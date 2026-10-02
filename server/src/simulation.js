const db = require('./db');
const { getGarageState } = require('./occupancy');

const insertEvent = db.prepare(
  'INSERT INTO events (garage_id, event_type) VALUES (?, ?)'
);

const MIN_DELAY_MS = 2000;
const MAX_DELAY_MS = 5000;
const ENTRY_WEIGHT = 0.6;

// garageId -> timeout handle
const active = new Map();

function randomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS);
}

function randomEventType() {
  return Math.random() < ENTRY_WEIGHT ? 'entry' : 'exit';
}

function scheduleNext(garageId) {
  const handle = setTimeout(() => {
    insertEvent.run(garageId, randomEventType());
    scheduleNext(garageId);
  }, randomDelay());
  active.set(garageId, handle);
}

function startSimulation(garageId) {
  if (active.has(garageId)) return { alreadyRunning: true };
  if (!getGarageState(garageId)) return { notFound: true };
  scheduleNext(garageId);
  return { started: true };
}

function stopSimulation(garageId) {
  const handle = active.get(garageId);
  if (!handle) return { wasRunning: false };
  clearTimeout(handle);
  active.delete(garageId);
  return { wasRunning: true };
}

function isRunning(garageId) {
  return active.has(garageId);
}

function startAllSimulations() {
  const garages = db.prepare('SELECT id FROM garages').all();
  let started = 0;
  for (const { id } of garages) {
    const result = startSimulation(id);
    if (result.started) started++;
  }
  return { started, total: garages.length };
}

function stopAllSimulations() {
  const ids = [...active.keys()];
  for (const id of ids) stopSimulation(id);
  return { stopped: ids.length };
}

function anyRunning() {
  return active.size > 0;
}

module.exports = {
  startSimulation,
  stopSimulation,
  isRunning,
  startAllSimulations,
  stopAllSimulations,
  anyRunning,
};
