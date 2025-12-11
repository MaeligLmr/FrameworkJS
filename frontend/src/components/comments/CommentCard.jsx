import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import commentService from "../../services/commentService";
import CommentForm from "./CommentForm";
import PopupConfirm from "../common/PopupConfirm";
import { Button } from "../common/Button";
import CommentList from "./CommentList";

const CommentCard = ({ comment, onCommentUpdated, onCommentDeleted, isChild = false }) => {
    const { id: articleId } = useParams();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [responding, setResponding] = useState(false);
    const [isResponding, setIsResponding] = useState(false);
    const [localComment, setLocalComment] = useState(comment);
    const { user } = useAuth();
    const isAuthor = user?._id === comment.author?._id;

    useEffect(() => {
        setLocalComment(comment);
    }, [comment]);

    // Callback for nested comment updates (delete/update of child comments)
    const handleNestedCommentUpdated = (updatedComment, action) => {
        if (action === 'delete') {
            // Remove deleted comment from responses
            setLocalComment(prev => ({
                ...prev,
                responses: (prev.responses || []).filter(r => r._id !== updatedComment._id)
            }));
        } else if (action === 'update') {
            // Update modified comment in responses
            setLocalComment(prev => ({
                ...prev,
                responses: (prev.responses || []).map(r => r._id === updatedComment._id ? updatedComment : r)
            }));
        }
        if (typeof onCommentUpdated === 'function') onCommentUpdated();
    };

    const handleDelete = async () => {
        setError(null);
        try {
            setIsDeleting(true);
            await commentService.deleteComment(articleId, comment._id || comment.id);
            setShowConfirm(false);
            // For nested comments, use onCommentDeleted callback
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
            // For nested comments, use onCommentUpdated callback with the updated comment
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

    const handleRespond = async (content) => {
        setResponding(true);
        setError(null);
        try {
            const newReply = await commentService.postComment(articleId, { content, comment: comment._id});
            setIsResponding(false);
            // Update local comment with new response
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

    if(isEditing && isAuthor) {
        return (
            <li className="p-4 border border-gray-200 rounded">
                <p className="text-gray-600">par <strong>{localComment.author?.username}</strong></p>
                {error && <div className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">{error}</div>}
                <CommentForm initialValue={localComment.text || localComment.content || ''} onSubmit={handleUpdate} loading={updating} onCancel={() => setIsEditing(false)} />
            </li>
        );
    }

    return (
        <li key={comment.id} className="p-4 border border-gray-200 rounded">
            {error && <div className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">{error}</div>}
            <p className="text-gray-600">par <strong>{localComment.author?.username}</strong> le {new Date(localComment.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-gray-800">{localComment.text || localComment.content}</p>
            {isAuthor && (
                <div className="flex justify-end gap-2">
                    <Button onClick={() => setIsEditing(true)} disabled={isDeleting} className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i> Modifier</Button>
                    <Button onClick={() => setShowConfirm(true)} disabled={isDeleting} className="text-red-600 hover:text-red-800"><i className="fas fa-trash"></i> Supprimer</Button>
                </div>
            )}
            {user && (
            <Button onClick={() => setIsResponding(true)}>Répondre</Button>
            )}
            {!isChild && <CommentList comments={localComment.responses || []} onCommentUpdated={(updatedComment) => handleNestedCommentUpdated(updatedComment, 'update')} isChild={true} onCommentDeleted={(deletedComment) => handleNestedCommentUpdated(deletedComment, 'delete')} />}
            {isResponding && (
                <CommentForm
                    onSubmit={handleRespond}
                    loading={responding}
                    onCancel={() => setIsResponding(false)}
                />
            )}
            {showConfirm && (
                <PopupConfirm
                    message="Êtes-vous sûr de vouloir supprimer ce commentaire ?"
                    onConfirm={handleDelete}
                    onCancel={() => setShowConfirm(false)}
                    confirmText="Supprimer"
                    confirmColor="bg-red-600"
                />
            )}
        </li>
    );
};
export default CommentCard;