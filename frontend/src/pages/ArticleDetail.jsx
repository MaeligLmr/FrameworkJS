import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import articleService from '../services/articleService';
import commentService from '../services/commentService';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';
import ArticleForm from '../components/articles/ArticleForm';
import PopupConfirm from '../components/common/PopupConfirm';
import CommentForm from '../components/comments/CommentForm';
import CommentList from '../components/comments/CommentList';
import Button from '../components/common/Button';

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
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);

  const isAuthor = article && user && (article.author?._id === user._id);
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

  const fetchComments = useCallback(async () => {
    setLoadingComments(true);
    setCommentsError([]);
    try {
      const res = await commentService.fetchComments(id);
      let commentList = res?.data || res || [];
      commentList = commentList.filter(c => !c.comment); // only top-level comments
      setComments(Array.isArray(commentList) ? commentList : []);
    } catch (err) {
      setCommentsError(err?.errors || ['Erreur lors du chargement des commentaires']);
    } finally {
      setLoadingComments(false);
    }
  }, [id]);

  useEffect(() => {
    if (article?._id || article?.id) {
      fetchComments();
    }
  }, [article?._id, article?.id, fetchComments]);

  const handleCommentSubmit = async (text) => {
    try {
      await commentService.postComment(id,{ author: user._id, content : text });
      setShowCommentForm(false);
      fetchComments();
    } catch (err) {
      setCommentsError(err?.errors);
    }
  };

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
      if (!body.image && article.imageUrl) {
        body.imageUrl = article.imageUrl;
      }
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
            <Button onClick={() => setEditing(true)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg">Modifier</Button>
            <Button onClick={() => setShowConfirm(true)} disabled={deleting} className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg disabled:opacity-50">
              {deleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        )}
      </div>
      <div>
        {article.imageUrl && <img src={article.imageUrl} alt={article.title || 'Article image'} className="w-full max-h-96 object-cover rounded-lgmt-4" />}
      </div>
      <div className="prose prose-lg mt-6">
        {article.content}
      </div>
      
      <section className="mt-8 border-t pt-6">
        <h2 className="text-2xl font-semibold mb-4">Commentaires</h2>
        
        {article.published ? (
          user ? (
            <div className="mb-6">
              {!showCommentForm && (
                <Button onClick={() => setShowCommentForm(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                  Ajouter un commentaire
                </Button>
              )}
              {showCommentForm && (
                <div className="p-4 border border-gray-200 rounded-lgmb-4">
                  <CommentForm onSubmit={handleCommentSubmit} onCancel={() => setShowCommentForm(false)} />
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-600 mb-4"><Link to="/login" className="text-blue-600">Connectez-vous</Link> pour ajouter un commentaire</p>
          )
        ) : (
          <p className="text-gray-600 mb-4 italic">Les commentaires sont désactivés pour les articles non publiés.</p>
        )}
        
        { 
        commentsError.length > 0 &&
        commentsError.map((err, index) => (
          <div key={index} className="p-2 border border-red-600 bg-red-100 text-red-700 mb-4">{err}</div>
        ))}
        
        {article.published && (
          loadingComments ? (
            <Loader />
          ) : comments.length === 0 ? (
            <p className="text-gray-600">Aucun commentaire pour le moment.</p>
          ) : (
            <CommentList comments={comments} onCommentUpdated={() => fetchComments()} />
          )
        )}
      </section>
      
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

