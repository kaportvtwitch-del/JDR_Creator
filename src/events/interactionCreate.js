module.exports = async (client) => {
  client.on("interactionCreate", async (interaction) => {

    // 🧠 SLASH COMMANDS
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.log(err);
        return interaction.reply({
          content: "❌ Erreur interne commande",
          ephemeral: true
        });
      }
    }

    // 🔘 BUTTONS (DELETE JDR)
    if (interaction.isButton()) {
      if (!interaction.customId.startsWith("delete_jdr_")) return;

      const { getJdr, deleteJdr } = require("../../database/jdrDatabase");

      const categoryId = interaction.customId.replace("delete_jdr_", "");
      const guild = interaction.guild;

      const jdr = getJdr(guild.id, categoryId);

      if (!jdr) {
        return interaction.reply({
          content: "❌ JDR introuvable",
          ephemeral: true
        });
      }

      const category = guild.channels.cache.get(jdr.categoryId);

      if (category) {
        for (const ch of category.children.cache.values()) {
          await ch.delete().catch(() => {});
        }
        await category.delete().catch(() => {});
      }

      guild.roles.cache.get(jdr.playersRoleId)?.delete().catch(() => {});
      guild.roles.cache.get(jdr.mjRoleId)?.delete().catch(() => {});

      deleteJdr(guild.id, categoryId);

      return interaction.reply({
        content: `🗑️ JDR **${jdr.name}** supprimé`,
        ephemeral: true
      });
    }
  });
};