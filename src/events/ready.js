module.exports = (client) => {
  client.once("ready", () => {
    console.log(`[READY] Connecté en tant que ${client.user.tag}`);
  });
};