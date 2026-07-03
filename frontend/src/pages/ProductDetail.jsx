import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/axios';
import { formatPrice, getDiscountedPrice, formatDate } from '../utils/format';
import useCartStore from '../store/cartStore';
import ProductCard from '../components/ui/ProductCard';
import { FiShoppingCart, FiStar, FiMinus, FiPlus, FiChevronRight } from 'react-icons/fi';

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [selectedImg, setSelectedImg] = useState(0);
  const addItem = useCartStore(s => s.addItem);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    api.get(`/products/${id}`).then(r => {
      setProduct(r.data.product);
      setRelated(r.data.related || []);
      setSelectedImg(0); setQty(1); setSelectedWeight(null); setAdded(false);
      if (r.data.product.weight_options?.length > 0) setSelectedWeight(r.data.product.weight_options.find(w => w.price_multiplier == 1) || r.data.product.weight_options[0]);
    });
    window.scrollTo(0, 0);
  }, [id]);

  if (!product) return <div className="flex items-center justify-center h-96"><div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const hasDiscount = product.discount_pct > 0;
  const basePrice = selectedWeight ? Math.round(Number(product.price) * Number(selectedWeight.price_multiplier)) : Number(product.price);
  const finalPrice = getDiscountedPrice(basePrice, product.discount_pct);
  const images = product.images || [];

  const handleAdd = () => {
    addItem(product, qty, selectedWeight);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-6 animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-gray-500 mb-6">
        <Link to="/" className="hover:text-emerald-600">Accueil</Link>
        <FiChevronRight size={12} />
        <Link to={`/catalog?category=${product.category?.slug}`} className="hover:text-emerald-600">{product.category?.name}</Link>
        <FiChevronRight size={12} />
        <span className="text-gray-900 font-medium truncate max-w-48">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* Gallery */}
        <div className="space-y-3">
          <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden">
            <img src={images[selectedImg]?.url || ''} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition shrink-0 ${i === selectedImg ? 'border-emerald-500' : 'border-transparent opacity-60 hover:opacity-100'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <p className="text-xs uppercase tracking-wider text-emerald-600 font-semibold mb-1">{product.category?.name}</p>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">par <span className="font-medium text-gray-700">{product.vendor}</span></p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 text-amber-500">
              {[...Array(5)].map((_, i) => <FiStar key={i} size={16} fill={i < Math.round(product.avg_rating) ? 'currentColor' : 'none'} />)}
            </div>
            <span className="text-sm font-semibold">{Number(product.avg_rating).toFixed(1)}</span>
            <span className="text-sm text-gray-400">({product.reviews_count} avis)</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-heading text-3xl font-bold text-emerald-600">{formatPrice(finalPrice)}</span>
            {hasDiscount && <span className="text-lg text-gray-400 line-through">{formatPrice(basePrice)}</span>}
            {hasDiscount && <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs font-bold">-{product.discount_pct}%</span>}
          </div>

          {/* Weight selector */}
          {product.weight_options?.length > 0 && (
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Poids</p>
              <div className="flex flex-wrap gap-2">
                {product.weight_options.map(w => (
                  <button key={w.id} onClick={() => setSelectedWeight(w)}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 transition ${selectedWeight?.id === w.id ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300'}`}>
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {product.tags.map(tag => (
                <span key={tag} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-semibold capitalize">{tag}</span>
              ))}
            </div>
          )}

          {/* Stock */}
          <p className={`text-sm font-semibold ${product.stock > 10 ? 'text-emerald-600' : product.stock > 0 ? 'text-amber-600' : 'text-red-600'}`}>
            {product.stock > 10 ? '✅ En stock' : product.stock > 0 ? `⚠️ Plus que ${product.stock} en stock` : '❌ Rupture de stock'}
          </p>

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-4">
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition"><FiMinus size={14} /></button>
              <span className="w-12 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition"><FiPlus size={14} /></button>
            </div>
            <button onClick={handleAdd} disabled={product.stock === 0}
              className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition text-white ${added ? 'bg-green-500' : 'bg-emerald-500 hover:bg-emerald-600'} disabled:bg-gray-300`}>
              <FiShoppingCart size={18} /> {added ? '✓ Ajouté !' : 'Ajouter au panier'}
            </button>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-gray-100">
            <h3 className="font-semibold mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        </div>
      </div>

      {/* Reviews */}
      {product.reviews?.length > 0 && (
        <section className="mt-14">
          <h2 className="font-heading text-xl font-bold mb-6">Avis clients ({product.reviews.length})</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {product.reviews.map(r => (
              <div key={r.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">{r.author?.name?.charAt(0)}</div>
                  <div>
                    <p className="text-sm font-semibold">{r.author?.name}</p>
                    <p className="text-[11px] text-gray-400">{formatDate(r.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 text-amber-500 mb-2">{[...Array(5)].map((_, i) => <FiStar key={i} size={12} fill={i < r.rating ? 'currentColor' : 'none'} />)}</div>
                <p className="text-sm text-gray-600">{r.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-14">
          <h2 className="font-heading text-xl font-bold mb-6">Produits similaires</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {related.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
