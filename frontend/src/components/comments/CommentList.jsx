import CommentCard from "./CommentCard";

const CommentList = ({ comments, onDelete }) => {
    return (
        <ul className="space-y-3">
            {comments.map(comment => (
                <CommentCard 
                    key={comment._id || comment.id} 
                    comment={comment} 
                    onCommentUpdated={onDelete}
                />
            ))}
        </ul>
    );
};

export default CommentList;