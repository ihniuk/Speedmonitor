const express = require('express');
const cors = require('cors');
const db = require('./db');
const runSpeedTest = require('./services/speedTest');
require('./scheduler/speedJob');

const app = express();
app.use(cors());
app.use(express.json());

async function initDatabaseWithRetry(retries = 10, delay = 3000) {
  for (let i = 0; i < retries; i++) {
    try {
      await db.query(`
        CREATE TABLE IF NOT EXISTS speed_results (
          id INT AUTO_INCREMENT PRIMARY KEY,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          download_mbps FLOAT,
          upload_mbps FLOAT,
          latency_ms FLOAT
        )
      `);
      console.log("✅ Database initialized successfully.");
      return;
    } catch (err) {
      console.error(`❌ Failed to connect to DB (attempt ${i + 1}/${retries}):`, err.message);
      if (i < retries - 1) await new Promise(res => setTimeout(res, delay));
      else throw err;
    }
  }
}

app.get('/api/recent', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM speed_results ORDER BY timestamp DESC LIMIT 48'
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/run-now', async (req, res) => {
  const result = await runSpeedTest();
  if (result && isFinite(result.download) && isFinite(result.upload) && isFinite(result.ping)) {
    await db.query(
      'INSERT INTO speed_results (download_mbps, upload_mbps, latency_ms) VALUES (?, ?, ?)',
      [result.download, result.upload, result.ping]
    );
    res.json({ success: true });
  } else {
    console.error("❌ Invalid speed test result:", result);
    res.status(500).json({ error: "Invalid speed test result" });
  }
});

initDatabaseWithRetry().then(() => {
  app.listen(5000, () => console.log("✅ Backend running on port 5000"));
}).catch(err => {
  console.error("❌ Failed to initialize database after retries:", err);
});
