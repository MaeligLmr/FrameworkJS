import api from './api';

export async function fetchComments(articleId){
  return api.request(`/articles/${articleId}/comments`);
}

export async function postComment(articleId, payload){
  return api.request(`/articles/${articleId}/comments`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
}

export default { fetchComments, postComment };
