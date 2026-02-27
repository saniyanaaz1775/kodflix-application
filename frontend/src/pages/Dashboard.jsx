import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchCategories, getMovieById, searchMovies } from '../api/omdb';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [heroMovie, setHeroMovie] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const [categoriesData, searchRes] = await Promise.all([
          fetchCategories(),
          searchMovies('avengers', 1),
        ]);
        if (cancelled) return;
        setCategories(categoriesData);
        const firstId = searchRes.Search?.[0]?.imdbID;
        if (firstId) {
          const detail = await getMovieById(firstId);
          if (!cancelled && detail) setHeroMovie(detail);
        }
        if (!firstId && categoriesData[0]?.movies?.[0]) {
          const detail = await getMovieById(categoriesData[0].movies[0].imdbID);
          if (!cancelled && detail) setHeroMovie(detail);
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load movies');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Loading movies...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <span className="logo">KodFlix</span>
          <nav className="header-nav">
            <span className="nav-item active">Home</span>
            <span className="nav-item">TV Shows</span>
            <span className="nav-item">Movies</span>
            <span className="nav-item">New & Popular</span>
            <span className="nav-item">My List</span>
          </nav>
        </div>
        <div className="header-right">
          <span className="user-name">{user?.username}</span>
          <button type="button" className="btn-logout" onClick={logout}>
            Sign out
          </button>
        </div>
      </header>

      {error && (
        <div className="dashboard-error">
          {error}
        </div>
      )}

      {heroMovie && (
        <section
          className="hero"
          style={{
            backgroundImage: heroMovie.Poster && heroMovie.Poster !== 'N/A'
              ? `linear-gradient(to top, var(--netflix-black) 0%, transparent 50%), url(${heroMovie.Poster})`
              : undefined,
          }}
        >
          <div className="hero-content">
            <h1 className="hero-title">{heroMovie.Title}</h1>
            <p className="hero-meta">
              {heroMovie.Year} · {heroMovie.Rated} · {heroMovie.Runtime} · {heroMovie.Genre}
            </p>
            <p className="hero-plot">{heroMovie.Plot}</p>
            <div className="hero-buttons">
              <button type="button" className="btn-play">
                ▶ Play
              </button>
              <button type="button" className="btn-mylist">
                + My List
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="content">
        {categories.map((row) => (
          <div key={row.title} className="row">
            <h2 className="row-title">{row.title}</h2>
            <div className="row-posters">
              {row.movies
                .filter((m) => m.Poster && m.Poster !== 'N/A')
                .map((movie) => (
                  <div key={movie.imdbID} className="poster-card">
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      loading="lazy"
                    />
                    <div className="poster-overlay">
                      <span className="poster-title">{movie.Title}</span>
                      <span className="poster-year">{movie.Year}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
