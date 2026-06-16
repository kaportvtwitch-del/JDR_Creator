const { Client, GatewayIntentBits, Collection } = require("discord.js");
const fs = require("fs");

const { createLock, removeLock } = require("./src/utils/lock");

createLock();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers]
});

client.commands = new Collection();

// Load commands
const commandFiles = fs.readdirSync("./src/commands/jdr");

for (const file of commandFiles) {
  const command = require(`./src/commands/jdr/${file}`);
  client.commands.set(command.data.name, command);
}

// Events
require("./src/events/ready")(client);
require("./src/events/interactionCreate")(client);

client.login(process.env.TOKEN);

// LOGS START
console.log("==================================");
console.log("🚀 BOT JDR STARTING");
console.log("PID:", process.pid);
console.log("TOKEN OK:", !!process.env.TOKEN);
console.log("CLIENT_ID:", process.env.CLIENT_ID);
console.log("==================================");

process.on("exit", removeLock);
process.on("SIGINT", () => {
  removeLock();
  process.exit();
});