import { useEffect, useState } from 'react';
import articleService from '../services/articleService';
import useAuth from '../hooks/useAuth';
import { ArticleCard } from '../components/articles/ArticleCard';
import ArticleList from '../components/articles/ArticleList';
import { Link } from 'react-router-dom';

export const MyArticles = () => {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // 'all', 'published', 'drafts'

  useEffect(() => {
    let mounted = true;
    const fetchMine = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await articleService.fetchMyArticles();
        let list = res;
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

  // Filtrer les articles selon le filtre sélectionné
  const filteredArticles = filter === 'all' 
    ? articles 
    : filter === 'published' 
    ? articles.filter(a => a.published)
    : articles.filter(a => !a.published);

  return (
    <main className="p-6 min-h-screen max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-4">Mes articles</h1>
        
        {/* Filtres de statut */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Tous ({articles.length})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'published' 
                ? 'bg-green-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Publiés ({articles.filter(a => a.published).length})
          </button>
          <button
            onClick={() => setFilter('drafts')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'drafts' 
                ? 'bg-gray-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Brouillons ({articles.filter(a => !a.published).length})
          </button>
        </div>
      </div>

      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-inbox text-4xl mb-4"></i>
          <p>Aucun article trouvé.</p>
        </div>
      ) : (
        <ArticleList articles={filteredArticles} />
      )}
      <Link to="/create" className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors">
        <i className="fas fa-plus"></i>
      </Link>
    </main>
  );
}

export default MyArticles;