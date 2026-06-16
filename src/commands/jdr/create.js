const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const { isAllowed } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_create")
    .setDescription("Créer une zone JDR complète (catégorie + rôle + salons)")
    .addStringOption(opt =>
      opt
        .setName("nom")
        .setDescription("Nom de la campagne / catégorie")
        .setRequired(true)
    )
    .addUserOption(opt =>
      opt
        .setName("membre")
        .setDescription("Propriétaire de la campagne")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isAllowed(interaction)) {
      return interaction.reply({
        content: "⛔ Vous n'êtes pas autorisé à utiliser cette commande.",
        ephemeral: true
      });
    }

    const nom = interaction.options.getString("nom");
    const ownerUser = interaction.options.getUser("membre");

    const guild = interaction.guild;
    const ownerMember = await guild.members.fetch(ownerUser.id);

    console.log(`[JDR] Création campagne: ${nom}`);

    // 1. Création du rôle joueur
    const role = await guild.roles.create({
      name: `Joueur_${nom}`,
      mentionable: true,
      reason: "Création JDR automatique"
    });

    console.log(`[JDR] Rôle créé: ${role.name}`);

    // 2. Création de la catégorie PRIVÉE
    const category = await guild.channels.create({
      name: nom,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
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
          id: ownerMember.id,
          allow: [
            // accès complet catégorie
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,

            // gestion JDR
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.ManageWebhooks,

            // gestion vocal
            PermissionFlagsBits.MoveMembers,
            PermissionFlagsBits.MuteMembers,
            PermissionFlagsBits.DeafenMembers
          ]
        }
      ]
    });

    console.log(`[JDR] Catégorie créée: ${category.name}`);

    // 3. Salons texte
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

    // 4. Salon vocal
    await guild.channels.create({
      name: "blabla",
      type: ChannelType.GuildVoice,
      parent: category.id
    });

    console.log(`[JDR] Salons créés`);

    // 5. Attribution du rôle au propriétaire
    await ownerMember.roles.add(role);

    console.log(`[JDR] Rôle attribué au propriétaire`);

    // 6. Réponse finale
    return interaction.reply({
      content:
        `✅ **Campagne JDR créée avec succès !**\n\n` +
        `📁 Catégorie : **${nom}**\n` +
        `🎭 Rôle : **Joueur_${nom}**\n` +
        `👑 Propriétaire : ${ownerUser}\n\n` +
        `🔒 Zone totalement privée configurée`,
      ephemeral: false
    });
  }
};