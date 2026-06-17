const fs = require("fs");
const file = "data.json";

function load() {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "{}");
    }

    const raw = fs.readFileSync(file, "utf8");

    if (!raw || raw.trim() === "") return {};

    return JSON.parse(raw);

  } catch (err) {
    console.log("❌ DB CORROMPUE -> reset auto");
    fs.writeFileSync(file, "{}");
    return {};
  }
}

function save(db) {
  fs.writeFileSync(file, JSON.stringify(db, null, 2));
}

function setJdr(guildId, categoryId, data) {
  const db = load();

  if (!db[guildId]) db[guildId] = { jdr: {} };
  if (!db[guildId].jdr) db[guildId].jdr = {};

  db[guildId].jdr[categoryId] = data;

  save(db);
}

function getJdr(guildId, categoryId) {
  const db = load();
  return db?.[guildId]?.jdr?.[categoryId];
}

function deleteJdr(guildId, categoryId) {
  const db = load();

  if (db?.[guildId]?.jdr?.[categoryId]) {
    delete db[guildId].jdr[categoryId];
    save(db);
  }
}

module.exports = {
  setJdr,
  getJdr,
  deleteJdr
};