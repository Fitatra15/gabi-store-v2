import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiUser, FiMapPin, FiGrid, FiLogOut } from 'react-icons/fi';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

export default function Header() {
  const { user, token, logout, isAdmin } = useAuthStore();
  const { getCount } = useCartStore();
  const [search, setSearch] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  const count = getCount();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) navigate(`/catalog?q=${encodeURIComponent(search.trim())}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass animate-fade-in-down" style={{ borderBottom: '1px solid rgba(229,231,235,0.5)' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-6 h-16 flex items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 shrink-0 group">
          <span className="text-2xl group-hover:animate-float">🛒</span>
          <span className="font-heading text-xl font-bold hidden sm:block">
            Gabi<span className="gradient-text">-Store</span>
          </span>
        </Link>

        {/* Location */}
        <div className="hidden md:flex items-center gap-1 text-xs text-gray-500 bg-white/60 px-2.5 py-1.5 rounded-full border border-gray-100">
          <FiMapPin size={11} className="text-emerald-500" />
          <span>Antsiranana</span>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex-1 max-w-md mx-auto">
          <div className="relative group">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-emerald-500 transition-colors" size={15} />
            <input type="text" placeholder="Rechercher un produit..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white/70 border border-gray-200/60 rounded-2xl text-sm placeholder:text-gray-400 focus:bg-white focus:shadow-md transition-all duration-300" />
          </div>
        </form>

        {/* Cart */}
        <Link to="/cart" className="relative p-2.5 rounded-2xl hover:bg-emerald-50 transition-all duration-300 group">
          <FiShoppingCart size={20} className="text-gray-600 group-hover:text-emerald-600 transition-colors" />
          {count > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-scale-in shadow-lg">
              {count}
            </span>
          )}
        </Link>

        {/* User */}
        {token ? (
          <div className="relative">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center gap-2 p-1.5 rounded-2xl hover:bg-emerald-50 transition-all duration-300">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-md">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in origin-top-right">
                  <div className="px-4 py-2 border-b border-gray-50">
                    <p className="font-semibold text-sm">{user?.name}</p>
                    <p className="text-xs text-gray-400">{user?.email}</p>
                  </div>
                  <Link to="/orders" onClick={() => setShowMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"><FiShoppingCart size={14} /> Mes commandes</Link>
                  <Link to="/profile" onClick={() => setShowMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"><FiUser size={14} /> Mon profil</Link>
                  {(user?.role === 'admin' || user?.role === 'superadmin') && (
                    <Link to="/admin" onClick={() => setShowMenu(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-purple-600 hover:bg-purple-50 transition-colors"><FiGrid size={14} /> Administration</Link>
                  )}
                  <div className="border-t border-gray-50 mt-1">
                    <button onClick={() => { logout(); navigate('/'); setShowMenu(false); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"><FiLogOut size={14} /> Déconnexion</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn-primary !py-2 !px-4 !text-sm !rounded-2xl flex items-center gap-1.5">
            <FiUser size={14} /> <span className="hidden sm:inline">Connexion</span>
          </Link>
        )}
      </div>
    </header>
  );
}
