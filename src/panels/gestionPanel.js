const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { getGuild } = require("../database/guildRepository");

function canGestion(member, guildData) {
  return member.permissions.has("Administrator") ||
    guildData.allowedRoles.some(r => member.roles.cache.has(r));
}

module.exports = async (interaction) => {

  const member = interaction.member;
  const guildData = await getGuild(interaction.guild.id);

  if (!canGestion(member, guildData)) {
    return interaction.reply({ content: "⛔ Accès refusé", ephemeral: true });
  }

  const embed = new EmbedBuilder()
    .setTitle("🛠 Panel Gestionnaire")
    .setColor(0x3498db);

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
      .setStyle(ButtonStyle.Danger)
  );

  const back = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("back_panel")
      .setLabel("⬅ Retour")
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.update({
    embeds: [embed],
    components: [row, back]
  });
};