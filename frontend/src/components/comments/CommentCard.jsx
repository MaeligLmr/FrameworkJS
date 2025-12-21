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
    const [showConfirm, setShowConfirm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState(null);
    const [updating, setUpdating] = useState(false);
    const [responding, setResponding] = useState(false);
    const [isResponding, setIsResponding] = useState(false);
    const [showMenu, setShowMenu] = useState(false);
    const [localComment, setLocalComment] = useState(comment);
    const { user } = useAuth();
    const isAuthor = user?._id === comment.author?._id;
    const menuRef = useRef(null);

    useEffect(() => {
        setLocalComment(comment);
    }, [comment]);

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
            const parentId = comment._id || comment.id;
            const newReply = await commentService.postComment(articleId, { content, comment: parentId });
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
            {error && <div className="mb-2 p-2 border border-red-600 bg-red-100 text-red-700">{error}</div>}
            <div className="flex gap-2">
                <Link to={`/profile/${localComment.author?._id}`}><Avatar dimensions={10} user={localComment.author} showName={false}></Avatar></Link>
                <div className="flex-1">
                    <div className="flex justify-between items-start">
                    <div className="text-gray-600 flex gap-2 flex-wrap text-sm">
                        <Link to={`/profile/${localComment.author?._id}`} className="flex gap-2 font-semibold text-gray-600 hover:font-bold">
                            <span className="font-semibold hover:underline">{localComment.author?.username}</span>
                        </Link>
                        {isChild && level >= 2 && rootReplyAuthor && (
                            <span className="text-gray-500">
                                &gt; <Link to={`/profile/${rootReplyAuthor?._id}`} className="hover:underline">{rootReplyAuthor?.username}</Link>
                            </span>
                        )}
                        le {new Date(localComment.createdAt).toLocaleString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
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
                    
                    {user && (
                        <Button noBorders onClick={() => setIsResponding(true)}>Répondre</Button>
                    )}
                </div>

            </div>
            {(level === 0 && localComment.responses && localComment.responses.length > 0) && (
                <CommentList
                    comments={localComment.responses || []}
                    onCommentUpdated={(updatedComment) => handleNestedCommentUpdated(updatedComment, 'update')}
                    level={level + 1}
                    rootReplyAuthor={level >= 1 ? rootReplyAuthor : localComment.author}
                    onCommentDeleted={(deletedComment) => handleNestedCommentUpdated(deletedComment, 'delete')}
                />
            )}
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