const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { postRecompenses, channelIds } = require('../systems/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('[ADMIN] Rafraîchir le message des récompenses dans 🎖️・récompenses')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('salon').setDescription('Salon cible (défaut : 🎖️・récompenses)').setRequired(false)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const targetChannel = interaction.options.getChannel('salon')
      || interaction.guild.channels.cache.find(c => c.name.includes('récompenses') || c.name.includes('recompenses'))
      || interaction.guild.channels.cache.get(channelIds['recompenses']);
    if (!targetChannel) return interaction.editReply('❌ Salon introuvable.');
    channelIds['recompenses'] = targetChannel.id;
    await postRecompenses(targetChannel, interaction.guild);
    await interaction.editReply(`✅ Récompenses mises à jour dans <#${targetChannel.id}>`);
  },
};
