const fs = require("fs");
const file = "data.json";

function load() {
  if (!fs.existsSync(file)) fs.writeFileSync(file, "{}");
  return JSON.parse(fs.readFileSync(file));
}

function save(db) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function setJdr(guildId, name, data) {
  const db = load();

  if (!db[guildId]) db[guildId] = { jdr: {} };
  if (!db[guildId].jdr) db[guildId].jdr = {};

  db[guildId].jdr[name.toLowerCase()] = data;

  save(db);
}

function getJdr(guildId, name) {
  const db = load();
  return db?.[guildId]?.jdr?.[name.toLowerCase()];
}

function deleteJdr(guildId, name) {
  const db = load();

  if (db?.[guildId]?.jdr?.[name.toLowerCase()]) {
    delete db[guildId].jdr[name.toLowerCase()];
    save(db);
  }
}

module.exports = {
  setJdr,
  getJdr,
  deleteJdr
};