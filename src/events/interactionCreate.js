const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { getJdr, deleteJdr } = require("../database/jdrRepository");

module.exports = (client) => {

  client.on("interactionCreate", async (interaction) => {

    // ==================================================
    // SLASH COMMANDS
    // ==================================================
    if (interaction.isChatInputCommand()) {

      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction);

      } catch (err) {
        console.log(err);

        if (interaction.replied || interaction.deferred) return;

        return interaction.reply({
          content: "❌ Erreur interne",
          ephemeral: true
        });
      }
    }

    // ==================================================
    // AUTOCOMPLETE (IMPORTANT POUR TES JDR)
    // ==================================================
    if (interaction.isAutocomplete()) {
      const { getAllJdr } = require("../database/jdrRepository");

      try {
        const focused = interaction.options.getFocused();
        const jdrs = await getAllJdr(interaction.guild.id);

        const filtered = jdrs
          .filter(j => j.name.toLowerCase().includes(focused.toLowerCase()))
          .slice(0, 25)
          .map(j => ({
            name: j.name,
            value: j.categoryId
          }));

        return interaction.respond(filtered);
      } catch (err) {
        console.log(err);
      }
    }

    // ==================================================
    // BUTTONS
    // ==================================================
    if (!interaction.isButton()) return;

    const id = interaction.customId;
    const guild = interaction.guild;

    try {

      // ======================
      // DELETE REQUEST
      // ======================
      if (id.startsWith("delete_jdr_")) {

        const jdrId = id.replace("delete_jdr_", "");
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
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return interaction.reply({
            content: "❌ JDR introuvable",
            ephemeral: true
          });
        }

        await interaction.deferUpdate();

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
        await deleteJdr(guild.id, jdrId);

        return interaction.editReply({
          content: `🗑️ JDR **${jdr.name}** supprimé`,
          components: []
        });
      }

      // ======================
      // CANCEL DELETE
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

    } catch (err) {
      console.log(err);

      if (!interaction.replied && !interaction.deferred) {
        return interaction.reply({
          content: "❌ Erreur interaction",
          ephemeral: true
        });
      }
    }
  });
};