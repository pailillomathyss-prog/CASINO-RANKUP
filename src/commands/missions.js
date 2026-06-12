const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../systems/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('missions')
    .setDescription('Voir vos missions du jour et votre progression'),

  async execute(interaction, client) {
    const missions = db.getUserMissions(interaction.user.id);
    const resetAt = missions[0] ? new Date(missions[0].reset_at) : new Date(Date.now() + 86400000);

    const embed = new EmbedBuilder()
      .setTitle('📜 Vos missions du jour')
      .setColor(0xe67e22)
      .setDescription('Progressez dans ces missions pour gagner de l\'XP !\n\u200b');

    if (missions.length === 0) {
      embed.addFields({ name: 'Aucune mission', value: 'Revenez bientôt !' });
    } else {
      for (const m of missions) {
        const icon = m.type === 'messages' ? '💬' : '🎤';
        const status = m.completed ? '✅' : '⏳';
        const barLen = 10;
        const filled = Math.min(Math.floor((m.progress / m.goal) * barLen), barLen);
        const bar = '█'.repeat(filled) + '░'.repeat(barLen - filled);
        embed.addFields({
          name: `${status} ${icon} ${m.description}`,
          value: `\`[${bar}]\` ${m.progress}/${m.goal}\nRécompense : **+${m.xp_reward} XP**${m.completed ? ' ✅ Complétée !' : ''}`,
          inline: false,
        });
      }
    }

    embed.setFooter({ text: `Réinitialisation : ${resetAt.toLocaleString('fr-FR')}` });
    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
