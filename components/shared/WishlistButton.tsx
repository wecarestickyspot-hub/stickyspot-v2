"use client";

import { Heart } from "lucide-react";
import { useTransition, useState } from "react";
import { toggleWishlist } from "@/lib/actions";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface WishlistButtonProps {
  productId: string;
  isWishlisted: boolean;
  isLoggedIn?: boolean;
}

export default function WishlistButton({ productId, isWishlisted, isLoggedIn }: WishlistButtonProps) {
  const [isPending, startTransition] = useTransition();
  
  // 🛡️ FIX 3: Initialize once. Removed the flickering useEffect.
  const [liked, setLiked] = useState(() => isWishlisted);
  
  const router = useRouter();
  const pathname = usePathname();

  // Safely sync state if server revalidates and prop changes, without causing useEffect flickers
  if (isWishlisted !== liked && !isPending) {
    setLiked(isWishlisted);
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    // 🛡️ FIX 1: Double-Click Race Condition Guard
    if (isPending) return;

    if (!isLoggedIn) {
      toast.error("Please login to save items! 🔒");
      // 🛡️ FIX 2: Elite UX - Redirect back to the exact product page after login
      router.push(`/sign-in?redirect_url=${encodeURIComponent(pathname)}`);
      return;
    }

    // 🚀 Optimistic UI Update (Instant feedback)
    const newLikedState = !liked;
    setLiked(newLikedState);

    if (newLikedState) {
      toast.success("Added to Wishlist ❤️");
    } else {
      toast.success("Removed from Wishlist 💔");
    }

    // Execute Server Action in background
    startTransition(async () => {
      try {
        await toggleWishlist(productId, pathname);
      } catch (error) {
        // Revert UI if server fails
        setLiked(!newLikedState); 
        toast.error("Something went wrong 😢");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      // 🛡️ FIX 4: Accessibility for Screen Readers
      aria-pressed={liked}
      aria-label={liked ? "Remove from Wishlist" : "Add to Wishlist"}
      // 🚀 UI FIX: Removed p-3. Added exact responsive width/height (w-8/10) and flex-center for perfect centering!
      className={`w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center rounded-full border transition-all duration-300 shadow-lg z-50 hover:scale-110 active:scale-95
        ${liked
          ? "bg-white text-rose-500 border-rose-200"
          : "bg-black/40 border-white/10 text-white/90 hover:bg-white hover:text-rose-500"
        }`}
    >
      {/* 💎 UI FIX: Made icon size responsive too (smaller on mobile, standard on PC) */}
      <Heart 
        // Using Tailwind width/height instead of fixed pixel size for better responsiveness
        className={`w-[18px] h-[18px] sm:w-[20px] sm:h-[20px] ${liked && !isPending ? "animate-[pop_0.3s_ease]" : ""}`}
        fill={liked ? "currentColor" : "none"} 
        strokeWidth={2.5}
      />
    </button>
  );
}