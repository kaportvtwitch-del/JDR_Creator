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
    .setDescription("Créer un JDR")
    .addStringOption(o =>
      o.setName("nom")
        .setDescription("Nom du JDR")
        .setRequired(true)
    )
    .addUserOption(o =>
      o.setName("proprietaire")
        .setDescription("MJ du JDR")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isAllowed(interaction)) {
      return interaction.reply({
        content: "⛔ interdit",
        flags: 64
      });
    }

    const nom = interaction.options.getString("nom")?.toLowerCase().trim();
    const ownerUser = interaction.options.getUser("proprietaire");

    if (!nom || !ownerUser) {
      return interaction.reply({
        content: "❌ paramètres invalides",
        flags: 64
      });
    }

    const guild = interaction.guild;

    const owner = await guild.members.fetch(ownerUser.id);

    // =========================
    // ROLES
    // =========================
    const playersRole = await guild.roles.create({
      name: `joueurs_${nom}`,
      mentionable: true
    });

    const mjRole = await guild.roles.create({
      name: `mj_${nom}`,
      mentionable: false
    });

    await owner.roles.add(mjRole).catch(() => {});

    // =========================
    // CATEGORY
    // =========================
    const category = await guild.channels.create({
      name: nom,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone.id,
          deny: [PermissionFlagsBits.ViewChannel]
        },
        {
          id: playersRole.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        },
        {
          id: mjRole.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.ManageRoles,
            PermissionFlagsBits.MuteMembers,
            PermissionFlagsBits.DeafenMembers,
            PermissionFlagsBits.MoveMembers
          ]
        }
      ]
    });

    // =========================
    // CHANNELS
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
      name: "vocal",
      type: ChannelType.GuildVoice,
      parent: category.id
    });

    // =========================
    // DB SAFE SAVE
    // =========================
    try {
      await setJdr(guild.id, nom, {
        id: category.id,
        guildId: guild.id,
        name: nom,
        categoryId: category.id,
        playersRoleId: playersRole.id,
        mjRoleId: mjRole.id,
        ownerId: owner.id
      });
    } catch (err) {
      console.error("❌ DB ERROR setJdr:", err);
    }

    return interaction.reply({
      content: `✅ JDR **${nom}** créé avec succès`,
      flags: 64
    });
  }
};