import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../lib/axios';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';
import { formatPrice } from '../utils/format';
import { FiMapPin, FiCheck, FiPhone } from 'react-icons/fi';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png', iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png' });

function LocationPicker({ position, setPosition }) {
  useMapEvents({ click(e) { setPosition([e.latlng.lat, e.latlng.lng]); } });
  return position ? <Marker position={position} /> : null;
}

/**
 * Generate USSD tel: link for mobile money payment
 * Orange Money: #144*11*0329118147*0329118147*MONTANT*1#
 * Mvola:        #111*1*2*0349339426*MONTANT*1*Gabi-Store#
 */
function getUssdLink(method, total) {
  const amount = Math.round(total);
  if (method === 'orange') {
    // Orange Money USSD
    const ussd = `#144*11*0329118147*0329118147*${amount}*1#`;
    return `tel:${encodeURIComponent(ussd)}`;
  }
  if (method === 'mvola') {
    // Mvola USSD
    const ussd = `#111*1*2*0349339426*${amount}*1*Gabi-Store#`;
    return `tel:${encodeURIComponent(ussd)}`;
  }
  return null;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, getDeliveryFee, getTotal, getItemPrice, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [position, setPosition] = useState(null);
  const [address, setAddress] = useState('');
  const [addressLabel, setAddressLabel] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [payment, setPayment] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);
  const [orderDone, setOrderDone] = useState(null); // Stores completed order for USSD

  useEffect(() => { if (!user) navigate('/login'); if (items.length === 0 && !orderDone) navigate('/cart'); }, []);

  const payments = [
    { id: 'mvola', label: 'Mvola', icon: '💚', color: 'border-green-500 bg-green-50', num: '0349339426' },
    { id: 'orange', label: 'Orange Money', icon: '🧡', color: 'border-orange-500 bg-orange-50', num: '0329118147' },
    { id: 'airtel', label: 'Airtel Money', icon: '❤️', color: 'border-red-500 bg-red-50' },
    { id: 'cash', label: 'Cash à la livraison', icon: '💵', color: 'border-emerald-500 bg-emerald-50' },
  ];

  const handleSubmit = async () => {
    if (!position) { setError('Veuillez marquer votre adresse sur la carte'); return; }
    if (!phone) { setError('Numéro de téléphone requis'); return; }
    setLoading(true); setError('');
    try {
      const orderItems = items.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        weight_id: item.weightId,
      }));
      const total = getTotal();
      const res = await api.post('/orders', {
        items: orderItems, payment_method: payment,
        delivery_label: addressLabel || 'Mon adresse',
        delivery_address: address, delivery_lat: position[0], delivery_lng: position[1],
        customer_phone: phone,
      });

      // If Orange Money or Mvola → show USSD screen before redirect
      if (payment === 'orange' || payment === 'mvola') {
        setOrderDone({ order: res.data.order, total, method: payment });
        clearCart();
        setLoading(false);
        // Auto-open USSD dialer
        const link = getUssdLink(payment, total);
        if (link) window.location.href = link;
      } else {
        clearCart();
        navigate(`/tracking/${res.data.order.id}`);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la commande');
      setLoading(false);
    }
  };

  // ═══ USSD Payment Screen (after order placed) ═══
  if (orderDone) {
    const { order, total, method } = orderDone;
    const ussdLink = getUssdLink(method, total);
    const methodInfo = payments.find(p => p.id === method);
    const ussdDisplay = method === 'orange'
      ? `#144*11*0329118147*0329118147*${Math.round(total)}*1#`
      : `#111*1*2*0349339426*${Math.round(total)}*1*Gabi-Store#`;

    return (
      <div className="max-w-lg mx-auto px-4 py-8 page-enter">
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4 animate-scale-in shadow-lg">✅</div>
          <h1 className="font-heading text-2xl font-bold mb-1">Commande enregistrée !</h1>
          <p className="text-gray-500 text-sm">N° {order.order_number}</p>
        </div>

        {/* USSD Payment Card */}
        <div className={`rounded-2xl border-2 p-6 mb-6 ${method === 'orange' ? 'border-orange-400 bg-orange-50' : 'border-green-400 bg-green-50'}`}>
          <div className="text-center mb-4">
            <span className="text-3xl">{methodInfo?.icon}</span>
            <h2 className="font-heading text-lg font-bold mt-2">Payer avec {methodInfo?.label}</h2>
            <p className="text-sm text-gray-600 mt-1">Montant : <strong className="text-lg">{formatPrice(total)}</strong></p>
          </div>

          {/* USSD Code display */}
          <div className="bg-white rounded-xl p-4 mb-4 border border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-2">Code USSD à composer :</p>
            <p className="text-center font-mono font-bold text-lg text-gray-900 break-all select-all">{ussdDisplay}</p>
          </div>

          {/* Auto dial button */}
          <a href={ussdLink} className={`block w-full py-4 text-white rounded-2xl font-bold text-center text-lg shadow-lg transition hover:opacity-90 active:scale-95 ${method === 'orange' ? 'bg-gradient-to-r from-orange-500 to-orange-600' : 'bg-gradient-to-r from-green-500 to-green-600'}`}>
            <FiPhone className="inline mr-2 -mt-0.5" size={20} />
            Lancer le paiement {methodInfo?.label}
          </a>

          <p className="text-xs text-gray-500 text-center mt-3">
            Cliquez sur le bouton ci-dessus pour ouvrir automatiquement le code USSD sur votre téléphone.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
          <h3 className="font-semibold text-sm mb-3">📋 Instructions :</h3>
          <ol className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold shrink-0">1</span> Cliquez "Lancer le paiement" ci-dessus</li>
            <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold shrink-0">2</span> Confirmez le paiement sur votre téléphone</li>
            <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold shrink-0">3</span> L'admin Gabi-Store vérifie et confirme votre paiement</li>
            <li className="flex gap-2"><span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-xs flex items-center justify-center font-bold shrink-0">4</span> Votre commande est préparée et livrée 🚚</li>
          </ol>
        </div>

        {/* Continue */}
        <button onClick={() => navigate(`/tracking/${order.id}`)}
          className="btn-primary w-full !py-3.5 !rounded-2xl !text-base flex items-center justify-center gap-2">
          Suivre ma commande →
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-6 py-6 page-enter">
      <h1 className="font-heading text-2xl font-bold mb-6">Finaliser la commande</h1>

      {/* Steps indicator */}
      <div className="flex items-center gap-2 mb-8">
        {['Adresse', 'Paiement', 'Confirmation'].map((s, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
              {step > i + 1 ? <FiCheck size={14} /> : i + 1}
            </div>
            <span className={`text-sm hidden sm:inline ${step === i + 1 ? 'font-semibold' : 'text-gray-400'}`}>{s}</span>
            {i < 2 && <div className="w-8 h-0.5 bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          {step >= 1 && (
            <div className={`bg-white rounded-xl border p-5 shadow-sm ${step === 1 ? 'border-emerald-300' : 'border-gray-100'}`}>
              <h3 className="font-semibold mb-3 flex items-center gap-2"><FiMapPin className="text-emerald-500" /> Adresse de livraison</h3>
              <div className="h-64 rounded-xl overflow-hidden mb-4 border border-gray-200">
                <MapContainer center={[-12.2795, 49.2913]} zoom={14} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OSM' />
                  <LocationPicker position={position} setPosition={setPosition} />
                </MapContainer>
              </div>
              <p className="text-xs text-gray-500 mb-3">Cliquez sur la carte pour marquer votre adresse</p>
              <input type="text" placeholder="Nom de l'adresse (ex: Maison, Bureau)" value={addressLabel} onChange={e => setAddressLabel(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm mb-2" />
              <input type="text" placeholder="Détails (bâtiment, étage, repère...)" value={address} onChange={e => setAddress(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              {step === 1 && <button onClick={() => { if (position) setStep(2); else setError('Marquez votre adresse sur la carte'); }} className="mt-4 w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition">Continuer</button>}
            </div>
          )}

          {/* Step 2: Payment */}
          {step >= 2 && (
            <div className={`bg-white rounded-xl border p-5 shadow-sm ${step === 2 ? 'border-emerald-300' : 'border-gray-100'}`}>
              <h3 className="font-semibold mb-3">💳 Mode de paiement</h3>
              <div className="grid grid-cols-2 gap-3 mb-4">
                {payments.map(p => (
                  <button key={p.id} onClick={() => setPayment(p.id)}
                    className={`p-3 rounded-xl border-2 text-left transition ${payment === p.id ? p.color : 'border-gray-200 hover:border-gray-300'}`}>
                    <span className="text-xl">{p.icon}</span>
                    <p className="text-sm font-semibold mt-1">{p.label}</p>
                    {p.num && <p className="text-[10px] text-gray-400 mt-0.5">N° {p.num}</p>}
                  </button>
                ))}
              </div>

              {/* Info USSD */}
              {(payment === 'orange' || payment === 'mvola') && (
                <div className={`p-3 rounded-xl mb-3 text-xs ${payment === 'orange' ? 'bg-orange-50 text-orange-800 border border-orange-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                  <p className="font-semibold">📱 Paiement automatique</p>
                  <p>Après confirmation, le code USSD s'ouvrira automatiquement sur votre téléphone pour effectuer le paiement.</p>
                </div>
              )}

              <input type="tel" placeholder="Numéro de téléphone" value={phone} onChange={e => setPhone(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm" />
              {step === 2 && <button onClick={() => { if (phone) setStep(3); else setError('Numéro de téléphone requis'); }} className="mt-4 w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition">Continuer</button>}
            </div>
          )}

          {/* Step 3: Confirm */}
          {step >= 3 && (
            <div className="bg-white rounded-xl border border-emerald-300 p-5 shadow-sm">
              <h3 className="font-semibold mb-3">✅ Confirmer la commande</h3>
              {error && <p className="text-sm text-red-500 bg-red-50 p-3 rounded-lg mb-3">{error}</p>}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 transition disabled:bg-gray-300 flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : (
                  payment === 'orange' || payment === 'mvola' ? `📱 Confirmer et payer par ${payment === 'orange' ? 'Orange Money' : 'Mvola'}` : '🛒 Confirmer et payer'
                )}
              </button>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm sticky top-20">
            <h3 className="font-heading font-bold mb-4">Votre commande</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.key} className="flex gap-3">
                  <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{item.name}</p>
                    {item.weightLabel && <p className="text-[10px] text-emerald-600">{item.weightLabel}</p>}
                    <p className="text-xs text-gray-500">×{item.quantity}</p>
                  </div>
                  <span className="text-xs font-semibold">{formatPrice(getItemPrice(item) * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{formatPrice(getSubtotal())}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">🚚 Livraison</span><span>{formatPrice(getDeliveryFee())}</span></div>
              <div className="border-t pt-2 flex justify-between font-bold text-base">
                <span>Total</span><span className="text-emerald-600">{formatPrice(getTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
