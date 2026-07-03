import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity = 1, weightOption = null) => {
        const items = [...get().items];
        const key = product.id + (weightOption ? `_w${weightOption.id}` : '');
        const existing = items.find(i => i.key === key);

        if (existing) {
          existing.quantity += quantity;
        } else {
          items.push({
            key,
            productId: product.id,
            name: product.name,
            price: product.price,
            discountPct: product.discount_pct || 0,
            image: product.images?.[0]?.url || '',
            vendor: product.vendor,
            unit: product.unit,
            quantity,
            weightId: weightOption?.id || null,
            weightLabel: weightOption?.label || null,
            weightMultiplier: weightOption?.price_multiplier || 1,
          });
        }
        set({ items });
      },

      removeItem: (key) => {
        set({ items: get().items.filter(i => i.key !== key) });
      },

      updateQuantity: (key, quantity) => {
        if (quantity <= 0) { get().removeItem(key); return; }
        const items = get().items.map(i => i.key === key ? { ...i, quantity } : i);
        set({ items });
      },

      clearCart: () => set({ items: [] }),

      getItemPrice: (item) => {
        let price = Number(item.price);
        if (item.discountPct > 0) price = Math.round(price * (1 - item.discountPct / 100));
        price = Math.round(price * (item.weightMultiplier || 1));
        return price;
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + get().getItemPrice(item) * item.quantity, 0);
      },

      getDeliveryFee: () => get().items.length > 0 ? 3000 : 0,

      getTotal: () => {
        return get().getSubtotal() + get().getDeliveryFee();
      },

      getCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'gabi-cart' }
  )
);

export default useCartStore;
