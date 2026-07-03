export function formatPrice(amount) {
  if (!amount && amount !== 0) return '0 MGA';
  return Number(amount).toLocaleString('fr-FR') + ' MGA';
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export function formatDateShort(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function getDiscountedPrice(price, discountPct) {
  if (!discountPct || discountPct <= 0) return price;
  return Math.round(price * (1 - discountPct / 100));
}

export function getPrimaryImage(product) {
  if (!product?.images?.length) return 'https://via.placeholder.com/400?text=Produit';
  const primary = product.images.find(i => i.is_primary);
  return primary ? primary.url : product.images[0].url;
}

export const STATUS_LABELS = {
  pending: 'En attente', confirmed: 'Confirmée', preparing: 'En préparation',
  in_transit: 'En livraison', delivered: 'Livrée', cancelled: 'Annulée',
};

export const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800', in_transit: 'bg-emerald-100 text-emerald-800',
  delivered: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800',
};

export const PAYMENT_LABELS = {
  mvola: 'Mvola', airtel: 'Airtel Money', orange: 'Orange Money', cash: 'Cash à la livraison',
};
