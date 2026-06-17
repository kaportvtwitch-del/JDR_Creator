const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_joueur_list")
    .setDescription("Liste les joueurs d'un JDR")
    .addRoleOption(option =>
      option
        .setName("role")
        .setDescription("Rôle joueurs du JDR")
        .setRequired(true)
    ),

  async execute(interaction) {
    const role = interaction.options.getRole("role");

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

    const members = role.members;

    if (members.size === 0) {
      return interaction.reply(
        `📜 Aucun joueur dans ${role}`
      );
    }

    const liste = members.map(m => `• ${m.user.tag}`);

    return interaction.reply(
      `📜 Joueurs de ${role}\n\n${liste.join("\n")}`
    );
  }
};