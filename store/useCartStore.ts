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
  stock: number;
  // 🚀 UPDATE 1: Bundle support fields
  isBundle?: boolean; 
  bundleProductIds?: string[]; // Checkout me kaam aayega stock minus karne ke liye
}

export interface CartTotals {
  subtotal: number;
  discount: number;
  shippingCost: number; // 🚀 UPDATE 2: Return shipping cost to UI
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
  
  addItem: (item: CartItem) => { success: boolean; message?: string }; 
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

        if (existingItem) {
          const newQuantity = existingItem.quantity + quantityToAdd;
          
          if (newQuantity > existingItem.stock) {
            return { success: false, message: "Stock limit reached" }; 
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
            item.id === id ? { ...item, quantity: Math.min(Math.max(1, quantity), item.stock) } : item
          ),
        })),

      applyDiscount: (amount, code) => set({ discount: amount, couponCode: code }),
      removeDiscount: () => set({ discount: 0, couponCode: null }),
      clearCart: () => set({ items: [], discount: 0, couponCode: null }),

      getCartTotal: () => {
        const { items, discount: manualDiscount, couponCode, freeShippingThreshold, shippingCharge } = get();
        
        const subtotal = items.reduce((acc, item) => acc + Math.round(item.price * 100) * item.quantity, 0) / 100;
        const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

        let finalDiscount = manualDiscount > 0 ? manualDiscount : 0;
        if (finalDiscount > subtotal) {
          finalDiscount = subtotal; 
        }

        const subtotalAfterDiscount = subtotal - finalDiscount;

        // 🚀 UPDATE 3: Accurate Shipping Calculation based on discounted total
        const shippingCost = (subtotalAfterDiscount >= freeShippingThreshold || totalItems === 0) 
            ? 0 
            : shippingCharge;

        return {
          subtotal,
          discount: finalDiscount,
          shippingCost,
          finalTotal: Math.round((subtotalAfterDiscount + shippingCost) * 100) / 100, // 👈 Ab Final Total ekdum accurate aayega
          activeOffer: finalDiscount > 0 ? couponCode : null,
          totalItems
        };
      },
    }),
    {
      name: "stickyspot-cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ 
        items: state.items, 
        discount: state.discount, 
        couponCode: state.couponCode 
      }),
    }
  )
);