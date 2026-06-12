const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const { ROLE_MILESTONES } = require('../systems/roles');
const { channelIds } = require('../systems/channels');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setup-roles')
    .setDescription('[ADMIN] Rafraîchir le message des récompenses dans 🎖️・récompenses')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addChannelOption(opt =>
      opt.setName('salon')
        .setDescription('Salon où poster (laisser vide = salon par défaut 🎖️・récompenses)')
        .setRequired(false)
    ),

  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    const targetChannel = interaction.options.getChannel('salon')
      || interaction.guild.channels.cache.find(c => c.name.includes('récompenses') || c.name.includes('recompenses'))
      || interaction.guild.channels.cache.get(channelIds['recompenses']);

    if (!targetChannel) {
      return interaction.editReply('❌ Salon 🎖️・récompenses introuvable. Créez-le ou précisez un salon.');
    }

    channelIds['recompenses'] = targetChannel.id;
    await targetChannel.bulkDelete(10).catch(() => {});

    const chunks = [];
    for (let i = 0; i < ROLE_MILESTONES.length; i += 5) {
      chunks.push(ROLE_MILESTONES.slice(i, i + 5));
    }

    const embed = new EmbedBuilder()
      .setTitle('🎖️ Récompenses par niveau')
      .setColor(0xffd700)
      .setDescription('Voici tous les rôles que vous pouvez obtenir en montant de niveau !\n\u200b');

    for (const chunk of chunks) {
      embed.addFields({
        name: '\u200b',
        value: chunk.map(r => {
          const role = interaction.guild.roles.cache.find(ro => ro.name === r.name);
          return `**Niveau ${r.level}** → ${role ? `<@&${role.id}>` : r.name}`;
        }).join('\n'),
        inline: true,
      });
    }
    embed.setFooter({ text: 'Continuez à être actif pour débloquer ces rôles !' });

    await targetChannel.send({ embeds: [embed] });
    await interaction.editReply(`✅ Message des récompenses posté dans <#${targetChannel.id}>`);
  },
};
