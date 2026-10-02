const express = require('express');
const cors = require('cors');
const { seedAll } = require('./seed');
const garagesRouter = require('./routes/garages');
const { startSnapshotJob, recordAllSnapshots } = require('./snapshots');

seedAll();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.post('/api/admin/snapshot', (req, res) => {
  recordAllSnapshots();
  res.json({ ok: true });
});

app.use('/api/garages', garagesRouter);

startSnapshotJob();

app.listen(PORT, () => {
  console.log(`OU Parking API listening on http://localhost:${PORT}`);
});
