import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import { FiUser, FiMail, FiPhone, FiLogOut, FiShield } from 'react-icons/fi';

export default function Profile() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  if (!user) { navigate('/login'); return null; }

  return (
    <div className="max-w-lg mx-auto px-4 py-8 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold mb-6">Mon profil</h1>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center font-heading text-2xl font-bold">{user.name?.charAt(0).toUpperCase()}</div>
          <div>
            <h2 className="font-heading text-lg font-bold">{user.name}</h2>
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-700 text-[11px] font-semibold rounded-full capitalize">{user.role}</span>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><FiMail className="text-gray-400" size={16} /><div><p className="text-[10px] text-gray-400">Email</p><p className="text-sm font-medium">{user.email}</p></div></div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><FiPhone className="text-gray-400" size={16} /><div><p className="text-[10px] text-gray-400">Téléphone</p><p className="text-sm font-medium">{user.phone || 'Non renseigné'}</p></div></div>
          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"><FiShield className="text-gray-400" size={16} /><div><p className="text-[10px] text-gray-400">Rôle</p><p className="text-sm font-medium capitalize">{user.role}</p></div></div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }} className="w-full mt-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-red-100 transition">
          <FiLogOut size={16} /> Déconnexion
        </button>
      </div>
    </div>
  );
}
