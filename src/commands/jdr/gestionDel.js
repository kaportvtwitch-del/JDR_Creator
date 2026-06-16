const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getGuild, updateGuild } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_del")
    .setDescription("Supprime un rôle autorisé")
    .addRoleOption(opt =>
      opt.setName("role").setDescription("Rôle").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const guildData = getGuild(interaction.guild.id);

    guildData.allowedRoles = guildData.allowedRoles.filter(r => r !== role.id);

    updateGuild(interaction.guild.id, guildData);

    await interaction.reply(`❌ Supprimé: ${role.name}`);
  }
};