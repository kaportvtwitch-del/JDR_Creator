const { getGuild } = require("../database/guildDatabase");

function isAllowed(interaction) {
  const data = getGuild(interaction.guild.id);

  return interaction.member.roles.cache.some(role =>
    data.allowedRoles.includes(role.id)
  );
}

module.exports = { isAllowed };