const fs = require("fs");
const { REST, Routes } = require("discord.js");

async function deployCommands() {
  try {
    console.log("[DEPLOY] 🚀 START");
    console.log("[DEPLOY] CLIENT_ID =", process.env.CLIENT_ID);

    const commands = [];

    const commandFiles = fs.readdirSync("./src/commands/jdr");

    for (const file of commandFiles) {
      const command = require(`../commands/jdr/${file}`);
      commands.push(command.data.toJSON());
    }

    console.log(`[DEPLOY] ${commands.length} commandes trouvées`);

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("[DEPLOY] ✅ DONE");
  } catch (err) {
    console.error("[DEPLOY] ❌ ERROR");
    console.error(err);
  }
}

module.exports = deployCommands;