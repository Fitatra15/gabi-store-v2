import { create } from 'zustand';
import api from '../lib/axios';

const useAuthStore = create((set, get) => ({
  user: JSON.parse(localStorage.getItem('gabi_user') || 'null'),
  token: localStorage.getItem('gabi_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('gabi_token', res.data.accessToken);
      localStorage.setItem('gabi_refresh', res.data.refreshToken);
      localStorage.setItem('gabi_user', JSON.stringify(res.data.user));
      set({ user: res.data.user, token: res.data.accessToken, isLoading: false });
      return res.data.user;
    } catch (err) {
      const msg = err.response?.data?.error || 'Erreur de connexion';
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  register: async (name, email, phone, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, phone, password });
      // Don't store token yet — account is unverified
      // Store temporarily for auto-login after verification
      set({ isLoading: false, error: null });
      return {
        user: res.data.user,
        verificationRequired: res.data.verificationRequired,
        _devVerificationCode: res.data._devVerificationCode,
      };
    } catch (err) {
      const msg = err.response?.data?.error || "Erreur d'inscription";
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: () => {
    const refresh = localStorage.getItem('gabi_refresh');
    if (refresh) api.post('/auth/logout', { refreshToken: refresh }).catch(() => {});
    localStorage.removeItem('gabi_token');
    localStorage.removeItem('gabi_refresh');
    localStorage.removeItem('gabi_user');
    set({ user: null, token: null });
  },

  isLoggedIn: () => !!get().token,
  isAdmin: () => get().user?.role === 'admin' || get().user?.role === 'superadmin',
  clearError: () => set({ error: null }),
}));

export default useAuthStore;
