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
    .setDescription("Créer un JDR")
    .addStringOption(o => o.setName("nom").setRequired(true))
    .addUserOption(o => o.setName("proprietaire").setRequired(true)),

  async execute(interaction) {
    if (!isAllowed(interaction)) {
      return interaction.reply({ content: "⛔ interdit", ephemeral: true });
    }

    const nom = interaction.options.getString("nom").toLowerCase().trim();
    const owner = await interaction.guild.members.fetch(
      interaction.options.getUser("proprietaire").id
    );

    const guild = interaction.guild;

    const playersRole = await guild.roles.create({
      name: `joueurs_${nom}`,
      mentionable: true
    });

    const mjRole = await guild.roles.create({
      name: `mj_${nom}`
    });

    await owner.roles.add(mjRole);

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
          id: owner.id,
          allow: [
            PermissionFlagsBits.ViewChannel,
            PermissionFlagsBits.SendMessages,
            PermissionFlagsBits.ManageChannels,
            PermissionFlagsBits.ManageMessages,
            PermissionFlagsBits.MuteMembers,
            PermissionFlagsBits.DeafenMembers,
            PermissionFlagsBits.MoveMembers
          ]
        }
      ]
    });

    await guild.channels.create({ name: "general", type: 0, parent: category.id });
    await guild.channels.create({ name: "annonce", type: 0, parent: category.id });
    await guild.channels.create({ name: "Vocal", type: 2, parent: category.id });

    setJdr(guild.id, nom, {
      categoryId: category.id,
      playersRoleId: playersRole.id,
      mjRoleId: mjRole.id,
      ownerId: owner.id
    });

    return interaction.reply(`✅ JDR ${nom} créé`);
  }
};