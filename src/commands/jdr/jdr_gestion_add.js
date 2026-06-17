const { SlashCommandBuilder } = require("discord.js");
const { getGuild, updateGuild } = require("../../database/guildDatabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_add")
    .setDescription("Autorise un rôle à créer des JDR")
    .addRoleOption(o =>
      o
        .setName("role")
        .setDescription("Rôle autorisé")
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const guild = getGuild(interaction.guild.id);

    if (!guild.allowedRoles.includes(role.id)) {
      guild.allowedRoles.push(role.id);
      updateGuild(interaction.guild.id, guild);
    }

    return interaction.reply(`✅ ${role.name} autorisé`);
  }
};