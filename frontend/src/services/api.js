const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Redirects to login if the backend reports an expired token
const handleTokenExpired = (status) => {
  const isExpired = status === 401;
  if (!isExpired) return;
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  } catch {
    // ignore storage errors
  }
  if (typeof window !== 'undefined') {
    window.location.assign('/login');
  }
};

export async function request(path, options = {}){
  const url = `${API_BASE}${path}`;
  
  const token = localStorage.getItem('token');
  const headers = { ...options.headers };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  const res = await fetch(url, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!res.ok) {
      handleTokenExpired(res.status);
      throw json;
    }
    return json;
  }
  if (!res.ok) {
    handleTokenExpired(res.status);
    throw new Error('Network error');
  }
  return res.text();
}

export default { request, API_BASE };
