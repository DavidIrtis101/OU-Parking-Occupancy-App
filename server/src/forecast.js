const db = require('./db');

// Simple hour-of-day averages from snapshots — no ML, enough for a prototype demo.
const selectHourlyAverages = db.prepare(`
  SELECT
    CAST(strftime('%H', recorded_at) AS INTEGER) AS hour,
    ROUND(AVG(occupancy)) AS avg_occupancy,
    COUNT(*) AS sample_count
  FROM occupancy_snapshots
  WHERE garage_id = ?
  GROUP BY hour
  ORDER BY hour
`);

function getForecast(garageId) {
  const garage = db
    .prepare('SELECT id, name, capacity FROM garages WHERE id = ?')
    .get(garageId);
  if (!garage) return null;

  const hourly = selectHourlyAverages.all(garageId);
  if (hourly.length === 0) {
    return {
      garage_id: garageId,
      simulated: true,
      message: 'Not enough historical data yet. Run the simulation for a while.',
      hourly: [],
      busiest_hours: [],
      best_time: null,
    };
  }

  const sorted = [...hourly].sort((a, b) => b.avg_occupancy - a.avg_occupancy);
  const busiest = sorted.slice(0, 3).map((h) => h.hour);
  const quietest = sorted[sorted.length - 1];

  const formatHour = (h) => {
    const suffix = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12} ${suffix}`;
  };

  const minBusy = Math.min(...busiest);
  const maxBusy = Math.max(...busiest);
  const busiestLabel =
    minBusy === maxBusy
      ? formatHour(minBusy)
      : `${formatHour(minBusy)}–${formatHour((maxBusy + 1) % 24)}`;

  return {
    garage_id: garageId,
    simulated: true,
    hourly: hourly.map((h) => ({
      hour: h.hour,
      avg_occupancy: h.avg_occupancy,
      percent: Math.round((h.avg_occupancy / garage.capacity) * 100),
    })),
    busiest_hours: busiest,
    busiest_label: busiestLabel,
    best_time: `after ${formatHour(quietest.hour)}`,
    message: `Usually busiest around ${busiestLabel}. Best time to park is ${formatHour(quietest.hour)}.`,
  };
}

module.exports = { getForecast };
