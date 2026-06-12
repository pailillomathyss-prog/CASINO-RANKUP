const { EmbedBuilder } = require('discord.js');

let logsChannelId = null;
let clientRef = null;

function initLogger(client, guild) {
  clientRef = client;
  const ch = guild.channels.cache.find(c =>
    c.name.toLowerCase().includes('logs') || c.name.toLowerCase().includes('log')
  );
  if (ch) {
    logsChannelId = ch.id;
    console.log(`✅ Salon logs trouvé : #${ch.name}`);
  } else {
    console.log('⚠️ Aucun salon logs trouvé');
  }
}

async function sendLog(embed) {
  if (!logsChannelId || !clientRef) return;
  const guild = clientRef.guilds.cache.get(process.env.GUILD_ID);
  if (!guild) return;
  const ch = guild.channels.cache.get(logsChannelId);
  if (ch) await ch.send({ embeds: [embed] }).catch(console.error);
}

async function logLevelUp(userId, oldLevel, newLevel, roleObtained) {
  const embed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setTitle('🎉 Level Up !')
    .addFields(
      { name: 'Joueur', value: `<@${userId}>`, inline: true },
      { name: 'Niveau', value: `**${oldLevel}** → **${newLevel}**`, inline: true },
    );
  if (roleObtained) embed.addFields({ name: '🎖️ Rôle obtenu', value: roleObtained, inline: true });
  embed.setTimestamp();
  await sendLog(embed);
}

async function logMissionComplete(userId, missionDesc, xpReward) {
  const embed = new EmbedBuilder()
    .setColor(0xe67e22)
    .setTitle('📜 Mission complétée')
    .addFields(
      { name: 'Joueur', value: `<@${userId}>`, inline: true },
      { name: 'Mission', value: missionDesc, inline: true },
      { name: 'XP gagné', value: `+${xpReward} XP`, inline: true },
    )
    .setTimestamp();
  await sendLog(embed);
}

async function logAdminAction(adminId, action, targetId, details) {
  const embed = new EmbedBuilder()
    .setColor(0xe74c3c)
    .setTitle('🔧 Action Admin')
    .addFields(
      { name: 'Admin', value: `<@${adminId}>`, inline: true },
      { name: 'Action', value: action, inline: true },
      { name: 'Cible', value: `<@${targetId}>`, inline: true },
    );
  if (details) embed.addFields({ name: 'Détails', value: details, inline: false });
  embed.setTimestamp();
  await sendLog(embed);
}

async function logMissionsReset() {
  const embed = new EmbedBuilder()
    .setColor(0x9b59b6)
    .setTitle('🔄 Missions réinitialisées')
    .setDescription('Les missions quotidiennes ont été renouvelées automatiquement.')
    .setTimestamp();
  await sendLog(embed);
}

module.exports = { initLogger, logLevelUp, logMissionComplete, logAdminAction, logMissionsReset };
