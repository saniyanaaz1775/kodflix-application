import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from './db.js';

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = 10;

export async function registerUser({ username, email, phone, password }) {
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  const added = db.addUser({ username, email, phone, password: hashed, role: 'user' });
  if (!added) return { success: false, error: 'Username or email already exists' };
  return { success: true };
}

export async function loginUser(username, password) {
  const user = db.findUserByUsername(username);
  if (!user) return { success: false, error: 'Invalid username or password' };
  const match = await bcrypt.compare(password, user.password);
  if (!match) return { success: false, error: 'Invalid username or password' };
  const token = jwt.sign(
    { id: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  return { success: true, token, user: { id: user.id, username: user.username, role: user.role } };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
