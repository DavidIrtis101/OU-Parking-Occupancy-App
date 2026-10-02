const db = require('./db');
const { getGarageState } = require('./occupancy');

const GARAGES = [
  { name: 'Adams Parking Garage', capacity: 500, location_label: 'North Campus' },
  { name: 'Walker Parking Garage', capacity: 450, location_label: 'Central Campus' },
  { name: 'Elm Avenue Parking Garage', capacity: 600, location_label: 'West Campus' },
  { name: 'Jenkins Parking Garage', capacity: 800, location_label: 'South Campus' },
  { name: 'Lloyd Noble Center Lot', capacity: 300, location_label: 'Lloyd Noble Center' },
];

function seedGarages() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM garages').get();
  if (count > 0) return;

  const insert = db.prepare(
    'INSERT INTO garages (name, capacity, location_label) VALUES (?, ?, ?)'
  );
  const insertAll = db.transaction((garages) => {
    for (const g of garages) insert.run(g.name, g.capacity, g.location_label);
  });

  insertAll(GARAGES);
  console.log(`Seeded ${GARAGES.length} garages`);
}

// Synthetic 24h history so charts and forecasts aren't empty on first demo.
// Pattern: low overnight, ramp up 7-11 AM, peak midday, decline after 2 PM.
function seedHistory() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM occupancy_snapshots').get();
  if (count > 0) return;

  const garages = db.prepare('SELECT id, capacity FROM garages').all();
  const insert = db.prepare(
    'INSERT INTO occupancy_snapshots (garage_id, occupancy, recorded_at) VALUES (?, ?, ?)'
  );

  const seedAll = db.transaction(() => {
    const now = Date.now();
    for (const garage of garages) {
      // 7 days of hourly snapshots
      for (let h = 7 * 24; h >= 0; h--) {
        const ts = new Date(now - h * 60 * 60 * 1000);
        const hour = ts.getHours();
        const dayOffset = Math.floor(h / 24);
        let factor;
        if (hour < 6) factor = 0.1;
        else if (hour < 9) factor = 0.3 + (hour - 6) * 0.15;
        else if (hour < 12) factor = 0.75 + (hour - 9) * 0.05;
        else if (hour < 14) factor = 0.9;
        else if (hour < 17) factor = 0.9 - (hour - 14) * 0.1;
        else factor = 0.5 - (hour - 17) * 0.05;

        // Weekday vs weekend variation
        const dow = ts.getDay();
        if (dow === 0 || dow === 6) factor *= 0.6;
        // Slight day-to-day noise
        factor *= 0.9 + (dayOffset % 3) * 0.05;

        factor = Math.max(0.05, Math.min(0.95, factor));
        const occupancy = Math.round(garage.capacity * factor);
        insert.run(garage.id, occupancy, ts.toISOString());
      }
    }
  });

  seedAll();
  console.log('Seeded synthetic 7-day occupancy history');
}

function seedAll() {
  seedGarages();
  seedHistory();
}

module.exports = { seedAll, seedGarages, seedHistory };
