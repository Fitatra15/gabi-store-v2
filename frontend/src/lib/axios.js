import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Inject token on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gabi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const refreshToken = localStorage.getItem('gabi_refresh');
      if (refreshToken) {
        try {
          const res = await axios.post('/api/auth/refresh', { refreshToken });
          localStorage.setItem('gabi_token', res.data.accessToken);
          localStorage.setItem('gabi_refresh', res.data.refreshToken);
          original.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return api(original);
        } catch { localStorage.removeItem('gabi_token'); localStorage.removeItem('gabi_refresh'); window.location.hash = '/login'; }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
