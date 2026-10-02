const db = require('./db');

// Occupancy is derived from events (entries minus exits) rather than stored
// as a number. This mirrors how gate/camera systems work, so swapping the
// simulated event source for real PGS data later won't change this file.

const selectGarage = db.prepare(
  'SELECT id, name, capacity, location_label FROM garages WHERE id = ?'
);
const selectAllGarages = db.prepare(
  'SELECT id, name, capacity, location_label FROM garages ORDER BY name'
);
const selectCounts = db.prepare(`
  SELECT
    SUM(CASE WHEN event_type = 'entry' THEN 1 ELSE 0 END) AS entries,
    SUM(CASE WHEN event_type = 'exit' THEN 1 ELSE 0 END) AS exits
  FROM events
  WHERE garage_id = ?
`);

function getStatus(occupancy, capacity) {
  if (occupancy >= capacity) return 'full';
  const available = capacity - occupancy;
  if (available / capacity > 0.2) return 'available';
  return 'filling up';
}

function buildState(garage) {
  const { entries, exits } = selectCounts.get(garage.id);
  const raw = (entries || 0) - (exits || 0);
  // Raw occupancy can dip negative with bad data; only the displayed value is clamped.
  const occupancy = Math.max(0, raw);
  const available = Math.max(0, garage.capacity - occupancy);

  return {
    id: garage.id,
    name: garage.name,
    location_label: garage.location_label,
    capacity: garage.capacity,
    occupancy,
    available,
    percent_occupied: Math.round((occupancy / garage.capacity) * 100),
    status: getStatus(occupancy, garage.capacity),
  };
}

function getGarageState(garageId) {
  const garage = selectGarage.get(garageId);
  return garage ? buildState(garage) : null;
}

function getAllGarageStates() {
  return selectAllGarages.all().map(buildState);
}

module.exports = { getGarageState, getAllGarageStates, getStatus };
