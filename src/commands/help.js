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
          name: '👤 Commandes joueur (/ et +)',
          value: [
            '`/rank` ou `+rank` [@joueur] — Voir votre niveau et XP *(🧩・commandes uniquement pour `+rank`)*',
            '`/classement` ou `+classement` — Top 10 du serveur',
            '`/missions` ou `+missions` — Vos missions du jour',
            '`/help` ou `+help` — Cette aide',
          ].join('\n'),
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
          name: '⚙️ Commandes admin — Configuration salons dédiés',
          value: [
            '`/setup-all` — Reconfigurer **tous** les salons et rôles',
            '`/setup-niveaux` — Poster dans 📈・niveau-xp',
            '`/setup-roles` — Poster dans 🎖️・récompenses',
            '`/setup-classement` — Poster dans 🏅・classement',
            '`/setup-missions` — Poster dans 📜・missions',
          ].join('\n'),
        },
      )
      .setFooter({ text: 'Gagnez de l\'XP en chattant et en vocal !' });

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
