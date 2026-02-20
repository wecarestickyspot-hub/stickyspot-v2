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
    // Blocks the user from spam-clicking while the server action is still resolving
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
      className={`p-3 rounded-full border transition-all duration-300 shadow-lg z-50 hover:scale-110 active:scale-95
        ${liked
          ? "bg-white text-rose-500 border-rose-200"
          : "bg-black/40 border-white/10 text-white/70 hover:bg-white hover:text-rose-500"
        }`}
    >
      {/* 💎 FIX 5: Micro UX Animation (Pop effect on like) */}
      <Heart 
        size={20} 
        fill={liked ? "currentColor" : "none"} 
        // We apply the pop animation only when it's liked and not pending to prevent weird states
        className={liked && !isPending ? "animate-[pop_0.3s_ease]" : ""} 
      />
    </button>
  );
}