"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, X, Scan, ZoomIn, AlertCircle, RotateCw } from "lucide-react";
import { createPortal } from "react-dom";
import CldImage from "../shared/CldImage";

interface LiveTryOnProps {
  imageSrc: string;
}

export default function LiveTryOn({ imageSrc }: LiveTryOnProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  
  // 🛡️ FIX 4: Dynamically clamp maxSize based on device to prevent GPU lag on old phones
  const minSize = 80;
  const [maxSize, setMaxSize] = useState(400); 
  const [stickerSize, setStickerSize] = useState(200); 
  
  // 🎨 WOW FACTOR: Added rotation for extra realism
  const [rotation, setRotation] = useState(0);
  
  const [mounted, setMounted] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setMounted(true);
    // Set max size based on screen width
    setMaxSize(window.innerWidth > 768 ? 600 : 350);

    // 🛡️ FIX 1 & 3: Check if device actually supports camera and is on HTTPS
    const isSecureContext = window.isSecureContext || location.hostname === "localhost";
    const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    
    if (!isSecureContext || !hasMediaDevices) {
      setIsSupported(false);
    }
  }, []);

  const startCamera = async () => {
    // 🛡️ FIX 6: Prevent double clicks causing multiple streams
    if (isOpen) return;
    
    setIsOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" } // Back camera if on mobile
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
      setHasPermission(true);
    } catch (err) {
      console.error("Camera access denied:", err);
      setHasPermission(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsOpen(false);
    setHasPermission(null); // Reset permission state on close
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  const sizePercentage = Math.round(((stickerSize - minSize) / (maxSize - minSize)) * 100);

  // If not supported, show a disabled button with tooltip
  if (!isSupported) {
    return (
      <button disabled className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-400 font-bold py-4 rounded-2xl cursor-not-allowed border border-slate-200 mt-4 relative group">
        <Scan size={20} /> AR Try-On (Not Supported)
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1.5 px-3 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Requires Camera & HTTPS
        </span>
      </button>
    );
  }

  // 👇 AR Modal Layout
  const arModal = (
    <div className="fixed inset-0 z-[99999] bg-black flex flex-col font-sans animate-in fade-in duration-300 w-screen h-[100dvh]">
      
      {/* Top Navbar */}
      <div className="absolute top-0 left-0 w-full p-4 sm:p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/80 via-black/40 to-transparent">
        <h3 className="text-white font-black text-base sm:text-lg flex items-center gap-2 drop-shadow-md">
          <Camera size={20} className="text-indigo-400" /> AR Preview
        </h3>
        <button
          onClick={stopCamera}
          className="bg-white/20 backdrop-blur-md text-white p-2.5 sm:p-3 rounded-full hover:bg-rose-500 transition-colors border border-white/30 flex items-center gap-2"
        >
          <X size={20} strokeWidth={2.5} /> <span className="text-sm font-bold pr-1 hidden sm:inline">Close</span>
        </button>
      </div>

      {/* Camera Feed & Sticker Overlay */}
      <div className="relative flex-1 w-full h-full overflow-hidden flex items-center justify-center bg-zinc-900">
        {hasPermission === false ? (
          <div className="text-center p-8 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 z-20 mx-4">
            <AlertCircle size={48} className="text-rose-400 mx-auto mb-4" />
            <p className="text-white font-bold text-lg mb-2">Camera Access Denied</p>
            <p className="text-white/60 text-sm mb-6 max-w-xs mx-auto">Please allow camera permissions in your browser settings to try this sticker live.</p>
            <button onClick={stopCamera} className="bg-white text-black px-6 py-2.5 rounded-full font-bold">Exit Preview</button>
          </div>
        ) : (
          <>
            {/* 🎥 Video Feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* 🎯 Targeting UI (Reticle) */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-50">
                <div className="w-48 h-48 sm:w-64 sm:h-64 border-[1px] border-white/40 rounded-[2rem] relative">
                    <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-white/80 rounded-tl-2xl"></div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-white/80 rounded-tr-2xl"></div>
                    <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-white/80 rounded-bl-2xl"></div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-white/80 rounded-br-2xl"></div>
                </div>
            </div>

            {/* 🌟 The Sticker Overlay (With Realism Tweaks) */}
            <div 
              className="absolute z-20 pointer-events-none transition-transform duration-75 ease-out"
              style={{ 
                width: `${stickerSize}px`, 
                height: `${stickerSize}px`,
                transform: `rotate(${rotation}deg)`,
                filter: "drop-shadow(0px 25px 35px rgba(0,0,0,0.5))" // 🎨 Realistic shadow
              }}
            >
              <CldImage
                src={imageSrc} 
                alt="AR Sticker Preview" 
                fill 
                className="object-contain opacity-[0.92] mix-blend-normal" // 🎨 Slight transparency for realism
              />
            </div>

            {/* Guidelines Text */}
            <div className="absolute top-20 sm:top-24 w-full text-center px-4 z-20">
                <p className="bg-black/60 backdrop-blur-md text-white text-xs sm:text-sm font-bold py-2.5 px-6 rounded-full inline-block border border-white/10 shadow-lg animate-pulse">
                    Point at surface & adjust size/tilt
                </p>
            </div>
          </>
        )}
      </div>

      {/* Bottom Controls (Size & Rotation Sliders) */}
      {hasPermission !== false && (
        <div className="absolute bottom-0 left-0 w-full p-4 sm:p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-30 pb-8 sm:pb-10">
          <div className="bg-black/40 backdrop-blur-2xl border border-white/10 p-4 sm:p-5 rounded-[2rem] max-w-md mx-auto shadow-2xl space-y-4">
            
            {/* Size Slider */}
            <div>
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-white/80 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><ZoomIn size={14}/> Size</span>
                <span className="bg-indigo-600/80 text-white font-black text-[10px] px-2 py-0.5 rounded text-center min-w-[36px]">{sizePercentage}%</span>
              </div>
              <input
                type="range"
                min={minSize}
                max={maxSize}
                value={stickerSize}
                onChange={(e) => setStickerSize(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
              />
            </div>

            {/* Rotation Slider (WOW Factor) */}
            <div>
              <div className="flex items-center justify-between mb-3 px-2">
                <span className="text-white/80 text-[10px] sm:text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><RotateCw size={14}/> Tilt</span>
                <span className="bg-indigo-600/80 text-white font-black text-[10px] px-2 py-0.5 rounded text-center min-w-[36px]">{rotation}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-indigo-500 h-2 bg-white/20 rounded-full appearance-none cursor-pointer"
              />
            </div>

          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {isSupported && (
        <button
          onClick={startCamera}
          className="w-full flex items-center justify-center gap-2 bg-indigo-50 text-indigo-600 font-black py-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all duration-300 border border-indigo-100 shadow-sm group mt-4 active:scale-95"
        >
          <Scan size={20} className="group-hover:scale-110 transition-transform" />
          Live Try-On (AR)
        </button>
      )}

      {mounted && isOpen && createPortal(arModal, document.body)}
    </>
  );
}