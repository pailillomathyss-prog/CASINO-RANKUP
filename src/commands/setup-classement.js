const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { postClassement, channelIds } = require('../systems/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-classement')
    .setDescription('[ADMIN] Rafraîchir le message de classement dans 🏅・classement')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('salon').setDescription('Salon cible (défaut : 🏅・classement)').setRequired(false)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const targetChannel = interaction.options.getChannel('salon')
      || interaction.guild.channels.cache.find(c => c.name.startsWith('🏅') || c.name.includes('classement'))
      || interaction.guild.channels.cache.get(channelIds['classement']);
    if (!targetChannel) return interaction.editReply('❌ Salon introuvable.');
    channelIds['classement'] = targetChannel.id;
    await postClassement(targetChannel, interaction.guild, client);
    await interaction.editReply(`✅ Classement mis à jour dans <#${targetChannel.id}>`);
  },
};
