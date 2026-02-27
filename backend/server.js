import 'dotenv/config';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { registerUser, loginUser, verifyToken } from './auth.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.post('/api/register', async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !phone || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    const result = await registerUser({ username, email, phone, password });
    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }
    res.status(201).json({ message: 'Registration successful. Please login.' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }
    const result = await loginUser(username, password);
    if (!result.success) {
      return res.status(401).json({ error: result.error });
    }
    res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/',
    });
    res.json({ message: 'Login successful', user: result.user });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('token', { path: '/' });
  res.json({ message: 'Logged out' });
});

app.get('/api/me', (req, res) => {
  const token = req.cookies?.token;
  const payload = token ? verifyToken(token) : null;
  if (!payload) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ user: { id: payload.id, username: payload.username, role: payload.role } });
});

app.get('/api/omdb', (req, res, next) => {
  const token = req.cookies?.token;
  if (!token || !verifyToken(token)) return res.status(401).json({ Response: 'False', Error: 'Not authenticated' });
  next();
}, async (req, res) => {
  try {
    const params = new URLSearchParams({ ...req.query, apikey: process.env.OMDB_API_KEY });
    const r = await fetch(`https://www.omdbapi.com/?${params}`);
    const data = await r.json();
    res.json(data);
  } catch (e) {
    res.status(502).json({ Response: 'False', Error: 'OMDB request failed' });
  }
});

app.listen(PORT, () => console.log(`Backend running at http://localhost:${PORT}`));
