const { getGuild } = require("../database/guildRepository");

// ======================
// ROLES AUTORISÉS (ton système actuel)
// ======================
async function isAllowed(interaction) {
  const guildData = await getGuild(interaction.guild.id);

  const memberRoles = interaction.member.roles.cache.map(r => r.id);

  return memberRoles.some(role =>
    guildData.allowedRoles.includes(role)
  );
}

// ======================
// ADMIN DISCORD
// ======================
function isAdmin(interaction) {
  return interaction.member.permissions.has("Administrator");
}

// ======================
// GESTIONNAIRE GLOBAL (DB + admin)
// ======================
async function isGestionnaire(interaction) {
  if (isAdmin(interaction)) return true;

  const guildData = await getGuild(interaction.guild.id);

  const memberRoles = interaction.member.roles.cache.map(r => r.id);

  return memberRoles.some(role =>
    guildData.allowedRoles.includes(role)
  );
}

// ======================
// MJ D'UN JDR
// ======================
function isMJ(interaction, jdr) {
  if (!jdr) return false;
  return interaction.member.roles.cache.has(jdr.mjRoleId);
}

// ======================
// ACCÈS PANEL GESTION
// ======================
async function canAccessGestion(interaction) {
  return await isGestionnaire(interaction);
}

// ======================
// ACCÈS PANEL MJ
// ======================
function canAccessMJ(interaction, jdr) {
  return isAdmin(interaction) || isMJ(interaction, jdr);
}

module.exports = {
  isAllowed,
  isAdmin,
  isGestionnaire,
  isMJ,
  canAccessGestion,
  canAccessMJ
};