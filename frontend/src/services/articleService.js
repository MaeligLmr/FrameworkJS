import api from './api';

export async function fetchArticles(params = {}){
  const { search, category, page, limit, sort } = params;
  const queryParams = new URLSearchParams();
  
  if (search) queryParams.append('search', search);
  if (category) queryParams.append('category', category);
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (sort) queryParams.append('sort', sort);
  
  const queryString = queryParams.toString();
  return api.request(`/articles${queryString ? `?${queryString}` : ''}`);
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

export async function getCountArticlesByAuthor(authorId) {
  return api.request(`/articles/author/count/${authorId}`);
}

export async function getViewsByAuthor(authorId) {
  return api.request(`/articles/author/views/${authorId}`);
}

export default { fetchArticles, createArticle, fetchArticle, updateArticle, deleteArticle, getCountArticlesByAuthor, getViewsByAuthor };
