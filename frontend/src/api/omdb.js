const OMDB_BASE = '/api/omdb';

export async function searchMovies(query, page = 1) {
  const params = new URLSearchParams({ s: query, type: 'movie', page: String(page) });
  const res = await fetch(`${OMDB_BASE}?${params}`, { credentials: 'include' });
  const data = await res.json();
  if (data.Response === 'False') return { Search: [], totalResults: 0 };
  return { Search: data.Search || [], totalResults: Number(data.totalResults) || 0 };
}

export async function searchMoviesMultiPage(query, pages = 2) {
  const pageCount = Math.max(1, Math.min(5, Number(pages) || 1));
  const results = await Promise.all(
    Array.from({ length: pageCount }).map((_, idx) => searchMovies(query, idx + 1))
  );

  const seen = new Set();
  const merged = [];
  for (const r of results) {
    for (const m of r.Search || []) {
      if (!m?.imdbID || seen.has(m.imdbID)) continue;
      seen.add(m.imdbID);
      merged.push(m);
    }
  }
  return merged;
}

export async function getMovieById(imdbId) {
  const params = new URLSearchParams({ i: imdbId });
  const res = await fetch(`${OMDB_BASE}?${params}`, { credentials: 'include' });
  const data = await res.json();
  if (data.Response === 'False') return null;
  return data;
}

export async function fetchCategories() {
  // OMDb doesn't provide true "trending" or "language" endpoints like TMDB.
  // We approximate Netflix-style rows using diverse, high-signal search terms.
  const categories = [
    // English / global
    { title: 'Popular in English', query: 'batman' },
    { title: 'Action & Adventure', query: 'mission' },
    { title: 'Sci‑Fi', query: 'star' },

    // Hindi / Bollywood
    { title: 'Hindi & Bollywood', query: 'shah rukh' },
    { title: 'Bollywood Blockbusters', query: 'salman khan' },

    // South Indian
    { title: 'South Indian Hits', query: 'telugu' },
    { title: 'Tamil Favorites', query: 'vijay' },

    // Korean
    { title: 'Korean Cinema', query: 'parasite' },
    { title: 'K‑Thrillers', query: 'busan' },
  ];
  const results = await Promise.all(
    categories.map(async (cat) => {
      const movies = await searchMoviesMultiPage(cat.query, 2);
      return { title: cat.title, movies };
    })
  );
  return results;
}
