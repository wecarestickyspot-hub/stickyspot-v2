import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  quantity: number;
  category?: string;
  isBundle?: boolean;
  stock: number;
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  finalTotal: number;
  activeOffer: string | null;
  totalItems: number;
}

interface CartStore {
  items: CartItem[];
  discount: number;
  couponCode: string | null;
  isOpen: boolean; 
  setIsOpen: (isOpen: boolean) => void;
  
  freeShippingThreshold: number; 
  shippingCharge: number;
  setShippingSettings: (threshold: number, charge: number) => void;
  
  addItem: (item: CartItem) => { success: boolean; message?: string }; // Modified to return status
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  applyDiscount: (amount: number, code: string) => void;
  removeDiscount: () => void;
  clearCart: () => void;
  getCartTotal: () => CartTotals;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      discount: 0,
      couponCode: null,
      isOpen: false,
      
      freeShippingThreshold: 499,
      shippingCharge: 49,

      setIsOpen: (isOpen) => set({ isOpen }),
      setShippingSettings: (threshold, charge) => set({ freeShippingThreshold: threshold, shippingCharge: charge }),

      addItem: (newItem) => {
        const { items } = get();
        const existingItem = items.find((item) => item.id === newItem.id);
        const quantityToAdd = newItem.quantity || 1;

        // 🚨 FIX 1: Strict Stock Enforcement
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantityToAdd;
          
          if (newQuantity > existingItem.stock) {
            return { success: false, message: "Stock limit reached" }; // UI can use this to show a toast
          }

          set({
            items: items.map((item) =>
              item.id === newItem.id
                ? { ...item, quantity: newQuantity }
                : item
            ),
          });
        } else {
          if (quantityToAdd > newItem.stock) {
            return { success: false, message: "Not enough stock" };
          }
          set({ items: [...items, { ...newItem, quantity: quantityToAdd }] });
        }
        
        set({ isOpen: true });
        return { success: true };
      },

      removeItem: (id) => {
        set((state) => {
          const newItems = state.items.filter((item) => item.id !== id);
          // 🚨 FIX 2: Auto-remove discount if cart becomes empty
          return {
            items: newItems,
            discount: newItems.length === 0 ? 0 : state.discount,
            couponCode: newItems.length === 0 ? null : state.couponCode
          };
        });
      },

      updateQuantity: (id, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            // 🚨 FIX 1: Prevent manual input from exceeding stock
            item.id === id ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) } : item
          ),
        })),

      applyDiscount: (amount, code) => set({ discount: amount, couponCode: code }),
      removeDiscount: () => set({ discount: 0, couponCode: null }),
      clearCart: () => set({ items: [], discount: 0, couponCode: null }),

      getCartTotal: () => {
        const { items, discount: manualDiscount, couponCode } = get();
        
        // 🚨 FIX 3: Safe Floating Point Math (Convert to integer paise/cents first, then divide)
        const subtotal = items.reduce((acc, item) => acc + Math.round(item.price * 100) * item.quantity, 0) / 100;
        const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

        // 🚨 FIX 2: Discount Sanity Check (Don't allow discount to exceed subtotal)
        let finalDiscount = manualDiscount > 0 ? manualDiscount : 0;
        if (finalDiscount > subtotal) {
          finalDiscount = subtotal; // Clamp discount to subtotal
        }

        return {
          subtotal,
          discount: finalDiscount,
          // Safe subtraction with float rounding
          finalTotal: Math.round((subtotal - finalDiscount) * 100) / 100,
          activeOffer: finalDiscount > 0 ? couponCode : null,
          totalItems
        };
      },
    }),
    {
      name: "stickyspot-cart-storage",
      storage: createJSONStorage(() => localStorage),
      // 🚨 FIX 5: Only persist items. Never persist shipping rules or raw discounts permanently.
      partialize: (state) => ({ 
        items: state.items, 
        discount: state.discount, 
        couponCode: state.couponCode 
      }),
    }
  )
);