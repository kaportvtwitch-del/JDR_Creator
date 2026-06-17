const { SlashCommandBuilder } = require("discord.js");
const { getJdr, deleteJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_delete")
    .setDescription("Supprimer un JDR")

    .addStringOption(o =>
      o
        .setName("id")
        .setDescription("ID du JDR à supprimer")
        .setRequired(true)
    ),

  async execute(interaction) {
    const guild = interaction.guild;
    const id = interaction.options.getString("id");

    const jdr = await getJdr(guild.id, id);

    if (!jdr) {
      return interaction.reply({
        content: "❌ introuvable",
        ephemeral: true
      });
    }

    // ======================
    // DELETE CHANNELS
    // ======================
    const category = guild.channels.cache.get(jdr.categoryId);

    if (category) {
      for (const ch of category.children.cache.values()) {
        await ch.delete().catch(() => {});
      }
      await category.delete().catch(() => {});
    }

    // ======================
    // DELETE ROLES
    // ======================
    guild.roles.cache.get(jdr.playersRoleId)?.delete().catch(() => {});
    guild.roles.cache.get(jdr.mjRoleId)?.delete().catch(() => {});

    // ======================
    // DELETE DB
    // ======================
    await deleteJdr(guild.id, id);

    return interaction.reply(`🗑️ JDR supprimé`);
  }
};