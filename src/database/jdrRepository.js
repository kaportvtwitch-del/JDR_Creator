const db = require("./mysql");

// ======================
// CREATE / UPDATE JDR
// ======================
async function setJdr(data) {
  const {
    id,
    guildId,
    name,
    categoryId,
    playersRoleId,
    mjRoleId,
    ownerId
  } = data;

  if (!id || !guildId) {
    throw new Error("setJdr: id ou guildId manquant");
  }

  await db.execute(
    `INSERT INTO jdr (id, guildId, name, categoryId, playersRoleId, mjRoleId, ownerId)
     VALUES (?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       categoryId = VALUES(categoryId),
       playersRoleId = VALUES(playersRoleId),
       mjRoleId = VALUES(mjRoleId),
       ownerId = VALUES(ownerId)`,
    [id, guildId, name, categoryId, playersRoleId, mjRoleId, ownerId]
  );
}

// ======================
// GET ONE JDR
// ======================
async function getJdr(guildId, id) {
  const [rows] = await db.execute(
    `SELECT * FROM jdr WHERE guildId = ? AND id = ?`,
    [guildId, id]
  );

  return rows[0] || null;
}

// ======================
// DELETE JDR
// ======================
async function deleteJdr(guildId, id) {
  await db.execute(
    `DELETE FROM jdr WHERE guildId = ? AND id = ?`,
    [guildId, id]
  );
}

// ======================
// LIST ALL JDR
// ======================
async function getAllJdr(guildId) {
  const [rows] = await db.execute(
    `SELECT * FROM jdr WHERE guildId = ?`,
    [guildId]
  );

  return rows;
}

module.exports = {
  setJdr,
  getJdr,
  deleteJdr,
  getAllJdr
};