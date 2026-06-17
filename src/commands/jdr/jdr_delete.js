const { SlashCommandBuilder } = require("discord.js");
const { getJdr, deleteJdr } = require("../../database/jdrDatabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_delete")
    .setDescription("Supprimer un JDR")
    .addStringOption(o =>
      o
        .setName("nom")
        .setDescription("Nom du JDR")
        .setRequired(true)
    ),

  async execute(interaction) {
    const nom = interaction.options.getString("nom").toLowerCase();
    const guild = interaction.guild;

    const jdr = getJdr(guild.id, nom);

    if (!jdr) {
      return interaction.reply({ content: "❌ introuvable", ephemeral: true });
    }

    const category = guild.channels.cache.get(jdr.categoryId);

    if (category) {
      for (const ch of category.children.cache.values()) {
        await ch.delete().catch(() => {});
      }
      await category.delete().catch(() => {});
    }

    guild.roles.cache.get(jdr.playersRoleId)?.delete();
    guild.roles.cache.get(jdr.mjRoleId)?.delete();

    deleteJdr(guild.id, nom);

    return interaction.reply(`🗑️ JDR supprimé`);
  }
};