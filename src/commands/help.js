const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('help')
    .setDescription('Voir toutes les commandes disponibles'),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle('📖 Aide — Commandes disponibles')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '👤 Commandes joueur (/ et !)',
          value: [
            '`/rank` ou `!rank` [@joueur] — Voir votre niveau et XP',
            '`/classement` ou `!classement` — Top 10 du serveur',
            '`/missions` ou `!missions` — Vos missions du jour',
            '`/help` ou `!help` — Cette aide',
          ].join('\n'),
        },
        {
          name: '⚠️ Restriction commandes `!`',
          value: 'Uniquement dans les salons **🧩・commandes**',
        },
        {
          name: '🔧 Commandes admin — Joueurs',
          value: [
            '`/addxp @joueur <xp>` — Ajouter de l\'XP',
            '`/setlevel @joueur <niveau>` — Définir un niveau (1-500)',
            '`/resetuser @joueur` — Remettre à zéro un joueur',
          ].join('\n'),
        },
        {
          name: '⚙️ Commandes admin — Configuration salons',
          value: [
            '`/setup-all` — Reconfigurer **tous** les salons et rôles',
            '`/setup-niveaux [#salon]` — Rafraîchir 📈・niveau-xp',
            '`/setup-roles [#salon]` — Rafraîchir 🎖️・récompenses',
            '`/setup-classement [#salon]` — Rafraîchir 🏅・classement',
            '`/setup-missions [#salon]` — Rafraîchir 📜・missions',
          ].join('\n'),
        },
        {
          name: '📢 Salons automatiques',
          value: [
            '`📈・niveau-xp` — Explication du système XP',
            '`🎖️・récompenses` — Liste des rôles par niveau',
            '`🏅・classement` — Classement mis à jour en temps réel',
            '`📜・missions` — Missions quotidiennes',
          ].join('\n'),
        },
      )
      .setFooter({ text: 'Gagnez de l\'XP en chattant et en vocal !' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
