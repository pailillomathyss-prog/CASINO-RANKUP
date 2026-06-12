const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { XP_PER_MESSAGE, XP_PER_VOICE_MINUTE } = require('../systems/xp');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voir-niveaux')
    .setDescription('Afficher comment gagner de l\'XP dans ce salon'),

  async execute(interaction, client) {
    const embed = new EmbedBuilder()
      .setTitle('📈 Comment gagner de l\'XP ?')
      .setColor(0x5865f2)
      .setDescription(
        '**Gagnez de l\'XP en étant actif sur le serveur !**\n\n' +
        `💬 **Messages** : \`+${XP_PER_MESSAGE} XP\` par message (1 fois par minute)\n` +
        `🎤 **Vocal** : \`+${XP_PER_VOICE_MINUTE} XP\` par minute passée en vocal\n` +
        `📜 **Missions** : XP bonus en complétant les missions quotidiennes\n\n` +
        '**Règles :**\n' +
        '• Un seul gain d\'XP par message toutes les 60 secondes\n' +
        '• Le vocal vous rapporte de l\'XP en continu\n' +
        '• Les missions se renouvellent toutes les 24h\n' +
        '• Maximum : **Niveau 500**\n\n' +
        '**Commandes joueur :**\n' +
        '`/rank` ou `+rank` — Voir votre niveau et XP\n' +
        '`/classement` ou `+classement` — Top 10 du serveur\n' +
        '`/missions` ou `+missions` — Vos missions du jour\n' +
        '`/voir-roles` — Voir les rôles à gagner\n\n' +
        '⚠️ La commande `+rank` est réservée aux salons **🧩・commandes**'
      )
      .setFooter({ text: 'Bonne chance dans votre progression !' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
