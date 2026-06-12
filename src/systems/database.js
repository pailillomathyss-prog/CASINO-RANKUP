const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new Database(path.join(dataDir, 'bot.db'));

function init() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      user_id TEXT PRIMARY KEY,
      guild_id TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      level INTEGER DEFAULT 0,
      total_messages INTEGER DEFAULT 0,
      total_voice_minutes INTEGER DEFAULT 0,
      last_message_xp INTEGER DEFAULT 0,
      username TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS missions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      description TEXT NOT NULL,
      goal INTEGER NOT NULL,
      xp_reward INTEGER NOT NULL,
      reset_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS user_missions (
      user_id TEXT NOT NULL,
      mission_id INTEGER NOT NULL,
      progress INTEGER DEFAULT 0,
      completed INTEGER DEFAULT 0,
      PRIMARY KEY (user_id, mission_id)
    );

    CREATE TABLE IF NOT EXISTS voice_sessions (
      user_id TEXT PRIMARY KEY,
      joined_at INTEGER NOT NULL
    );
  `);
}

function getUser(userId, guildId) {
  let user = db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
  if (!user) {
    db.prepare('INSERT INTO users (user_id, guild_id) VALUES (?, ?)').run(userId, guildId);
    user = db.prepare('SELECT * FROM users WHERE user_id = ? AND guild_id = ?').get(userId, guildId);
  }
  return user;
}

function updateUser(userId, guildId, data) {
  const keys = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = Object.values(data);
  db.prepare(`UPDATE users SET ${keys} WHERE user_id = ? AND guild_id = ?`).run(...values, userId, guildId);
}

function getLeaderboard(guildId, limit = 10) {
  return db.prepare('SELECT * FROM users WHERE guild_id = ? ORDER BY xp DESC LIMIT ?').all(guildId, limit);
}

function getAllUsers(guildId) {
  return db.prepare('SELECT * FROM users WHERE guild_id = ?').all(guildId);
}

function getMissions() {
  return db.prepare('SELECT * FROM missions').all();
}

function getUserMissions(userId) {
  return db.prepare(`
    SELECT m.*, COALESCE(um.progress, 0) as progress, COALESCE(um.completed, 0) as completed
    FROM missions m
    LEFT JOIN user_missions um ON m.id = um.mission_id AND um.user_id = ?
  `).all(userId);
}

function updateMissionProgress(userId, missionId, progress, completed) {
  db.prepare(`
    INSERT INTO user_missions (user_id, mission_id, progress, completed)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id, mission_id) DO UPDATE SET progress = ?, completed = ?
  `).run(userId, missionId, progress, completed, progress, completed);
}

function resetMissions(newMissions) {
  db.prepare('DELETE FROM missions').run();
  db.prepare('DELETE FROM user_missions').run();
  const insert = db.prepare('INSERT INTO missions (type, description, goal, xp_reward, reset_at) VALUES (?, ?, ?, ?, ?)');
  for (const m of newMissions) {
    insert.run(m.type, m.description, m.goal, m.xp_reward, m.reset_at);
  }
}

function startVoiceSession(userId) {
  db.prepare('INSERT OR REPLACE INTO voice_sessions (user_id, joined_at) VALUES (?, ?)').run(userId, Date.now());
}

function endVoiceSession(userId) {
  const session = db.prepare('SELECT * FROM voice_sessions WHERE user_id = ?').get(userId);
  if (!session) return 0;
  db.prepare('DELETE FROM voice_sessions WHERE user_id = ?').run(userId);
  return Math.floor((Date.now() - session.joined_at) / 60000);
}

module.exports = { init, getUser, updateUser, getLeaderboard, getAllUsers, getMissions, getUserMissions, updateMissionProgress, resetMissions, startVoiceSession, endVoiceSession };
