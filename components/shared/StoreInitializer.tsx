"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function StoreInitializer({ 
  threshold, 
  charge 
}: { 
  threshold: number, 
  charge: number 
}) {
  const setShippingSettings = useCartStore((state) => state.setShippingSettings);

  useEffect(() => {
    // 🛡️ FIX: Removed useRef lock. 
    // Now it updates on first load AND instantly syncs if the Admin updates settings
    // without requiring the user to hard-refresh the page.
    // React handles the optimization automatically via the dependency array!
    
    if (typeof threshold === 'number' && typeof charge === 'number') {
      setShippingSettings(threshold, charge);
    }
    
  }, [threshold, charge, setShippingSettings]);

  // Renderless Component: Acts purely as a logic bridge between Server & Client
  return null; 
}