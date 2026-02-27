import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH = join(__dirname, 'data.json');

function load() {
  if (!existsSync(DB_PATH)) return { users: [] };
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { users: [] };
  }
}

function save(data) {
  writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

const db = {
  getUsers: () => load().users,
  addUser: (user) => {
    const data = load();
    if (data.users.some((u) => u.username === user.username || u.email === user.email))
      return false;
    data.users.push({ ...user, id: Date.now().toString() });
    save(data);
    return true;
  },
  findUserByUsername: (username) => load().users.find((u) => u.username === username),
};

export default db;
