const db = require("./mysql");

async function setJdr(data) {
  return db.execute(
    `INSERT INTO jdr
    (id, guildId, name, categoryId, playersRoleId, mjRoleId, ownerId)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.id ?? null,
      data.guildId ?? null,
      data.name ?? null,
      data.categoryId ?? null,
      data.playersRoleId ?? null,
      data.mjRoleId ?? null,
      data.ownerId ?? null
    ]
  );
}

async function getJdr(guildId, id) {
  const [rows] = await db.execute(
    `SELECT * FROM jdr WHERE guildId = ? AND id = ?`,
    [guildId, id]
  );
  return rows[0];
}

async function deleteJdr(guildId, id) {
  return db.execute(
    `DELETE FROM jdr WHERE guildId = ? AND id = ?`,
    [guildId, id]
  );
}

module.exports = {
  setJdr,
  getJdr,
  deleteJdr
};