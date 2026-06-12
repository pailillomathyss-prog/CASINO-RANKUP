const cron = require('node-cron');
const { EmbedBuilder } = require('discord.js');
const db = require('./database');
const { addXp } = require('./xp');
const { logMissionComplete, logMissionsReset } = require('./logger');

const MISSION_TEMPLATES = [
  { type: 'messages', description: 'Envoyer 10 messages',   goal: 10,  xp_reward: 100 },
  { type: 'messages', description: 'Envoyer 25 messages',   goal: 25,  xp_reward: 200 },
  { type: 'messages', description: 'Envoyer 50 messages',   goal: 50,  xp_reward: 350 },
  { type: 'messages', description: 'Envoyer 100 messages',  goal: 100, xp_reward: 600 },
  { type: 'vocal',    description: 'Passer 10 min en vocal',goal: 10,  xp_reward: 150 },
  { type: 'vocal',    description: 'Passer 30 min en vocal',goal: 30,  xp_reward: 300 },
  { type: 'vocal',    description: 'Passer 1h en vocal',    goal: 60,  xp_reward: 500 },
  { type: 'vocal',    description: 'Passer 2h en vocal',    goal: 120, xp_reward: 800 },
];

function pickDailyMissions() {
  const shuffled = [...MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 4);
}

function generateMissions() {
  const resetAt = Date.now() + 24 * 60 * 60 * 1000;
  const picked = pickDailyMissions();
  db.resetMissions(picked.map(m => ({ ...m, reset_at: resetAt })));
}

function getMissionEmbed() {
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
  return embed;
}

async function checkMissionProgress(userId, guildId, type, amount, client) {
  const missions = db.getMissions().filter(m => m.type === type);
  for (const mission of missions) {
    const userMissions = db.getUserMissions(userId);
    const um = userMissions.find(u => u.id === mission.id);
    if (um && um.completed) continue;

    const currentProgress = (um ? um.progress : 0) + amount;
    const completed = currentProgress >= mission.goal ? 1 : 0;

    db.updateMissionProgress(userId, mission.id, Math.min(currentProgress, mission.goal), completed);

    if (completed && !(um && um.completed)) {
      await addXp(userId, guildId, mission.xp_reward, client);
      await logMissionComplete(userId, mission.description, mission.xp_reward);

      const guild = client.guilds.cache.get(guildId);
      if (guild) {
        const { getChannelId } = require('./channels');
        const chId = getChannelId('missions');
        if (chId) {
          const ch = guild.channels.cache.get(chId);
          if (ch) {
            ch.send(`✅ <@${userId}> a complété la mission **"${mission.description}"** et gagne **+${mission.xp_reward} XP** !`).catch(() => {});
          }
        }
      }
    }
  }
}

function startMissionCron(client) {
  const missions = db.getMissions();
  if (missions.length === 0) {
    generateMissions();
  } else {
    const now = Date.now();
    if (missions[0].reset_at < now) generateMissions();
  }

  cron.schedule('0 0 * * *', async () => {
    generateMissions();
    await logMissionsReset();
    console.log('🔄 Missions réinitialisées');

    const guild = client.guilds.cache.get(process.env.GUILD_ID);
    if (!guild) return;
    const { postMissions, getChannelId } = require('./channels');
    const chId = getChannelId('missions');
    if (chId) {
      const ch = guild.channels.cache.get(chId);
      if (ch) await postMissions(ch, client);
    }
  });
}

module.exports = { generateMissions, getMissionEmbed, checkMissionProgress, startMissionCron };
