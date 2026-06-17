const { SlashCommandBuilder } = require("discord.js");
const { getJdr, deleteJdr } = require("../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_delete")
    .setDescription("Supprimer un JDR")
    .addStringOption(o => o.setName("id").setRequired(true)),

  async execute(interaction) {
    const guild = interaction.guild;
    const id = interaction.options.getString("id");

    const jdr = await getJdr(guild.id, id);

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

    await guild.roles.cache.get(jdr.playersRoleId)?.delete().catch(() => {});
    await guild.roles.cache.get(jdr.mjRoleId)?.delete().catch(() => {});

    await deleteJdr(guild.id, id);

    return interaction.reply(`🗑️ supprimé`);
  }
};