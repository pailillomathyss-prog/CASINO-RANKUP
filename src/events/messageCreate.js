const { addXp, MESSAGE_COOLDOWN_MS, XP_PER_MESSAGE } = require('../systems/xp');
const db = require('../systems/database');
const { checkMissionProgress } = require('../systems/missions');

const PREFIX = '!';

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot || !message.guild) return;

    const userId = message.author.id;
    const guildId = message.guild.id;
    const user = db.getUser(userId, guildId);
    const now = Date.now();

    db.updateUser(userId, guildId, { username: message.author.username });

    if (message.content.startsWith(PREFIX)) {
      const args = message.content.slice(PREFIX.length).trim().split(/\s+/);
      const commandName = args.shift().toLowerCase();
      const prefixCommand = client.prefixCommands?.get(commandName);
      if (prefixCommand) {
        try {
          await prefixCommand.execute(message, args, client);
        } catch (err) {
          console.error(err);
          message.reply('❌ Une erreur est survenue.').catch(() => {});
        }
        return;
      }
    }

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
