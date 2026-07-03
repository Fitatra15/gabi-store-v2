import { Link } from 'react-router-dom';
import { FiMapPin, FiMail, FiPhone, FiHeart } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="hidden md:block bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-12">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🛒</span>
              <span className="font-heading text-xl font-bold text-white">Gabi<span className="text-emerald-400">-Store</span></span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">Votre marketplace multi-catégories à Antsiranana. Produits frais, mode locale et livraison rapide.</p>
            <div className="flex items-center gap-2 text-xs">
              <FiMapPin size={12} className="text-emerald-400" />
              <span>Antsiranana, Madagascar</span>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">Navigation</h4>
            <div className="space-y-2.5">
              {[{ to: '/', label: 'Accueil' }, { to: '/catalog', label: 'Catalogue' }, { to: '/orders', label: 'Mes commandes' }, { to: '/profile', label: 'Mon profil' }].map(l => (
                <Link key={l.to} to={l.to} className="block text-sm hover:text-emerald-400 transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">Catégories</h4>
            <div className="space-y-2.5">
              {['Fruits & Légumes', 'Viandes & Poissons', 'Épicerie', 'Boissons', 'Mode & Vêtements'].map(c => (
                <Link key={c} to="/catalog" className="block text-sm hover:text-emerald-400 transition-colors">{c}</Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading font-semibold text-white text-sm mb-4">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm"><FiPhone size={12} className="text-emerald-400" /> +261 32 XX XXX XX</div>
              <div className="flex items-center gap-2 text-sm"><FiMail size={12} className="text-emerald-400" /> contact@gabi-store.com</div>
            </div>
            <div className="mt-4 p-3 bg-gray-800 rounded-xl">
              <p className="text-xs font-semibold text-white mb-1">💳 Modes de paiement</p>
              <p className="text-[11px]">Mvola • Airtel Money • Orange Money • Cash</p>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-xs">© {new Date().getFullYear()} Gabi-Store. Tous droits réservés.</p>
          <p className="text-xs flex items-center gap-1">Fait avec <FiHeart size={10} className="text-red-400" /> à Antsiranana</p>
        </div>
      </div>
    </footer>
  );
}
