const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/mysql");
const { getJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_list")
    .setDescription("Lister les joueurs d’un JDR")

    .addStringOption(o =>
      o.setName("jdr")
        .setDescription("Nom du JDR")
        .setRequired(true)
        .setAutocomplete(true)
    ),

  async execute(interaction) {
    const jdrId = interaction.options.getString("jdr");

    const jdr = await getJdr(interaction.guild.id, jdrId);

    if (!jdr) {
      return interaction.reply({
        content: "❌ JDR introuvable",
        ephemeral: true
      });
    }

    const [rows] = await db.execute(
      `SELECT userId FROM jdr_players WHERE jdrId = ?`,
      [jdrId]
    );

    if (!rows.length) {
      return interaction.reply({
        content: `❌ Aucun joueur dans **${jdr.name}**`,
        ephemeral: true
      });
    }

    const list = rows.map(r => `<@${r.userId}>`).join("\n");

    return interaction.reply({
      content: `👥 Joueurs du JDR **${jdr.name}** :\n${list}`,
      ephemeral: true
    });
  }
};