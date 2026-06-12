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
          name: '👤 Commandes joueur',
          value: [
            '`/rank [@joueur]` — Voir votre niveau et XP',
            '`/classement` — Top 10 du serveur',
            '`/missions` — Vos missions du jour',
            '`/help` — Cette aide',
          ].join('\n'),
        },
        {
          name: '🔧 Commandes admin',
          value: [
            '`/addxp @joueur <quantité>` — Ajouter de l\'XP',
            '`/setlevel @joueur <niveau>` — Définir un niveau',
            '`/resetuser @joueur` — Remettre à zéro',
          ].join('\n'),
        },
        {
          name: '📢 Salons automatiques',
          value: [
            '`📈・niveau-xp` — Explication du système XP',
            '`🎖️・récompenses` — Liste des rôles à gagner',
            '`🏅・classement` — Classement en temps réel',
            '`📜・missions` — Missions du jour',
          ].join('\n'),
        },
      )
      .setFooter({ text: 'Gagnez de l\'XP en chattant et en vocal !' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
