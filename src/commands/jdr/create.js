const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits
} = require("discord.js");

const { isAllowed } = require("../../utils/permissions");
const { setJdr } = require("../../database/jdrDatabase");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_create")
    .setDescription("Créer un JDR complet")
    .addStringOption(o =>
      o
        .setName("nom")
        .setDescription("Nom du JDR")
        .setRequired(true)
    )
    .addUserOption(o =>
      o
        .setName("proprietaire")
        .setDescription("MJ du JDR")
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!isAllowed(interaction)) {
      return interaction.reply({ content: "⛔ Vous n'êtes pas autoriser à utiliser cette commande", ephemeral: true });
    }

    const nom = interaction.options.getString("nom").toLowerCase().trim();

    const ownerMember = await interaction.guild.members.fetch(
      interaction.options.getUser("proprietaire").id
    );

    const guild = interaction.guild;

    // 🎭 ROLE JOUEURS
    const playersRole = await guild.roles.create({
      name: `joueurs_${nom}`,
      mentionable: true
    });

    // 🎩 ROLE MJ
    const mjRole = await guild.roles.create({
      name: `mj_${nom}`,
      mentionable: true
    });

    await ownerMember.roles.add(mjRole);

    // 📁 CATEGORIE JDR
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
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        },
        {
          id: mjRole.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ReadMessageHistory,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.ManageRoles
          ]
        }
      ]
    });

    // 💬 SALONS TEXTES
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

    // 🔊 SALON VOCAL
    await guild.channels.create({
      name: "vocal",
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: playersRole.id,
          allow: [
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak
          ]
        },
        {
          id: mjRole.id,
          allow: [
            PermissionFlagsBits.Connect,
            PermissionFlagsBits.Speak,
            PermissionFlagsBits.MuteMembers,
            PermissionFlagsBits.DeafenMembers,
            PermissionFlagsBits.MoveMembers
          ]
        }
      ]
    });

    // 💾 DB (KEY = CATEGORY ID)
    setJdr(guild.id, category.id, {
      name: nom,
      categoryId: category.id,
      playersRoleId: playersRole.id,
      mjRoleId: mjRole.id,
      ownerId: ownerMember.id
    });

    return interaction.reply(`✅ JDR **${nom}** créé avec succès`);
  }
};