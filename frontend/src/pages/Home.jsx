import { useEffect, useState } from 'react';
import articleService from '../services/articleService';
import ArticleList from '../components/articles/ArticleList';

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
        <ArticleList articles={articles} />
      )}
    </main>
  );
}

export default Home;