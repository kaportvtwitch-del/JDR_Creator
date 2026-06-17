const { SlashCommandBuilder } = require("discord.js");
const { getGuild, updateGuild } = require("../../database/guildDatabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_del")
    .setDescription("Retire un rôle autorisé")
    .addRoleOption(o => o.setName("role").setRequired(true)),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const guild = getGuild(interaction.guild.id);

    guild.allowedRoles = guild.allowedRoles.filter(id => id !== role.id);

    updateGuild(interaction.guild.id, guild);

    return interaction.reply(`🗑️ ${role.name} retiré`);
  }
};