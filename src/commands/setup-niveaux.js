const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { XP_PER_MESSAGE, XP_PER_VOICE_MINUTE } = require('../systems/xp');
const { channelIds } = require('../systems/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-niveaux')
    .setDescription('[ADMIN] Rafraîchir le message d\'explication XP dans 📈・niveau-xp')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('salon')
        .setDescription('Salon où poster (laisser vide = salon par défaut 📈・niveau-xp)')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const targetChannel = interaction.options.getChannel('salon')
      || interaction.guild.channels.cache.find(c => c.name.includes('niveau-xp') || c.name.includes('niveau'))
      || interaction.guild.channels.cache.get(channelIds['niveaux']);

    if (!targetChannel) {
      return interaction.editReply('❌ Salon 📈・niveau-xp introuvable. Créez-le ou précisez un salon.');
    }

    channelIds['niveaux'] = targetChannel.id;
    await targetChannel.bulkDelete(10).catch(() => {});

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
        '**Commandes :**\n' +
        '`/rank` ou `+rank` — Voir votre niveau et XP\n' +
        '`/classement` ou `+classement` — Top 10 du serveur\n' +
        '`/missions` ou `+missions` — Vos missions du jour\n' +
        '`/help` ou `+help` — Toutes les commandes\n\n' +
        '⚠️ Les commandes `+` sont réservées aux salons **🧩・commandes**'
      )
      .setFooter({ text: 'Bonne chance dans votre progression !' })
      .setTimestamp();

    await targetChannel.send({ embeds: [embed] });
    await interaction.editReply(`✅ Message d\'explication XP posté dans <#${targetChannel.id}>`);
  },
};
