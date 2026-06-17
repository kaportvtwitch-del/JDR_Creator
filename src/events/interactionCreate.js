const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { getJdr, deleteJdr } = require("../database/jdrRepository");

module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {

    // ======================
    // SLASH COMMANDS
    // ======================
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);
      } catch (err) {
        console.log(err);

        if (!interaction.replied) {
          return interaction.reply({
            content: "❌ Erreur interne",
            ephemeral: true
          });
        }
      }
    }

    // ======================
    // BUTTONS
    // ======================
    if (!interaction.isButton()) return;

    const id = interaction.customId;

    // ======================
    // DELETE REQUEST
    // ======================
    if (id.startsWith("delete_jdr_")) {

      const jdrId = id.replace("delete_jdr_", "");
      const guild = interaction.guild;

      const jdr = await getJdr(guild.id, jdrId);

      if (!jdr) {
        return interaction.reply({
          content: "❌ JDR introuvable",
          ephemeral: true
        });
      }

      const confirmRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId(`confirm_delete_${jdrId}`)
          .setLabel("✔ Oui supprimer")
          .setStyle(ButtonStyle.Danger),

        new ButtonBuilder()
          .setCustomId("cancel_delete")
          .setLabel("❌ Annuler")
          .setStyle(ButtonStyle.Secondary)
      );

      return interaction.reply({
        content: `⚠️ Supprimer le JDR **${jdr.name}** ?`,
        components: [confirmRow],
        ephemeral: true
      });
    }

    // ======================
    // CONFIRM DELETE
    // ======================
    if (id.startsWith("confirm_delete_")) {

      const jdrId = id.replace("confirm_delete_", "");
      const guild = interaction.guild;

      const jdr = await getJdr(guild.id, jdrId);

      if (!jdr) {
        return interaction.reply({
          content: "❌ JDR introuvable",
          ephemeral: true
        });
      }

      // delete channels
      const category = guild.channels.cache.get(jdr.categoryId);

      if (category) {
        for (const ch of category.children.cache.values()) {
          await ch.delete().catch(() => {});
        }
        await category.delete().catch(() => {});
      }

      // delete roles
      guild.roles.cache.get(jdr.playersRoleId)?.delete().catch(() => {});
      guild.roles.cache.get(jdr.mjRoleId)?.delete().catch(() => {});

      // delete DB
      await deleteJdr(guild.id, jdrId);

      return interaction.update({
        content: `🗑️ JDR **${jdr.name}** supprimé`,
        components: []
      });
    }

    // ======================
    // CANCEL
    // ======================
    if (id === "cancel_delete") {
      return interaction.update({
        content: "❌ Suppression annulée",
        components: []
      });
    }

    // ======================
    // CLOSE LIST
    // ======================
    if (id === "close_jdr_list") {
      return interaction.update({
        content: "📕 Liste fermée",
        embeds: [],
        components: []
      });
    }
  });
};