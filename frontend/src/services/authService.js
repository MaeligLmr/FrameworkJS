import api from './api';

export async function login(credentials){
  const res = await api.request('/auth/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(credentials)
  });
  // store token in localStorage if present
  const token = res?.token;
  const user  = res?.user;
  if (token) {
    try { localStorage.setItem('token', token); } catch { /* ignore */ }
  }
  if (user) {
    try { localStorage.setItem('user', JSON.stringify(user)); } catch { /* ignore */ }
  }
  return res;
}

export async function signup(payload){
  const res = await api.request('/auth/signup', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(payload)
  });
  const token = res?.token;
  const user  = res?.user;
  if (token) {
    try { localStorage.setItem('token', token); } catch { /* ignore */ }
  }
  if (user) {
    try { localStorage.setItem('user', JSON.stringify(user)); } catch { /* ignore */ }
  }
  return res;
}

export async function logout(){
  return api.request('/auth/logout', {
    method: 'POST',
  }).then(() => {
    try { localStorage.removeItem('token'); } catch { /* ignore */ }
    try { localStorage.removeItem('user'); } catch { /* ignore */ }
  });
}

export default { login, signup, logout };