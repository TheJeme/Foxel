const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const DB_PATH = path.join(DATA_DIR, "foxel.db");
const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma("journal_mode = WAL");

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    guild_id TEXT,
    channel_id TEXT NOT NULL,
    message TEXT NOT NULL,
    remind_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    delivered INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    channel_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
  );

  CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders(remind_at) WHERE delivered = 0;
  CREATE INDEX IF NOT EXISTS idx_notes_user ON notes(user_id);
  CREATE INDEX IF NOT EXISTS idx_conversations_channel ON conversations(channel_id, created_at);
`);

// Reminders
const addReminder = db.prepare(`
  INSERT INTO reminders (user_id, guild_id, channel_id, message, remind_at)
  VALUES (?, ?, ?, ?, ?)
`);

const getPendingReminders = db.prepare(`
  SELECT * FROM reminders WHERE delivered = 0 AND remind_at <= ?
`);

const markDelivered = db.prepare(`
  UPDATE reminders SET delivered = 1 WHERE id = ?
`);

const getUserReminders = db.prepare(`
  SELECT * FROM reminders WHERE user_id = ? AND delivered = 0 ORDER BY remind_at ASC
`);

const deleteReminder = db.prepare(`
  DELETE FROM reminders WHERE id = ? AND user_id = ?
`);

// Notes (user facts the AI learns)
const upsertNote = db.prepare(`
  INSERT INTO notes (user_id, key, value)
  VALUES (?, ?, ?)
  ON CONFLICT(user_id, key) DO UPDATE SET value = excluded.value, updated_at = strftime('%s', 'now')
`);

// Need a unique constraint for upsert to work
db.exec(`CREATE UNIQUE INDEX IF NOT EXISTS idx_notes_user_key ON notes(user_id, key)`);

const getUserNotes = db.prepare(`
  SELECT key, value FROM notes WHERE user_id = ? ORDER BY updated_at DESC LIMIT 20
`);

const deleteNote = db.prepare(`
  DELETE FROM notes WHERE user_id = ? AND key = ?
`);

// Conversation history (last N messages per channel for context)
const addMessage = db.prepare(`
  INSERT INTO conversations (channel_id, user_id, role, content)
  VALUES (?, ?, ?, ?)
`);

const getRecentMessages = db.prepare(`
  SELECT role, content, created_at FROM conversations
  WHERE channel_id = ?
  ORDER BY created_at DESC
  LIMIT ?
`);

const pruneOldMessages = db.prepare(`
  DELETE FROM conversations WHERE channel_id = ? AND id NOT IN (
    SELECT id FROM conversations WHERE channel_id = ? ORDER BY created_at DESC LIMIT 50
  )
`);

module.exports = {
  db,
  reminders: {
    add(userId, guildId, channelId, message, remindAtUnix) {
      return addReminder.run(userId, guildId, channelId, message, remindAtUnix);
    },
    getPending() {
      return getPendingReminders.all(Math.floor(Date.now() / 1000));
    },
    markDelivered(id) {
      return markDelivered.run(id);
    },
    getForUser(userId) {
      return getUserReminders.all(userId);
    },
    delete(id, userId) {
      return deleteReminder.run(id, userId);
    },
  },
  notes: {
    set(userId, key, value) {
      return upsertNote.run(userId, key, value);
    },
    getForUser(userId) {
      return getUserNotes.all(userId);
    },
    delete(userId, key) {
      return deleteNote.run(userId, key);
    },
  },
  conversation: {
    add(channelId, userId, role, content) {
      addMessage.run(channelId, userId, role, content);
      pruneOldMessages.run(channelId, channelId);
    },
    getRecent(channelId, limit = 15) {
      return getRecentMessages.all(channelId, limit).reverse();
    },
  },
};
