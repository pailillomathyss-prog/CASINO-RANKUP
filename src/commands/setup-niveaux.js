const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { postNiveauxInfo, channelIds } = require('../systems/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-niveaux')
    .setDescription('[ADMIN] Rafraîchir le message d\'explication XP dans 📈・niveau-xp')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('salon').setDescription('Salon cible (défaut : 📈・niveau-xp)').setRequired(false)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const targetChannel = interaction.options.getChannel('salon')
      || interaction.guild.channels.cache.find(c => c.name.includes('niveau-xp') || c.name.startsWith('📈'))
      || interaction.guild.channels.cache.get(channelIds['niveaux']);
    if (!targetChannel) return interaction.editReply('❌ Salon introuvable.');
    channelIds['niveaux'] = targetChannel.id;
    await postNiveauxInfo(targetChannel);
    await interaction.editReply(`✅ Message niveau-xp mis à jour dans <#${targetChannel.id}>`);
  },
};
