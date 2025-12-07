import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import articleService from '../services/articleService';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';
import ArticleForm from '../components/articles/ArticleForm';
import PopupConfirm from '../components/common/PopupConfirm';

export const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editErrors, setEditErrors] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const isAuthor = article && user && (article.author?._id === user._id || article.author?.id === user.id);

  useEffect(() => {
    let mounted = true;
    const fetchOne = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await articleService.fetchArticle(id);
        // normalize
        const a = res?.data || res || null;
        if (mounted) setArticle(a);
      } catch (err) {
        setError(err?.message || JSON.stringify(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchOne();
    return () => { mounted = false; };
  }, [id]);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      await articleService.deleteArticle(id);
      navigate('/');
    } catch (err) {
      setError(err?.message || 'Erreur lors de la suppression');
      setDeleting(false);
    }
  };

  const handleUpdate = async (payload) => {
    setEditErrors([]);
    try {
      setUpdating(true);
      const body = { ...payload };
      if (user?._id) body.author = user._id;
      const res = await articleService.updateArticle(id, body);
      const updated = res?.data || res;
      if (updated) {
        setArticle(updated);
        setEditing(false);
      }
    } catch (err) {
      setEditErrors(err?.errors || err?.message ? [err.message || JSON.stringify(err)] : [JSON.stringify(err)]);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <div className="p-6"><Loader /></div>;
  if (error) return <div className="p-6 text-red-600">Erreur: {error}</div>;
  if (!article) return <div className="p-6">Article introuvable.</div>;

  if (editing && isAuthor) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <Link to="#" onClick={() => setEditing(false)} className="text-sm text-blue-600">← Annuler</Link>
        <h1 className="text-2xl font-semibold mt-4 mb-4">Modifier l'article</h1>
        <ArticleForm initialValues={article} onSubmit={handleUpdate} loading={updating} errors={editErrors} />
      </main>
    );
  }

  return (
    <main className="p-6 max-w-3xl mx-auto">
      <Link to="/" className="text-sm text-blue-600">← Retour</Link>
      <div className="flex justify-between items-start mt-4">
        <div>
          <h1 className="text-3xl font-bold">{article.title || 'Sans titre'}</h1>
          <div className="text-sm text-gray-600 mt-2">
            par <strong>{article.author?.username}</strong> le {new Date(article.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        {isAuthor && (
          <div className="flex gap-2">
            <button onClick={() => setEditing(true)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded">Modifier</button>
            <button onClick={() => setShowConfirm(true)} disabled={deleting} className="px-3 py-1 bg-red-600 text-white text-sm rounded disabled:opacity-50">
              {deleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        )}
      </div>
      <div className="prose prose-lg mt-6">
        {article.content}
      </div>
      {showConfirm && (
      <PopupConfirm
        message="Êtes-vous sûr de vouloir supprimer cet article ?"
        onConfirm={handleDelete}
        onCancel={() => setShowConfirm(false)}
        confirmText="Supprimer"
      />)}
    </main>
  );
};

export default ArticleDetail;

