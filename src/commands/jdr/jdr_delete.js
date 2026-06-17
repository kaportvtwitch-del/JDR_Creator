const { SlashCommandBuilder } = require("discord.js");
const { getJdr, deleteJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_delete")
    .setDescription("Supprimer un JDR (Discord + DB)")
    .addStringOption(o =>
      o.setName("id")
        .setDescription("ID du JDR (category ID)")
        .setRequired(true)
    ),

  async execute(interaction) {
    const id = interaction.options.getString("id");
    const guild = interaction.guild;

    const jdr = await getJdr(guild.id, id);

    if (!jdr) {
      return interaction.reply({
        content: "❌ JDR introuvable",
        ephemeral: true
      });
    }

    try {
      // ======================
      // 1. DELETE CHANNELS
      // ======================
      const category = guild.channels.cache.get(jdr.categoryId);

      if (category) {
        for (const ch of category.children.cache.values()) {
          await ch.delete().catch(() => {});
        }
        await category.delete().catch(() => {});
      }

      // ======================
      // 2. DELETE ROLES
      // ======================
      const playersRole = guild.roles.cache.get(jdr.playersRoleId);
      const mjRole = guild.roles.cache.get(jdr.mjRoleId);

      if (playersRole) await playersRole.delete().catch(() => {});
      if (mjRole) await mjRole.delete().catch(() => {});

      // ======================
      // 3. DELETE DATABASE
      // ======================
      await deleteJdr(guild.id, id);

      return interaction.reply({
        content: `🗑️ JDR **${jdr.name}** supprimé (Discord + DB)`,
        ephemeral: true
      });

    } catch (err) {
      console.log(err);

      return interaction.reply({
        content: "❌ Erreur lors de la suppression complète",
        ephemeral: true
      });
    }
  }
};