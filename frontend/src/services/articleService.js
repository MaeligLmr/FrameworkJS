import api from './api';

export async function fetchArticles(){
  return api.request('/articles');
}

export async function fetchArticle(id){
  return api.request(`/articles/${id}`);
}

export async function createArticle(payload){
  return api.request('/articles', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
}

export async function updateArticle(id, payload){
  return api.request(`/articles/${id}`, {method:'PUT', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
}

export async function deleteArticle(id){
  return api.request(`/articles/${id}`, {method:'DELETE'});
}

export default { fetchArticles, createArticle, fetchArticle, updateArticle, deleteArticle };
