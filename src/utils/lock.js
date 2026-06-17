const fs = require("fs");

const LOCK_FILE = "bot.lock";

function createLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const oldPid = fs.readFileSync(LOCK_FILE, "utf8");

    try {
      process.kill(parseInt(oldPid), 0);
      console.log(`[LOCK] Bot déjà actif (PID ${oldPid})`);
      process.exit(1);
    } catch (e) {
      console.log("[LOCK] ancien lock supprimé (process mort)");
      fs.unlinkSync(LOCK_FILE);
    }
  }

  fs.writeFileSync(LOCK_FILE, process.pid.toString());
  console.log(`[LOCK] verrou actif PID=${process.pid}`);
}

function removeLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const pid = fs.readFileSync(LOCK_FILE, "utf8");

    if (parseInt(pid) === process.pid) {
      fs.unlinkSync(LOCK_FILE);
    }
  }
}

module.exports = { createLock, removeLock };