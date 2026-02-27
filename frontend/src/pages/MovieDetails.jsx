import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMovieById } from '../api/omdb';
import './MovieDetails.css';

export default function MovieDetails() {
  const { imdbID } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const detail = await getMovieById(imdbID);
        if (cancelled) return;
        if (!detail) {
          setError('Movie not found.');
          setMovie(null);
        } else {
          setMovie(detail);
        }
      } catch (e) {
        if (!cancelled) setError(e?.message || 'Failed to load movie details.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [imdbID]);

  if (loading) {
    return (
      <div className="details-loading">
        <div className="details-spinner" />
        <p>Loading details...</p>
      </div>
    );
  }

  return (
    <div className="details-page">
      <header className="details-header">
        <Link to="/dashboard" className="details-back">
          ← Back
        </Link>
        <span className="details-brand">KodFlix</span>
      </header>

      {error && <div className="details-error">{error}</div>}

      {movie && (
        <div className="details-content">
          <div className="details-poster">
            {movie.Poster && movie.Poster !== 'N/A' ? (
              <img src={movie.Poster} alt={movie.Title} referrerPolicy="no-referrer" />
            ) : (
              <div className="details-poster-fallback">No Poster</div>
            )}
          </div>

          <div className="details-info">
            <h1 className="details-title">{movie.Title}</h1>
            <p className="details-meta">
              {movie.Year} · {movie.Rated} · {movie.Runtime}
            </p>
            <p className="details-submeta">
              {movie.Genre} · {movie.Language} · {movie.Country}
            </p>

            <p className="details-plot">{movie.Plot}</p>

            <div className="details-grid">
              <div>
                <div className="details-label">Director</div>
                <div className="details-value">{movie.Director}</div>
              </div>
              <div>
                <div className="details-label">Actors</div>
                <div className="details-value">{movie.Actors}</div>
              </div>
              <div>
                <div className="details-label">IMDB</div>
                <div className="details-value">
                  {movie.imdbRating} ({movie.imdbVotes})
                </div>
              </div>
              <div>
                <div className="details-label">Type</div>
                <div className="details-value">{movie.Type}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

