const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { postMissions, channelIds } = require('../systems/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-missions')
    .setDescription('[ADMIN] Rafraîchir le message des missions dans 📜・missions')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('salon').setDescription('Salon cible (défaut : 📜・missions)').setRequired(false)
    ),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const targetChannel = interaction.options.getChannel('salon')
      || interaction.guild.channels.cache.find(c => c.name.includes('missions') && c.name.startsWith('📜'))
      || interaction.guild.channels.cache.get(channelIds['missions']);
    if (!targetChannel) return interaction.editReply('❌ Salon introuvable.');
    channelIds['missions'] = targetChannel.id;
    await postMissions(targetChannel, client);
    await interaction.editReply(`✅ Missions mises à jour dans <#${targetChannel.id}>`);
  },
};
