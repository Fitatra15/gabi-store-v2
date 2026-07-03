import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/axios';
import { formatPrice, formatDateShort, STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS } from '../utils/format';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders').then(r => { setOrders(r.data.orders); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  if (orders.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-6 py-24 text-center animate-fade-in">
        <p className="text-6xl mb-4">📦</p>
        <h1 className="font-heading text-2xl font-bold mb-2">Aucune commande</h1>
        <p className="text-gray-500 mb-6">Passez votre première commande dès maintenant !</p>
        <Link to="/catalog" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition">
          <FiPackage size={18} /> Explorer le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 animate-fade-in">
      <h1 className="font-heading text-2xl font-bold mb-6">Mes commandes ({orders.length})</h1>
      <div className="space-y-3">
        {orders.map(order => (
          <Link key={order.id} to={`/tracking/${order.id}`}
            className="block bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md hover:border-emerald-200 transition">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-heading font-bold text-sm">{order.order_number}</p>
                <p className="text-xs text-gray-400">{formatDateShort(order.created_at)}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
                <FiChevronRight className="text-gray-300" size={16} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {order.items?.slice(0, 3).map((item, i) => (
                  <img key={i} src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover border-2 border-white" />
                ))}
                {order.items?.length > 3 && <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold border-2 border-white">+{order.items.length - 3}</div>}
              </div>
              <div className="flex-1" />
              <div className="text-right">
                <p className="text-xs text-gray-500">{PAYMENT_LABELS[order.payment_method]}</p>
                <p className="font-heading font-bold text-emerald-600">{formatPrice(order.total)}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
