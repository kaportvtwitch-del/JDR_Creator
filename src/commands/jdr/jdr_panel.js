const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_panel")
    .setDescription("Ouvrir le panel JDR"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("🎲 Panel JDR")
      .setColor(0x5865f2)
      .setDescription("Accédez au système de gestion");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("panel_admin")
        .setLabel("👑 Admin")
        .setStyle(ButtonStyle.Danger),

      new ButtonBuilder()
        .setCustomId("panel_gestion")
        .setLabel("🛠 Gestion")
        .setStyle(ButtonStyle.Primary),

      new ButtonBuilder()
        .setCustomId("panel_mj")
        .setLabel("🎲 MJ")
        .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
};