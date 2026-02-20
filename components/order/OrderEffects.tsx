"use client";

import { useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";
import { useSearchParams, useRouter } from "next/navigation";
import confetti from "canvas-confetti";

export default function OrderEffects({ orderId, status }: { orderId: string, status: string }) {
  const clearCart = useCartStore((state) => state.clearCart);
  const searchParams = useSearchParams();
  const router = useRouter();

  // 🛡️ FIX 1 & 4: Safe Cart Clearing & Confetti Memory Safety
  useEffect(() => {
    const shouldClear = searchParams.get("clear_cart");

    // We only clear the cart and celebrate IF the URL explicitly says so 
    // AND the status has successfully changed from PENDING.
    if (shouldClear === "true" && status !== "PENDING") {
      clearCart();

      const duration = 3 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };
      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      let interval: NodeJS.Timeout = setInterval(function() {
        const timeLeft = animationEnd - Date.now();
        if (timeLeft <= 0) return clearInterval(interval);
        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);

      // Remove `clear_cart` from URL so refreshing the page doesn't fire confetti again
      router.replace(`/orders/${orderId}`);

      return () => clearInterval(interval);
    }
  }, [clearCart, searchParams, orderId, router, status]);

  // 🛡️ FIX 3: Webhook Race Condition Polling
  // If the page loads but the webhook hasn't updated the DB to PAID yet,
  // we silently ask the server for fresh data every 3 seconds.
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    if (status === "PENDING") {
      pollInterval = setInterval(() => {
        router.refresh(); // Magically re-runs the Server Component to check DB!
      }, 3000);
    }
    return () => clearInterval(pollInterval);
  }, [status, router]);

  return null; // This component has no UI, it's just pure logic!
}