const OMDB_BASE = '/api/omdb';

export async function searchMovies(query, page = 1) {
  const params = new URLSearchParams({ s: query, type: 'movie', page: String(page) });
  const res = await fetch(`${OMDB_BASE}?${params}`, { credentials: 'include' });
  const data = await res.json();
  if (data.Response === 'False') return { Search: [], totalResults: 0 };
  return { Search: data.Search || [], totalResults: Number(data.totalResults) || 0 };
}

export async function getMovieById(imdbId) {
  const params = new URLSearchParams({ i: imdbId });
  const res = await fetch(`${OMDB_BASE}?${params}`, { credentials: 'include' });
  const data = await res.json();
  if (data.Response === 'False') return null;
  return data;
}

export async function fetchCategories() {
  const categories = [
    { title: 'Trending Now', query: 'avengers' },
    { title: 'Action', query: 'action' },
    { title: 'Comedy', query: 'comedy' },
    { title: 'Drama', query: 'drama' },
    { title: 'Marvel', query: 'marvel' },
    { title: 'Sci-Fi', query: 'sci-fi' },
  ];
  const results = await Promise.all(
    categories.map(async (cat) => {
      const { Search } = await searchMovies(cat.query, 1);
      return { title: cat.title, movies: Search || [] };
    })
  );
  return results;
}
