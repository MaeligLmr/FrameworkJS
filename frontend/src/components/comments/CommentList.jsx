import CommentCard from "./CommentCard";

const CommentList = ({ comments, onDelete, onCommentUpdated, onCommentDeleted, isChild = false }) => {
    const handleCallback = onCommentUpdated || onDelete;
    
    return (
        <ul className="space-y-3 ml-4">
            {comments.map(comment => (
                <CommentCard 
                    key={comment._id || comment.id} 
                    comment={comment} 
                    onCommentUpdated={handleCallback}
                    onCommentDeleted={onCommentDeleted}
                    isChild={isChild}
                />
            ))}
        </ul>
    );
};

export default CommentList;