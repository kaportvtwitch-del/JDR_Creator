const { SlashCommandBuilder, ChannelType } = require("discord.js");
const { isAllowed } = require("../../utils/permissions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_create")
    .setDescription("Créer une zone JDR")
    .addStringOption(opt =>
      opt.setName("nom").setDescription("Nom catégorie").setRequired(true)
    )
    .addUserOption(opt =>
      opt.setName("membre").setDescription("Owner").setRequired(true)
    ),

  async execute(interaction) {
    if (!isAllowed(interaction)) {
      return interaction.reply({
        content: "⛔ Non autorisé",
        ephemeral: true
      });
    }

    const name = interaction.options.getString("nom");
    const member = interaction.options.getUser("membre");
    const guild = interaction.guild;

    // ROLE
    const role = await guild.roles.create({
      name: `joueur ${name}`,
      permissions: []
    });

    // CATEGORY
    const category = await guild.channels.create({
      name,
      type: ChannelType.GuildCategory
    });

    // CHANNELS
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
      name: "blabla",
      type: ChannelType.GuildVoice,
      parent: category.id
    });

    // OWNER ROLE
    const memberObj = await guild.members.fetch(member.id);
    await memberObj.roles.add(role);

    await interaction.reply(`✅ JDR créé: ${name}`);
  }
};