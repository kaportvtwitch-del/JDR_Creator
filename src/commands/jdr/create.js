const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const { isAllowed } = require("../../utils/permissions");
const { setJdr } = require("../../database/jdrRepository");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_create")
    .setDescription("Créer un JDR complet (roles + salons + permissions)")
    .addStringOption(o =>
      o.setName("nom")
        .setDescription("Nom du JDR")
        .setRequired(true)
    )
    .addUserOption(o =>
      o.setName("proprietaire")
        .setDescription("MJ principal")
        .setRequired(true)
    ),

  async execute(interaction) {

      if (!(await isAllowed(interaction))) {
      return interaction.reply({
        content: "⛔ Tu n’as pas la permission",
        ephemeral: true
      });
    }

    const nom = interaction.options.getString("nom").toLowerCase().trim();
    const ownerUser = interaction.options.getUser("proprietaire");
    const guild = interaction.guild;

    const owner = await guild.members.fetch(ownerUser.id);

    try {

      // ======================
      // ROLES
      // ======================
      const playersRole = await guild.roles.create({
        name: `joueurs_${nom}`,
        mentionable: true,
        permissions: []
      });

      const mjRole = await guild.roles.create({
        name: `mj_${nom}`,
        mentionable: true,
        permissions: []
      });

      await owner.roles.add(mjRole);

      // ======================
      // CATEGORY
      // ======================
      const category = await guild.channels.create({
        name: nom,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: mjRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.ManageChannels,
              PermissionFlagsBits.ManageMessages,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.ManageThreads,
              PermissionFlagsBits.CreatePublicThreads,
              PermissionFlagsBits.CreatePrivateThreads,
              PermissionFlagsBits.SendMessagesInThreads,
              PermissionFlagsBits.MuteMembers,
              PermissionFlagsBits.DeafenMembers,
              PermissionFlagsBits.MoveMembers,
              PermissionFlagsBits.UseVAD,
              PermissionFlagsBits.Speak
            ]
          },
          {
            id: playersRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
              PermissionFlagsBits.SendMessagesInThreads,
              PermissionFlagsBits.Connect,
              PermissionFlagsBits.UseVAD,
              PermissionFlagsBits.Speak
            ]
          }
        ]
      });

      // ======================
      // CHANNELS
      // ======================
      await guild.channels.create({
        name: "📢-annonces",
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: category.permissionOverwrites.cache
      });

      await guild.channels.create({
        name: "💬-general",
        type: ChannelType.GuildText,
        parent: category.id,
        permissionOverwrites: category.permissionOverwrites.cache
      });

      await guild.channels.create({
        name: "🔊-vocal",
        type: ChannelType.GuildVoice,
        parent: category.id,
        permissionOverwrites: category.permissionOverwrites.cache
      });

      // ======================
      // SAVE DB
      // ======================
      await setJdr({
        id: category.id,
        guildId: guild.id,
        name: nom,
        categoryId: category.id,
        playersRoleId: playersRole.id,
        mjRoleId: mjRole.id,
        ownerId: owner.id
      });

      return interaction.reply({
        content: `✅ JDR **${nom}** créé avec succès`,
        ephemeral: true
      });

    } catch (err) {
      console.log(err);

      return interaction.reply({
        content: "❌ Erreur lors de la création du JDR",
        ephemeral: true
      });
    }
  }
};