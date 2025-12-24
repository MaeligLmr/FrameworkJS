import { useEffect, useState, useCallback, useRef } from 'react';
import articleService from '../services/articleService';
import ArticleList from '../components/articles/ArticleList';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/common/Loader';
import Select from 'react-select';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

const CATEGORIES = [
  { value: 'all', label: 'Toutes' },
  { value: 'Cinéma & Séries', label: 'Cinéma & Séries' },
  { value: 'Musique', label: 'Musique' },
  { value: 'Comics, Manga', label: 'Comics, Manga' },
  { value: 'Internet', label: 'Internet' }
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
    <main className="p-6 min-h-screen">
      <section className="mb-8 rounded-xl">
        <h1 className="text-3xl font-bold mb-3">Bienvenue sur Zentra.</h1>
        <p className="text-[#2F4889] mb-3">
          Zentra est un espace dédié à la pop culture, là où le cinéma, les séries, la musique, le jeu vidéo et les tendances numériques se croisent.
        </p>
        <p className="text-[#2F4889] mb-3">
          Nous explorons ce qui façonne la culture d’aujourd’hui, entre œuvres cultes, nouveautés et phénomènes qui font vibrer Internet.
        </p>
        <p className="text-[#2F4889]">
          Zentra, c’est un regard curieux et accessible sur la pop culture contemporaine, pensé comme un point de rencontre pour découvrir, analyser et partager.
        </p>
      </section>

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-6">Articles récents</h2>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          {/* Barre de recherche et filtres */}
          <div className="w-full">
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
              className="w-full md:w-48 rounded-2xl"
              styles={{
                control: (base, state) => ({
                  ...base,
                  minHeight: '40px',
                  borderRadius: '0.5rem',
                  borderColor: state.isFocused ? '#4062BB' : base.borderColor,
                  boxShadow: state.isFocused ? '0 0 0 1px #4062BB' : base.boxShadow,
                  '&:hover': {
                    borderColor: state.isFocused ? '#4062BB' : base.borderColor
                  }
                }),
                option: (base, state) => ({
                  ...base,
                  backgroundColor: state.isSelected ? '#4062BB' : state.isFocused ? '#E8EFFF' : base.backgroundColor,
                  color: state.isSelected ? 'white' : state.isFocused ? '#4062BB' : base.color,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: state.isSelected ? '#4062BB' : '#E8EFFF',
                    color: state.isSelected ? 'white' : '#4062BB'
                  }
                })
              }}
            />
          </div>
        </div>
        {/* Boutons de catégorie scrollables */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
          <div className="flex gap-2 w-full overflow-x-auto pb-2 scroll-smooth scrollbar-thin scrollbar-thumb-gray-300">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat.value}
                onClick={() => setCategory(cat.value)}
                light={category !== cat.value}
              >
                {cat.label}
              </Button>
            ))}
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
        <Link to="/create" className="md:hidden fixed bottom-6 right-6 bg-[#4062BB] text-white p-4 px-4.5 rounded-full shadow-lg hover:bg-[#2F4889] transition-colors z-50">
          <i className="fas fa-plus"></i>
        </Link>
      )}
    </main>
  );
}

export default Home;