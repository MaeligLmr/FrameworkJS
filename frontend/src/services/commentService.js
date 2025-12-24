/**
 * Service des commentaires (frontend)
 * Fournit des fonctions pour lister, créer, modifier et supprimer des commentaires
 * d'un article. Utilise le routeur imbriqué `/articles/:articleId/comments` côté backend.
 */
import api from './api';

/** Liste les commentaires d'un article (structure imbriquée) */
export async function fetchComments(articleId){
  return api.request(`/articles/${articleId}/comments`);
}

/** Crée un commentaire pour un article (payload JSON) */
export async function postComment(articleId, payload){
  return api.request(`/articles/${articleId}/comments`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
}

/** Met à jour un commentaire existant */
export async function updateComment(articleId, commentId, payload){
  return api.request(`/articles/${articleId}/comments/${commentId}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
}

/** Supprime un commentaire */
export async function deleteComment(articleId, commentId){
  return api.request(`/articles/${articleId}/comments/${commentId}`, {method:'DELETE'});
}

/** Compte le nombre de commentaires d'un auteur */
export async function getCountCommentsByAuthor(authorId) {
  return api.request(`/articles/:articleId/comments/author/count/${authorId}`);
}

export default { fetchComments, postComment, updateComment, deleteComment, getCountCommentsByAuthor };
