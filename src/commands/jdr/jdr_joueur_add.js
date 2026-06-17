const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/mysql");
const { getJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_add")
    .setDescription("Ajouter un joueur à un JDR")

    .addStringOption(o =>
      o
        .setName("jdr_id")
        .setDescription("ID du JDR")
        .setRequired(true)
    )

    .addUserOption(o =>
      o
        .setName("joueur")
        .setDescription("Joueur à ajouter")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guild = interaction.guild;

    const jdrId = interaction.options.getString("jdr_id");
    const user = interaction.options.getUser("joueur");

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
    // CHECK MEMBER IN GUILD
    // ======================
    const member = await guild.members.fetch(user.id).catch(() => null);

    if (!member) {
      return interaction.reply({
        content: "❌ Le joueur n’est pas sur le serveur",
        ephemeral: true
      });
    }

    // ======================
    // INSERT DB
    // ======================
    await db.execute(
      `INSERT INTO jdr_players (jdrId, userId)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE userId = VALUES(userId)`,
      [jdrId, user.id]
    );

    return interaction.reply(
      `✅ **${user.tag}** ajouté au JDR **${jdr.name}**`
    );
  }
};