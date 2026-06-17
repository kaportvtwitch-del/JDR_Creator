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
// HELPERS SAFE
// ==================================================
function isAdmin(member) {
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

function isGestionnaire(member, guildData) {
  const roles = guildData?.allowedRoles || [];
  return roles.some(roleId => member.roles.cache.has(roleId));
}

function canAccessGestion(member, guildData) {
  return isAdmin(member) || isGestionnaire(member, guildData);
}

// ==================================================
// SAFE REPLY
// ==================================================
async function safeReply(interaction, data) {
  try {
    if (interaction.deferred || interaction.replied) {
      return interaction.editReply(data);
    }
    return interaction.reply(data);
  } catch (e) {
    console.log("safeReply error:", e);
  }
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
        return safeReply(interaction, {
          content: "❌ Erreur interne",
          ephemeral: true
        });
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

    const guildData = await getGuild(guild.id) || { allowedRoles: [] };

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
      // ADMIN PANEL (GESTION DES GESTIONNAIRES)
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
          .setDescription("Gestion des gestionnaires");

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("jdr_gestion_add")
            .setLabel("➕ Add gestionnaire")
            .setStyle(ButtonStyle.Success),

          new ButtonBuilder()
            .setCustomId("jdr_gestion_del")
            .setLabel("➖ Remove gestionnaire")
            .setStyle(ButtonStyle.Danger),

          new ButtonBuilder()
            .setCustomId("jdr_gestion_list")
            .setLabel("📜 List gestionnaire")
            .setStyle(ButtonStyle.Primary),

          new ButtonBuilder()
            .setCustomId("back_panel")
            .setLabel("⬅ Back")
            .setStyle(ButtonStyle.Secondary)
        );

        return interaction.update({ embeds: [embed], components: [row] });
      }

      // ==================================================
      // GESTION PANEL
      // ==================================================
      if (id === "panel_gestion") {

        if (!canAccessGestion(member, guildData)) {
          return safeReply(interaction, {
            content: "⛔ Accès refusé",
            ephemeral: true
          });
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
            .setLabel("⬅ Back")
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

        return safeReply(interaction, {
          content: text,
          ephemeral: true
        });
      }

      // ==================================================
      // MJ SELECT
      // ==================================================
      if (id.startsWith("mj_jdr_")) {

        const jdrId = id.replace("mj_jdr_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return safeReply(interaction, {
            content: "❌ JDR introuvable",
            ephemeral: true
          });
        }

        return safeReply(interaction, {
          content: `🎲 MJ Panel : **${jdr.name}**`,
          ephemeral: true
        });
      }

      // ==================================================
      // DELETE FLOW
      // ==================================================
      if (id.startsWith("delete_jdr_")) {

        await interaction.deferReply({ ephemeral: true });

        const jdrId = id.replace("delete_jdr_", "");
        const jdr = await getJdr(guild.id, jdrId);

        if (!jdr) {
          return interaction.editReply("❌ JDR introuvable");
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

        await deleteJdr(guild.id, jdrId);

        return interaction.editReply(`🗑️ JDR **${jdr.name}** supprimé`);
      }

      // ==================================================
      // UNKNOWN BUTTON (🔥 FIX ÉCHEC INTERACTION)
      // ==================================================
      const known = [
        "panel_admin",
        "panel_gestion",
        "panel_mj",
        "back_panel",
        "jdr_list"
      ];

      if (
        !known.includes(id) &&
        !id.startsWith("mj_jdr_") &&
        !id.startsWith("delete_jdr_") &&
        !id.startsWith("confirm_delete_")
      ) {
        console.log("❌ BUTTON NON GÉRÉ :", id);

        return safeReply(interaction, {
          content: "⚠️ Bouton non configuré",
          ephemeral: true
        });
      }

    } catch (err) {
      console.log(err);

      return safeReply(interaction, {
        content: "❌ Erreur interaction",
        ephemeral: true
      });
    }
  });
};