/**
 * CommentList — Liste de commentaires
 * Affiche soit les commentaires racine (level = 0), soit aplatit les réponses
 * en une seule liste pour les niveaux >= 1 afin de simplifier l'affichage.
 * 
 * Props :
 * - comments : tableau de commentaires (peut contenir `responses`)
 * - onDelete / onCommentUpdated / onCommentDeleted : callbacks pour mise à jour/suppression
 * - level : niveau d'imbrication actuel (0 = racine)
 * - rootReplyAuthor : auteur mentionné pour les réponses profondes
 */
import CommentCard from "./CommentCard";

const CommentList = ({ comments = [], onDelete, onCommentUpdated, onCommentDeleted, level = 0, rootReplyAuthor = null }) => {
    const handleCallback = onCommentUpdated || onDelete;
    // Log de debug (peut être retiré en prod)
    // console.log('CommentList level', level, 'count', Array.isArray(comments) ? comments.length : 0);

    // Lors du rendu des réponses (level >= 1), on aplatit tous les descendants
    // dans une seule liste pour un affichage linéaire.
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