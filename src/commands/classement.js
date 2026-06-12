const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../systems/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('classement')
    .setDescription('Voir le top 10 du serveur'),

  async execute(interaction, client) {
    await interaction.deferReply();
    const top = db.getLeaderboard(interaction.guildId, 10);
    const lines = [];
    for (let i = 0; i < top.length; i++) {
      const u = top[i];
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
      let name = u.username || `<@${u.user_id}>`;
      try {
        const m = await interaction.guild.members.fetch(u.user_id);
        name = m.displayName;
      } catch {}
      lines.push(`${medal} **${name}** — Niv. ${u.level} | ${u.xp.toLocaleString()} XP`);
    }

    const myUser = db.getAllUsers(interaction.guildId).sort((a,b)=>b.xp-a.xp);
    const myRank = myUser.findIndex(u => u.user_id === interaction.user.id) + 1;
    const myData = db.getUser(interaction.user.id, interaction.guildId);

    const embed = new EmbedBuilder()
      .setTitle('🏅 Classement du serveur')
      .setColor(0xffd700)
      .setDescription(lines.length > 0 ? lines.join('\n') : 'Aucun joueur pour l\'instant.')
      .setFooter({ text: `Votre position : #${myRank} • Niv. ${myData.level} | ${myData.xp.toLocaleString()} XP` })
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
