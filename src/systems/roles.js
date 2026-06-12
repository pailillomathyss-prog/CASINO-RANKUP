const ROLE_MILESTONES = [
  { level: 5,   name: '⭐ Niveau 5',    color: 0x95a5a6 },
  { level: 10,  name: '⭐ Niveau 10',   color: 0x7f8c8d },
  { level: 20,  name: '🌟 Niveau 20',   color: 0x27ae60 },
  { level: 30,  name: '🌟 Niveau 30',   color: 0x2ecc71 },
  { level: 50,  name: '💎 Niveau 50',   color: 0x3498db },
  { level: 75,  name: '💎 Niveau 75',   color: 0x2980b9 },
  { level: 100, name: '🔥 Niveau 100',  color: 0xe67e22 },
  { level: 150, name: '🔥 Niveau 150',  color: 0xe74c3c },
  { level: 200, name: '👑 Niveau 200',  color: 0x9b59b6 },
  { level: 250, name: '👑 Niveau 250',  color: 0x8e44ad },
  { level: 300, name: '🌌 Niveau 300',  color: 0xf39c12 },
  { level: 350, name: '🌌 Niveau 350',  color: 0xd35400 },
  { level: 400, name: '🏆 Niveau 400',  color: 0xc0392b },
  { level: 450, name: '🏆 Niveau 450',  color: 0xff6b6b },
  { level: 500, name: '🎯 LÉGENDE 500', color: 0xffd700 },
];

function getRoleForLevel(level) {
  let best = null;
  for (const r of ROLE_MILESTONES) {
    if (level >= r.level) best = r;
  }
  return best;
}

async function setupRoles(guild) {
  for (const milestone of ROLE_MILESTONES) {
    const existing = guild.roles.cache.find(r => r.name === milestone.name);
    if (!existing) {
      await guild.roles.create({
        name: milestone.name,
        color: milestone.color,
        reason: 'Rôle de niveau auto-créé par le bot',
      }).catch(console.error);
    }
  }
}

module.exports = { ROLE_MILESTONES, getRoleForLevel, setupRoles };
