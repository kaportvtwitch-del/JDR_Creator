const db = require("./mysql");

async function getGuild(guildId) {
  const [rows] = await db.execute(
    `SELECT * FROM guild_settings WHERE guildId = ?`,
    [guildId]
  );

  if (rows.length === 0) {
    await db.execute(
      `INSERT INTO guild_settings (guildId, allowedRoles)
       VALUES (?, ?)`,
      [guildId, JSON.stringify([])]
    );

    return { guildId, allowedRoles: [] };
  }

  return {
    ...rows[0],
    allowedRoles: JSON.parse(rows[0].allowedRoles || "[]")
  };
}

async function updateGuild(guildId, data) {
  await db.execute(
    `UPDATE guild_settings SET allowedRoles = ? WHERE guildId = ?`,
    [JSON.stringify(data.allowedRoles), guildId]
  );
}

module.exports = { getGuild, updateGuild };