import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { formatPrice, STATUS_LABELS, STATUS_COLORS } from '../../utils/format';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    const params = filter ? `?status=${filter}` : '';
    api.get(`/orders${params}`).then(r => { setOrders(r.data.orders); setLoading(false); });
  };

  useEffect(fetchOrders, [filter]);

  const updateStatus = async (orderId, status) => {
    await api.put(`/orders/${orderId}/status`, { status });
    fetchOrders();
  };

  const statuses = ['', 'pending', 'confirmed', 'preparing', 'in_transit', 'delivered', 'cancelled'];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-xl font-bold">Gestion des commandes</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded-xl text-sm bg-white">
          <option value="">Tous les statuts</option>
          {statuses.slice(1).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">N° Commande</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Articles</th>
                <th className="text-left px-4 py-3">Total</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{o.order_number}</td>
                  <td className="px-4 py-3">{o.customer?.name}<br /><span className="text-xs text-gray-400">{o.customer?.phone || o.customer?.email}</span></td>
                  <td className="px-4 py-3">{o.items?.length} article(s)</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${STATUS_COLORS[o.status]}`}>{STATUS_LABELS[o.status]}</span></td>
                  <td className="px-4 py-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)} className="px-2 py-1 border rounded-lg text-xs bg-white">
                      {statuses.slice(1).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">Aucune commande</p>}
        </div>
      </div>
    </div>
  );
}
