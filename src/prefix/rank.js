const { EmbedBuilder } = require('discord.js');
const db = require('../systems/database');
const { totalXpForLevel } = require('../systems/xp');
const { getRoleForLevel } = require('../systems/roles');

const ALLOWED_CHANNEL_NAME = '🧩・commandes';

module.exports = {
  name: 'rank',
  async execute(message, args, client) {
    if (!message.channel.name.includes('commandes') && !message.channel.name.startsWith('🧩')) {
      return message.reply(`❌ Cette commande n'est utilisable que dans les salons **${ALLOWED_CHANNEL_NAME}** !`).then(m => setTimeout(() => m.delete().catch(()=>{}), 5000));
    }

    const target = message.mentions.users.first() || message.author;
    const user = db.getUser(target.id, message.guildId);
    const nextLevelXp = totalXpForLevel(user.level + 1);
    const currentLevelXp = totalXpForLevel(user.level);
    const xpInLevel = user.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    const progress = Math.min(Math.floor((xpInLevel / xpNeeded) * 20), 20);
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
    const roleInfo = getRoleForLevel(user.level);
    const role = roleInfo ? message.guild.roles.cache.find(r => r.name === roleInfo.name) : null;
    const allUsers = db.getAllUsers(message.guildId).sort((a, b) => b.xp - a.xp);
    const rank = allUsers.findIndex(u => u.user_id === target.id) + 1;

    const embed = new EmbedBuilder()
      .setTitle(`📊 Profil de ${target.username}`)
      .setThumbnail(target.displayAvatarURL())
      .setColor(role ? role.color : 0x5865f2)
      .addFields(
        { name: '🏆 Niveau', value: `**${user.level}** / 500`, inline: true },
        { name: '⚡ XP Total', value: `${user.xp.toLocaleString()} XP`, inline: true },
        { name: '🏅 Classement', value: rank > 0 ? `#${rank}` : 'Non classé', inline: true },
        { name: `Progression vers le niveau ${user.level + 1}`, value: `\`[${bar}]\`\n${xpInLevel.toLocaleString()} / ${xpNeeded.toLocaleString()} XP` },
        { name: '💬 Messages', value: `${user.total_messages.toLocaleString()}`, inline: true },
        { name: '🎤 Minutes vocal', value: `${user.total_voice_minutes.toLocaleString()}`, inline: true },
        { name: '🎖️ Rôle actuel', value: role ? `<@&${role.id}>` : 'Aucun rôle', inline: true },
      )
      .setFooter({ text: user.level === 500 ? '🎯 NIVEAU MAXIMUM ATTEINT !' : `Prochain palier : Niveau ${user.level + 1}` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
