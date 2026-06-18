const { getGuild } = require("../database/guildRepository");
const { PermissionsBitField } = require("discord.js");

// ======================
// ADMIN DISCORD
// ======================
function isAdmin(interaction) {
  return interaction.member.permissions.has(
    PermissionsBitField.Flags.Administrator
  );
}

// ======================
// ROLES AUTORISÉS
// (Admin OU rôle gestionnaire)
// ======================
async function isAllowed(interaction) {

  // Admin = toujours autorisé
  if (isAdmin(interaction)) return true;

  const guildData = await getGuild(interaction.guild.id);

  if (!guildData) return false;

  const allowedRoles = guildData.allowedRoles || [];

  const memberRoles = interaction.member.roles.cache.map(r => r.id);

  return memberRoles.some(roleId =>
    allowedRoles.includes(roleId)
  );
}

// ======================
// GESTIONNAIRE GLOBAL
// ======================
async function isGestionnaire(interaction) {
  return await isAllowed(interaction);
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
  return await isAllowed(interaction);
}

// ======================
// ACCÈS PANEL MJ
// ======================
function canAccessMJ(interaction, jdr) {

  if (isAdmin(interaction)) return true;

  return isMJ(interaction, jdr);
}

module.exports = {
  isAllowed,
  isAdmin,
  isGestionnaire,
  isMJ,
  canAccessGestion,
  canAccessMJ
};