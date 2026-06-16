const fs = require("fs");
const { databaseFile } = require("../config/config");

function load() {
  if (!fs.existsSync(databaseFile)) {
    fs.writeFileSync(databaseFile, JSON.stringify({}));
  }
  return JSON.parse(fs.readFileSync(databaseFile));
}

function save(db) {
  fs.writeFileSync(databaseFile, JSON.stringify(db, null, 2));
}

function getGuild(guildId) {
  const db = load();

  if (!db[guildId]) {
    db[guildId] = {
      allowedRoles: []
    };
  }

  save(db);
  return db[guildId];
}

function updateGuild(guildId, data) {
  const db = load();
  db[guildId] = data;
  save(db);
}

module.exports = { getGuild, updateGuild };