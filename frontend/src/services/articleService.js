import api from './api';

export async function fetchArticles(){
  return api.request('/articles');
}

export async function createArticle(payload){
  return api.request('/articles', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)});
}

export default { fetchArticles, createArticle };
