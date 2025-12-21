import CommentCard from "./CommentCard";

const CommentList = ({ comments = [], onDelete, onCommentUpdated, onCommentDeleted, level = 0, rootReplyAuthor = null }) => {
    const handleCallback = onCommentUpdated || onDelete;
    console.log(
        "CommentList level",
        level,
        "count",
        Array.isArray(comments) ? comments.length : 0,
        "responses per item",
        Array.isArray(comments)
            ? comments.map(c => ({ id: c._id || c.id, responses: Array.isArray(c.responses) ? c.responses.length : 0 }))
            : []
    );

    // When rendering replies (level >= 1), flatten all descendants into the same list
    const flattenReplies = (nodes, currentLevel, currentRootAuthor) => {
        return nodes.flatMap((n) => {
            const self = { node: n, level: currentLevel, rootReplyAuthor: currentRootAuthor };
            const children = Array.isArray(n.responses)
                ? flattenReplies(n.responses, currentLevel + 1, n.author || currentRootAuthor)
                : [];
            return [self, ...children];
        });
    };

    const itemsToRender = level >= 1
        ? flattenReplies(comments, level, rootReplyAuthor)
        : comments.map((c) => ({ node: c, level, rootReplyAuthor }));

    return (
        <ul className={`mt-2 ${level === 0 ? '' : 'border-l border-gray-200 ml-4'}`}>
            {itemsToRender.map(({ node, level: lvl, rootReplyAuthor: rra }) => (
                <CommentCard
                    key={node._id || node.id}
                    comment={node}
                    onCommentUpdated={handleCallback}
                    onCommentDeleted={onCommentDeleted}
                    isChild={lvl > 0}
                    level={lvl}
                    rootReplyAuthor={rra}
                />
            ))}
        </ul>
    );
};

export default CommentList;