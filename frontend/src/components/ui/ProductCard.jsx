import { Link } from 'react-router-dom';
import { FiShoppingCart, FiStar, FiPlus } from 'react-icons/fi';
import useCartStore from '../../store/cartStore';
import { formatPrice } from '../../utils/format';

export default function ProductCard({ product }) {
  const { addItem } = useCartStore();
  const p = product;
  const hasDiscount = p.discount_pct > 0;
  const finalPrice = hasDiscount ? Math.round(p.price * (1 - p.discount_pct / 100)) : p.price;
  const imageUrl = p.images?.[0]?.url;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({ id: p.id, name: p.name, price: p.price, discountPct: p.discount_pct || 0, image: imageUrl, vendor: p.vendor, unit: p.unit, weightMultiplier: 1 });
  };

  return (
    <Link to={`/product/${p.id}`} className="group animate-fade-in-up">
      <div className="bg-white rounded-2xl border border-gray-100/80 overflow-hidden card-hover card-shine">
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-gray-50">
          <img src={imageUrl} alt={p.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />

          {/* Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-red-500 to-orange-500 text-white text-[10px] font-bold rounded-full shadow-lg animate-pulse-glow">
                -{p.discount_pct}%
              </span>
            )}
            {p.is_featured && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-[10px] font-bold rounded-full shadow-md">
                ⭐ Vedette
              </span>
            )}
          </div>

          {/* Quick Add */}
          <button onClick={handleAdd}
            className="absolute bottom-2.5 right-2.5 w-10 h-10 bg-white/90 backdrop-blur-sm text-emerald-600 rounded-xl flex items-center justify-center shadow-lg opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 hover:bg-emerald-500 hover:text-white active:scale-90">
            <FiPlus size={18} />
          </button>

          {/* Stock warning */}
          {p.stock > 0 && p.stock <= 5 && (
            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 bg-orange-500/90 text-white text-[9px] font-bold rounded-full backdrop-blur-sm">
              Plus que {p.stock} !
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3.5">
          {p.vendor && <p className="text-[10px] text-emerald-600 font-semibold mb-0.5 tracking-wide uppercase">{p.vendor}</p>}
          <h3 className="font-semibold text-sm text-gray-800 line-clamp-2 leading-snug mb-2 group-hover:text-emerald-700 transition-colors">{p.name}</h3>

          {/* Rating */}
          {p.avg_rating > 0 && (
            <div className="flex items-center gap-1 mb-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} size={10} className={i < Math.round(p.avg_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="text-[10px] text-gray-400">({p.reviews_count})</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-base font-bold text-gray-900">{formatPrice(finalPrice)}</span>
              {hasDiscount && <span className="text-[11px] text-gray-400 line-through">{formatPrice(p.price)}</span>}
            </div>
            {p.unit && <span className="text-[10px] text-gray-400">/{p.unit}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
