const {
  SlashCommandBuilder,
  EmbedBuilder
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("jdr_help")
    .setDescription("Affiche l'aide complète du système JDR"),

  async execute(interaction) {

    const embed = new EmbedBuilder()
      .setTitle("📘 Aide du système JDR")
      .setColor(0x00AEFF)
      .setDescription("Voici toutes les commandes et leur utilisation par rôle 👇")

      // ======================
      // ADMIN
      // ======================
      .addFields({
        name: "👑 Admin (serveur)",
        value:
          "`/jdr_gestion_add` → Ajouter un rôle gestionnaire\n" +
          "`/jdr_gestion_del` → Retirer un rôle gestionnaire\n" +
          "`/jdr_gestion_list` → Liste des gestionnaires\n" +
          "`/jdr_create` → Créer un JDR\n" +
          "`/jdr_delete` → Supprimer un JDR\n" +
          "`/jdr_list` → Liste de tous les JDR\n\n" +
          "✔ Accès à tous les panels (Admin / Gestion / MJ)"
      })

      // ======================
      // GESTIONNAIRE
      // ======================
      .addFields({
        name: "🛠 Gestionnaire",
        value:
          "`/jdr_create` → Créer un JDR\n" +
          "`/jdr_delete` → Supprimer un JDR\n" +
          "`/jdr_list` → Voir les JDR\n\n" +
          "✔ Peut gérer tous les JDR du serveur\n" +
          "❌ Ne peut pas gérer les gestionnaires"
      })

      // ======================
      // MJ
      // ======================
      .addFields({
        name: "🎲 MJ (Maître du Jeu)",
        value:
          "`/jdr_joueur_add` → Ajouter un joueur à un JDR\n" +
          "`/jdr_joueur_del` → Retirer un joueur d’un JDR\n" +
          "`/jdr_joueur_list` → Liste des joueurs d’un JDR\n\n" +
          "✔ Accès uniquement à ses JDR (role MJ_nomduJDR)\n" +
          "✔ Gestion des joueurs de ses parties"
      })

      // ======================
      // FONCTIONNEMENT
      // ======================
      .addFields({
        name: "⚙️ Fonctionnement du système",
        value:
          "• Un JDR crée 2 rôles automatiquement :\n" +
          "  - `MJ_nomduJDR`\n" +
          "  - `Joueur_nomduJDR`\n\n" +
          "• Les permissions sont basées sur :\n" +
          "  - Rôles Discord\n" +
          "  - Base de données SQL\n\n" +
          "• Un MJ ne peut gérer QUE ses JDR"
      })

      .setFooter({ text: "Système JDR Bot • Help Panel" });

    return interaction.reply({
      embeds: [embed],
      ephemeral: true
    });
  }
};