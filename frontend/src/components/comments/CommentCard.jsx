import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useParams } from "react-router-dom";
import commentService from "../../services/commentService";
import CommentForm from "./CommentForm";
import PopupConfirm from "../common/PopupConfirm";

const CommentCard = ({ comment, onCommentUpdated }) => {
    const { id: articleId } = useParams();
    const [showConfirm, setShowConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const { user } = useAuth();
    const isAuthor = user?._id === comment.author?._id;

    const handleDelete = async () => {
        setError(null);
        try {
            setIsDeleting(true);
            await commentService.deleteComment(articleId, comment._id || comment.id);
            setShowConfirm(false);
            if (typeof onCommentUpdated === 'function') onCommentUpdated();
        } catch (err) {
            setError(err?.message || 'Erreur lors de la suppression');
            setIsDeleting(false);
        }
    };

    const handleUpdate = async (content) => {
        setError(null);
        try {
            setUpdating(true);
            await commentService.updateComment(articleId, comment._id || comment.id, { content });
            setIsEditing(false);
            if (typeof onCommentUpdated === 'function') onCommentUpdated();
        } catch (err) {
            setError(err?.message || 'Erreur lors de la modification');
            setUpdating(false);
        }
    };

    if(isEditing && isAuthor) {
        return (
            <li className="p-4 border border-gray-200 rounded">
                <p className="text-gray-600">par <strong>{comment.author?.username}</strong></p>
                {error && <div className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">{error}</div>}
                <CommentForm initialValue={comment.text || comment.content || ''} onSubmit={handleUpdate} loading={updating} onCancel={() => setIsEditing(false)} />
            </li>
        );
    }

    return (
        <li key={comment.id} className="p-4 border border-gray-200 rounded">
            {error && <div className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">{error}</div>}
            <p className="text-gray-600">par <strong>{comment.author?.username}</strong> le {new Date(comment.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-gray-800">{comment.text || comment.content}</p>
            {isAuthor && (
                <div className="flex justify-end gap-2">
                    <button onClick={() => setIsEditing(true)} disabled={isDeleting} className="text-blue-600 hover:text-blue-800"><i className="fas fa-edit"></i> Modifier</button>
                    <button onClick={() => setShowConfirm(true)} disabled={isDeleting} className="text-red-600 hover:text-red-800"><i className="fas fa-trash"></i> Supprimer</button>
                </div>
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