import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/axios';
import { formatPrice, formatDate, STATUS_LABELS, STATUS_COLORS, PAYMENT_LABELS } from '../utils/format';
import { FiPhone, FiMapPin, FiCheck } from 'react-icons/fi';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });

const STEPS = ['pending', 'confirmed', 'preparing', 'in_transit', 'delivered'];
const STEP_LABELS = ['Reçue', 'Confirmée', 'Préparation', 'En route', 'Livrée'];
const STEP_ICONS = ['📋', '✅', '👨‍🍳', '🚚', '📦'];

export default function Tracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}`).then(r => setOrder(r.data.order));
  }, [id]);

  if (!order) return <div className="flex justify-center py-20"><div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" /></div>;

  const currentStep = STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading text-xl font-bold">{order.order_number}</h1>
          <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${STATUS_COLORS[order.status]}`}>{STATUS_LABELS[order.status]}</span>
      </div>

      {/* Progress */}
      {!isCancelled && (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between">
            {STEPS.map((step, i) => (
              <div key={step} className="flex flex-col items-center flex-1 relative">
                {i > 0 && <div className={`absolute top-4 -left-1/2 right-1/2 h-0.5 ${i <= currentStep ? 'bg-emerald-500' : 'bg-gray-200'}`} />}
                <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-sm ${i <= currentStep ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                  {i < currentStep ? <FiCheck size={14} /> : STEP_ICONS[i]}
                </div>
                <span className={`text-[10px] mt-1.5 text-center ${i <= currentStep ? 'text-emerald-600 font-semibold' : 'text-gray-400'}`}>{STEP_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 text-sm text-red-700">
          ❌ Commande annulée{order.cancel_reason ? ` : ${order.cancel_reason}` : ''}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Map */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-64">
            <MapContainer center={[order.delivery_lat || -12.2795, order.delivery_lng || 49.2913]} zoom={15} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
              <Marker position={[order.delivery_lat, order.delivery_lng]}>
                <Popup>📍 {order.delivery_label || 'Adresse de livraison'}</Popup>
              </Marker>
            </MapContainer>
          </div>
          <div className="p-4">
            <p className="text-sm font-semibold flex items-center gap-1.5"><FiMapPin className="text-emerald-500" size={14} /> {order.delivery_label || 'Adresse'}</p>
            {order.delivery_address && <p className="text-xs text-gray-500 mt-0.5">{order.delivery_address}</p>}
          </div>
        </div>

        {/* Driver + Payment */}
        <div className="space-y-4">
          {/* Driver card */}
          {order.driver && (
            <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">🚚 Votre livreur</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">{order.driver.avatar || '🏍️'}</div>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{order.driver.name}</p>
                  <p className="text-xs text-gray-500">{order.driver.vehicle}</p>
                </div>
                <a href={`tel:${order.driver.phone}`} className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center hover:bg-emerald-600 transition">
                  <FiPhone size={16} />
                </a>
              </div>
            </div>
          )}

          {/* Order items */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
               <h3 className="text-sm font-semibold text-gray-700 mb-3">📦 Articles commandés</h3>
            <div className="space-y-2.5">
              {order.items?.map(item => (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    {item.weight_label && <p className="text-[10px] text-emerald-600">{item.weight_label}</p>}
                  </div>
                  <span className="text-xs text-gray-500">×{item.quantity}</span>
                  <span className="text-xs font-semibold">{formatPrice(item.total_price)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-3 pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-gray-500"><span>Sous-total</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between text-gray-500"><span>🚚 Livraison</span><span>{formatPrice(order.delivery_fee)}</span></div>
              <div className="flex justify-between font-bold text-base pt-1 border-t border-gray-50"><span>Total</span><span className="text-emerald-600">{formatPrice(order.total)}</span></div>
            </div>
          </div>

          {/* Payment */}
          <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm text-sm">
            <p className="text-gray-500">Paiement : <span className="font-semibold text-gray-700">{PAYMENT_LABELS[order.payment_method]}</span></p>
            <p className="text-gray-500 mt-1">Téléphone : <span className="font-semibold text-gray-700">{order.customer_phone}</span></p>
          </div>
        </div>
      </div>

      {/* Status History */}
      {order.status_history?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">📋 Historique</h3>
          <div className="space-y-3">
            {order.status_history.map((h, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{h.note || STATUS_LABELS[h.status]}</p>
                  <p className="text-[11px] text-gray-400">{formatDate(h.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/orders" className="text-sm text-emerald-600 font-semibold hover:underline">← Retour à mes commandes</Link>
      </div>
    </div>
  );
}
