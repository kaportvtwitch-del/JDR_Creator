const { SlashCommandBuilder } = require("discord.js");
const { getGuild } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_list")
    .setDescription("Liste des rôles autorisés"),

  async execute(interaction) {
    const guildData = getGuild(interaction.guild.id);

    const list = guildData.allowedRoles.length
      ? guildData.allowedRoles.map(r => `<@&${r}>`).join("\n")
      : "Aucun rôle";

    await interaction.reply(`📜\n${list}`);
  }
};