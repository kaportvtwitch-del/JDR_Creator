const fs = require("fs");
const file = "data.json";

function load() {
  try {
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, "{}");
    }

    const raw = fs.readFileSync(file, "utf8");

    if (!raw || raw.trim() === "") {
      return {};
    }

    return JSON.parse(raw);

  } catch (err) {
    console.log("❌ DB CORROMPUE -> reset automatique");
    fs.writeFileSync(file, "{}");
    return {};
  }
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