const { EmbedBuilder } = require('discord.js');
const db = require('../systems/database');

module.exports = {
  name: 'classement',
  async execute(message, args, client) {
    if (!message.channel.name.includes('commandes') && !message.channel.name.startsWith('🧩')) {
      return message.reply(`❌ Cette commande n'est utilisable que dans les salons **🧩・commandes** !`).then(m => setTimeout(() => m.delete().catch(()=>{}), 5000));
    }

    const top = db.getLeaderboard(message.guildId, 10);
    const lines = [];
    for (let i = 0; i < top.length; i++) {
      const u = top[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      let name = u.username || `<@${u.user_id}>`;
      try {
        const m = await message.guild.members.fetch(u.user_id);
        name = m.displayName;
      } catch {}
      lines.push(`${medal} **${name}** — Niv. ${u.level} | ${u.xp.toLocaleString()} XP`);
    }

    const myUser = db.getAllUsers(message.guildId).sort((a,b)=>b.xp-a.xp);
    const myRank = myUser.findIndex(u => u.user_id === message.author.id) + 1;
    const myData = db.getUser(message.author.id, message.guildId);

    const embed = new EmbedBuilder()
      .setTitle('🏅 Classement du serveur')
      .setColor(0xffd700)
      .setDescription(lines.length > 0 ? lines.join('\n') : 'Aucun joueur pour l\'instant.')
      .setFooter({ text: `Votre position : #${myRank} • Niv. ${myData.level} | ${myData.xp.toLocaleString()} XP` })
      .setTimestamp();

    await message.reply({ embeds: [embed] });
  },
};
