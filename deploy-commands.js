const fs = require("fs");
const { REST, Routes } = require("discord.js");

const commands = [];

const commandFiles = fs.readdirSync("./src/commands/jdr");

for (const file of commandFiles) {
  const command = require(`./src/commands/jdr/${file}`);
  commands.push(command.data.toJSON());
}

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("[DEPLOY] START");
    console.log("[DEPLOY] CLIENT_ID =", process.env.CLIENT_ID);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("[DEPLOY] DONE");
  } catch (err) {
    console.error("[DEPLOY ERROR]", err);
  }
})();