import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import ProductCard from '../components/ui/ProductCard';
import { formatPrice } from '../utils/format';
import { FiArrowRight, FiTruck, FiShield, FiClock, FiStar } from 'react-icons/fi';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [products, setProducts] = useState([]);
  const [promos, setPromos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories));
    api.get('/products/featured').then(r => setFeatured(r.data.products?.slice(0, 8)));
    api.get('/products?limit=12&sort=newest').then(r => setProducts(r.data.products));
    api.get('/products?promo=true&limit=8').then(r => setPromos(r.data.products));
  }, []);

  return (
    <div className="page-enter">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden" style={{ background: 'var(--gradient-hero)' }}>
        {/* Blobs décoratifs animés */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-blob" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-900/20 rounded-full blur-3xl animate-blob" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '4s' }} />

        <div className="relative max-w-7xl mx-auto px-4 lg:px-6 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md text-white/90 text-xs font-medium px-4 py-2 rounded-full mb-6 animate-fade-in-down border border-white/20">
              <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse" />
              Livraison disponible à Antsiranana
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5 animate-fade-in-up">
              Tout ce dont<br />
              vous avez <span className="relative">
                besoin
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                  <path d="M2 8C40 2 80 2 100 6C120 10 160 10 198 4" stroke="rgba(252,211,77,0.6)" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="text-emerald-100 text-lg md:text-xl mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              Produits frais, mode locale et artisanat malgache.<br className="hidden md:block" />
              Livrés chez vous en 45 minutes. 🚀
            </p>
            <div className="flex flex-wrap gap-3 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <Link to="/catalog" className="btn-primary !py-3.5 !px-8 !text-base flex items-center gap-2 !rounded-2xl !shadow-xl">
                Explorer le catalogue <FiArrowRight />
              </Link>
              <Link to="/catalog?featured=true" className="btn-secondary !bg-white/15 !text-white !border-white/20 !py-3.5 !px-6 !rounded-2xl backdrop-blur-sm hover:!bg-white/25">
                ⭐ Produits vedettes
              </Link>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" className="w-full">
            <path d="M0 40C240 80 480 80 720 40C960 0 1200 0 1440 40V100H0Z" fill="#FAFAFA" />
          </svg>
        </div>
      </section>

      {/* ═══ FEATURES BAR ═══ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 -mt-4 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 stagger-children">
          {[
            { icon: FiTruck, text: 'Livraison 45 min', sub: 'Antsiranana' },
            { icon: FiShield, text: 'Paiement sécurisé', sub: 'Mobile Money' },
            { icon: FiClock, text: 'Ouvert 7j/7', sub: '8h — 20h' },
            { icon: FiStar, text: 'Qualité garantie', sub: 'Produits frais' },
          ].map(({ icon: Icon, text, sub }, i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 flex items-center gap-3 card-hover animate-fade-in-up">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center shrink-0">
                <Icon size={18} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{text}</p>
                <p className="text-[11px] text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 mt-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold animate-fade-in-left">Catégories</h2>
          <Link to="/catalog" className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">Voir tout <FiArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 stagger-children">
          {categories.map((c, i) => (
            <Link key={c.id} to={`/catalog?category=${c.slug}`}
              className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-gray-100/80 card-hover group animate-fade-in-up cursor-pointer">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
                {c.icon}
              </div>
              <span className="text-[11px] font-semibold text-gray-600 text-center leading-tight">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ PROMOS ═══ */}
      {promos.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-6 mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold">
              🔥 <span className="gradient-text">Promotions</span>
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">
            {promos.map((p, i) => (
              <Link key={p.id} to={`/product/${p.id}`}
                className="min-w-[260px] md:min-w-[300px] bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-amber-100 card-hover snap-start animate-fade-in-up"
                style={{ animationDelay: `${i * 80}ms` }}>
                <div className="flex items-center gap-3">
                  <img src={p.images?.[0]?.url} alt={p.name} className="w-20 h-20 rounded-xl object-cover shadow-sm" />
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full mb-1">-{p.discount_pct}%</span>
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">{p.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-400 line-through">{formatPrice(p.price)}</span>
                      <span className="text-sm font-bold text-emerald-600">{formatPrice(Math.round(p.price * (1 - p.discount_pct / 100)))}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ FEATURED ═══ */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 lg:px-6 mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-heading text-2xl font-bold animate-fade-in-left">⭐ Produits vedettes</h2>
            <Link to="/catalog?featured=true" className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">Voir tout <FiArrowRight size={14} /></Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
            {featured.slice(0, 8).map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* ═══ ALL PRODUCTS ═══ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 mt-12 mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-heading text-2xl font-bold animate-fade-in-left">🆕 Nouveautés</h2>
          <Link to="/catalog?sort=newest" className="text-sm text-emerald-600 font-semibold flex items-center gap-1 hover:gap-2 transition-all">Tout voir <FiArrowRight size={14} /></Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      {/* ═══ CTA BANNER ═══ */}
      <section className="max-w-7xl mx-auto px-4 lg:px-6 mb-12">
        <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: 'var(--gradient-dark)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl animate-blob" style={{ animationDelay: '3s' }} />
          <div className="relative z-10 text-center max-w-md mx-auto">
            <h3 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">Prêt à commander ?</h3>
            <p className="text-gray-400 mb-6 text-sm">Livraison rapide partout à Antsiranana. Paiement par Mobile Money ou en espèces.</p>
            <Link to="/catalog" className="btn-primary !py-3.5 !px-8 !text-base inline-flex items-center gap-2 !rounded-2xl">
              Commencer mes achats <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
