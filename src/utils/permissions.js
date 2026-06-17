const { getGuild } = require("../database/guildRepository");

async function isAllowed(interaction) {
  const guildData = await getGuild(interaction.guild.id);

  const memberRoles = interaction.member.roles.cache.map(r => r.id);

  return memberRoles.some(role =>
    guildData.allowedRoles.includes(role)
  );
}

module.exports = { isAllowed };