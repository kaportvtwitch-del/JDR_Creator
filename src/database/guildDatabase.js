const fs = require("fs");
const file = "data.json";

function load() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
  return JSON.parse(fs.readFileSync(file));
}

function save(db) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function getGuild(guildId) {
  const db = load();

  if (!db[guildId]) {
    db[guildId] = { allowedRoles: [] };
    save(db);
  }

  return db[guildId];
}

function updateGuild(guildId, data) {
  const db = load();
  db[guildId] = data;
  save(db);
}

module.exports = {
  getGuild,
  updateGuild
};