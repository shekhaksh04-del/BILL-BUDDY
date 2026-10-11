import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Users, Receipt, Share2, CheckCircle2, ChevronUp, ChevronDown, HelpCircle, HeartHandshake } from 'lucide-react';

interface IntroSectionProps {
  onDismiss?: () => void;
}

export const IntroSection: React.FC<IntroSectionProps> = () => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('billbuddy_intro_collapsed');
      return saved !== 'true';
    } catch {
      return true;
    }
  });

  const toggleExpand = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('billbuddy_intro_collapsed', (!next).toString());
      } catch {}
      return next;
    });
  };

  return (
    <div className="mb-6 rounded-3xl border border-[#d6e8dd] dark:border-[#1d3329] bg-gradient-to-r from-emerald-500/10 via-teal-400/8 to-emerald-400/10 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 p-4 sm:p-6 shadow-[0_8px_25px_-5px_rgba(16,185,129,0.08)] backdrop-blur-xs transition-all">
      {/* Header bar of Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 flex-shrink-0">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white tracking-tight">
                Welcome to BILL BUDDY! 🎉
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-800">
                Quick Guide
              </span>
            </div>
            <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] mt-0.5 font-medium">
              The hassle-free way to split group bills, dinner tabs & trips without awkward math.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleExpand}
          className="self-end sm:self-auto flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#15241f] text-emerald-800 dark:text-emerald-300 border border-[#d2e4d9] dark:border-[#21372e] hover:border-emerald-400 btn-tactile cursor-pointer"
        >
          <span>{isExpanded ? 'Hide Intro' : 'How it works'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Expanded Intro Content */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-[#d8e8de] dark:border-[#1d352b] space-y-4 animate-fadeIn">
          {/* 4 Feature Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Step 1 */}
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#121f1a]/90 border border-[#e2eee7] dark:border-[#1f372d] shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-extrabold text-xs mb-2">
                1
              </div>
              <h3 className="text-xs font-extrabold text-[#111827] dark:text-white flex items-center gap-1">
                <span>Enter Bill & Occasion</span>
              </h3>
              <p className="text-[11px] text-[#4b5563] dark:text-[#9ca3af] mt-1 leading-relaxed">
                Add occasion (e.g. Birthday Party, Goa Trip), bill amount, and optional GST tax or tip.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#121f1a]/90 border border-[#e2eee7] dark:border-[#1f372d] shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-extrabold text-xs mb-2">
                2
              </div>
              <h3 className="text-xs font-extrabold text-[#111827] dark:text-white flex items-center gap-1">
                <span>Customize Members</span>
              </h3>
              <p className="text-[11px] text-[#4b5563] dark:text-[#9ca3af] mt-1 leading-relaxed">
                Starts with Person 1 & 2. Rename friends, pick colorful avatars, and add more members anytime.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#121f1a]/90 border border-[#e2eee7] dark:border-[#1f372d] shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-700 dark:text-emerald-300 font-extrabold text-xs mb-2">
                3
              </div>
              <h3 className="text-xs font-extrabold text-[#111827] dark:text-white flex items-center gap-1">
                <span>100% Exact Split</span>
              </h3>
              <p className="text-[11px] text-[#4b5563] dark:text-[#9ca3af] mt-1 leading-relaxed">
                Zero float drift. Remainder cents/paise are balanced so total shares strictly match the bill.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-3.5 rounded-2xl bg-white/90 dark:bg-[#121f1a]/90 border border-[#e2eee7] dark:border-[#1f372d] shadow-2xs">
              <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-700 dark:text-teal-300 font-extrabold text-xs mb-2">
                4
              </div>
              <h3 className="text-xs font-extrabold text-[#111827] dark:text-white flex items-center gap-1">
                <span>Track & Share Slip</span>
              </h3>
              <p className="text-[11px] text-[#4b5563] dark:text-[#9ca3af] mt-1 leading-relaxed">
                Toggle Paid vs Pending, check remaining balances, and export high-res receipt or WhatsApp summary!
              </p>
            </div>
          </div>

          {/* Quick value badges */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#13221d] text-emerald-800 dark:text-emerald-300 font-bold border border-[#d6e5dd] dark:border-[#21372e]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Guaranteed Penny Match
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#13221d] text-teal-800 dark:text-teal-300 font-bold border border-[#d6e5dd] dark:border-[#21372e]">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Clean Mint Theme
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#13221d] text-[#374151] dark:text-[#d1d5db] font-bold border border-[#d6e5dd] dark:border-[#21372e]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Persistent Local Storage
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white/80 dark:bg-[#13221d] text-[#374151] dark:text-[#d1d5db] font-bold border border-[#d6e5dd] dark:border-[#21372e]">
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              Direct WhatsApp Share
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
