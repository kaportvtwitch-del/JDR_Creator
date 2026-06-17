const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/mysql");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_del")
    .setDescription("Retirer un joueur d’un JDR")

    .addStringOption(o =>
      o
        .setName("jdr_id")
        .setDescription("ID du JDR")
        .setRequired(true)
    )

    .addUserOption(o =>
      o
        .setName("joueur")
        .setDescription("Joueur à retirer")
        .setRequired(true)
    ),

  async execute(interaction) {
    const jdrId = interaction.options.getString("jdr_id");
    const user = interaction.options.getUser("joueur");

    // ======================
    // DELETE
    // ======================
    const [result] = await db.execute(
      `DELETE FROM jdr_players WHERE jdrId = ? AND userId = ?`,
      [jdrId, user.id]
    );

    // ======================
    // FEEDBACK
    // ======================
    if (result.affectedRows === 0) {
      return interaction.reply({
        content: "❌ Ce joueur n’est pas dans ce JDR",
        ephemeral: true
      });
    }

    return interaction.reply(
      `🗑️ **${user.tag}** retiré du JDR`
    );
  }
};