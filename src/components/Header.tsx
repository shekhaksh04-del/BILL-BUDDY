import React from 'react';
import { Sun, Moon, History, RefreshCw, Receipt, Sparkles } from 'lucide-react';
import { CURRENCIES } from '../utils/billCalculator';

interface HeaderProps {
  isDark: boolean;
  onToggleTheme: () => void;
  currency: string;
  onCurrencyChange: (curr: string) => void;
  historyCount: number;
  onOpenHistory: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isDark,
  onToggleTheme,
  currency,
  onCurrencyChange,
  historyCount,
  onOpenHistory,
  onReset,
}) => {
  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[#F8FAF9]/90 dark:bg-[#0c1613]/90 border-b border-[#e5efe9] dark:border-[#1a2d26] transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
        {/* Brand */}
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onReset}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/25 group-hover:scale-105 group-hover:shadow-emerald-500/40 transition-all duration-300">
            <Receipt className="w-5 h-5 transition-transform group-hover:rotate-6 duration-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#111827] dark:text-white">
                BILL <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">BUDDY</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800/80 shadow-2xs flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                Clean Mint
              </span>
            </div>
            <p className="text-[11px] text-[#4b5563] dark:text-[#9ca3af] hidden sm:block font-medium">
              Your smart companion for splitting bills fairly & accurately
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Currency Selector */}
          <div className="relative">
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="appearance-none bg-white dark:bg-[#14231e] text-[#111827] dark:text-[#f3f4f6] text-xs sm:text-sm font-bold rounded-xl px-3 py-2 pr-7 border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400 dark:hover:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs cursor-pointer btn-tactile"
              aria-label="Currency"
            >
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.symbol}>
                  {c.symbol} ({c.code})
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
              ▾
            </div>
          </div>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-[#14231e] text-[#1f2937] dark:text-[#f3f4f6] hover:text-emerald-700 dark:hover:text-emerald-300 border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400 dark:hover:border-emerald-600 btn-tactile cursor-pointer"
            title="View History"
          >
            <History className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">History</span>
            {historyCount > 0 && (
              <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-gradient-to-r from-emerald-600 to-teal-500 text-white min-w-4 shadow-xs">
                {historyCount}
              </span>
            )}
          </button>

          {/* Reset Current Bill */}
          <button
            onClick={onReset}
            className="p-2.5 rounded-xl text-[#4b5563] hover:text-emerald-600 dark:text-[#9ca3af] dark:hover:text-emerald-300 bg-white dark:bg-[#14231e] border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400 dark:hover:border-emerald-600 btn-tactile cursor-pointer"
            title="Start New Bill"
          >
            <RefreshCw className="w-4 h-4 transition-transform active:rotate-180 duration-300" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onToggleTheme();
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white dark:bg-[#14231e] text-[#1f2937] dark:text-[#f3f4f6] border border-[#d6e5dd] dark:border-[#21372e] hover:border-amber-400 dark:hover:border-amber-500 btn-tactile cursor-pointer transition shadow-2xs"
            title={isDark ? "Switch to Clean Mint Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle theme"
          >
            {isDark ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-amber-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
