"use client";

/**
 * 🚀 CLOUDINARY LOADER (Production-Ready)
 * Iska kaam hai images ko fly-par optimize karna taaki page load speed makkhan ho.
 */
export default function cloudinaryLoader({ 
  src, 
  width, 
  quality 
}: { 
  src: string; 
  width: number; 
  quality?: number 
}) {
  // 🛡️ FIX 1: Early Return for Non-Cloudinary Images
  // Agar image local hai ya kisi aur domain ki hai, toh छेड़खानी mat karo.
  if (!src.includes('res.cloudinary.com')) return src;

  // 🛡️ FIX 2: Versioning & Multi-Upload Fix
  // Cloudinary URLs mein kabhi '/upload/v12345/' hota hai. 
  // Hamara replace logic sirf '/upload/' ko target karega taaki versioning na toote.
  const params = [
    `f_auto`, // Automatically select best format (WebP/AVIF)
    `q_auto:${quality || 'good'}`, // Smart quality compression
    `w_${width}`, // Resize image on the fly to exact width needed
    `c_limit`, // Fit within width without stretching
    `dpr_auto` // Support high-resolution (Retina) screens
  ].join(',');

  // 🔥 THE FIX: Regex replace use karein taaki sirf PEHLA '/upload/' replace ho
  // Isse nested paths ya double upload keywords safe rehte hain.
  return src.replace(/\/upload\/(v[0-9]+\/)?/, `/upload/${params}/$1`);
}