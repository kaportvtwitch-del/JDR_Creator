const { SlashCommandBuilder } = require("discord.js");
const { getGuild } = require("../../database/guildRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_list")
    .setDescription("Liste des rôles autorisés"),

  async execute(interaction) {
    const guildData = await getGuild(interaction.guild.id);

    if (!guildData.allowedRoles.length) {
      return interaction.reply("❌ Aucun rôle autorisé");
    }

    const roles = guildData.allowedRoles
      .map(id => `<@&${id}>`)
      .join("\n");

    return interaction.reply(`📜 Rôles autorisés :\n${roles}`);
  }
};