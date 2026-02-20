"use client";

import { useState, useTransition } from "react";
import { Star, MessageSquare, UploadCloud, Loader2, X, Image as ImageIcon } from "lucide-react";
import { addReview } from "@/lib/actions";
import toast from "react-hot-toast";
import Image from "next/image";
import CldImage from "@/components/shared/CldImage";

// 🛡️ FIX 1 (Performance): Strict Typing
export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  imageUrl?: string | null;
}

interface ReviewProps {
  productId: string;
  productSlug: string;
  reviews: Review[];
  currentUser: any;
}

export default function Reviews({ productId, productSlug, reviews, currentUser }: ReviewProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  // States for Image Handling
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [isPending, startTransition] = useTransition();

  // UX FIX 3: Calculate Average Rating
  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  // 📸 Handle File Selection (Create local preview only, DO NOT encode to Base64)
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }

      const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP images are allowed.");
        return;
      }

      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Safe, fast local preview
    }
  };

  // 🚀 Direct Cloudinary Upload Function
  const uploadToCloudinary = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      // Ensure this preset is restricted in Cloudinary!
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      return data.secure_url || null;
    } catch (error) {
      console.error("Cloudinary upload failed:", error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  // 🚀 Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Please login to leave a review! 🔒");
      return;
    }

    if (comment.trim().length < 5) {
      toast.error("Review is too short. Add a few more words! ✍️");
      return;
    }

    // 🛡️ CRITICAL FIX 1: Upload image FIRST, then send only URL to server
    let uploadedUrl = null;
    if (imageFile) {
      uploadedUrl = await uploadToCloudinary(imageFile);
      if (!uploadedUrl) {
        toast.error("Image upload failed. Please try again.");
        return;
      }
    }

    startTransition(async () => {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("slug", productSlug);
      formData.append("rating", rating.toString());
      formData.append("comment", comment); // Server action MUST sanitize this!

      if (uploadedUrl) {
        formData.append("imageUrl", uploadedUrl); // Sending URL, not Base64!
      }

      const result = await addReview(formData);

      if (result?.success) {
        toast.success("Review posted successfully! 🎉");
        setComment("");
        setImageFile(null);
        setImagePreview(null);
        setRating(5);
      } else {
        // Hum 'any' use kar rahe hain taaki agar 'message' ho toh wo mil jaye
        toast.error((result as any).message || "Failed to post review.");
      }
    });
  };

  return (
    <div className="w-full">
      {/* HEADER WITH AVERAGE RATING */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 border-b border-slate-100 pb-6">
        <div className="flex items-center gap-4">
          <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 hidden sm:block">
            <MessageSquare className="text-indigo-600" size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight italic">Customer Reviews</h2>
            <p className="text-slate-500 font-medium text-sm mt-1">Real photos and vibes from the StickySpot fam.</p>
          </div>
        </div>

        {/* 📈 UX FIX: Average Rating Badge */}
        {reviews.length > 0 && (
          <div className="flex items-center gap-3 bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-1">
              <Star size={20} className="text-amber-400 fill-amber-400" />
              <span className="text-xl font-black text-slate-900">{avgRating}</span>
            </div>
            <div className="w-px h-6 bg-slate-200"></div>
            <p className="text-sm font-bold text-slate-500">{reviews.length} reviews</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

        {/* 📝 LEFT: Review Form */}
        <div className="lg:col-span-5 bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm sticky top-24">
          <h3 className="text-xl font-black text-slate-900 mb-6">Write a Review</h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ... [Star Rating & Comment HTML remains exactly the same] ... */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block">Overall Rating</label>
              <div className="flex items-center gap-2 bg-slate-50 w-fit p-2 rounded-2xl border border-slate-100">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 hover:scale-110 transition-transform focus:outline-none"
                  >
                    <Star size={28} className={`${star <= rating ? "text-amber-400 fill-amber-400" : "text-slate-300 fill-slate-200"}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Your Feedback</label>
              <textarea
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="How's the quality? Where did you stick it?"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 focus:outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 transition-all resize-none font-medium"
              ></textarea>
            </div>

            {/* Image Upload Area */}
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Add a Photo (Optional)</label>

              {!imagePreview ? (
                <label className="flex items-center justify-center w-full h-24 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl cursor-pointer hover:bg-indigo-50/50 hover:border-indigo-300 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full shadow-sm group-hover:bg-indigo-100 transition-colors">
                      <UploadCloud size={20} className="text-slate-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-500 group-hover:text-indigo-600">Upload Sticker Photo</span>
                  </div>
                  <input type="file" accept="image/jpeg, image/png, image/webp" onChange={handleImageChange} className="hidden" />
                </label>
              ) : (
                <div className="relative w-fit">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-sm">
                    <Image src={imagePreview} alt="Preview" fill className="object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setImageFile(null);
                    }}
                    className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 hover:bg-rose-600 hover:scale-110 transition-all shadow-md"
                  >
                    <X size={14} strokeWidth={3} />
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isPending || isUploading}
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-lg shadow-slate-900/10 active:scale-95 uppercase tracking-widest text-xs"
            >
              {(isPending || isUploading) ? <Loader2 size={18} className="animate-spin" /> : "Post Review"}
            </button>
          </form>
        </div>

        {/* ⭐ RIGHT: Review List */}
        <div className="lg:col-span-7 space-y-6">
          {reviews.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-12 text-center h-full flex flex-col items-center justify-center">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Star size={32} className="text-slate-300" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">Be the first to review!</h3>
              <p className="text-slate-500 font-medium">Grab this sticker and let everyone know how it looks on your gear.</p>
            </div>
          ) : (
            // 🚀 UX FIX: Rendering array safely
            reviews.map((review) => (
              <div key={review.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center font-black text-lg border border-indigo-100">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-slate-900">{review.userName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                        {new Date(review.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={12}
                        className={`${star <= review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200 fill-slate-200"}`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-slate-600 font-medium leading-relaxed mb-5">{review.comment}</p>

                {/* Show uploaded image if exists */}
                {review.imageUrl && (
                  <div className="relative w-32 h-32 rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:scale-[1.02] transition-transform cursor-pointer">
                    <CldImage src={review.imageUrl} alt="Review Photo" fill className="object-cover" />
                  </div>
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}