const { SlashCommandBuilder } = require("discord.js");
const { getGuild, updateGuild } = require("../../database/guildRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_del")
    .setDescription("Retire un rôle autorisé")
    .addRoleOption(o =>
      o.setName("role").setDescription("Rôle").setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

    const guildData = await getGuild(interaction.guild.id);

    guildData.allowedRoles = guildData.allowedRoles.filter(
      id => id !== role.id
    );

    await updateGuild(interaction.guild.id, guildData);

    return interaction.reply(`🗑️ ${role.name} retiré`);
  }
};