const db = require('./db');
const { getGarageState, getAllGarageStates } = require('./occupancy');

const insertSnapshot = db.prepare(`
  INSERT INTO occupancy_snapshots (garage_id, occupancy, recorded_at)
  VALUES (?, ?, ?)
`);

const selectHistory = db.prepare(`
  SELECT occupancy, recorded_at
  FROM occupancy_snapshots
  WHERE garage_id = ?
    AND recorded_at >= ?
  ORDER BY recorded_at ASC
`);

const SNAPSHOT_INTERVAL_MS = 5 * 60 * 1000;

function recordAllSnapshots() {
  const now = new Date().toISOString();
  const record = db.transaction((garages) => {
    for (const g of garages) {
      insertSnapshot.run(g.id, g.occupancy, now);
    }
  });
  record(getAllGarageStates());
}

function getHistory(garageId, range) {
  const hours = range === '7d' ? 168 : 24;
  const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  return selectHistory.all(garageId, since);
}

function startSnapshotJob() {
  recordAllSnapshots();
  return setInterval(recordAllSnapshots, SNAPSHOT_INTERVAL_MS);
}

module.exports = { recordAllSnapshots, getHistory, startSnapshotJob };
