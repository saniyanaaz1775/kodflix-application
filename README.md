# KodFlix

A secured Netflix-style movie app with **Registration**, **Login**, and a **Dashboard** that fetches movie data from the OMDB API.

## Features

- **Auth**: Sign up (username, email, phone, password) and sign in. JWT stored in HTTP-only cookie.
- **Protected dashboard**: Only logged-in users can access the movie dashboard.
- **OMDB integration**: Movie data and posters from [OMDB API](http://www.omdbapi.com/) (API key: `15549baf`).
- **Netflix-style UI**: Hero banner, horizontal scrolling rows (Trending, Action, Comedy, etc.).

## Tech Stack

- **Backend**: Node.js, Express, JWT, bcrypt, file-based JSON store.
- **Frontend**: React (Vite), React Router.

## How to Run

### 1. Start the backend

```bash
cd backend
npm install
npm start
```

Backend runs at **http://localhost:5000**.

### 2. Start the frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173**.

### 3. Use the app

1. Open **http://localhost:5173** in your browser.
2. **Sign up** with username, email, phone, and password.
3. **Sign in** with username and password.
4. You’ll be redirected to the **Dashboard** (Netflix-style) with movies from OMDB.

## API

- **OMDB** is used via the backend proxy at `/api/omdb` (API key is kept server-side). The dashboard calls this after login to load movies.

## Notes

- For production, set `JWT_SECRET` and use a real database instead of `data.json`.
- Do not commit or expose your OMDB API key in production.
