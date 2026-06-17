const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/mysql");
const { getJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_del")
    .setDescription("Retirer un joueur d’un JDR")
    .addStringOption(o =>
      o.setName("jdr_id")
        .setDescription("ID du JDR")
        .setRequired(true)
    )
    .addUserOption(o =>
      o.setName("joueur")
        .setDescription("Joueur à retirer")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guild = interaction.guild;

    const jdrId = interaction.options.getString("jdr_id");
    const user = interaction.options.getUser("joueur");

    const member = await guild.members.fetch(user.id);

    const jdr = await getJdr(guild.id, jdrId);

    if (!jdr) {
      return interaction.reply({
        content: "❌ JDR introuvable",
        flags: 64
      });
    }

    // =========================
    // 🔐 CHECK MJ (SECURITE)
    // =========================
    const mjRole = guild.roles.cache.get(jdr.mjRoleId);

    if (!interaction.member.roles.cache.has(mjRole?.id)) {
      return interaction.reply({
        content: "⛔ Tu n’es pas MJ de ce JDR",
        flags: 64
      });
    }

    // =========================
    // 🧹 REMOVE ROLE DISCORD
    // =========================
    const playerRole = guild.roles.cache.get(jdr.playersRoleId);

    if (playerRole) {
      await member.roles.remove(playerRole).catch(() => {});
    }

    // =========================
    // 🗄️ REMOVE DB
    // =========================
    const [result] = await db.execute(
      `DELETE FROM jdr_players WHERE jdrId = ? AND userId = ?`,
      [jdrId, user.id]
    );

    if (result.affectedRows === 0) {
      return interaction.reply({
        content: "❌ Ce joueur n’est pas dans la base",
        flags: 64
      });
    }

    return interaction.reply({
      content: `🗑️ **${user.tag}** retiré du JDR`,
      flags: 64
    });
  }
};