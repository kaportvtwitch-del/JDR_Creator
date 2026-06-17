const { SlashCommandBuilder } = require("discord.js");
const { getGuild } = require("../../database/guildDatabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_list")
    .setDescription("Liste des rôles autorisés"),

  async execute(interaction) {
    const guild = getGuild(interaction.guild.id);

    if (!guild.allowedRoles.length) {
      return interaction.reply("📭 Aucun rôle autorisé");
    }

    return interaction.reply(
      guild.allowedRoles.map(r => `<@&${r}>`).join("\n")
    );
  }
};