import { useMemo, useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { fetchCategories, getMovieById, searchMoviesMultiPage } from '../api/omdb';
import './Dashboard.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [heroMovie, setHeroMovie] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchRow, setSearchRow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const languageQuickSearches = useMemo(
    () => ([
      { label: 'Hindi', query: 'shah rukh' },
      { label: 'South Indian', query: 'telugu' },
      { label: 'Korean', query: 'parasite' },
      { label: 'English', query: 'batman' },
    ]),
    []
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const categoriesData = await fetchCategories();
        if (cancelled) return;
        setCategories(categoriesData);

        const candidateIds = categoriesData
          .flatMap((r) => r.movies || [])
          .filter((m) => m?.imdbID && m?.Poster && m.Poster !== 'N/A')
          .map((m) => m.imdbID);

        const heroId = candidateIds.length
          ? candidateIds[Math.floor(Math.random() * candidateIds.length)]
          : categoriesData[0]?.movies?.[0]?.imdbID;

        if (heroId) {
          const detail = await getMovieById(heroId);
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

  const runSearch = async (term) => {
    const q = (term || '').trim();
    if (!q) {
      setSearchRow(null);
      return;
    }
    try {
      setError(null);
      const movies = await searchMoviesMultiPage(q, 2);
      setSearchRow({ title: `Search results for "${q}"`, movies });
    } catch (e) {
      setError(e?.message || 'Search failed');
    }
  };

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
              <Link to={`/title/${heroMovie.imdbID}`} className="btn-play">
                ▶ Details
              </Link>
              <button type="button" className="btn-mylist">
                + My List
              </button>
            </div>
          </div>
        </section>
      )}

      <div className="content">
        <div className="search-bar">
          <form
            className="search-form"
            onSubmit={(e) => {
              e.preventDefault();
              runSearch(searchTerm);
            }}
          >
            <input
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search movies (try: RRR, KGF, Parasite, 3 Idiots, Batman...)"
              aria-label="Search movies"
            />
            <button type="submit" className="search-btn">Search</button>
            {searchRow && (
              <button
                type="button"
                className="search-clear"
                onClick={() => {
                  setSearchTerm('');
                  setSearchRow(null);
                }}
              >
                Clear
              </button>
            )}
          </form>
          <div className="search-chips">
            {languageQuickSearches.map((x) => (
              <button
                key={x.label}
                type="button"
                className="chip"
                onClick={() => {
                  setSearchTerm(x.query);
                  runSearch(x.query);
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
        </div>

        {searchRow && (
          <div className="row">
            <h2 className="row-title">{searchRow.title}</h2>
            <div className="row-posters">
              {searchRow.movies
                .filter((m) => m.Poster && m.Poster !== 'N/A')
                .map((movie) => (
                  <Link key={movie.imdbID} to={`/title/${movie.imdbID}`} className="poster-card">
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="poster-overlay">
                      <span className="poster-title">{movie.Title}</span>
                      <span className="poster-year">{movie.Year}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        )}

        {categories.map((row) => (
          <div key={row.title} className="row">
            <h2 className="row-title">{row.title}</h2>
            <div className="row-posters">
              {row.movies
                .filter((m) => m.Poster && m.Poster !== 'N/A')
                .map((movie) => (
                  <Link key={movie.imdbID} to={`/title/${movie.imdbID}`} className="poster-card">
                    <img
                      src={movie.Poster}
                      alt={movie.Title}
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="poster-overlay">
                      <span className="poster-title">{movie.Title}</span>
                      <span className="poster-year">{movie.Year}</span>
                    </div>
                  </Link>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
