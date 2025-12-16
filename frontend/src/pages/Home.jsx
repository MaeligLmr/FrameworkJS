import { useEffect, useState, useCallback, useRef } from 'react';
import articleService from '../services/articleService';
import ArticleList from '../components/articles/ArticleList';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Select from 'react-select';
import Input from '../components/common/Input';

const CATEGORIES = [
  { value: 'all', label: 'Toutes' },
  { value: 'Technologie', label: 'Technologie' },
  { value: 'Santé', label: 'Santé' },
  { value: 'Science', label: 'Science' },
  { value: 'Finance', label: 'Finance' },
  { value: 'Éducation', label: 'Éducation' },
  { value: 'Divertissement', label: 'Divertissement' }
];

export const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('recent');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();
  const observerTarget = useRef(null);

  const fetchArticles = useCallback(async (pageNum, reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await articleService.fetchArticles({
        search: search || undefined,
        category: category !== 'all' ? category : undefined,
        sort: sort || undefined,
        page: pageNum,
        limit: 5
      });

      const newArticles = response?.articles || response?.data || [];
      const pagination = response?.pagination;

      if (reset) {
        setArticles(newArticles);
      } else {
        setArticles(prev => [...prev, ...newArticles]);
      }

      setHasMore(pagination?.hasMore ?? false);
    } catch (err) {
      setError(err?.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, loading]);

  // Reset and fetch on filter change
  useEffect(() => {
    setPage(1);
    setArticles([]);
    fetchArticles(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, category, sort]);

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, loading]);

  // Fetch more when page changes
  useEffect(() => {
    if (page > 1) {
      fetchArticles(page);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <main className="p-6 min-h-screen max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-6">Articles récents</h1>
        
        {/* Barre de recherche et filtres */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 md:items-end">
          <div className="flex-1">
            <Input
              type="text"
              name="search"
              label="Rechercher"
              placeholder="Rechercher un article..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={<i className="fas fa-search"></i>}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
            <Select
              options={CATEGORIES}
              value={CATEGORIES.find(cat => cat.value === category)}
              onChange={(selected) => setCategory(selected.value)}
              className="w-full md:w-64"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '40px'
                })
              }}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tri</label>
            <Select
              options={[
                { value: 'recent', label: 'Plus récents' },
                { value: 'oldest', label: 'Plus anciens' },
                { value: 'popular', label: 'Populaires' }
              ]}
              value={
                sort === 'recent' ? { value: 'recent', label: 'Plus récents' } :
                sort === 'oldest' ? { value: 'oldest', label: 'Plus anciens' } :
                sort === 'popular' ? { value: 'popular', label: 'Populaires' } :
                { value: 'popular', label: 'Populaires' }
              }
              onChange={(selected) => setSort(selected.value)}
              className="w-full md:w-64"
              styles={{
                control: (base) => ({
                  ...base,
                  minHeight: '40px'
                })
              }}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 border border-red-600 text-red-700 rounded-lg mb-6">
          {error}
        </div>
      )}

      {articles.length === 0 && !loading ? (
        <div className="text-center py-12 text-gray-500">
          <i className="fas fa-inbox text-4xl mb-4"></i>
          <p>Aucun article trouvé.</p>
        </div>
      ) : (
        <>
          <ArticleList articles={articles} />
          
          {/* Infinite scroll trigger */}
          <div ref={observerTarget} className="py-4 text-center">
            {loading && <Loader />}
            {!hasMore && articles.length > 0 && (
              <p className="text-gray-500 text-sm">Tous les articles ont été chargés</p>
            )}
          </div>
        </>
      )}
      
      {user && (
        <Link to="/create" className="md:hidden fixed bottom-6 right-6 bg-blue-600 text-white p-4 px-4.5 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50">
          <i className="fas fa-plus"></i>
        </Link>
      )}
    </main>
  );
}

export default Home;