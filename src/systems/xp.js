const db = require('./database');
const { logLevelUp } = require('./logger');

const XP_PER_MESSAGE = 15;
const XP_PER_VOICE_MINUTE = 5;
const MESSAGE_COOLDOWN_MS = 60000;

function xpForLevel(level) {
  return Math.floor(100 * Math.pow(level, 1.5));
}

function totalXpForLevel(level) {
  let total = 0;
  for (let i = 1; i <= level; i++) total += xpForLevel(i);
  return total;
}

function getLevelFromXp(xp) {
  let level = 0;
  while (level < 500 && xp >= totalXpForLevel(level + 1)) {
    level++;
  }
  return level;
}

async function addXp(userId, guildId, amount, client) {
  const user = db.getUser(userId, guildId);
  const oldLevel = user.level;
  const newXp = user.xp + amount;
  const newLevel = Math.min(getLevelFromXp(newXp), 500);

  db.updateUser(userId, guildId, { xp: newXp, level: newLevel });

  const leveledUp = newLevel > oldLevel;
  if (leveledUp && client) {
    const guild = client.guilds.cache.get(guildId);
    if (guild) {
      await handleLevelUp(guild, userId, oldLevel, newLevel, client);
    }
  }

  return { oldLevel, newLevel, newXp, leveledUp };
}

async function handleLevelUp(guild, userId, oldLevel, newLevel, client) {
  const { getRoleForLevel } = require('./roles');
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return;

  let obtainedRoleName = null;
  for (let lvl = oldLevel + 1; lvl <= newLevel; lvl++) {
    const roleInfo = getRoleForLevel(lvl);
    if (roleInfo) {
      const role = guild.roles.cache.find(r => r.name === roleInfo.name);
      if (role && !member.roles.cache.has(role.id)) {
        await member.roles.add(role).catch(console.error);
        obtainedRoleName = roleInfo.name;
      }
    }
  }

  await logLevelUp(userId, oldLevel, newLevel, obtainedRoleName);

  const { getChannelId } = require('./channels');
  const channelId = getChannelId('classement');
  if (channelId) {
    const channel = guild.channels.cache.get(channelId);
    if (channel) {
      const roleInfo = getRoleForLevel(newLevel);
      let msg = `🎉 <@${userId}> vient de passer au **niveau ${newLevel}** !`;
      if (roleInfo) msg += `\n🎖️ Nouveau rôle obtenu : **${roleInfo.name}**`;
      channel.send(msg).catch(console.error);
    }
  }
}

module.exports = { addXp, xpForLevel, totalXpForLevel, getLevelFromXp, XP_PER_MESSAGE, XP_PER_VOICE_MINUTE, MESSAGE_COOLDOWN_MS };
