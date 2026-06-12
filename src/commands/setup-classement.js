const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { postClassement, channelIds } = require('../systems/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-classement')
    .setDescription('[ADMIN] Rafraîchir le message de classement dans 🏅・classement')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('salon')
        .setDescription('Salon où poster (laisser vide = salon par défaut 🏅・classement)')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const targetChannel = interaction.options.getChannel('salon')
      || interaction.guild.channels.cache.find(c => c.name.includes('classement') && c.name.startsWith('🏅'))
      || interaction.guild.channels.cache.get(channelIds['classement']);

    if (!targetChannel) {
      return interaction.editReply('❌ Salon 🏅・classement introuvable. Créez-le ou précisez un salon.');
    }

    channelIds['classement'] = targetChannel.id;
    await postClassement(targetChannel, interaction.guild, client);
    await interaction.editReply(`✅ Message de classement posté dans <#${targetChannel.id}>`);
  },
};
