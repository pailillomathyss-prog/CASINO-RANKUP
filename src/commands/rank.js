const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../systems/database');
const { xpForLevel, totalXpForLevel, getLevelFromXp } = require('../systems/xp');
const { getRoleForLevel } = require('../systems/roles');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('Voir votre niveau et votre XP')
    .addUserOption(opt => opt.setName('utilisateur').setDescription('Joueur à voir').setRequired(false)),

  async execute(interaction, client) {
    const target = interaction.options.getUser('utilisateur') || interaction.user;
    const user = db.getUser(target.id, interaction.guildId);
    const nextLevelXp = totalXpForLevel(user.level + 1);
    const currentLevelXp = totalXpForLevel(user.level);
    const xpInLevel = user.xp - currentLevelXp;
    const xpNeeded = nextLevelXp - currentLevelXp;
    const progress = Math.min(Math.floor((xpInLevel / xpNeeded) * 20), 20);
    const bar = '█'.repeat(progress) + '░'.repeat(20 - progress);
    const roleInfo = getRoleForLevel(user.level);
    const role = roleInfo ? interaction.guild.roles.cache.find(r => r.name === roleInfo.name) : null;
    const allUsers = db.getAllUsers(interaction.guildId).sort((a, b) => b.xp - a.xp);
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

    await interaction.reply({ embeds: [embed] });
  },
};
