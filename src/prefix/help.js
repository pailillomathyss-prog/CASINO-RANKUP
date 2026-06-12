const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async execute(message, args, client) {
    const embed = new EmbedBuilder()
      .setTitle('📖 Aide — Commandes disponibles')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '👤 Commandes joueur (+ et /)',
          value: [
            '`+rank` ou `/rank` [@joueur] — Voir votre niveau et XP *(🧩・commandes uniquement)*',
            '`+classement` ou `/classement` — Top 10 du serveur',
            '`+missions` ou `/missions` — Vos missions du jour',
            '`+help` ou `/help` — Cette aide',
          ].join('\n'),
        },
        {
          name: '🔧 Commandes admin (/ uniquement)',
          value: [
            '`/addxp` `/setlevel` `/resetuser` — Gestion joueurs',
            '`/setup-all` — Reconfigurer tous les salons dédiés',
            '`/setup-niveaux` `/setup-roles` `/setup-classement` `/setup-missions`',
          ].join('\n'),
        },
      )
      .setFooter({ text: 'Gagnez de l\'XP en chattant et en vocal !' });
    await message.reply({ embeds: [embed] });
  },
};
