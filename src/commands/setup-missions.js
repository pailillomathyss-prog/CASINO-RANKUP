const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { getMissionEmbed } = require('../systems/missions');
const { channelIds } = require('../systems/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-missions')
    .setDescription('[ADMIN] Rafraîchir le message des missions dans 📜・missions')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('salon')
        .setDescription('Salon où poster (laisser vide = salon par défaut 📜・missions)')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const targetChannel = interaction.options.getChannel('salon')
      || interaction.guild.channels.cache.find(c => c.name.includes('missions'))
      || interaction.guild.channels.cache.get(channelIds['missions']);

    if (!targetChannel) {
      return interaction.editReply('❌ Salon 📜・missions introuvable. Créez-le ou précisez un salon.');
    }

    channelIds['missions'] = targetChannel.id;
    await targetChannel.bulkDelete(10).catch(() => {});
    const embed = getMissionEmbed();
    await targetChannel.send({ embeds: [embed] });
    await interaction.editReply(`✅ Message des missions posté dans <#${targetChannel.id}>`);
  },
};
