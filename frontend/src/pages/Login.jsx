import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { FiMail, FiLock, FiUser, FiPhone, FiCheckCircle } from 'react-icons/fi';
import api from '../lib/axios';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const { login, register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const [localError, setLocalError] = useState('');

  // Email verification state
  const [showVerify, setShowVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault(); setLocalError(''); clearError();
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      // Check if verification required
      if (err.message.includes('vérifier votre email')) {
        setVerifyEmail(form.email);
        setShowVerify(true);
      }
      setLocalError(err.message);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault(); setLocalError(''); clearError();
    if (form.password !== form.confirm) { setLocalError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setLocalError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    try {
      const result = await register(form.name, form.email, form.phone, form.password);
      // After registration, show verification form
      setVerifyEmail(form.email);
      setShowVerify(true);
      setLocalError('');
    } catch (err) {
      setLocalError(err.message);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault(); setLocalError('');
    setVerifyLoading(true);
    try {
      await api.post('/auth/verify-email', { email: verifyEmail, code: verifyCode });
      setVerifySuccess(true);
      setVerifyLoading(false);
      // Auto login after 2s
      setTimeout(async () => {
        try {
          await login(verifyEmail, form.password);
          navigate('/');
        } catch { setShowVerify(false); setTab('login'); }
      }, 2000);
    } catch (err) {
      setLocalError(err.response?.data?.error || 'Code invalide');
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    setLocalError('');
    try {
      const res = await api.post('/auth/resend-verification', { email: verifyEmail });
      setLocalError('');
      alert('Nouveau code envoyé à votre email !');
    } catch (err) {
      setLocalError(err.response?.data?.error || 'Erreur');
    }
  };

  const set = (k, v) => setForm({ ...form, [k]: v });
  const err = localError || error;

  // Email verification screen
  if (showVerify) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold">✉️ Vérification Email</h1>
            <p className="text-gray-500 text-sm mt-2">Un code à 6 chiffres a été envoyé à</p>
            <p className="font-semibold text-emerald-600">{verifyEmail}</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            {verifySuccess ? (
              <div className="text-center py-6">
                <FiCheckCircle className="mx-auto text-emerald-500 mb-3" size={48} />
                <h3 className="font-heading text-xl font-bold text-emerald-600 mb-1">Email vérifié !</h3>
                <p className="text-sm text-gray-500">Connexion en cours...</p>
              </div>
            ) : (
              <>
                {err && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{err}</div>}

                <p className="text-sm text-gray-500 mb-4 text-center">Consultez votre boîte email (et les spams) pour trouver le code.</p>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Code de vérification</label>
                    <input type="text" inputMode="numeric" maxLength={6} placeholder="123456" value={verifyCode}
                      onChange={e => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-4 border border-gray-200 rounded-xl text-2xl text-center font-mono tracking-[0.5em] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
                  </div>
                  <button type="submit" disabled={verifyLoading || verifyCode.length < 6}
                    className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition disabled:bg-gray-300 flex items-center justify-center gap-2">
                    {verifyLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Vérifier'}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <button onClick={handleResend} className="text-sm text-emerald-600 font-semibold hover:underline">
                    Renvoyer le code
                  </button>
                </div>

                <div className="text-center mt-2">
                  <button onClick={() => { setShowVerify(false); setLocalError(''); }} className="text-xs text-gray-400 hover:text-gray-600">
                    ← Retour à la connexion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 animate-fade-in">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold">🛒 Gabi<span className="text-emerald-500">-Store</span></h1>
          <p className="text-gray-500 text-sm mt-1">Votre marketplace à Antsiranana</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button onClick={() => { setTab('login'); setLocalError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${tab === 'login' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>Connexion</button>
            <button onClick={() => { setTab('register'); setLocalError(''); }} className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${tab === 'register' ? 'bg-white shadow text-emerald-600' : 'text-gray-500'}`}>Inscription</button>
          </div>

          {err && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-xl">{err}</div>}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" placeholder="Mot de passe" value={form.password} onChange={e => set('password', e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition disabled:bg-gray-300 flex items-center justify-center gap-2">
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Se connecter'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="relative">
                <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="text" placeholder="Nom complet" value={form.name} onChange={e => set('name', e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div className="relative">
                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="tel" placeholder="Téléphone (ex: +261 32 123 45 67)" value={form.phone} onChange={e => set('phone', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="email" placeholder="Email" value={form.email} onChange={e => set('email', e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" placeholder="Mot de passe (min. 6 caractères)" value={form.password} onChange={e => set('password', e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <input type="password" placeholder="Confirmer le mot de passe" value={form.confirm} onChange={e => set('confirm', e.target.value)} required
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none" />
              </div>
              <button type="submit" disabled={isLoading}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition disabled:bg-gray-300 flex items-center justify-center gap-2">
                {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Créer mon compte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
