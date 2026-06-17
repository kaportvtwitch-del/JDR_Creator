const { SlashCommandBuilder } = require("discord.js");
const db = require("../../database/mysql");
const { getJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_add")
    .setDescription("Ajouter un joueur à un JDR")
    .addStringOption(o =>
      o.setName("jdr_id").setRequired(true)
    )
    .addUserOption(o =>
      o.setName("joueur").setRequired(true)
    ),

  async execute(interaction) {
    const jdrId = interaction.options.getString("jdr_id");
    const user = interaction.options.getUser("joueur");

    const jdr = await getJdr(interaction.guild.id, jdrId);

    if (!jdr) {
      return interaction.reply({ content: "❌ JDR introuvable", ephemeral: true });
    }

    await db.execute(
      `INSERT INTO jdr_players (jdrId, userId)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE userId = userId`,
      [jdrId, user.id]
    );

    return interaction.reply(`✅ ${user.tag} ajouté au JDR`);
  }
};