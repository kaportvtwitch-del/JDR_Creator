const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");
const db = require("../../database/mysql");
const { getJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_list")
    .setDescription("Lister les joueurs d’un JDR")

    .addStringOption(o =>
      o
        .setName("jdr_id")
        .setDescription("ID du JDR")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const jdrId = interaction.options.getString("jdr_id");

    // ======================
    // CHECK JDR
    // ======================
    const jdr = await getJdr(guild.id, jdrId);

    if (!jdr) {
      return interaction.reply({
        content: "❌ JDR introuvable",
        ephemeral: true
      });
    }

    // ======================
    // GET PLAYERS
    // ======================
    const [rows] = await db.execute(
      `SELECT userId FROM jdr_players WHERE jdrId = ?`,
      [jdrId]
    );

    if (!rows || rows.length === 0) {
      return interaction.reply({
        content: "❌ Aucun joueur dans ce JDR",
        ephemeral: true
      });
    }

    // ======================
    // FORMAT LIST
    // ======================
    const list = rows.map(r => `<@${r.userId}>`).join("\n");

    // ======================
    // EMBED CLEAN
    // ======================
    const embed = new EmbedBuilder()
      .setTitle(`👥 Joueurs du JDR ${jdr.name}`)
      .setDescription(list)
      .setColor(0x00AEFF);

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};