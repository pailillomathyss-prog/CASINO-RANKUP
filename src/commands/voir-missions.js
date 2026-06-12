const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../systems/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voir-missions')
    .setDescription('Afficher les missions du jour dans ce salon'),

  async execute(interaction, client) {
    const missions = db.getMissions();
    const resetAt = missions[0] ? new Date(missions[0].reset_at) : new Date(Date.now() + 86400000);

    const embed = new EmbedBuilder()
      .setTitle('📜 Missions du jour')
      .setColor(0xe67e22)
      .setDescription('Complétez ces missions pour gagner de l\'XP bonus !\n\u200b');

    if (missions.length === 0) {
      embed.addFields({ name: 'Aucune mission', value: 'Les missions arrivent bientôt !' });
    } else {
      for (const m of missions) {
        const icon = m.type === 'messages' ? '💬' : '🎤';
        embed.addFields({
          name: `${icon} ${m.description}`,
          value: `Récompense : **+${m.xp_reward} XP**`,
          inline: false,
        });
      }
    }

    embed.setFooter({ text: `Réinitialisation : ${resetAt.toLocaleString('fr-FR')}` });
    await interaction.reply({ embeds: [embed] });
  },
};
