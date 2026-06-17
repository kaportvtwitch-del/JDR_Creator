const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { getAllJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_list")
    .setDescription("Liste des JDR du serveur"),

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
      .setColor(0x00AEFF)
      .setDescription("🗑️ **Suppression de JDR :**");

    const rows = [];

    for (const jdr of jdrs) {

      const safeName = jdr.name.length > 50
        ? jdr.name.slice(0, 47) + "..."
        : jdr.name;

      rows.push(
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`delete_jdr_${jdr.id}`)
            .setLabel(`🗑 ${safeName}`)
            .setStyle(ButtonStyle.Danger)
        )
      );
    }

    return interaction.reply({
      embeds: [embed],
      components: rows,
      ephemeral: true
    });
  }
};