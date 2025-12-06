import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import articleService from '../services/articleService';

export const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const articles = await articleService.fetchArticles();

        // Normalize response shapes
        let list = [];
        if (Array.isArray(articles)) list = articles;
        else if (Array.isArray(articles?.data)) list = articles.data;

        // Fallback: try to find any array in response
        if (!list.length) {
          const maybeArray = Object.values(articles || {}).find(v => Array.isArray(v));
          if (maybeArray) list = maybeArray;
        }

        const getTime = (a) => {
          const dateVal = a?.publishedAt || a?.published_at || a?.createdAt || a?.created_at || a?.date || a?.updatedAt;
          const t = dateVal ? new Date(dateVal).getTime() : 0;
          return Number.isNaN(t) ? 0 : t;
        };

        // sort descending by date
        list.sort((a, b) => getTime(b) - getTime(a));

        if (mounted) setArticles(list);
      } catch (err) {
        setError(err?.message || JSON.stringify(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchArticles();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Chargement des articles…</div>;
  if (error) return <div className="p-6 text-red-600">Erreur: {error}</div>;

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Articles récents</h1>
      {articles.length === 0 ? (
        <div>Aucun article trouvé.</div>
      ) : (
        <ul className="space-y-4">
          {articles.map((a) => (
            <li key={a._id || a.id} className="p-4 border rounded bg-white">
              <Link to={`/articles/${a._id || a.id}`} className="text-lg font-semibold text-blue-600">
                {a.title || a.name || 'Sans titre'}
              </Link>
              <div className="text-sm text-gray-600">
                {a.author?.username || a.author || a.authorName || ''} — {new Date(a.publishedAt || a.createdAt || a.date || a.updatedAt).toLocaleString()}
              </div>
              <p className="mt-2 text-gray-800">{(a.content || a.excerpt || a.description || '').slice(0, 240)}{(a.content || a.excerpt || a.description || '').length > 240 ? '…' : ''}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Home;