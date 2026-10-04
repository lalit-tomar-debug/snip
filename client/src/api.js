const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

async function request(path, options) {
  const res = await fetch(`${API}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

export const shorten = (url) => request('/shorten', { method: 'POST', body: JSON.stringify({ url }) });
export const getLinks = () => request('/links');
export const getAnalytics = (code) => request(`/analytics/${code}`);
export const deleteLink = (code) => request(`/links/${code}`, { method: 'DELETE' });
