import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import articleService from '../services/articleService';
import commentService from '../services/commentService';
import Loader from '../components/common/Loader';
import useAuth from '../hooks/useAuth';
import ArticleForm from '../components/articles/ArticleForm';
import PopupConfirm from '../components/common/PopupConfirm';
import CommentForm from '../components/comments/CommentForm';
import CommentList from '../components/comments/CommentList';
import Button from '../components/common/Button';
import Avatar from '../components/profile/avatar';
import { getCategoryColor } from '../utils/helpers';

export const ArticleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editErrors, setEditErrors] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showPublishConfirm, setShowPublishConfirm] = useState(false);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentsError, setCommentsError] = useState([]);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const menuRef = useRef(null);

  const handleBack = () => {
    const cameFromCreate = location.state?.from === '/create';
    if (cameFromCreate && window.history.length > 2) {
      navigate(-2);
    } else if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  const isAuthor = article && user && (article.author?._id === user._id)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

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
      const items = res?.data || res || [];
      // If API already returns nested `responses`, just keep top-level roots
      const roots = Array.isArray(items) ? items.filter((c) => !c.comment) : [];
      setComments(roots);
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
      await commentService.postComment(id, { author: user._id, content: text });
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
      setPublishing(false);
    }
  };

  const handleTogglePublish = async () => {
    setPublishing(true);
    setError(null);
    try {
      const res = article.published 
        ? await articleService.unpublishArticle(id)
        : await articleService.publishArticle(id);
      const updated = res?.data || res;
      if (updated) {
        setArticle(updated);
        setShowMenu(false);
      }
    } catch (err) {
      setError(err?.message || 'Erreur lors de la mise à jour');
    } finally {
      setPublishing(false);
      setShowPublishConfirm(false);
    }
  };

  if (loading) return <div className="p-6"><Loader /></div>;
  if (error) return <div className="p-6 text-red-600">Erreur: {error}</div>;
  if (!article) return <div className="p-6">Article introuvable.</div>;

  if (editing && isAuthor) {
    return (
      <main className="p-6 max-w-3xl mx-auto">
        <Link to="#" onClick={() => setEditing(false)} className="text-sm text-[#4062BB]">← Annuler</Link>
        <h1 className="text-2xl font-semibold mt-4 mb-4">Modifier l'article</h1>
        <ArticleForm initialValues={article} onSubmit={handleUpdate} loading={updating} errors={editErrors} />
      </main>
    );
  }

  return (
    <main className="p-6 flex flex-col gap-6 min-h-screen">
      <Button onClick={handleBack} noBorders rounded icon='arrow-left'></Button>
      <div className="max-w-3xl md:min-w-3xl mx-auto">
        <div className='flex flex-col gap-4'>
          <div className="flex justify-between items-start gap-4">
            <h1 className="text-3xl font-bold">{article.title || 'Sans titre'}</h1>{isAuthor && (
              <div className="relative" ref={menuRef}>
                <Button onClick={() => setShowMenu(!showMenu)} noBorders icon='ellipsis-vertical' rounded>
                </Button>
                {showMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max">
                    <Button
                      onClick={() => { setEditing(true); setShowMenu(false); }}
                      disabled={deleting || publishing}
                      icon="edit"
                      noBorders
                      full
                    >
                      Modifier
                    </Button>
                    <Button
                      onClick={() => { setShowPublishConfirm(true); setShowMenu(false); }}
                      disabled={deleting || publishing}
                      icon={article.published ? "eye-slash" : "eye"}
                      noBorders
                      full
                    >
                      {article.published ? "Dépublier" : "Publier"}
                    </Button>
                    <Button
                      onClick={() => { setShowConfirm(true); setShowMenu(false); }}
                      disabled={deleting || publishing}
                      danger
                      icon="trash"
                      noBorders
                      full
                    >
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-2 flex gap-2 items-center">
            <Link to={`/profile/${article.author?._id}`} className='flex gap-2 items-center'><Avatar user={article.author} dimensions={8}></Avatar></Link> le {new Date(article.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}

          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(article.category)}`}>
              {article.category}
            </span>
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <i className="fas fa-eye"></i>
              {article.views || 0} vues
            </span>
          </div>



        </div>
        <div>
          {article.imageUrl && <img src={article.imageUrl} alt={article.title || 'Article image'} onClick={() => setShowImageModal(true)} className="w-full max-h-96 object-cover rounded-lg mt-4 cursor-pointer hover:opacity-90 transition-opacity" />}
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
                  <Button onClick={() => setShowCommentForm(true)}>
                    Ajouter un commentaire
                  </Button>
                )}
                {showCommentForm && (
                  <CommentForm onSubmit={handleCommentSubmit} onCancel={() => setShowCommentForm(false)} />
                )}
              </div>
            ) : (
              <p className="text-gray-600 mb-4"><Link to="/login" className="text-[#4062BB]">Connectez-vous</Link> pour ajouter un commentaire</p>
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

        {showImageModal && article.imageUrl && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
            <div className="max-w-4xl max-h-screen flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img src={article.imageUrl} alt={article.title || 'Article image'} className="max-w-full max-h-screen object-contain" />
              <button onClick={() => setShowImageModal(false)} className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center hover:bg-gray-200/30 rounded-full transition-colors">
                <i className="fas fa-times text-white"></i>
              </button>
            </div>
          </div>
        )}

        {showConfirm && (
          <PopupConfirm
            message="Êtes-vous sûr de vouloir supprimer cet article ?"
            onConfirm={handleDelete}
            onCancel={() => setShowConfirm(false)}
            confirmText="Supprimer"
            danger
          />)}
        
        {showPublishConfirm && (
          <PopupConfirm
            message={article.published 
              ? "Êtes-vous sûr de vouloir dépublier cet article ? Il ne sera plus visible publiquement."
              : "Êtes-vous sûr de vouloir publier cet article ? Il sera visible par tous."}
            onConfirm={handleTogglePublish}
            onCancel={() => setShowPublishConfirm(false)}
            confirmText={article.published ? "Dépublier" : "Publier"}
            danger={article.published}
          />)}
      </div>
    </main>
  );
};

export default ArticleDetail;

