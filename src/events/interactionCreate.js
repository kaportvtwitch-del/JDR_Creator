const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionsBitField,
  EmbedBuilder
} = require("discord.js");

const {
  getJdr,
  deleteJdr,
  getAllJdr
} = require("../database/jdrRepository");

// ==================================================
// HELPERS PERMISSIONS
// ==================================================
function isAdmin(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

function isGestionnaire(member, guildData) {
  if (!guildData) return false;

  return guildData.allowedRoles?.some(roleId =>
    member.roles.cache.has(roleId)
  );
}

function isMJ(member, jdr) {
  if (!jdr) return false;
  return member.roles.cache.has(jdr.mjRoleId);
}

function canAccessGestion(member, guildData) {
  return isAdmin(member) || isGestionnaire(member, guildData);
}

// ==================================================
// MAIN EVENT
// ==================================================
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

        if (!interaction.replied && !interaction.deferred) {
          return interaction.reply({
            content: "❌ Erreur interne",
            ephemeral: true
          });
        }
      }
    }

    // ==================================================
    // AUTOCOMPLETE
    // ==================================================
    if (interaction.isAutocomplete()) {
      try {
        const focused = interaction.options.getFocused();
        const jdrs = await getAllJdr(interaction.guild.id);

        const filtered = jdrs
          .filter(j => j.name.toLowerCase().includes(focused.toLowerCase()))
          .slice(0, 25)
          .map(j => ({
            name: j.name,
            value: j.id
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
    const member = interaction.member;

    const guildData = await require("../database/guildRepository").getGuild(guild.id);

    try {

      // ==================================================
      // 🎛 PANEL ADMIN
      // ==================================================
      if (id === "panel_admin") {

        if (!isAdmin(member)) {
          return interaction.reply({ content: "⛔ Accès refusé", ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle("👑 Panel Admin")
          .setColor(0xff0000)
          .setDescription("Gestion globale du serveur JDR");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("jdr_create")
            .setLabel("➕ Créer JDR")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("jdr_list")
            .setLabel("📜 Liste JDR")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("jdr_gestion_add")
            .setLabel("➕ Ajout gestionnaire")
            .setStyle(ButtonStyle.Secondary),

          new ButtonBuilder()
            .setCustomId("back_panel")
            .setLabel("⬅ Retour")
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // 🛠 PANEL GESTION
      // ==================================================
      if (id === "panel_gestion") {

        if (!canAccessGestion(member, guildData)) {
          return interaction.reply({ content: "⛔ Accès refusé", ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle("🛠 Panel Gestionnaire")
          .setColor(0x00aaff)
          .setDescription("Gestion des JDR");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("jdr_create")
            .setLabel("➕ Créer JDR")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("jdr_list")
            .setLabel("📜 Liste JDR")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("jdr_delete")
            .setLabel("🗑 Supprimer JDR")
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId("back_panel")
            .setLabel("⬅ Retour")
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // 🎲 PANEL MJ
      // ==================================================
      if (id === "panel_mj") {

        const jdrs = await getAllJdr(guild.id);

        const mjJdrs = jdrs.filter(j =>
          member.roles.cache.has(j.mjRoleId)
        );

        if (mjJdrs.length === 0 && !isAdmin(member) && !isGestionnaire(member, guildData)) {
          return interaction.reply({
            content: "⛔ Aucun JDR MJ trouvé",
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("🎲 Panel MJ")
          .setColor(0x00ff99)
          .setDescription("Tes JDR disponibles");

        const row = new ActionRowBuilder();

        mjJdrs.slice(0, 5).forEach(j => {
          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`mj_jdr_${j.id}`)
              .setLabel(j.name)
              .setStyle(ButtonStyle.Primary)
          );
        });

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // 🔙 BACK
      // ==================================================
      if (id === "back_panel") {

        const embed = new EmbedBuilder()
          .setTitle("🎲 Panel JDR")
          .setColor(0x00aeff)
          .setDescription("Sélectionne une section");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("panel_admin")
            .setLabel("👑 Admin")
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId("panel_gestion")
            .setLabel("🛠 Gestion")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("panel_mj")
            .setLabel("🎲 MJ")
            .setStyle(ButtonStyle.Success)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // DELETE REQUEST
      // ==================================================
      if (id.startsWith("delete_jdr_")) {

        const jdrId = id.replace("delete_jdr_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return interaction.reply({ content: "❌ JDR introuvable", ephemeral: true });
        }

        if (!canAccessGestion(member, guildData)) {
          return interaction.reply({ content: "⛔ Accès refusé", ephemeral: true });
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

      // ==================================================
      // CONFIRM DELETE
      // ==================================================
      if (id.startsWith("confirm_delete_")) {

        const jdrId = id.replace("confirm_delete_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return interaction.reply({ content: "❌ JDR introuvable", ephemeral: true });
        }

        if (!canAccessGestion(member, guildData)) {
          return interaction.reply({ content: "⛔ Accès refusé", ephemeral: true });
        }

        await interaction.deferUpdate();

        const category = guild.channels.cache.get(jdr.categoryId);

        if (category) {
          for (const ch of category.children.cache.values()) {
            await ch.delete().catch(() => {});
          }
          await category.delete().catch(() => {});
        }

        guild.roles.cache.get(jdr.playersRoleId)?.delete().catch(() => {});
        guild.roles.cache.get(jdr.mjRoleId)?.delete().catch(() => {});

        await deleteJdr(guild.id, jdrId);

        return interaction.editReply({
          content: `🗑️ JDR **${jdr.name}** supprimé`,
          components: []
        });
      }

      // ==================================================
      // CANCEL
      // ==================================================
      if (id === "cancel_delete") {
        return interaction.update({
          content: "❌ Suppression annulée",
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