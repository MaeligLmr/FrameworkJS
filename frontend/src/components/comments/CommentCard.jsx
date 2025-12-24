/**
 * CommentCard — Carte d'un commentaire avec actions
 * Affiche un commentaire et ses métadonnées, permet l'édition/suppression pour l'auteur,
 * et la réponse (gestion des commentaires imbriqués).
 * 
 * Props :
 * - comment : objet Comment (incluant `author`, `responses`, etc.)
 * - onCommentUpdated : callback après modification/réponse (rafraîchit la liste côté parent)
 * - onCommentDeleted : callback après suppression (spécialement pour les commentaires enfants)
 * - isChild : indique si le commentaire est une réponse (imbriqué)
 * - level : niveau d'imbrication (0 = racine)
 * - rootReplyAuthor : auteur de la réponse ciblée (affichage "@" au-delà de 2 niveaux)
 * 
 * Comportement :
 * - Menu d'actions visible uniquement pour l'auteur
 * - Édition inline via `CommentForm`
 * - Réponses imbriquées rendues via `CommentList` (récursif)
 */
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link, useParams } from "react-router-dom";
import commentService from "../../services/commentService";
import CommentForm from "./CommentForm";
import PopupConfirm from "../common/PopupConfirm";
import Button from "../common/Button";
import CommentList from "./CommentList";
import Avatar from "../profile/avatar";

const CommentCard = ({ 
    comment, 
    onCommentUpdated, 
    onCommentDeleted, 
    isChild = false, 
    level = 0, 
    rootReplyAuthor = null }) => {
    const { id: articleId } = useParams();
    // États d'UI : confirmations, édition/suppression, messages d'erreur
    const [showConfirm, setShowConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    // États de chargement : mise à jour et réponse
    const [updating, setUpdating] = useState(false);
    const [responding, setResponding] = useState(false);
    const [isResponding, setIsResponding] = useState(false);
    // Menu d'actions (modifier/supprimer)
    const [showMenu, setShowMenu] = useState(false);
    // État local du commentaire (pour refléter les modifications sans refetch)
    const [localComment, setLocalComment] = useState(comment);
    const { user } = useAuth();
    // Seulement l'auteur du commentaire peut modifier/supprimer
    const isAuthor = user?._id === comment.author?._id;
    // Référence pour fermer le menu si clic à l'extérieur
    const menuRef = useRef(null);

    // Synchronise l'état local quand le commentaire de props change
    useEffect(() => {
        setLocalComment(comment);
    }, [comment]);

    // Ferme le menu d'actions si on clique en dehors
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

    // Callback pour les mises à jour des commentaires imbriqués (delete/update des enfants)
    const handleNestedCommentUpdated = (updatedComment, action) => {
        if (action === 'delete') {
            setLocalComment(prev => ({
                ...prev,
                responses: (prev.responses || []).filter(r => r._id !== updatedComment._id)
            }));
        } else if (action === 'update') {
            setLocalComment(prev => ({
                ...prev,
                responses: (prev.responses || []).map(r => r._id === updatedComment._id ? updatedComment : r)
            }));
        }
        if (typeof onCommentUpdated === 'function') onCommentUpdated();
    };

    // Supprime le commentaire courant (auteur uniquement)
    const handleDelete = async () => {
        setError(null);
        try {
            setIsDeleting(true);
            await commentService.deleteComment(articleId, comment._id || comment.id);
            setShowConfirm(false);
            if (isChild && typeof onCommentDeleted === 'function') {
                onCommentDeleted(comment);
            } else if (typeof onCommentUpdated === 'function') {
                onCommentUpdated();
            }
        } catch (err) {
            setError(err?.message || 'Erreur lors de la suppression');
            setIsDeleting(false);
        }
    };

    // Met à jour le contenu du commentaire (édition inline)
    const handleUpdate = async (content) => {
        setError(null);
        try {
            setUpdating(true);
            const updatedComment = await commentService.updateComment(articleId, comment._id || comment.id, { content });
            const newCommentData = {
                ...localComment,
                content: updatedComment.data.content || updatedComment.data.text
            };
            setLocalComment(newCommentData);
            setIsEditing(false);
            if (isChild && typeof onCommentUpdated === 'function') {
                onCommentUpdated(newCommentData);
            } else if (typeof onCommentUpdated === 'function') {
                onCommentUpdated();
            }
        } catch (err) {
            setError(err?.message || 'Erreur lors de la modification');
            setUpdating(false);
        }
    };

    // Ajoute une réponse au commentaire courant
    const handleRespond = async (content) => {
        setResponding(true);
        setError(null);
        try {
            const parentId = comment._id || comment.id;
            const newReply = await commentService.postComment(articleId, { content, comment: parentId });
            setIsResponding(false);
            setLocalComment(prev => ({
                ...prev,
                responses: [...(prev.responses || []), newReply.data]
            }));
            if (typeof onCommentUpdated === 'function') onCommentUpdated();
        } catch (err) {
            setError(err?.message || 'Erreur lors de la réponse');
            setResponding(false);
        }
    }

    // Mode édition : affiche le formulaire d'édition pour l'auteur
    if (isEditing && isAuthor) {
        return (
            <li className="p-4">
                <p className="text-gray-600"><Link to={`/profile/${localComment.author?._id}`}>{localComment.author?.username}</Link></p>
                {error && <div className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">{error}</div>}
                <CommentForm initialValue={localComment.text || localComment.content || ''} onSubmit={handleUpdate} loading={updating} onCancel={() => setIsEditing(false)} />
            </li>
        );
    }

    return (
        <li key={comment.id} className="p-4">
            {/* Affichage des erreurs locales */}
            {error && <div className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">{error}</div>}
            <div className="flex gap-2">
                <Link to={`/profile/${localComment.author?._id}`}><Avatar dimensions={10} user={localComment.author} showName={false}></Avatar></Link>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                    <div className="text-gray-600 flex gap-2 flex-wrap text-sm">
                        <Link to={`/profile/${localComment.author?._id}`} className="flex gap-2 font-semibold text-gray-600 hover:font-bold">
                            <span className="font-semibold hover:underline">{localComment.author?.username}</span>
                        </Link>
                        {/* Mention du destinataire dans les réponses profondes (>= 2 niveaux) */}
                        {isChild && level >= 2 && rootReplyAuthor && (
                            <span className="text-gray-500">
                                &gt; <Link to={`/profile/${rootReplyAuthor?._id}`} className="hover:underline">{rootReplyAuthor?.username}</Link>
                            </span>
                        )}
                        le {new Date(localComment.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {/* Menu d'actions réservé à l'auteur (modifier/supprimer) */}
                    {isAuthor && (
                        <div className="relative flex justify-end" ref={menuRef}>
                            <Button onClick={() => setShowMenu(!showMenu)} noBorders icon="ellipsis-vertical">
                            </Button>
                            {showMenu && (
                                <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-max">
                                    <Button 
                                        onClick={() => { setIsEditing(true); setShowMenu(false); }} 
                                        disabled={isDeleting} 
                                        icon="edit"
                                        noBorders
                                        full
                                    >
                                        Modifier
                                    </Button>
                                    <Button 
                                        onClick={() => { setShowConfirm(true); setShowMenu(false); }} 
                                        disabled={isDeleting} 
                                        danger
                                        noBorders
                                        full
                                        icon="trash"
                                    >
                                        Supprimer
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    </div>
                    <p className="text-gray-800">{localComment.text || localComment.content}</p>
                    
                    {/* Bouton pour répondre au commentaire (utilisateur connecté) */}
                    {user && (
                        <Button noBorders onClick={() => setIsResponding(true)}>Répondre</Button>
                    )}
                </div>

            </div>
            {/* Rendu des réponses du commentaire racine (niveau 0) via CommentList */}
            {(level === 0 && localComment.responses && localComment.responses.length > 0) && (
                <CommentList
                    comments={localComment.responses || []}
                    onCommentUpdated={(updatedComment) => handleNestedCommentUpdated(updatedComment, 'update')}
                    level={level + 1}
                    rootReplyAuthor={level >= 1 ? rootReplyAuthor : localComment.author}
                    onCommentDeleted={(deletedComment) => handleNestedCommentUpdated(deletedComment, 'delete')}
                />
            )}
            {/* Formulaire de réponse inline */}
            {isResponding && (
                <CommentForm
                    onSubmit={handleRespond}
                    loading={responding}
                    onCancel={() => setIsResponding(false)}
                />
            )}
            {/* Popup de confirmation pour suppression */}
            {showConfirm && (
                <PopupConfirm
                    message="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                    confirmText="Supprimer"
                    danger
                />
            )}


        </li>
    );
};
export default CommentCard;