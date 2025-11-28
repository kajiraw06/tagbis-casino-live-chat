// Lightweight JSON-based persistence replacing SQLite to avoid native build issues.
// NOTE: This is NOT a true SQL database. It emulates required user operations.
// For production, revert to SQLite (better-sqlite3) or another real DB.
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data', 'users.json');

function ensureDataFile() {
  const dataDir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ users: [], lastId: 0 }, null, 2));
  }
}

function load() {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (e) {
    return { users: [], lastId: 0 };
  }
}

function save(state) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  } catch (e) {
    console.error('Failed to persist users.json', e);
  }
}

function getUserByUsername(username) {
  const { users } = load();
  return users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null;
}

function createUser(username, password_hash) {
  const state = load();
  if (state.users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
    throw new Error('Username already exists');
  }
  const id = state.lastId + 1;
  const user = {
    id,
    username,
    password_hash,
    level: 'regular',
    coins: 100,
    created_at: new Date().toISOString()
  };
  state.users.push(user);
  state.lastId = id;
  save(state);
  return user;
}

function getUserById(id) {
  const { users } = load();
  return users.find(u => u.id === id) || null;
}

function updateCoins(id, coins) {
  const state = load();
  const user = state.users.find(u => u.id === id);
  if (!user) return false;
  user.coins = coins;
  save(state);
  return true;
}

function listUsers() {
  const { users } = load();
  return users.map(({ id, username, level, coins, created_at }) => ({ id, username, level, coins, created_at }));
}

module.exports = {
  getUserByUsername,
  createUser,
  getUserById,
  updateCoins,
  listUsers
};
