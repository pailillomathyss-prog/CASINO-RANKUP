const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  async execute(message, args, client) {
    if (!message.channel.name.includes('commandes') && !message.channel.name.startsWith('🧩')) {
      return message.reply(`❌ Cette commande n'est utilisable que dans les salons **🧩・commandes** !`).then(m => setTimeout(() => m.delete().catch(()=>{}), 5000));
    }

    const embed = new EmbedBuilder()
      .setTitle('📖 Aide — Commandes disponibles')
      .setColor(0x5865f2)
      .addFields(
        {
          name: '👤 Commandes joueur (! et /)',
          value: [
            '`!rank` ou `/rank` [@joueur] — Voir votre niveau et XP',
            '`!classement` ou `/classement` — Top 10 du serveur',
            '`!missions` ou `/missions` — Vos missions du jour',
            '`!help` ou `/help` — Cette aide',
          ].join('\n'),
        },
        {
          name: '⚠️ Restriction',
          value: 'Les commandes `!` ne fonctionnent que dans les salons **🧩・commandes**',
        },
        {
          name: '🔧 Commandes admin (/ uniquement)',
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

    await message.reply({ embeds: [embed] });
  },
};
