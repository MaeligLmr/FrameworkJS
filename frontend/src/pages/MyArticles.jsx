import { useEffect, useState } from 'react';
import articleService from '../services/articleService';
import useAuth from '../hooks/useAuth';
import { ArticleCard } from '../components/articles/ArticleCard';
import ArticleList from '../components/articles/ArticleList';

export const MyArticles = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchMine = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await articleService.fetchArticles();
        let list = Array.isArray(res) ? res : res?.data || res?.data?.data || [];
        // filter by author id (accept _id or id)
        const myId = user?.id || user?._id;
        if (myId) {
          list = list.filter(a => (a.author && (a.author === myId || a.author._id === myId || a.author.id === myId)));
        } else {
          list = [];
        }
        if (mounted) setArticles(list);
      } catch (err) {
        setError(err?.message || JSON.stringify(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMine();
    return () => { mounted = false; };
  }, [user]);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (error) return <div className="p-6 text-red-600">Erreur: {error}</div>;

  return (
    <main className="p-6 min-h-screen">
      <h1 className="text-2xl font-semibold mb-4">Mes articles</h1>
      {articles.length === 0 ? (
        <div>Aucun article trouvé.</div>
      ) : (
        <ArticleList articles={articles} />
      )}
    </main>
  );
}

export default MyArticles;