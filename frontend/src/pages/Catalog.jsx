import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../lib/axios';
import ProductCard from '../components/ui/ProductCard';
import { FiFilter, FiX } from 'react-icons/fi';

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const q = searchParams.get('q') || '';
  const promo = searchParams.get('promo') || '';
  const featured = searchParams.get('featured') || '';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    api.get('/categories').then(r => setCategories(r.data.categories));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sort) params.set('sort', sort);
    if (q) params.set('search', q);
    if (promo) params.set('promo', promo);
    if (featured) params.set('featured', featured);
    params.set('page', page); params.set('limit', 20);
    api.get(`/products?${params.toString()}`).then(r => {
      setProducts(r.data.products); setPagination(r.data.pagination); setLoading(false);
    }).catch(() => setLoading(false));
  }, [category, sort, q, promo, featured, page]);

  const setFilter = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    if (key !== 'page') p.delete('page'); // reset page only when changing other filters
    setSearchParams(p);
  };

  const clearFilters = () => setSearchParams({});

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">{q ? `Recherche : "${q}"` : 'Catalogue'}</h1>
          <p className="text-sm text-gray-500 mt-1">{pagination.total || 0} produits trouvés</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={sort} onChange={e => setFilter('sort', e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none">
            <option value="">Pertinence</option>
            <option value="price_asc">Prix croissant</option>
            <option value="price_desc">Prix décroissant</option>
            <option value="rating">Mieux notés</option>
            <option value="newest">Nouveautés</option>
          </select>
          <button onClick={() => setShowFilters(!showFilters)} className="md:hidden p-2 border rounded-xl"><FiFilter size={18} /></button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar */}
        <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'} md:block md:relative md:inset-auto md:z-auto w-full md:w-56 shrink-0`}>
          <div className="flex justify-between items-center mb-4 md:hidden">
            <h3 className="font-bold text-lg">Filtres</h3>
            <button onClick={() => setShowFilters(false)}><FiX size={20} /></button>
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Catégories</h4>
            <button onClick={() => setFilter('category', '')} className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${!category ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50'}`}>Toutes</button>
            {categories.map(c => (
              <button key={c.id} onClick={() => { setFilter('category', c.slug); setShowFilters(false); }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${category === c.slug ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50'}`}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Filtres rapides</h4>
            <button onClick={() => setFilter('promo', promo ? '' : 'true')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${promo ? 'bg-amber-50 text-amber-700 font-semibold' : 'hover:bg-gray-50'}`}>🔥 En promotion</button>
            <button onClick={() => setFilter('featured', featured ? '' : 'true')}
              className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition ${featured ? 'bg-emerald-50 text-emerald-700 font-semibold' : 'hover:bg-gray-50'}`}>⭐ Vedettes</button>
          </div>

          {(category || sort || q || promo || featured) && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:underline">✕ Effacer les filtres</button>
          )}
        </aside>

        {/* Products */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
              {[...Array(6)].map((_, i) => <div key={i} className="aspect-square bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-5xl mb-4">🔍</p>
              <p className="font-semibold text-lg">Aucun produit trouvé</p>
              <p className="text-sm text-gray-500 mt-1">Essayez de modifier vos filtres</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-5">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              {pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(pagination.totalPages)].map((_, i) => (
                    <button key={i} onClick={() => setFilter('page', i + 1)}
                      className={`w-10 h-10 rounded-xl text-sm font-medium transition ${page === i + 1 ? 'bg-emerald-500 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{i + 1}</button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
