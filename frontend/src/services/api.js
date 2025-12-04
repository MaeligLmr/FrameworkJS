const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export async function request(path, options = {}){
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, options);
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    const json = await res.json();
    if (!res.ok) throw json;
    return json;
  }
  if (!res.ok) throw new Error('Network error');
  return res.text();
}

export default { request, API_BASE };
