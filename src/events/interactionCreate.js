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
// HELPERS
// ==================================================
function isAdmin(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

async function getGuildData(guildId) {
  return require("../database/guildRepository").getGuild(guildId);
}

// ==================================================
// MAIN
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

    const guildData = await getGuildData(guild.id);

    try {

      // ==================================================
      // BACK PANEL
      // ==================================================
      if (id === "back_panel") {

        const embed = new EmbedBuilder()
          .setTitle("🎲 Panel JDR")
          .setColor(0x00aeff);

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
      // ADMIN PANEL
      // ==================================================
      if (id === "panel_admin") {

        if (!isAdmin(member)) {
          return interaction.reply({ content: "⛔ Admin uniquement", ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle("👑 Panel Admin")
          .setColor(0xff0000);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("jdr_gestion_add")
            .setLabel("➕ Ajouter gestionnaire")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("jdr_gestion_del")
            .setLabel("➖ Retirer gestionnaire")
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId("jdr_gestion_list")
            .setLabel("📜 Liste gestionnaires")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("back_panel")
            .setLabel("⬅ Retour")
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // GESTION PANEL
      // ==================================================
      if (id === "panel_gestion") {

        if (!isAdmin(member) && !guildData?.allowedRoles?.some(r => member.roles.cache.has(r))) {
          return interaction.reply({ content: "⛔ Accès refusé", ephemeral: true });
        }

        const embed = new EmbedBuilder()
          .setTitle("🛠 Panel Gestionnaire")
          .setColor(0x00aaff);

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
            .setCustomId("back_panel")
            .setLabel("⬅ Retour")
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // MJ PANEL
      // ==================================================
      if (id === "panel_mj") {

        const jdrs = await getAllJdr(guild.id);

        const mjJdrs = jdrs.filter(j =>
          member.roles.cache.has(j.mjRoleId)
        );

        const embed = new EmbedBuilder()
          .setTitle("🎲 Panel MJ")
          .setColor(0x00ff99);

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
      // LIST JDR
      // ==================================================
      if (id === "jdr_list") {

        const jdrs = await getAllJdr(guild.id);

        const text = jdrs.length
          ? jdrs.map(j => `🎲 ${j.name} (\`${j.id}\`)`).join("\n")
          : "Aucun JDR";

        return interaction.reply({
          content: text,
          ephemeral: true
        });
      }

      // ==================================================
      // MJ CLICK
      // ==================================================
      if (id.startsWith("mj_jdr_")) {

        const jdrId = id.replace("mj_jdr_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return interaction.reply({ content: "❌ JDR introuvable", ephemeral: true });
        }

        return interaction.reply({
          content: `🎲 Panel MJ : **${jdr.name}**`,
          ephemeral: true
        });
      }

      // ==================================================
      // DELETE FLOW
      // ==================================================
      if (id.startsWith("delete_jdr_")) {

        const jdrId = id.replace("delete_jdr_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return interaction.reply({ content: "❌ JDR introuvable", ephemeral: true });
        }

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId(`confirm_delete_${jdrId}`)
            .setLabel("✔ Confirmer")
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId("cancel_delete")
            .setLabel("❌ Annuler")
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.reply({
          content: `Supprimer **${jdr.name}** ?`,
          components: [row],
          ephemeral: true
        });
      }

      if (id.startsWith("confirm_delete_")) {

        await interaction.deferUpdate();

        const jdrId = id.replace("confirm_delete_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (jdr) {
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
        }

        return interaction.editReply({
          content: "🗑️ JDR supprimé",
          components: []
        });
      }

      if (id === "cancel_delete") {
        return interaction.update({
          content: "❌ Annulé",
          components: []
        });
      }

      // ==================================================
      // SAFE FALLBACK
      // ==================================================
      return;

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