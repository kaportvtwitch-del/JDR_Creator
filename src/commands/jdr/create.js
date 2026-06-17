const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const { isAllowed } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_create")
    .setDescription("Créer un JDR complet (MJ + joueurs + salons privés)")
    .addStringOption(option =>
      option
        .setName("nom")
        .setDescription("Nom du JDR")
        .setRequired(true)
    )
    .addUserOption(option =>
      option
        .setName("proprietaire")
        .setDescription("MJ / propriétaire du JDR")
        .setRequired(true)
    ),

  async execute(interaction) {
    try {
      if (!isAllowed(interaction)) {
        return interaction.reply({
          content: "⛔ Vous n'êtes pas autorisé à créer un JDR.",
          ephemeral: true
        });
      }

      const nom = interaction.options.getString("nom").trim();
      const ownerUser = interaction.options.getUser("proprietaire");

      const guild = interaction.guild;
      const owner = await guild.members.fetch(ownerUser.id);

      console.log(`[JDR] Création du JDR : ${nom}`);

      // =========================
      // 1. ROLES
      // =========================

      const playersRole = await guild.roles.create({
        name: `joueurs_${nom}`,
        mentionable: true,
        reason: `Création JDR ${nom}`
      });

      const mjRole = await guild.roles.create({
        name: `mj_${nom}`,
        mentionable: false,
        reason: `MJ du JDR ${nom}`
      });

      console.log(`[JDR] Rôles créés`);

      // Donne le rôle MJ au propriétaire
      await owner.roles.add(mjRole);

      // =========================
      // 2. CATEGORIE PRIVEE
      // =========================

      const category = await guild.channels.create({
        name: nom,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },

          // accès joueurs
          {
            id: playersRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak
            ]
          },

          // accès MJ (owner)
          {
            id: owner.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.Speak,

              // gestion JDR
              PermissionFlagsBits.ManageMessages,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageWebhooks,

              // vocal admin
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers
            ]
          }
        ]
      });

      console.log(`[JDR] Catégorie créée`);

      // =========================
      // 3. SALONS
      // =========================

      await guild.channels.create({
        name: "general",
        type: ChannelType.GuildText,
        parent: category.id
      });

      await guild.channels.create({
        name: "annonce",
        type: ChannelType.GuildText,
        parent: category.id
      });

      await guild.channels.create({
        name: "Vocal",
        type: ChannelType.GuildVoice,
        parent: category.id
      });

      console.log(`[JDR] Salons créés`);

      // =========================
      // 4. FEEDBACK
      // =========================

      return interaction.reply({
        content:
          `✅ **JDR créé avec succès !**\n\n` +
          `📁 Nom : **${nom}**\n` +
          `🎭 Joueurs : <@&${playersRole.id}>\n` +
          `👑 MJ : <@&${mjRole.id}> (assigné à ${ownerUser})\n\n` +
          `🔒 Catégorie privée configurée`,
        ephemeral: false
      });

    } catch (error) {
      console.error("[JDR_CREATE_ERROR]", error);

      if (!interaction.replied) {
        return interaction.reply({
          content: "❌ Erreur lors de la création du JDR.",
          ephemeral: true
        });
      }
    }
  }
};