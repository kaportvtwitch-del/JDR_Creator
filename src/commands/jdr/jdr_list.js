const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require("discord.js");
const { getGuild } = require("../../database/guildDatabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_list")
    .setDescription("Afficher la liste des JDR du serveur"),

  async execute(interaction) {
    const db = getGuild(interaction.guild.id);
    const jdrs = db?.jdr || {};

    const keys = Object.keys(jdrs);

    if (keys.length === 0) {
      return interaction.reply({
        content: "❌ Aucun JDR trouvé",
        ephemeral: true
      });
    }

    const embed = new EmbedBuilder()
      .setTitle("📜 Liste des JDR")
      .setColor(0x00AEFF);

    const rows = [];

    for (const id of keys) {
      const jdr = jdrs[id];

      embed.addFields({
        name: jdr.name,
        value: `ID: \`${id}\``
      });

      const button = new ButtonBuilder()
        .setCustomId(`delete_jdr_${id}`)
        .setLabel(`🗑 Supprimer ${jdr.name}`)
        .setStyle(ButtonStyle.Danger);

      rows.push(new ActionRowBuilder().addComponents(button));
    }

    await interaction.reply({
      embeds: [embed],
      components: rows,
      ephemeral: true
    });
  }
};