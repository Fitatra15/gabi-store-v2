import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import api from '../../lib/axios';
import { formatPrice } from '../../utils/format';
import { FiPackage, FiShoppingCart, FiDollarSign, FiAlertTriangle, FiGrid, FiTag, FiUsers, FiHome } from 'react-icons/fi';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} /></div>
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="font-heading text-xl font-bold">{value}</p>
          {sub && <p className="text-[10px] text-gray-400">{sub}</p>}
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(r => setStats(r.data));
  }, []);

  if (!stats) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="animate-fade-in">
      <h2 className="font-heading text-xl font-bold mb-6">Tableau de bord</h2>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={FiPackage} label="Produits" value={stats.stats.totalProducts} color="bg-blue-100 text-blue-600" />
        <StatCard icon={FiShoppingCart} label="Commandes aujourd'hui" value={stats.stats.ordersToday} color="bg-emerald-100 text-emerald-600" />
        <StatCard icon={FiDollarSign} label="Chiffre d'affaires" value={formatPrice(stats.stats.revenue)} color="bg-purple-100 text-purple-600" />
        <StatCard icon={FiAlertTriangle} label="Stock faible" value={stats.stats.lowStock} color="bg-amber-100 text-amber-600" />
      </div>

      {/* Recent orders */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-semibold">Dernières commandes</h3>
          <Link to="/admin/orders" className="text-sm text-emerald-600 font-semibold hover:underline">Voir tout</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr><th className="text-left px-5 py-3">N°</th><th className="text-left px-5 py-3">Client</th><th className="text-left px-5 py-3">Total</th><th className="text-left px-5 py-3">Statut</th></tr>
            </thead>
            <tbody>
              {stats.recentOrders?.map(o => (
                <tr key={o.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-5 py-3 font-medium">{o.order_number}</td>
                  <td className="px-5 py-3">{o.customer?.name || 'Client'}</td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${o.status === 'delivered' ? 'bg-green-100 text-green-700' : o.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
