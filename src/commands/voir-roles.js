const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { ROLE_MILESTONES } = require('../systems/roles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voir-roles')
    .setDescription('Afficher les rôles à gagner par niveau dans ce salon'),

  async execute(interaction, client) {
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
    await interaction.reply({ embeds: [embed] });
  },
};
