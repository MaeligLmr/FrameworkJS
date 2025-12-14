import api from './api';

export async function fetchComments(articleId){
  return api.request(`/articles/${articleId}/comments`);
}

export async function postComment(articleId, payload){
  return api.request(`/articles/${articleId}/comments`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
}

export async function updateComment(articleId, commentId, payload){
  return api.request(`/articles/${articleId}/comments/${commentId}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
}

export async function deleteComment(articleId, commentId){
  return api.request(`/articles/${articleId}/comments/${commentId}`, {method:'DELETE'});
}

export async function getCountCommentsByAuthor(authorId) {
  return api.request(`/articles/:articleId/comments/author/count/${authorId}`);
}

export default { fetchComments, postComment, updateComment, deleteComment, getCountCommentsByAuthor };
