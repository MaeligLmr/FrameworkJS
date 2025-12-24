/**
 * Service des articles (frontend)
 * Fournit des fonctions pour lister, créer, mettre à jour, publier/dépublier
 * et supprimer des articles. Gère aussi les paramètres de recherche/pagination.
 */
import api from './api';

/** Liste les articles avec filtres et pagination */
export async function fetchArticles(params = {}){
  const { search, author, category, page, limit, sort, showDrafts } = params;
  const queryParams = new URLSearchParams();
  
  if (search) queryParams.append('search', search);
  if (author) queryParams.append('author', author);
  if (category) queryParams.append('category', category);
  if (page) queryParams.append('page', page);
  if (limit) queryParams.append('limit', limit);
  if (sort) queryParams.append('sort', sort);
  if (showDrafts) queryParams.append('showDrafts', showDrafts);

  const queryString = queryParams.toString();
  return api.request(`/articles${queryString ? `?${queryString}` : ''}`);
}

/** Récupère un article par son ID */
export async function fetchArticle(id){
  return api.request(`/articles/${id}`);
}

/** Récupère les articles de l'utilisateur connecté (inclut brouillons) */
export async function fetchMyArticles(){
  const queryParams = new URLSearchParams();
  queryParams.append('author', 'me');
  queryParams.append('showDrafts', 'true');
  const body = queryParams.toString();
  return api.request(`/articles?${body}`);
}

/** Crée un article (utilise FormData pour gérer l'image) */
export async function createArticle(payload){
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.request('/articles', {method:'POST', body: formData});
}

/** Met à jour un article (FormData pour l'image optionnelle) */
export async function updateArticle(id, payload){
  const formData = new FormData();
  Object.entries(payload || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  });
  return api.request(`/articles/${id}`, {method:'PUT', body: formData});
}

/** Publie un article (PATCH) */
export async function publishArticle(id){
  return api.request(`/articles/${id}/publish`, {method:'PATCH'});
}

/** Dépublie un article (PATCH) */
export async function unpublishArticle(id){
  return api.request(`/articles/${id}/unpublish`, {method:'PATCH'});
}

/** Supprime un article (DELETE) */
export async function deleteArticle(id){
  return api.request(`/articles/${id}`, {method:'DELETE'});
}

/** Statistiques: nombre d'articles par auteur */
export async function getCountArticlesByAuthor(authorId) {
  return api.request(`/articles/author/count/${authorId}`);
}

/** Statistiques: vues cumulées par auteur */
export async function getViewsByAuthor(authorId) {
  return api.request(`/articles/author/views/${authorId}`);
}

export default { fetchArticles, createArticle, fetchArticle, updateArticle, publishArticle, unpublishArticle, deleteArticle, getCountArticlesByAuthor, getViewsByAuthor, fetchMyArticles };
