const express = require('express');
const db = require('../db');
const { getGarageState, getAllGarageStates } = require('../occupancy');
const {
  startSimulation,
  stopSimulation,
  isRunning,
  startAllSimulations,
  stopAllSimulations,
  anyRunning,
} = require('../simulation');
const { getHistory } = require('../snapshots');
const { getForecast } = require('../forecast');

const router = express.Router();

const insertEvent = db.prepare(
  'INSERT INTO events (garage_id, event_type) VALUES (?, ?)'
);
const getRecentEvents = db.prepare(`
  SELECT id, garage_id, event_type, created_at
  FROM events
  WHERE garage_id = ?
  ORDER BY created_at DESC, id DESC
  LIMIT ?
`);

function parseId(req, res) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid garage id' });
    return null;
  }
  return id;
}

function withSimFlag(state) {
  return { ...state, simulationRunning: isRunning(state.id) };
}

// GET /api/garages
router.get('/', (req, res) => {
  res.json({
    garages: getAllGarageStates().map(withSimFlag),
    simulationRunning: anyRunning(),
  });
});

// POST /api/garages/simulate/start — start all garages
router.post('/simulate/start', (req, res) => {
  const result = startAllSimulations();
  res.json({ running: true, ...result });
});

// POST /api/garages/simulate/stop — stop all garages
router.post('/simulate/stop', (req, res) => {
  const result = stopAllSimulations();
  res.json({ running: false, ...result });
});

// GET /api/garages/:id/events?limit=20
router.get('/:id/events', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  if (!getGarageState(id)) return res.status(404).json({ error: 'Garage not found' });

  let limit = Number(req.query.limit) || 20;
  limit = Math.min(Math.max(limit, 1), 200);
  res.json(getRecentEvents.all(id, limit));
});

// GET /api/garages/:id/history?range=24h|7d
router.get('/:id/history', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  if (!getGarageState(id)) return res.status(404).json({ error: 'Garage not found' });

  const range = req.query.range === '7d' ? '7d' : '24h';
  res.json({ garage_id: id, range, points: getHistory(id, range) });
});

// GET /api/garages/:id/forecast?day=today
router.get('/:id/forecast', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const forecast = getForecast(id);
  if (!forecast) return res.status(404).json({ error: 'Garage not found' });
  res.json(forecast);
});

// POST /api/garages/:id/simulate/start
router.post('/:id/simulate/start', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const result = startSimulation(id);
  if (result.notFound) return res.status(404).json({ error: 'Garage not found' });
  res.json({ running: true, alreadyRunning: !!result.alreadyRunning });
});

// POST /api/garages/:id/simulate/stop
router.post('/:id/simulate/stop', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;
  if (!getGarageState(id)) return res.status(404).json({ error: 'Garage not found' });

  const result = stopSimulation(id);
  res.json({ running: false, wasRunning: result.wasRunning });
});

// GET /api/garages/:id
router.get('/:id', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const state = getGarageState(id);
  if (!state) return res.status(404).json({ error: 'Garage not found' });
  res.json(withSimFlag(state));
});

// POST /api/garages/:id/events  { event_type: 'entry' | 'exit' }
router.post('/:id/events', (req, res) => {
  const id = parseId(req, res);
  if (id === null) return;

  const { event_type } = req.body || {};
  if (event_type !== 'entry' && event_type !== 'exit') {
    return res.status(400).json({ error: "event_type must be 'entry' or 'exit'" });
  }
  if (!getGarageState(id)) {
    return res.status(404).json({ error: 'Garage not found' });
  }

  insertEvent.run(id, event_type);
  res.status(201).json(withSimFlag(getGarageState(id)));
});

module.exports = router;
