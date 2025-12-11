import api from './api';

export async function fetchArticles(){
  return api.request('/articles');
}

export async function fetchArticle(id){
  return api.request(`/articles/${id}`);
}

export async function createArticle(payload){
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.request('/articles', {method:'POST', body: formData});
}

export async function updateArticle(id, payload){
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.request(`/articles/${id}`, {method:'PUT', body: formData});
}

export async function deleteArticle(id){
  return api.request(`/articles/${id}`, {method:'DELETE'});
}

export default { fetchArticles, createArticle, fetchArticle, updateArticle, deleteArticle };
