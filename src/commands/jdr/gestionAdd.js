const { SlashCommandBuilder, PermissionFlagsBits } = require("discord.js");
const { getGuild, updateGuild } = require("../../utils/database");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_add")
    .setDescription("Ajoute un rôle autorisé")
    .addRoleOption(opt =>
      opt.setName("role").setDescription("Rôle").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const guildData = getGuild(interaction.guild.id);

    if (!guildData.allowedRoles.includes(role.id)) {
      guildData.allowedRoles.push(role.id);
    }

    updateGuild(interaction.guild.id, guildData);

    await interaction.reply(`✅ Ajouté: ${role.name}`);
  }
};