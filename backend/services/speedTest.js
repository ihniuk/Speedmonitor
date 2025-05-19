const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function runSpeedTest() {
  try {
    const { stdout } = await execPromise('librespeed-cli --json');
    const arr = JSON.parse(stdout);
    if (Array.isArray(arr) && arr.length > 0) {
      const data = arr[0];
      return {
        download: parseFloat(data.download), // Mbps
        upload: parseFloat(data.upload),     // Mbps
        ping: parseFloat(data.ping)          // ms
      };
    }
    return null;
  } catch (err) {
    console.error("Speed test failed:", err);
    return null;
  }
}

module.exports = runSpeedTest;
