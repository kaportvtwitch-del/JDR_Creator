const { SlashCommandBuilder } = require("discord.js");
const { getGuild, updateGuild } = require("../../database/guildRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_gestion_add")
    .setDescription("Autorise un rôle à créer des JDR")
    .addRoleOption(o =>
      o.setName("role").setDescription("Rôle").setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

    const guildData = await getGuild(interaction.guild.id);

    if (!guildData.allowedRoles.includes(role.id)) {
      guildData.allowedRoles.push(role.id);
      await updateGuild(interaction.guild.id, guildData);
    }

    return interaction.reply(`✅ ${role.name} autorisé`);
  }
};