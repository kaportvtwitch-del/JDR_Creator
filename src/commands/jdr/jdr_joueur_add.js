const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/mysql");
const { getJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_add")
    .setDescription("Ajouter un joueur à un JDR")
    .addStringOption(o =>
      o.setName("jdr_id")
        .setDescription("ID du JDR (categoryId)")
        .setRequired(true)
    )
    .addUserOption(o =>
      o.setName("joueur")
        .setDescription("Joueur à ajouter")
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
    // 🎮 GIVE PLAYER ROLE
    // =========================
    const playerRole = guild.roles.cache.get(jdr.playersRoleId);

    if (!playerRole) {
      return interaction.reply({
        content: "❌ Rôle joueur introuvable",
        flags: 64
      });
    }

    await member.roles.add(playerRole).catch(() => {});

    // =========================
    // 💾 DB SAVE
    // =========================
    await db.execute(
      `
      INSERT INTO jdr_players (jdrId, userId)
      VALUES (?, ?)
      ON DUPLICATE KEY UPDATE userId = userId
      `,
      [jdrId, user.id]
    );

    return interaction.reply({
      content: `✅ ${user.tag} ajouté au JDR`,
      flags: 64
    });
  }
};