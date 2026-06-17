const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const { isAllowed } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_create")
    .setDescription("Créer un espace JDR privé")
    .addStringOption(option =>
      option
        .setName("nom")
        .setDescription("Nom du JDR")
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName("proprietaire")
        .setDescription("Propriétaire du JDR")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      // Vérification des permissions
      if (!isAllowed(interaction)) {
        return interaction.reply({
          content: "⛔ Vous n'êtes pas autorisé à utiliser cette commande.",
          ephemeral: true
        });
      }

      const nomJdr = interaction.options.getString("nom").trim();
      const proprietaireUser =
        interaction.options.getUser("proprietaire");

      const guild = interaction.guild;

      const proprietaire = await guild.members.fetch(
        proprietaireUser.id
      );

      const roleName = `joueurs_${nomJdr}`;

      // Vérification rôle existant
      const existingRole = guild.roles.cache.find(
        r => r.name.toLowerCase() === roleName.toLowerCase()
      );

      if (existingRole) {
        return interaction.reply({
          content: `❌ Le rôle "${roleName}" existe déjà.`,
          ephemeral: true
        });
      }

      // Création du rôle
      const role = await guild.roles.create({
        name: roleName,
        mentionable: true,
        reason: `Création du JDR ${nomJdr}`
      });

      // Création catégorie privée
      const category = await guild.channels.create({
        name: nomJdr,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [
              PermissionFlagsBits.ViewChannel
            ]
          },

          {
            id: role.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak
            ]
          },

          {
            id: proprietaire.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,

              PermissionFlagsBits.ManageMessages,
              PermissionFlagsBits.ManageChannels,

              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers
            ]
          }
        ],
        reason: `Création du JDR ${nomJdr}`
      });

      // Salon général
      await guild.channels.create({
        name: "general",
        type: ChannelType.GuildText,
        parent: category.id,
        reason: `Création du JDR ${nomJdr}`
      });

      // Salon annonce
      await guild.channels.create({
        name: "annonce",
        type: ChannelType.GuildText,
        parent: category.id,
        reason: `Création du JDR ${nomJdr}`
      });

      // Salon vocal
      await guild.channels.create({
        name: "Vocal",
        type: ChannelType.GuildVoice,
        parent: category.id,
        reason: `Création du JDR ${nomJdr}`
      });

      await interaction.reply({
        content:
          `✅ JDR créé avec succès\n\n` +
          `📁 Catégorie : **${nomJdr}**\n` +
          `🎭 Rôle : <@&${role.id}>\n` +
          `👑 Propriétaire : ${proprietaire}\n\n` +
          `🔒 Catégorie privée créée`,
        ephemeral: false
      });

    } catch (error) {
      console.error("[JDR_CREATE]", error);

      if (!interaction.replied) {
        await interaction.reply({
          content: "❌ Une erreur est survenue lors de la création du JDR.",
          ephemeral: true
        });
      }
    }
  }
};