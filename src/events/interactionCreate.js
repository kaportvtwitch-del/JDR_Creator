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

const { getGuild } = require("../database/guildRepository");

// ==================================================
// HELPERS
// ==================================================
function isAdmin(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

function isGestionnaire(member, guildData) {
  return guildData?.allowedRoles?.some(roleId =>
    member.roles.cache.has(roleId)
  );
}

function canGestion(member, guildData) {
  return isAdmin(member) || isGestionnaire(member, guildData);
}

// ==================================================
// SAFE REPLY SYSTEM (ANTI CRASH)
// ==================================================
async function safeReply(interaction, payload) {
  if (interaction.replied || interaction.deferred) {
    return interaction.followUp(payload);
  }
  return interaction.reply(payload);
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
            content: "❌ Erreur commande",
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
        const jdrs = await getAllJdr(interaction.guild.id);
        const focused = interaction.options.getFocused();

        return interaction.respond(
          jdrs
            .filter(j => j.name.toLowerCase().includes(focused.toLowerCase()))
            .slice(0, 25)
            .map(j => ({
              name: j.name,
              value: j.id
            }))
        );
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

    let guildData = null;
    try {
      guildData = await getGuild(guild.id);
    } catch (e) {
      console.log(e);
    }

    try {

      // ==================================================
      // PANEL ADMIN
      // ==================================================
      if (id === "panel_admin") {

        if (!isAdmin(member)) {
          return safeReply(interaction, {
            content: "⛔ Admin uniquement",
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("👑 Panel Admin")
          .setColor(0xff0000)
          .setDescription("Gestion gestionnaires");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("jdr_gestion_add").setLabel("➕ Add").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("jdr_gestion_del").setLabel("➖ Del").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("jdr_gestion_list").setLabel("📜 List").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("back_panel").setLabel("⬅ Back").setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // PANEL GESTION
      // ==================================================
      if (id === "panel_gestion") {

        if (!canGestion(member, guildData)) {
          return safeReply(interaction, {
            content: "⛔ Refusé",
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("🛠 Panel Gestionnaire")
          .setColor(0x00aaff);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("jdr_create").setLabel("➕ Créer JDR").setStyle(ButtonStyle.Success),
          new ButtonBuilder().setCustomId("jdr_list").setLabel("📜 Liste JDR").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("jdr_delete").setLabel("🗑 Delete").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("back_panel").setLabel("⬅ Back").setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // PANEL MJ (SAFE + FIX ROW LIMIT)
      // ==================================================
      if (id === "panel_mj") {

        const jdrs = await getAllJdr(guild.id);
        const mjJdrs = jdrs.filter(j => member.roles.cache.has(j.mjRoleId));

        if (mjJdrs.length === 0) {
          return safeReply(interaction, {
            content: "❌ Aucun JDR MJ",
            ephemeral: true
          });
        }

        const embed = new EmbedBuilder()
          .setTitle("🎲 Panel MJ")
          .setColor(0x00ff99);

        const rows = [];
        let row = new ActionRowBuilder();

        for (const j of mjJdrs.slice(0, 10)) {

          if (row.components.length === 5) {
            rows.push(row);
            row = new ActionRowBuilder();
          }

          row.addComponents(
            new ButtonBuilder()
              .setCustomId(`mj_jdr_${j.id}`)
              .setLabel(j.name.slice(0, 80))
              .setStyle(ButtonStyle.Primary)
          );
        }

        if (row.components.length) rows.push(row);

        return interaction.update({ embeds: [embed], components: rows });
      }

      // ==================================================
      // BACK
      // ==================================================
      if (id === "back_panel") {

        const embed = new EmbedBuilder()
          .setTitle("🎲 Panel JDR")
          .setColor(0x00aeff);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId("panel_admin").setLabel("👑 Admin").setStyle(ButtonStyle.Danger),
          new ButtonBuilder().setCustomId("panel_gestion").setLabel("🛠 Gestion").setStyle(ButtonStyle.Primary),
          new ButtonBuilder().setCustomId("panel_mj").setLabel("🎲 MJ").setStyle(ButtonStyle.Success)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // DELETE FLOW (SAFE FIX)
      // ==================================================
      if (id.startsWith("delete_jdr_")) {

        const jdrId = id.replace("delete_jdr_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return safeReply(interaction, {
            content: "❌ JDR introuvable",
            ephemeral: true
          });
        }

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder().setCustomId(`confirm_delete_${jdrId}`).setStyle(ButtonStyle.Danger).setLabel("✔ Oui"),
          new ButtonBuilder().setCustomId("cancel_delete").setStyle(ButtonStyle.Secondary).setLabel("❌ Non")
        );

        return safeReply(interaction, {
          content: `Supprimer **${jdr.name}** ?`,
          components: [row],
          ephemeral: true
        });
      }

      if (id.startsWith("confirm_delete_")) {

        const jdrId = id.replace("confirm_delete_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return safeReply(interaction, {
            content: "❌ introuvable",
            ephemeral: true
          });
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
          content: "🗑️ JDR supprimé",
          components: []
        });
      }

      if (id === "cancel_delete") {
        return interaction.update({
          content: "❌ annulé",
          components: []
        });
      }

      // ==================================================
      // FALLBACK SAFE (IMPORTANT FIX)
      // ==================================================
      console.log("⚠️ BUTTON NON GÉRÉ :", id);

      return safeReply(interaction, {
        content: "⚠️ Action non disponible",
        ephemeral: true
      });

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