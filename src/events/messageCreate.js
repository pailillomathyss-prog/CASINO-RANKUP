const { addXp, MESSAGE_COOLDOWN_MS, XP_PER_MESSAGE } = require('../systems/xp');
const db = require('../systems/database');
const { checkMissionProgress } = require('../systems/missions');

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;
    const user = db.getUser(userId, guildId);
    const now = Date.now();

    db.updateUser(userId, guildId, { username: message.author.username });

    if (now - user.last_message_xp >= MESSAGE_COOLDOWN_MS) {
      db.updateUser(userId, guildId, { last_message_xp: now, total_messages: user.total_messages + 1 });
      await addXp(userId, guildId, XP_PER_MESSAGE, client);
      await checkMissionProgress(userId, guildId, 'messages', 1, client);
    } else {
      db.updateUser(userId, guildId, { total_messages: user.total_messages + 1 });
      await checkMissionProgress(userId, guildId, 'messages', 1, client);
    }
  },
};
