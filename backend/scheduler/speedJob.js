const cron = require('node-cron');
const db = require('../db');
const runSpeedTest = require('../services/speedTest');

cron.schedule('*/30 * * * *', async () => {
  const result = await runSpeedTest();
  if (result && isFinite(result.download) && isFinite(result.upload) && isFinite(result.ping)) {
    await db.query(
      'INSERT INTO speed_results (download_mbps, upload_mbps, latency_ms) VALUES (?, ?, ?)',
      [result.download, result.upload, result.ping]
    );
    console.log("Speed test logged:", result);
  } else {
    console.error("❌ Invalid speed test result (cron):", result);
  }
});
