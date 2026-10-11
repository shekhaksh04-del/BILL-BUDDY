import React, { useState } from 'react';
import { X, Search, Trash2, ArrowUpRight, CheckCircle2, Clock, Calendar, Download, AlertTriangle } from 'lucide-react';
import { BillHistoryRecord } from '../types';
import { formatCurrency, downloadReceiptImage } from '../utils/billCalculator';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: BillHistoryRecord[];
  onLoadRecord: (record: BillHistoryRecord) => void;
  onDeleteRecord: (id: string) => void;
  onClearAll: () => void;
  onShowToast: (msg: string) => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onLoadRecord,
  onDeleteRecord,
  onClearAll,
  onShowToast,
}) => {
  const [search, setSearch] = useState('');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) =>
    item.occasionName.toLowerCase().includes(search.toLowerCase())
  );

  const handleDownloadFromHistory = (item: BillHistoryRecord) => {
    const fullCalc = {
      id: item.id,
      occasionName: item.occasionName,
      subtotal: item.subtotal,
      taxPercent: 0,
      taxAmount: item.taxAmount,
      tipAmount: item.tipAmount,
      tipLabel: item.tipAmount > 0 ? 'Included' : '',
      grandTotal: item.grandTotal,
      memberShares: item.memberShares,
      sumOfShares: item.grandTotal,
      discrepancy: 0,
      isExactMatch: true,
      currency: item.currency,
      calculatedAt: item.createdAt,
    };
    downloadReceiptImage(fullCalc);
    onShowToast(`Downloaded receipt for ${item.occasionName}! 📥`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-[#121c19] rounded-3xl border border-[#e2eee7] dark:border-[#1d3028] shadow-[0_20px_50px_rgba(0,0,0,0.15)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden transition-colors">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#eef5f1] dark:border-[#1d3028] flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
              <span>Split History</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100/90 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold border border-emerald-300/60">
                {history.length} {history.length === 1 ? 'Record' : 'Records'}
              </span>
            </h3>
            <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] mt-0.5 font-medium">
              Track and recall your past bills anytime
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6b7280] hover:text-[#111827] dark:hover:text-white rounded-xl hover:bg-[#f3f7f4] dark:hover:bg-[#192b25] transition btn-tactile cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#eef5f1] dark:border-[#1d3028] bg-[#f8faf9] dark:bg-[#15231f] flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by occasion (e.g. Birthday, Goa, Dinner)..."
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white dark:bg-[#182823] border border-[#d6e5dd] dark:border-[#21372e] rounded-xl text-[#111827] dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-2xs"
            />
          </div>

          {history.length > 0 && !showConfirmClear && (
            <button
              onClick={() => setShowConfirmClear(true)}
              className="text-xs text-rose-600 dark:text-rose-400 hover:text-rose-700 font-bold px-3 py-2 rounded-xl border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition flex items-center gap-1.5 flex-shrink-0 btn-tactile cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Clear All</span>
            </button>
          )}
        </div>

        {/* Clear Confirmation Banner */}
        {showConfirmClear && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border-b border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
            <span className="flex items-center gap-1.5 font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Are you sure? This will delete all past records permanently.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  onClearAll();
                  setShowConfirmClear(false);
                }}
                className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 cursor-pointer btn-tactile"
              >
                Yes, Clear
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1 bg-white dark:bg-[#182823] text-[#374151] dark:text-[#d1d5db] rounded-lg font-bold border border-[#d6e5dd] cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* History List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {filteredHistory.length === 0 ? (
            <div className="text-center py-12 text-[#9ca3af] dark:text-[#6b7280]">
              <Calendar className="w-10 h-10 mx-auto mb-2 opacity-50 text-emerald-600" />
              <p className="text-sm font-extrabold text-[#111827] dark:text-white">No bills found in history</p>
              <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1 font-medium">
                {search ? 'Try a different search term' : 'Every calculated bill is safely stored here.'}
              </p>
            </div>
          ) : (
            filteredHistory.map((item) => {
              const formattedDate = new Date(item.createdAt).toLocaleDateString();
              const formattedTime = new Date(item.createdAt).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-[#e2eee7] dark:border-[#1d3028] bg-white dark:bg-[#182823] hover:border-emerald-300 dark:hover:border-emerald-700 shadow-2xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  {/* Left Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm sm:text-base text-[#111827] dark:text-white">
                        {item.occasionName}
                      </h4>
                      {item.isFullyPaid ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300/60">
                          <CheckCircle2 className="w-3 h-3" /> Fully Paid
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1 border border-amber-300/60">
                          <Clock className="w-3 h-3" /> {item.paidCount}/{item.numberOfPeople} Paid
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-[#6b7280] dark:text-[#9ca3af] mt-1 font-medium">
                      <span>{formattedDate} • {formattedTime}</span>
                      <span>•</span>
                      <span>{item.numberOfPeople} People</span>
                    </div>
                  </div>

                  {/* Right: Amount & Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#eef5f1] dark:border-[#1d3028]">
                    <div className="text-left sm:text-right">
                      <div className="font-mono font-extrabold text-base sm:text-lg text-[#111827] dark:text-white">
                        {formatCurrency(item.grandTotal, item.currency)}
                      </div>
                      <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af] block font-medium">
                        Collected: {formatCurrency(item.totalCollected, item.currency)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleDownloadFromHistory(item)}
                        className="p-2 text-[#4b5563] hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-[#1f372f] rounded-xl transition btn-tactile cursor-pointer"
                        title="Download Receipt"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          onLoadRecord(item);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold btn-mint-primary shadow-2xs transition cursor-pointer"
                        title="Load into Editor"
                      >
                        <span>Open</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteRecord(item.id)}
                        className="p-2 text-[#9ca3af] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition btn-tactile cursor-pointer"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
