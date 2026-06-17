const db = require("./mysql");

/**
 * Créer / mettre à jour un JDR
 */
async function setJdr(guildId, name, data) {
  if (!data?.id) {
    throw new Error("setJdr: id (categoryId) manquant");
  }

  return db.execute(
    `
    INSERT INTO jdr (
      id,
      guildId,
      name,
      categoryId,
      playersRoleId,
      mjRoleId,
      ownerId
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      categoryId = VALUES(categoryId),
      playersRoleId = VALUES(playersRoleId),
      mjRoleId = VALUES(mjRoleId),
      ownerId = VALUES(ownerId)
    `,
    [
      data.id,              // 👈 categoryId = PRIMARY KEY
      guildId,
      name,
      data.categoryId,
      data.playersRoleId,
      data.mjRoleId,
      data.ownerId
    ]
  );
}

/**
 * Récupérer un JDR
 */
async function getJdr(guildId, id) {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM jdr
    WHERE guildId = ? AND id = ?
    `,
    [guildId, id]
  );

  return rows[0] || null;
}

/**
 * Supprimer un JDR
 */
async function deleteJdr(guildId, id) {
  return db.execute(
    `
    DELETE FROM jdr
    WHERE guildId = ? AND id = ?
    `,
    [guildId, id]
  );
}

/**
 * Lister tous les JDR d'un serveur
 */
async function listJdr(guildId) {
  const [rows] = await db.execute(
    `
    SELECT *
    FROM jdr
    WHERE guildId = ?
    `,
    [guildId]
  );

  return rows;
}

module.exports = {
  setJdr,
  getJdr,
  deleteJdr,
  listJdr
};