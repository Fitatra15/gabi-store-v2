import { useState, useEffect } from 'react';
import api from '../../lib/axios';
import { FiPlus, FiEdit, FiTrash2, FiX, FiPhone, FiTruck } from 'react-icons/fi';

const VEHICLES = ['Moto', 'Vélo', 'Voiture', 'Tuk-tuk'];
const AVATARS = ['🏍️', '🚲', '🚗', '🛺', '🚚'];

export default function AdminDrivers() {
  const [drivers, setDrivers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', vehicle: 'Moto', avatar: '🏍️', is_available: true });

  const fetchDrivers = () => api.get('/drivers').then(r => setDrivers(r.data.drivers));
  useEffect(() => { fetchDrivers(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', phone: '', vehicle: 'Moto', avatar: '🏍️', is_available: true }); setShowModal(true); };
  const openEdit = (d) => { setEditing(d); setForm({ name: d.name, phone: d.phone, vehicle: d.vehicle, avatar: d.avatar, is_available: d.is_available }); setShowModal(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editing) await api.put(`/drivers/${editing.id}`, form);
    else await api.post('/drivers', form);
    fetchDrivers(); setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce livreur ?')) return;
    await api.delete(`/drivers/${id}`);
    fetchDrivers();
  };

  const toggleAvailable = async (d) => {
    await api.put(`/drivers/${d.id}`, { is_available: !d.is_available });
    fetchDrivers();
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-xl font-bold">🚚 Gestion des livreurs ({drivers.length})</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-emerald-600 transition"><FiPlus size={16} /> Ajouter un livreur</button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drivers.map(d => (
          <div key={d.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-2xl">{d.avatar || '🏍️'}</div>
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{d.name}</h3>
                <p className="text-xs text-gray-500 flex items-center gap-1"><FiPhone size={10} /> {d.phone}</p>
              </div>
              <button onClick={() => toggleAvailable(d)}
                className={`px-2.5 py-1 rounded-full text-[10px] font-bold cursor-pointer transition ${d.is_available ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                {d.is_available ? '🟢 Dispo' : '🔴 Occupé'}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <FiTruck size={12} /> {d.vehicle}
                <span className="text-amber-500">⭐ {Number(d.rating || 0).toFixed(1)}</span>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(d)} className="p-1.5 text-gray-400 hover:text-blue-500 transition"><FiEdit size={14} /></button>
                <button onClick={() => handleDelete(d.id)} className="p-1.5 text-gray-400 hover:text-red-500 transition"><FiTrash2 size={14} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {drivers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🚚</p>
          <p className="font-semibold text-gray-600">Aucun livreur enregistré</p>
          <p className="text-sm text-gray-400 mt-1">Ajoutez votre premier livreur</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-lg">{editing ? 'Modifier' : 'Nouveau'} livreur</h3>
              <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Nom complet *" value={form.name} onChange={e => set('name', e.target.value)} required
                className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              <input type="tel" placeholder="Téléphone *" value={form.phone} onChange={e => set('phone', e.target.value)} required
                className="w-full px-3 py-2.5 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Véhicule</label>
                <div className="flex gap-2 flex-wrap">
                  {VEHICLES.map(v => (
                    <button key={v} type="button" onClick={() => set('vehicle', v)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition ${form.vehicle === v ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-gray-300'}`}>{v}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1.5">Avatar</label>
                <div className="flex gap-2">
                  {AVATARS.map(a => (
                    <button key={a} type="button" onClick={() => set('avatar', a)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition ${form.avatar === a ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>{a}</button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.is_available} onChange={e => set('is_available', e.target.checked)} className="rounded" /> Disponible immédiatement
              </label>
              <button type="submit" className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition">
                {editing ? 'Modifier' : 'Ajouter'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
