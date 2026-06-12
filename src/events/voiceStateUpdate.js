const db = require('../systems/database');
const { addXp, XP_PER_VOICE_MINUTE } = require('../systems/xp');
const { checkMissionProgress } = require('../systems/missions');

const voiceIntervals = new Map();

module.exports = {
  name: 'voiceStateUpdate',
  async execute(oldState, newState, client) {
    const userId = newState.member?.id || oldState.member?.id;
    const guildId = newState.guild?.id || oldState.guild?.id;
    if (!userId || !guildId) return;
    if (newState.member?.user?.bot) return;

    const joinedChannel = !oldState.channelId && newState.channelId;
    const leftChannel = oldState.channelId && !newState.channelId;

    if (joinedChannel) {
      db.startVoiceSession(userId);
      const interval = setInterval(async () => {
        await addXp(userId, guildId, XP_PER_VOICE_MINUTE, client);
        await checkMissionProgress(userId, guildId, 'vocal', 1, client);
        const user = db.getUser(userId, guildId);
        db.updateUser(userId, guildId, { total_voice_minutes: user.total_voice_minutes + 1 });
      }, 60000);
      voiceIntervals.set(userId, interval);
    }

    if (leftChannel) {
      const interval = voiceIntervals.get(userId);
      if (interval) {
        clearInterval(interval);
        voiceIntervals.delete(userId);
      }
      db.endVoiceSession(userId);
    }
  },
};
