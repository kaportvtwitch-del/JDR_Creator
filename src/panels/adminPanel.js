const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField
} = require("discord.js");

module.exports = async (interaction) => {

  const member = interaction.member;

  if (!member.permissions.has(PermissionsBitField.Flags.Administrator)) {
    return interaction.reply({ content: "⛔ Accès refusé", ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle("👑 Panel Admin")
    .setColor(0xff0000)
    .setDescription("Gestion des rôles gestionnaires");

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("jdr_gestion_add")
      .setLabel("➕ Ajouter gestionnaire")
      .setStyle(ButtonStyle.Success),

    new ButtonBuilder()
      .setCustomId("jdr_gestion_del")
      .setLabel("➖ Retirer gestionnaire")
      .setStyle(ButtonStyle.Danger),

    new ButtonBuilder()
      .setCustomId("jdr_gestion_list")
      .setLabel("📜 Liste gestionnaires")
      .setStyle(ButtonStyle.Primary)
  );

  const back = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("back_panel")
      .setLabel("⬅ Retour")
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.update({
    embeds: [embed],
    components: [row, back]
  });
};