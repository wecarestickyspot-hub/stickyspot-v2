"use client";

import { useState, useTransition } from "react";
import { updateStoreSettings } from "@/lib/actions";
import { Image as ImageIcon, UploadCloud, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";
import cloudinaryLoader from "@/lib/cloudinaryLoader";

export default function HeroImageManager({ currentImage }: { currentImage: string | null }) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImage);
  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 🛡️ FIX 3: Strict File Type Check (No SVGs or weird formats)
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Only JPG, PNG, and WebP allowed.");
      e.target.value = ''; // Reset input
      return;
    }

    // 🛡️ FIX 4: Client-Side Size Validation (Max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File is too large. Maximum size is 2MB.");
      e.target.value = ''; // Reset input
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Uploading image to Cloudinary...");

    try {
      const formData = new FormData();
      formData.append("file", file);
      // Ensure this preset is locked down in your Cloudinary Dashboard!
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "your_preset_here"); 

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.secure_url) {
        setPreviewUrl(data.secure_url);
        toast.success("Image Uploaded! Click Save to apply.", { id: toastId });
      } else {
        throw new Error(data.error?.message || "Upload failed");
      }
    } catch (error) {
      // 🛡️ FIX 6: Removed console.error for production
      if (process.env.NODE_ENV !== "production") {
          console.error("Upload error:", error);
      }
      toast.error("Failed to upload image. Please try again.", { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = ''; // Reset input so same file can be selected again if needed
    }
  };

  const handleSave = () => {
    if (!previewUrl) return;
    
    startTransition(async () => {
      const formData = new FormData();
      formData.append("heroImage", previewUrl);
      
      try {
          const result = await updateStoreSettings(formData);
          
          if (result?.error) {
            toast.error(result.error);
          } else {
            toast.success("Hero Image is now LIVE on Home Page! 🚀");
          }
      } catch (error) {
          toast.error("A critical error occurred while saving.");
      }
    });
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm max-w-4xl mt-8">
      <h2 className="text-xl font-black text-slate-900 mb-2 flex items-center gap-2">
        <ImageIcon className="text-indigo-600" size={24} /> Home Page Hero Banner
      </h2>
      <p className="text-slate-500 text-sm font-medium mb-8">Upload a new banner image to instantly update your store's front page.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="flex flex-col gap-4">
          <div className="relative border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all group cursor-pointer h-64">
            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              onChange={handleImageUpload} 
              disabled={isUploading || isPending}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" 
            />
            {isUploading ? (
              <Loader2 size={40} className="text-indigo-500 animate-spin mb-3" />
            ) : (
              <UploadCloud size={40} className="text-slate-400 group-hover:text-indigo-500 transition-colors mb-3" />
            )}
            <h3 className="font-bold text-slate-700">Click or Drag Image Here</h3>
            <p className="text-xs text-slate-400 mt-1">Recommended size: 1920x1080px (WebP/PNG, Max 2MB)</p>
          </div>

          <button
            onClick={handleSave}
            disabled={isPending || isUploading || previewUrl === currentImage}
            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex justify-center items-center gap-2 shadow-lg shadow-slate-900/10"
          >
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <><CheckCircle2 size={18} /> Save & Make Live</>}
          </button>
        </div>

        <div className="flex flex-col">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Live Preview</p>
          <div className="relative w-full h-64 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 shadow-inner flex items-center justify-center">
            {previewUrl ? (
              <Image 
                loader={cloudinaryLoader}
                src={previewUrl} 
                alt="Hero Preview" 
                fill 
                className="object-cover"
                unoptimized={!previewUrl.includes("cloudinary.com")} // Fallback if URL is external
              />
            ) : (
              <span className="text-slate-400 font-bold text-sm">No Image Uploaded</span>
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
            <div className="absolute bottom-4 left-4 pointer-events-none">
                <div className="w-24 h-4 bg-white/20 rounded-full mb-2" />
                <div className="w-16 h-3 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}