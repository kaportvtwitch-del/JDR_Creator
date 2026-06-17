const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} = require("discord.js");

const { getAllJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_list")
    .setDescription("Afficher la liste des JDR du serveur"),

  async execute(interaction) {
    const jdrs = await getAllJdr(interaction.guild.id);

    if (!jdrs.length) {
      return interaction.reply({
        content: "❌ Aucun JDR trouvé",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📜 Liste des JDR")
      .setColor(0x00AEFF);

    const rows = [];

    for (const jdr of jdrs) {
      embed.addFields({
        name: jdr.name,
        value: `ID: \`${jdr.id}\``
      });

      const deleteButton = new ButtonBuilder()
        .setCustomId(`delete_jdr_${jdr.id}`)
        .setLabel(`🗑 Supprimer ${jdr.name}`)
        .setStyle(ButtonStyle.Danger);

      rows.push(new ActionRowBuilder().addComponents(deleteButton));
    }

    // 🔴 bouton fermer liste
    const closeRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_jdr_list")
        .setLabel("❌ Fermer")
        .setStyle(ButtonStyle.Secondary)
    );

    return interaction.reply({
      embeds: [embed],
      components: [...rows, closeRow],
      ephemeral: true
    });
  }
};