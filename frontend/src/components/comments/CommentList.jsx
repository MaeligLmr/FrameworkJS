import CommentCard from "./CommentCard";

const CommentList = ({ comments, onDelete, onCommentUpdated, onCommentDeleted, isChild = false, level = 0, rootReplyAuthor = null }) => {
    const handleCallback = onCommentUpdated || onDelete;
    console.log("Rendering CommentList with comments:", comments);
    return (
        <ul className="space-y-3 mt-4">
            {comments.map(comment => (
                <CommentCard 
                    key={comment._id || comment.id} 
                    comment={comment} 
                    onCommentUpdated={handleCallback}
                    onCommentDeleted={onCommentDeleted}
                    isChild={isChild}
                    level={level}
                    rootReplyAuthor={rootReplyAuthor}
                />
            ))}
        </ul>
    );
};

export default CommentList;