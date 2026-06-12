const { EmbedBuilder } = require('discord.js');
const db = require('./database');
const { ROLE_MILESTONES } = require('./roles');
const { XP_PER_MESSAGE, XP_PER_VOICE_MINUTE } = require('./xp');

const CHANNEL_NAMES = {
  niveaux:     '📈・niveau-xp',
  recompenses: '🎖️・récompenses',
  classement:  '🏅・classement',
  missions:    '📜・missions',
};

const channelIds = {};
const pinnedMessageIds = {};

function getChannelId(key) {
  return channelIds[key] || null;
}

async function findOrSendEmbed(channel, embed) {
  try {
    const messages = await channel.messages.fetch({ limit: 20 });
    const botMsg = messages.find(m => m.author.id === channel.client.user.id && m.embeds.length > 0);
    if (botMsg) {
      await botMsg.edit({ embeds: [embed] });
      return botMsg.id;
    }
  } catch {}
  const sent = await channel.send({ embeds: [embed] }).catch(console.error);
  return sent?.id;
}

async function setupInfoChannels(client, guild) {
  for (const [key, name] of Object.entries(CHANNEL_NAMES)) {
    let channel = guild.channels.cache.find(c => c.name === name);
    if (!channel) {
      channel = await guild.channels.create({
        name,
        reason: 'Salon auto-créé par le bot',
      }).catch(console.error);
    }
    if (channel) {
      channelIds[key] = channel.id;
    }
  }

  setInterval(async () => {
    const g = client.guilds.cache.get(process.env.GUILD_ID);
    if (!g) return;
    const ch = g.channels.cache.get(channelIds['classement']);
    if (ch) await refreshClassement(ch, g);
  }, 5 * 60 * 1000);
}

async function refreshClassement(channel, guild) {
  const top = db.getLeaderboard(guild.id, 10);
  const lines = [];
  for (let i = 0; i < top.length; i++) {
    const u = top[i];
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
    let tag = u.username || `<@${u.user_id}>`;
    try { const member = await guild.members.fetch(u.user_id); tag = member.displayName; } catch {}
    lines.push(`${medal} ${tag} — Niv. **${u.level}** | ${u.xp.toLocaleString()} XP`);
  }
  const embed = new EmbedBuilder()
    .setTitle('🏅 Classement du serveur')
    .setColor(0xffd700)
    .setDescription(lines.length > 0 ? lines.join('\n') : 'Aucun joueur pour l\'instant.')
    .setFooter({ text: `Mis à jour toutes les 5 minutes • ${new Date().toLocaleTimeString('fr-FR')}` })
    .setTimestamp();
  await findOrSendEmbed(channel, embed);
}

async function postClassement(channel, guild, client) {
  const top = db.getLeaderboard(guild.id, 10);
  const lines = [];
  for (let i = 0; i < top.length; i++) {
    const u = top[i];
    const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `**${i + 1}.**`;
    let tag = u.username || `<@${u.user_id}>`;
    try { const member = await guild.members.fetch(u.user_id); tag = member.displayName; } catch {}
    lines.push(`${medal} ${tag} — Niv. **${u.level}** | ${u.xp.toLocaleString()} XP`);
  }
  const embed = new EmbedBuilder()
    .setTitle('🏅 Classement du serveur')
    .setColor(0xffd700)
    .setDescription(lines.length > 0 ? lines.join('\n') : 'Aucun joueur pour l\'instant.')
    .setFooter({ text: `Mis à jour toutes les 5 minutes • ${new Date().toLocaleTimeString('fr-FR')}` })
    .setTimestamp();
  await findOrSendEmbed(channel, embed);
}

async function postNiveauxInfo(channel) {
  const embed = new EmbedBuilder()
    .setTitle('📈 Comment gagner de l\'XP ?')
    .setColor(0x5865f2)
    .setDescription(
      '**Gagnez de l\'XP en étant actif sur le serveur !**\n\n' +
      `💬 **Messages** : \`+${XP_PER_MESSAGE} XP\` par message (1 fois par minute)\n` +
      `🎤 **Vocal** : \`+${XP_PER_VOICE_MINUTE} XP\` par minute passée en vocal\n` +
      `📜 **Missions** : XP bonus en complétant les missions quotidiennes\n\n` +
      '**Règles :**\n' +
      '• Un seul gain d\'XP par message toutes les 60 secondes\n' +
      '• Le vocal vous rapporte de l\'XP en continu\n' +
      '• Les missions se renouvellent toutes les 24h\n' +
      '• Maximum : **Niveau 500**\n\n' +
      '**Commandes :**\n' +
      '`/rank` ou `+rank` — Voir votre niveau et XP\n' +
      '`/classement` ou `+classement` — Top 10 du serveur\n' +
      '`/missions` ou `+missions` — Vos missions du jour\n' +
      '`/voir-roles` — Voir les rôles à gagner\n\n' +
      '⚠️ `+rank` est réservé aux salons **🧩・commandes**'
    )
    .setFooter({ text: 'Bonne chance dans votre progression !' })
    .setTimestamp();
  await findOrSendEmbed(channel, embed);
}

async function postRecompenses(channel, guild) {
  const chunks = [];
  for (let i = 0; i < ROLE_MILESTONES.length; i += 5) chunks.push(ROLE_MILESTONES.slice(i, i + 5));
  const embed = new EmbedBuilder()
    .setTitle('🎖️ Récompenses par niveau')
    .setColor(0xffd700)
    .setDescription('Voici tous les rôles que vous pouvez obtenir en montant de niveau !\n\u200b');
  for (const chunk of chunks) {
    embed.addFields({
      name: '\u200b',
      value: chunk.map(r => {
        const role = guild.roles.cache.find(ro => ro.name === r.name);
        return `**Niveau ${r.level}** → ${role ? `<@&${role.id}>` : r.name}`;
      }).join('\n'),
      inline: true,
    });
  }
  embed.setFooter({ text: 'Continuez à être actif pour débloquer ces rôles !' });
  await findOrSendEmbed(channel, embed);
}

async function postMissions(channel, client) {
  const { getMissionEmbed } = require('./missions');
  const embed = getMissionEmbed();
  await findOrSendEmbed(channel, embed);
}

module.exports = {
  setupInfoChannels, postClassement, postNiveauxInfo, postRecompenses,
  postMissions, getChannelId, CHANNEL_NAMES, channelIds,
};
