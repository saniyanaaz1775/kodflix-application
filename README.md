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

## Deployment (Vercel + Render)

The app is ready to deploy: frontend to **Vercel**, backend to **Render**.

### 1. Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 2. Deploy backend on Render

1. Go to [render.com](https://render.com) and sign in with GitHub.
2. **New** → **Web Service**.
3. Connect your repo and configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node
4. Add **Environment Variables**:
   - `JWT_SECRET` — strong random string (e.g. from a password generator)
   - `OMDB_API_KEY` — your OMDb key (e.g. `15549baf`)
   - `FRONTEND_ORIGIN` — leave blank for now (set after Vercel deploy)
5. Create the service and wait for deploy. Copy the backend URL (e.g. `https://kodflix-backend.onrender.com`). The API base is that URL + `/api`, e.g. `https://kodflix-backend.onrender.com/api`.

### 3. Deploy frontend on Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub.
2. **Add New** → **Project** and import the same repo.
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Add **Environment Variable**:
   - `VITE_API_BASE_URL` = your backend API base, e.g. `https://kodflix-backend.onrender.com/api`
5. Deploy. Copy the frontend URL (e.g. `https://kodflix-frontend.vercel.app`).

### 4. Point backend CORS to frontend

1. In Render → your backend service → **Environment**.
2. Set `FRONTEND_ORIGIN` = your Vercel URL (e.g. `https://kodflix-frontend.vercel.app`).
3. Save and **Redeploy** the backend.

### 5. Test

Open the Vercel URL → Sign up → Log in → Dashboard and movie details should work. If there are CORS or cookie issues, confirm `FRONTEND_ORIGIN` matches the Vercel URL exactly (including `https://`).

---

## Notes

- For production, set `JWT_SECRET` and use a real database instead of `data.json`.
- Do not commit or expose your OMDB API key in production.
