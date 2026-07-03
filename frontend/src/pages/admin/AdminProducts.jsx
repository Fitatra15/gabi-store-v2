import { useState, useEffect, useRef } from 'react';
import api from '../../lib/axios';
import { formatPrice } from '../../utils/format';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUpload, FiImage } from 'react-icons/fi';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', stock: '', category_id: '', description: '', vendor: '', unit: 'pièce', is_featured: false, discount_pct: 0 });
  const [imageFiles, setImageFiles] = useState([]); // For new uploads
  const [imagePreview, setImagePreview] = useState([]); // Preview URLs
  const [existingImages, setExistingImages] = useState([]); // Existing product images
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/products?limit=100').then(r => setProducts(r.data.products));
    api.get('/categories').then(r => setCategories(r.data.categories));
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', price: '', stock: '', category_id: categories[0]?.id || '', description: '', vendor: '', unit: 'pièce', is_featured: false, discount_pct: 0 });
    setImageFiles([]); setImagePreview([]); setExistingImages([]);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, price: p.price, stock: p.stock, category_id: p.category_id, description: p.description || '', vendor: p.vendor || '', unit: p.unit || 'pièce', is_featured: p.is_featured, discount_pct: p.discount_pct || 0 });
    setExistingImages(p.images || []);
    setImageFiles([]); setImagePreview([]);
    setShowModal(true);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
    // Generate previews
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(f);
    });
  };

  const removeNewImage = (idx) => {
    setImageFiles(prev => prev.filter((_, i) => i !== idx));
    setImagePreview(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // Upload new images first
    const uploadedUrls = [];
    for (const file of imageFiles) {
      const fd = new FormData();
      fd.append('image', file);
      try {
        const res = await api.post('/upload/image', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        uploadedUrls.push({ url: res.data.url });
      } catch (err) { console.error('Upload error:', err); }
    }

    // Combine existing + new
    const allImages = [...existingImages.map(i => ({ url: i.url })), ...uploadedUrls];
    const data = { ...form, price: Number(form.price), stock: Number(form.stock), discount_pct: Number(form.discount_pct), images: allImages };

    if (editing) await api.put(`/products/${editing.id}`, data);
    else await api.post('/products', data);

    const r = await api.get('/products?limit=100');
    setProducts(r.data.products);
    setShowModal(false);
    setUploading(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce produit ?')) return;
    await api.delete(`/products/${id}`);
    setProducts(products.filter(p => p.id !== id));
  };

  const set = (k, v) => setForm({ ...form, [k]: v });

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-heading text-xl font-bold">Gestion des produits ({products.length})</h2>
        <button onClick={openCreate} className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-sm font-semibold flex items-center gap-2 hover:bg-emerald-600 transition"><FiPlus size={16} /> Ajouter</button>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs">
              <tr><th className="text-left px-4 py-3">Produit</th><th className="text-left px-4 py-3">Catégorie</th><th className="text-left px-4 py-3">Prix</th><th className="text-left px-4 py-3">Stock</th><th className="text-left px-4 py-3">Vedette</th><th className="px-4 py-3">Actions</th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50">
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><img src={p.images?.[0]?.url} alt="" className="w-10 h-10 rounded-lg object-cover bg-gray-100" /><div><p className="font-medium">{p.name}</p><p className="text-xs text-gray-400">{p.vendor}</p></div></div></td>
                  <td className="px-4 py-3 text-xs">{p.category?.name}</td>
                  <td className="px-4 py-3 font-semibold">{formatPrice(p.price)}{p.discount_pct > 0 && <span className="text-red-500 text-xs ml-1">-{p.discount_pct}%</span>}</td>
                  <td className="px-4 py-3"><span className={`font-semibold ${p.stock < 10 ? 'text-red-500' : 'text-emerald-600'}`}>{p.stock}</span></td>
                  <td className="px-4 py-3">{p.is_featured ? '⭐' : '—'}</td>
                  <td className="px-4 py-3"><div className="flex gap-1 justify-center"><button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-blue-500"><FiEdit size={14} /></button><button onClick={() => handleDelete(p.id)} className="p-1.5 text-gray-400 hover:text-red-500"><FiTrash2 size={14} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-heading font-bold text-lg">{editing ? 'Modifier' : 'Nouveau'} produit</h3>
              <button onClick={() => setShowModal(false)}><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input type="text" placeholder="Nom *" value={form.name} onChange={e => set('name', e.target.value)} required className="w-full px-3 py-2.5 border rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder="Prix (MGA) *" value={form.price} onChange={e => set('price', e.target.value)} required className="px-3 py-2.5 border rounded-xl text-sm" />
                <input type="number" placeholder="Stock *" value={form.stock} onChange={e => set('stock', e.target.value)} required className="px-3 py-2.5 border rounded-xl text-sm" />
              </div>
              <select value={form.category_id} onChange={e => set('category_id', e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm">
                {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
              <input type="text" placeholder="Vendeur" value={form.vendor} onChange={e => set('vendor', e.target.value)} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
              <textarea placeholder="Description" value={form.description} onChange={e => set('description', e.target.value)} rows={3} className="w-full px-3 py-2.5 border rounded-xl text-sm" />
              <div className="grid grid-cols-2 gap-3">
                <input type="text" placeholder="Unité (kg, pièce...)" value={form.unit} onChange={e => set('unit', e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm" />
                <input type="number" placeholder="Réduction %" value={form.discount_pct} onChange={e => set('discount_pct', e.target.value)} className="px-3 py-2.5 border rounded-xl text-sm" />
              </div>

              {/* IMAGE UPLOAD */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-2">📸 Photos du produit</label>

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {existingImages.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={img.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => setExistingImages(prev => prev.filter((_, j) => j !== i))}
                          className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg flex items-center justify-center"><FiX size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New image previews */}
                {imagePreview.length > 0 && (
                  <div className="flex gap-2 mb-2 flex-wrap">
                    {imagePreview.map((src, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border-2 border-emerald-300">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeNewImage(i)}
                          className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white rounded-bl-lg flex items-center justify-center"><FiX size={10} /></button>
                        <span className="absolute bottom-0 left-0 right-0 bg-emerald-500 text-white text-[8px] text-center">NOUVEAU</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button */}
                <input type="file" ref={fileRef} accept="image/*" multiple onChange={handleFileSelect} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-sm text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition flex items-center justify-center gap-2">
                  <FiUpload size={16} /> Choisir des photos depuis votre appareil
                </button>
                <p className="text-[10px] text-gray-400 mt-1">JPEG, PNG, WebP — 5 Mo max par image</p>
              </div>

              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)} className="rounded" /> Produit vedette</label>
              <button type="submit" disabled={uploading}
                className="w-full py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition disabled:bg-gray-300 flex items-center justify-center gap-2">
                {uploading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Upload en cours...</> : editing ? 'Modifier' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
