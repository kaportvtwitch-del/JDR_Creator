module.exports = (client) => {
  client.on("interactionCreate", async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, client);
    } catch (err) {
      console.error(err);
      if (!interaction.replied) {
        interaction.reply({
          content: "❌ Erreur interne",
          ephemeral: true
        });
      }
    }
  });
};