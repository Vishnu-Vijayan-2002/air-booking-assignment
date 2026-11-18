import React, { useState } from 'react';
import { Plane, Sparkles, X, ArrowRight, Tag, Check, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SiteBanner = () => {
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);

  if (!visible) return null;

  const handleCopyCode = () => {
    navigator.clipboard.writeText('AIRFLY2026');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="relative bg-gradient-to-r from-sky-700 via-sky-600 to-cyan-600 text-white text-xs py-2.5 px-4 shadow-sm z-50 transition-all border-b border-sky-500/40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left: Airplane highlight */}
        <div className="flex items-center gap-2.5">
          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-white/20 text-white shadow-inner animate-pulse">
            <Plane className="w-3.5 h-3.5 -rotate-45" />
          </span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-wide uppercase bg-sky-900/60 text-sky-200 text-[10px] px-2 py-0.5 rounded-full border border-sky-400/30">
              Limited Offer
            </span>
            <span className="font-medium text-slate-100 hidden sm:inline">
              Get flat <strong>15% OFF</strong> on all domestic & international flight bookings
            </span>
            <span className="font-medium text-slate-100 sm:hidden">
              Flat <strong>15% OFF</strong> flights
            </span>
          </div>
        </div>

        {/* Center: Promo Code Badge */}
        <div className="flex items-center gap-2">
          <span className="text-sky-200 hidden md:inline">Use Coupon:</span>
          <button
            onClick={handleCopyCode}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/15 hover:bg-white/25 border border-white/30 rounded-lg font-mono font-bold text-white transition-all hover:scale-105"
            title="Click to copy promo code"
          >
            <Tag className="w-3 h-3 text-amber-300" />
            <span>AIRFLY2026</span>
            {copied ? (
              <Check className="w-3 h-3 text-emerald-300" />
            ) : (
              <span className="text-[10px] text-sky-200 font-normal">copy</span>
            )}
          </button>
        </div>

        {/* Right: CTA & Dismiss */}
        <div className="flex items-center gap-3">
          <Link
            to="/flights"
            className="hidden lg:inline-flex items-center gap-1 text-white font-bold underline hover:text-sky-100 decoration-sky-300"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <button
            onClick={() => setVisible(false)}
            className="p-1 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            title="Dismiss announcement"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
