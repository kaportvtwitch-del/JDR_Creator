const { REST, Routes } = require("discord.js");
const fs = require("fs");

module.exports = async function deployCommands() {
  console.log("==================================");
  console.log("[DEPLOY] 🚀 START");

  try {
    const commands = [];
    const commandFiles = fs.readdirSync("./src/commands/jdr");

    console.log(`[DEPLOY] CLIENT_ID = ${process.env.CLIENT_ID}`);
    console.log(`[DEPLOY] ${commandFiles.length} commandes trouvées`);

    for (const file of commandFiles) {
      const command = require(`../commands/jdr/${file}`);

      // 🔥 DEBUG IMPORTANT
      console.log(`[DEPLOY] CHECK -> ${file}`);

      if (!command?.data) {
        console.log(`❌ SKIP ${file} (pas de data)`);
        continue;
      }

      if (!command.data.name) {
        console.log(`❌ SKIP ${file} (pas de name)`);
        continue;
      }

      if (!command.data.description) {
        console.log(`❌ SKIP ${file} (description manquante)`);
        continue;
      }

      // 🔥 conversion sécurisée
      try {
        commands.push(command.data.toJSON());
        console.log(`✅ OK -> ${command.data.name}`);
      } catch (err) {
        console.log(`❌ ERREUR toJSON -> ${file}`);
        console.log(err.message);
      }
    }

    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );

    console.log("[DEPLOY] ✅ DONE");
    console.log("==================================");

  } catch (error) {
    console.log("[DEPLOY] ❌ ERROR");
    console.log(error);
    console.log("==================================");
  }
};