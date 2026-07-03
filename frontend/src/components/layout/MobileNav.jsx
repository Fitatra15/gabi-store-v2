import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiShoppingCart, FiPackage, FiUser } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';
import useAuthStore from '../../store/authStore';

export default function MobileNav() {
  const location = useLocation();
  const { getCount } = useCartStore();
  const { token } = useAuthStore();
  const count = getCount();

  const items = [
    { to: '/', icon: FiHome, label: 'Accueil' },
    { to: '/catalog', icon: FiSearch, label: 'Explorer' },
    { to: '/cart', icon: FiShoppingCart, label: 'Panier', badge: count },
    { to: '/orders', icon: FiPackage, label: 'Commandes', auth: true },
    { to: token ? '/profile' : '/login', icon: FiUser, label: token ? 'Profil' : 'Connexion' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden glass" style={{ borderTop: '1px solid rgba(229,231,235,0.5)' }}>
      <div className="flex items-center justify-around h-16 px-2">
        {items.map(({ to, icon: Icon, label, badge, auth }) => {
          if (auth && !token) return null;
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} className={`relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${active ? 'text-emerald-600' : 'text-gray-400'}`}>
              <div className={`relative transition-transform duration-300 ${active ? 'scale-110 -translate-y-0.5' : ''}`}>
                <Icon size={20} />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-gradient-to-br from-emerald-400 to-emerald-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-md animate-scale-in">
                    {badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors ${active ? 'text-emerald-600' : 'text-gray-400'}`}>{label}</span>
              {active && <div className="absolute -bottom-1.5 w-5 h-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
