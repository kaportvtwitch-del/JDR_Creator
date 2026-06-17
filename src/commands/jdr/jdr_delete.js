const { SlashCommandBuilder } = require("discord.js");
const { getJdr, deleteJdr } = require("../../database/jdrDatabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_delete")
    .setDescription("Supprimer un JDR via ID de catégorie")
    .addStringOption(o =>
      o
        .setName("category_id")
        .setDescription("ID de la catégorie du JDR")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const categoryId = interaction.options.getString("category_id");

    const jdr = getJdr(guild.id, categoryId);

    if (!jdr) {
      return interaction.reply({
        content: "❌ JDR introuvable",
        ephemeral: true
      });
    }

    // 🧹 SUPPRESSION SALONS
    const category = guild.channels.cache.get(jdr.categoryId);

    if (category) {
      for (const ch of category.children.cache.values()) {
        await ch.delete().catch(() => {});
      }
      await category.delete().catch(() => {});
    }

    // 🧹 SUPPRESSION ROLES
    guild.roles.cache.get(jdr.playersRoleId)?.delete().catch(() => {});
    guild.roles.cache.get(jdr.mjRoleId)?.delete().catch(() => {});

    // 🧹 DB
    deleteJdr(guild.id, categoryId);

    return interaction.reply(`🗑️ JDR supprimé avec succès`);
  }
};