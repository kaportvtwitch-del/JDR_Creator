const fs = require("fs");
const { lockFile } = require("../config/config");

function createLock() {
  try {
    if (fs.existsSync(lockFile)) {
      const pid = fs.readFileSync(lockFile, "utf8");

      if (pid) {
        try {
          process.kill(pid, 0);
          console.log(`[LOCK] Bot déjà actif (PID ${pid})`);
          process.exit(1);
        } catch {
          console.log("[LOCK] ancien lock supprimé");
        }
      }
    }

    fs.writeFileSync(lockFile, process.pid.toString());
    console.log(`[LOCK] verrou actif PID=${process.pid}`);
  } catch (e) {
    console.error("[LOCK ERROR]", e);
  }
}

function removeLock() {
  try {
    if (fs.existsSync(lockFile)) fs.unlinkSync(lockFile);
  } catch {}
}

module.exports = { createLock, removeLock };