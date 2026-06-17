const db = require("./mysql");

// CREATE / UPDATE JDR
async function setJdr(data) {
  await db.execute(
    `INSERT INTO jdr (id, guildId, name, categoryId, playersRoleId, mjRoleId, ownerId)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE name = VALUES(name)`,
    [
      data.categoryId,
      data.guildId,
      data.name,
      data.categoryId,
      data.playersRoleId,
      data.mjRoleId,
      data.ownerId
    ]
  );
}

// GET ONE JDR
async function getJdr(guildId, id) {
  const [rows] = await db.execute(
    `SELECT * FROM jdr WHERE guildId = ? AND id = ?`,
    [guildId, id]
  );
  return rows[0];
}

// GET ALL JDR
async function getAllJdr(guildId) {
  const [rows] = await db.execute(
    `SELECT * FROM jdr WHERE guildId = ?`,
    [guildId]
  );
  return rows;
}

// DELETE JDR
async function deleteJdr(guildId, id) {
  await db.execute(
    `DELETE FROM jdr WHERE guildId = ? AND id = ?`,
    [guildId, id]
  );

  await db.execute(
    `DELETE FROM jdr_players WHERE jdrId = ?`,
    [id]
  );
}

module.exports = {
  setJdr,
  getJdr,
  getAllJdr,
  deleteJdr
};