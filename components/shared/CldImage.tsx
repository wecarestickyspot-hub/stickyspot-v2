import Image, { ImageProps } from 'next/image';
import cloudinaryLoader from '@/lib/cloudinaryLoader';

export default function CldImage({
  // ⚡ FIX 3: Sensible default sizes to prevent layout shifts and warnings
  // This automatically handles lazy developers who forget to add sizes when using 'fill'
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...props
}: ImageProps) {
  
  // 🛡️ SECURITY & STABILITY CHECKS
  const srcString = typeof props.src === 'string' ? props.src : '';

  // 1. Bypass custom loader for local assets (e.g., "/placeholder.png")
  // Ye zaroori hai warna local images Cloudinary URL ban jayengi aur toot jayengi.
  if (srcString.startsWith('/')) {
    return <Image sizes={sizes} {...props} />;
  }

  // 🛡️ FIX 2: Elite Security Check
  // Prevent arbitrary external URLs from being maliciously passed to your loader
  if (srcString.startsWith('http') && !srcString.includes('res.cloudinary.com')) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`[Security] Blocked non-Cloudinary image from custom loader: ${srcString}`);
    }
    // Safe Fallback: Render external images as unoptimized to prevent UI crashes, 
    // but don't run them through the Cloudinary loader logic.
    return <Image sizes={sizes} {...props} unoptimized />;
  }

  // 🚀 THE HAPPY PATH: 100% Server-Side Rendered Cloudinary Image
  return (
    <Image 
      loader={cloudinaryLoader} 
      sizes={sizes} 
      {...props} 
    />
  );
}