import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { formatPrice, formatDate, PAYMENT_LABELS } from '../../utils/format';
import { FiCheck, FiX, FiClock, FiAlertCircle } from 'react-icons/fi';

const STATUS_STYLES = {
  pending: { bg: 'bg-yellow-100 text-yellow-800', icon: FiClock, label: 'En attente' },
  confirmed: { bg: 'bg-green-100 text-green-800', icon: FiCheck, label: 'Confirmé' },
  failed: { bg: 'bg-red-100 text-red-800', icon: FiX, label: 'Rejeté' },
  refunded: { bg: 'bg-purple-100 text-purple-800', icon: FiAlertCircle, label: 'Remboursé' },
};

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState(null);
  const [reference, setReference] = useState('');
  const [notes, setNotes] = useState('');

  const fetchPayments = () => {
    setLoading(true);
    const params = filter ? `?status=${filter}` : '';
    api.get(`/payments${params}`).then(r => { setPayments(r.data.payments); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(fetchPayments, [filter]);

  const handleConfirm = async () => {
    if (!confirmModal) return;
    await api.put(`/payments/${confirmModal.id}/confirm`, { reference, notes: notes || 'Paiement vérifié' });
    setConfirmModal(null); setReference(''); setNotes('');
    fetchPayments();
  };

  const handleReject = async (id) => {
    const reason = prompt('Raison du rejet :');
    if (reason === null) return;
    await api.put(`/payments/${id}/reject`, { reason });
    fetchPayments();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-xl font-bold">💰 Vérification des paiements</h2>
        <select value={filter} onChange={e => setFilter(e.target.value)} className="px-3 py-2 border rounded-xl text-sm bg-white">
          <option value="">Tous</option>
          <option value="pending">⏳ En attente</option>
          <option value="confirmed">✅ Confirmés</option>
          <option value="failed">❌ Rejetés</option>
        </select>
      </div>

      {/* Info box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-semibold mb-1">💡 Comment vérifier un paiement Mobile Money ?</p>
        <ol className="list-decimal ml-4 space-y-0.5 text-xs">
          <li>Vérifiez sur votre compte Mvola/Airtel/Orange si le montant a bien été reçu</li>
          <li>Notez la <strong>référence de transaction</strong> du mobile money</li>
          <li>Cliquez "Confirmer" et entrez la référence — la commande passera automatiquement en "Confirmée"</li>
        </ol>
      </div>

      {/* Payments table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr>
                <th className="text-left px-4 py-3">Commande</th>
                <th className="text-left px-4 py-3">Client</th>
                <th className="text-left px-4 py-3">Mode</th>
                <th className="text-left px-4 py-3">Téléphone</th>
                <th className="text-left px-4 py-3">Montant</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Date</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => {
                const style = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                const Icon = style.icon;
                return (
                  <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{p.Order?.order_number}</td>
                    <td className="px-4 py-3">
                      <p className="text-xs font-medium">{p.Order?.customer?.name}</p>
                      <p className="text-[10px] text-gray-400">{p.Order?.customer?.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs font-semibold">{PAYMENT_LABELS[p.provider] || p.provider}</span>
                    </td>
                    <td className="px-4 py-3 text-xs font-mono">{p.phone_number}</td>
                    <td className="px-4 py-3 font-bold">{formatPrice(p.amount)}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${style.bg}`}>
                        <Icon size={10} /> {style.label}
                      </span>
                      {p.reference && <p className="text-[10px] text-gray-400 mt-0.5">Réf: {p.reference}</p>}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">{formatDate(p.createdAt)}</td>
                    <td className="px-4 py-3">
                      {p.status === 'pending' && (
                        <div className="flex gap-1 justify-center">
                          <button onClick={() => { setConfirmModal(p); setReference(''); setNotes(''); }}
                            className="px-2.5 py-1 bg-green-500 text-white rounded-lg text-xs font-semibold hover:bg-green-600 transition flex items-center gap-1">
                            <FiCheck size={10} /> Confirmer
                          </button>
                          <button onClick={() => handleReject(p.id)}
                            className="px-2.5 py-1 bg-red-100 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-200 transition flex items-center gap-1">
                            <FiX size={10} /> Rejeter
                          </button>
                        </div>
                      )}
                      {p.status === 'confirmed' && <p className="text-[10px] text-green-600 text-center">✅ {formatDate(p.confirmed_at)}</p>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {payments.length === 0 && <p className="text-center py-8 text-gray-400 text-sm">{filter === 'pending' ? 'Aucun paiement en attente' : 'Aucun paiement'}</p>}
        </div>
      </div>

      {/* Confirm modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setConfirmModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-heading font-bold text-lg mb-1">✅ Confirmer le paiement</h3>
            <p className="text-sm text-gray-500 mb-4">
              {PAYMENT_LABELS[confirmModal.provider]} — <strong>{formatPrice(confirmModal.amount)}</strong> — {confirmModal.phone_number}
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Référence de transaction Mobile Money *</label>
                <input type="text" placeholder="Ex: TXN123456789" value={reference} onChange={e => setReference(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optionnel)</label>
                <input type="text" placeholder="Commentaire..." value={notes} onChange={e => setNotes(e.target.value)}
                  className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <button onClick={handleConfirm} disabled={!reference}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition disabled:bg-gray-300">
                Confirmer la réception
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
