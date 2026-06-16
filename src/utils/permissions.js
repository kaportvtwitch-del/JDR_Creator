const { getGuild } = require("./database");

function isAllowed(interaction) {
  const guildData = getGuild(interaction.guild.id);

  return interaction.member.roles.cache.some(role =>
    guildData.allowedRoles.includes(role.id)
  );
}

module.exports = { isAllowed };