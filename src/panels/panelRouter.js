const adminPanel = require("./adminPanel");
const gestionPanel = require("./gestionPanel");
const mjPanel = require("./mjPanel");

module.exports = async (interaction) => {

  const id = interaction.customId;

  if (id === "panel_admin") return adminPanel(interaction);
  if (id === "panel_gestion") return gestionPanel(interaction);
  if (id === "panel_mj") return mjPanel(interaction);

  if (id === "back_panel") {
    return interaction.update({
      content: "🎲 Panel principal",
      embeds: [],
      components: []
    });
  }

};