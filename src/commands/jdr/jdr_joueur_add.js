const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_add")
    .setDescription("Ajoute un joueur à un JDR")
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Rôle joueurs du JDR")
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName("joueur")
        .setDescription("Joueur à ajouter")
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("role");
    const joueur = interaction.options.getMember("joueur");

    if (!role.name.startsWith("joueurs_")) {
      return interaction.reply({
        content: "❌ Ce rôle n'est pas un rôle JDR valide.",
        ephemeral: true
      });
    }

    const mjRoleName = role.name.replace("joueurs_", "mj_");

    const hasMjRole =
      interaction.member.roles.cache.some(
        r => r.name === mjRoleName
      );

    if (!hasMjRole) {
      return interaction.reply({
        content: "⛔ Vous n'êtes pas MJ de ce JDR.",
        ephemeral: true
      });
    }

    await joueur.roles.add(role);

    return interaction.reply(
      `✅ ${joueur} ajouté au rôle ${role}`
    );
  }
};