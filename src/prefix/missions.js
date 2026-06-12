const { EmbedBuilder } = require('discord.js');
const db = require('../systems/database');

module.exports = {
  name: 'missions',
  async execute(message, args, client) {
    if (!message.channel.name.includes('commandes') && !message.channel.name.startsWith('🧩')) {
      return message.reply(`❌ Cette commande n'est utilisable que dans les salons **🧩・commandes** !`).then(m => setTimeout(() => m.delete().catch(()=>{}), 5000));
    }

    const missions = db.getUserMissions(message.author.id);
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
    await message.reply({ embeds: [embed] });
  },
};
