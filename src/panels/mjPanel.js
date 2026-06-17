const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const { getAllJdr } = require("../database/jdrRepository");

module.exports = async (interaction) => {

  const member = interaction.member;
  const jdrs = await getAllJdr(interaction.guild.id);

  const myJdrs = jdrs.filter(j =>
    member.roles.cache.has(j.mjRoleId)
  );

  if (!myJdrs.length) {
    return interaction.reply({
      content: "❌ Aucun JDR trouvé",
      ephemeral: true
    });
  }

  const embed = new EmbedBuilder()
    .setTitle("🎲 Panel MJ")
    .setColor(0x57f287)
    .setDescription("Vos JDR disponibles");

  const row = new ActionRowBuilder();

  myJdrs.slice(0, 5).forEach(j => {
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`mj_select_${j.id}`)
        .setLabel(j.name)
        .setStyle(ButtonStyle.Primary)
    );
  });

  const back = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("back_panel")
      .setLabel("⬅ Retour")
      .setStyle(ButtonStyle.Secondary)
  );

  return interaction.update({
    embeds: [embed],
    components: [row, back]
  });
};