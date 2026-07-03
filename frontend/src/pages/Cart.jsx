import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import { formatPrice } from '../utils/format';
import { FiMinus, FiPlus, FiTrash2, FiArrowRight } from 'react-icons/fi';

export default function Cart() {
  const { items, updateQuantity, removeItem, clearCart, getSubtotal, getDeliveryFee, getTotal, getItemPrice } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 page-enter">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 flex items-center justify-center text-5xl mb-6 animate-float">🛒</div>
        <h2 className="font-heading text-2xl font-bold text-gray-800 mb-2">Votre panier est vide</h2>
        <p className="text-gray-400 text-sm mb-6">Explorez nos produits et ajoutez vos favoris</p>
        <Link to="/catalog" className="btn-primary !rounded-2xl flex items-center gap-2">Explorer le catalogue <FiArrowRight size={16} /></Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading text-2xl font-bold animate-fade-in-left">Mon panier <span className="text-emerald-500">({items.length})</span></h1>
        <button onClick={clearCart} className="text-xs text-red-500 hover:text-red-600 font-semibold transition-colors">Vider le panier</button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2 space-y-3 stagger-children">
          {items.map((item) => (
            <div key={item.key} className="bg-white rounded-2xl border border-gray-100/80 p-4 flex gap-4 card-hover animate-fade-in-up">
              <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover shrink-0 shadow-sm" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-gray-800 truncate">{item.name}</h3>
                {item.weightLabel && <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">{item.weightLabel}</span>}
                <p className="text-xs text-gray-400 mt-0.5">{item.vendor}</p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 bg-gray-50 rounded-xl">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-l-xl hover:bg-gray-100 transition text-gray-500 active:scale-90"><FiMinus size={14} /></button>
                    <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="w-8 h-8 flex items-center justify-center rounded-r-xl hover:bg-gray-100 transition text-gray-500 active:scale-90"><FiPlus size={14} /></button>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-gray-900">{formatPrice(getItemPrice(item) * item.quantity)}</p>
                    <p className="text-[10px] text-gray-400">{formatPrice(getItemPrice(item))}/unité</p>
                  </div>
                </div>
              </div>
              <button onClick={() => removeItem(item.key)}
                className="self-start p-2 text-gray-300 hover:text-red-500 transition-colors active:scale-90"><FiTrash2 size={16} /></button>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="md:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100/80 p-5 shadow-sm sticky top-20 animate-fade-in-right">
            <h3 className="font-heading font-bold text-lg mb-4">Résumé</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-gray-500"><span>Sous-total</span><span className="font-semibold text-gray-700">{formatPrice(getSubtotal())}</span></div>
              <div className="flex justify-between text-gray-500"><span>🚚 Livraison</span><span className="font-semibold text-gray-700">{formatPrice(getDeliveryFee())}</span></div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
                <span className="font-heading font-bold text-lg">Total</span>
                <span className="font-heading font-bold text-xl gradient-text">{formatPrice(getTotal())}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-primary w-full mt-5 !py-3.5 flex items-center justify-center gap-2 !rounded-2xl !text-base">
              Commander <FiArrowRight size={16} />
            </Link>
            <Link to="/catalog" className="block text-center text-sm text-emerald-600 font-semibold mt-3 hover:underline">← Continuer mes achats</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
