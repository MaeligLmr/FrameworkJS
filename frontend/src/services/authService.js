import api from './api';

export async function login(credentials){
  return api.request('/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(credentials)
  });
}

export async function signup(payload){
  return api.request('/auth/signup', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
}

export async function logout(){
  return api.request('/auth/logout', {
    method: 'POST',
  });
}

export default { login, signup, logout };