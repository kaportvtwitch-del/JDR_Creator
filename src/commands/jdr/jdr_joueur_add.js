const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/mysql");
const { getJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_add")
    .setDescription("Ajouter un joueur à un JDR")

    .addStringOption(o =>
      o.setName("jdr")
        .setDescription("JDR")
        .setRequired(true)
        .setAutocomplete(true)
    )

    .addUserOption(o =>
      o.setName("joueur")
        .setDescription("Joueur à ajouter")
        .setRequired(true)
    ),

  async execute(interaction) {
    const jdrId = interaction.options.getString("jdr");
    const user = interaction.options.getUser("joueur");

    const jdr = await getJdr(interaction.guild.id, jdrId);

    if (!jdr) {
      return interaction.reply({ content: "❌ JDR introuvable", ephemeral: true });
    }

    const member = await interaction.guild.members.fetch(interaction.user.id);

    // 🔒 SEULEMENT MJ OU OWNER
    const isOwner = jdr.ownerId === interaction.user.id;
    const isMJ = member.roles.cache.has(jdr.mjRoleId);

    if (!isOwner && !isMJ) {
      return interaction.reply({
        content: "⛔ Tu n’es pas MJ de ce JDR",
        ephemeral: true
      });
    }

    const target = await interaction.guild.members.fetch(user.id);

    // ======================
    // ROLE JOUEUR
    // ======================
    await target.roles.add(jdr.playersRoleId).catch(() => null);

    // ======================
    // DB
    // ======================
    await db.execute(
      `INSERT INTO jdr_players (jdrId, userId)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE userId = userId`,
      [jdrId, user.id]
    );

    return interaction.reply({
      content: `✅ ${user.tag} ajouté au JDR **${jdr.name}**`,
      ephemeral: true
    });
  }
};