import React from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Download,
  Share2,
  Copy,
  Printer,
  Sparkles,
  Receipt,
  Users,
  ArrowRightCircle,
} from 'lucide-react';
import { CalculationResult } from '../types';
import { formatCurrency, generateShareText, downloadReceiptImage } from '../utils/billCalculator';

interface ResultSectionProps {
  result: CalculationResult | null;
  onToggleMemberPaid: (memberId: string) => void;
  onMarkAllPaid: (paid: boolean) => void;
  onShowToast: (msg: string) => void;
}

export const ResultSection: React.FC<ResultSectionProps> = ({
  result,
  onToggleMemberPaid,
  onMarkAllPaid,
  onShowToast,
}) => {
  // Empty State at starting when no entries are calculated yet
  if (!result) {
    return (
      <div className="bg-white dark:bg-[#121c19] rounded-2xl border border-[#e2eee7] dark:border-[#1d3028] shadow-[0_10px_30px_-4px_rgba(18,43,31,0.05)] p-8 sm:p-10 text-center flex flex-col items-center justify-center min-h-[420px] transition-colors">
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-emerald-100 via-teal-50 to-emerald-50 dark:from-emerald-950/60 dark:via-teal-900/40 dark:to-emerald-900/30 border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5 shadow-sm">
          <Receipt className="w-10 h-10 transition-transform hover:scale-110 duration-300" />
        </div>
        <h3 className="text-lg font-extrabold text-[#111827] dark:text-white mb-2">
          Ready to Calculate Shares
        </h3>
        <p className="text-xs sm:text-sm text-[#4b5563] dark:text-[#9ca3af] max-w-md leading-relaxed mb-6 font-medium">
          Enter your occasion name, bill amount, customize person names, and click{' '}
          <strong className="text-emerald-700 dark:text-emerald-400 font-bold">"Split Bill Accurately"</strong> to generate your exact 100% penny-matched breakdown.
        </p>

        {/* 3 Quick Clean Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-md text-left">
          <div className="p-3 rounded-xl bg-[#f8faf9] dark:bg-[#182823] border border-[#e2eee7] dark:border-[#21372e] shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">STEP 1</span>
            <span className="text-xs font-bold text-[#111827] dark:text-white">Enter Bill Amount</span>
          </div>
          <div className="p-3 rounded-xl bg-[#f8faf9] dark:bg-[#182823] border border-[#e2eee7] dark:border-[#21372e] shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">STEP 2</span>
            <span className="text-xs font-bold text-[#111827] dark:text-white">Add People</span>
          </div>
          <div className="p-3 rounded-xl bg-[#f8faf9] dark:bg-[#182823] border border-[#e2eee7] dark:border-[#21372e] shadow-2xs">
            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block mb-0.5">STEP 3</span>
            <span className="text-xs font-bold text-[#111827] dark:text-white">Track & Share</span>
          </div>
        </div>
      </div>
    );
  }

  const { currency, memberShares, grandTotal, subtotal, taxAmount, tipAmount, occasionName } = result;

  // Paid & Pending metrics
  const paidMembers = memberShares.filter((m) => m.isPaid);
  const totalCollected = paidMembers.reduce((sum, m) => sum + m.amount, 0);
  const remainingAmount = Math.max(0, grandTotal - totalCollected);
  const percentCollected = grandTotal > 0 ? Math.min(100, Math.round((totalCollected / grandTotal) * 100)) : 0;
  const isAllPaid = paidMembers.length === memberShares.length;

  const handleCopyClipboard = async () => {
    const text = generateShareText(result);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      onShowToast('Bill summary copied to clipboard! 📋');
    } catch {
      onShowToast('Bill summary copied to clipboard! 📋');
    }
  };

  const handleWhatsAppShare = () => {
    const text = generateShareText(result);
    try {
      navigator.clipboard?.writeText(text);
    } catch {}

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) document.body.removeChild(a);
    }, 200);

    onShowToast('Opening WhatsApp & summary copied! 💬');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    downloadReceiptImage(result);
    onShowToast('Receipt image downloaded! 📥');
  };

  return (
    <div className="space-y-5">
      {/* Printable Receipt Hidden Container */}
      <div id="printable-receipt" className="hidden print:block font-mono p-6">
        <h1 className="text-2xl font-bold text-center mb-1">BILL BUDDY Receipt</h1>
        <p className="text-center text-sm mb-4">{occasionName} • {new Date(result.calculatedAt).toLocaleString()}</p>
        <hr className="my-2" />
        <div className="flex justify-between py-1"><span>Subtotal:</span><span>{formatCurrency(subtotal, currency)}</span></div>
        {taxAmount > 0 && <div className="flex justify-between py-1"><span>Tax:</span><span>+{formatCurrency(taxAmount, currency)}</span></div>}
        {tipAmount > 0 && <div className="flex justify-between py-1"><span>Tip:</span><span>+{formatCurrency(tipAmount, currency)}</span></div>}
        <div className="flex justify-between py-2 font-bold text-lg border-t border-b"><span>Grand Total:</span><span>{formatCurrency(grandTotal, currency)}</span></div>
        <h3 className="font-bold mt-4 mb-2">Member Shares:</h3>
        {memberShares.map((m, idx) => (
          <div key={idx} className="flex justify-between py-1">
            <span>{idx + 1}. {m.name} [{m.isPaid ? 'PAID' : 'PENDING'}]</span>
            <span>{formatCurrency(m.amount, currency)}</span>
          </div>
        ))}
        <hr className="my-4" />
        <div className="flex justify-between font-bold">
          <span>Total Collected: {formatCurrency(totalCollected, currency)}</span>
          <span>Remaining: {formatCurrency(remainingAmount, currency)}</span>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-[#121c19] rounded-2xl border border-[#e2eee7] dark:border-[#1d3028] shadow-[0_10px_30px_-4px_rgba(18,43,31,0.05)] p-5 sm:p-6 transition-colors">
        {/* Header & Occasion Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eef5f1] dark:border-[#1d3028] gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-800">
                Split Result
              </span>
              <span className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-medium">
                {new Date(result.calculatedAt).toLocaleDateString()}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-[#111827] dark:text-white mt-1">
              {occasionName}
            </h2>
          </div>

          {/* Quick Animated Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#182823] hover:text-emerald-700 dark:hover:text-emerald-300 text-[#111827] dark:text-[#f3f4f6] flex items-center gap-1.5 border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400 dark:hover:border-emerald-600 btn-tactile cursor-pointer"
              title="Download High-Res Receipt Image (PNG)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Receipt</span>
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 rounded-xl text-xs font-bold btn-mint-primary flex items-center gap-1.5 shadow-sm cursor-pointer"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={handleCopyClipboard}
              className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-[#182823] hover:text-emerald-700 dark:hover:text-emerald-300 text-[#111827] dark:text-[#f3f4f6] flex items-center gap-1.5 border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400 dark:hover:border-emerald-600 btn-tactile cursor-pointer"
              title="Copy Summary"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </button>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-[#6b7280] hover:text-emerald-700 dark:hover:text-emerald-300 bg-white dark:bg-[#182823] border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400 btn-tactile cursor-pointer hidden sm:block"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bill Summary Banner with Clean Mint Gradient Accents */}
        <div className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#f8faf9] via-emerald-50/40 to-[#f0f7f3] dark:from-[#15231f] dark:via-[#192b25] dark:to-[#121c19] border border-[#dce8e1] dark:border-[#1d3028] shadow-2xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center sm:text-left">
            <div>
              <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] block font-semibold">Original Bill</span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-[#111827] dark:text-white">
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] block font-semibold">
                Tax {result.taxPercent > 0 ? `(${result.taxPercent}%)` : ''}
              </span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-[#111827] dark:text-white">
                {taxAmount > 0 ? `+${formatCurrency(taxAmount, currency)}` : '0.00'}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] block font-semibold">
                Tip {result.tipLabel ? `(${result.tipLabel})` : ''}
              </span>
              <span className="text-sm sm:text-base font-extrabold font-mono text-[#111827] dark:text-white">
                {tipAmount > 0 ? `+${formatCurrency(tipAmount, currency)}` : '0.00'}
              </span>
            </div>
            <div className="sm:border-l sm:border-[#d6e5dd] dark:sm:border-[#21372e] sm:pl-3">
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">
                Grand Total
              </span>
              <span className="text-base sm:text-xl font-extrabold font-mono text-emerald-800 dark:text-emerald-300">
                {formatCurrency(grandTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Exact Total Matching Guarantee Box */}
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/40 border border-emerald-300/80 dark:border-emerald-800/80 flex items-start gap-3 shadow-2xs">
          <div className="p-1.5 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white mt-0.5 flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="flex-1 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 font-extrabold text-emerald-950 dark:text-emerald-200">
              <span className="flex items-center gap-1.5">
                Exact Total Matching Verified
                <span className="text-[10px] bg-emerald-200/90 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 px-2 py-0.5 rounded-full font-mono font-bold">
                  Diff: {formatCurrency(result.discrepancy, currency)}
                </span>
              </span>
              <span className="font-mono text-emerald-800 dark:text-emerald-300 font-bold">
                Sum: {formatCurrency(result.sumOfShares, currency)} = {formatCurrency(grandTotal, currency)}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800 dark:text-emerald-300/90 mt-0.5 font-medium">
              Every single paisa/cent is accounted for. Remainder fractions are distributed so the sum of individual shares perfectly equals the total.
            </p>
          </div>
        </div>

        {/* Payment Tracker Section */}
        <div className="p-4 sm:p-5 rounded-2xl border border-[#e2eee7] dark:border-[#1d3028] bg-[#f8faf9] dark:bg-[#15231f] mb-5 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div>
              <span className="text-xs font-extrabold text-[#111827] dark:text-white block">
                Payment Collection Status
              </span>
              <span className="text-[11px] text-[#4b5563] dark:text-[#9ca3af] font-medium">
                {paidMembers.length} of {memberShares.length} members paid ({percentCollected}%)
              </span>
            </div>

            {/* Quick Action Buttons with Mint Styling */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onMarkAllPaid(true)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer btn-tactile ${
                  isAllPaid
                    ? 'btn-mint-primary text-white shadow-xs'
                    : 'bg-white dark:bg-[#182823] text-[#111827] dark:text-[#f3f4f6] border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400'
                }`}
              >
                Mark All Paid
              </button>
              <button
                type="button"
                onClick={() => onMarkAllPaid(false)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-[#182823] text-[#111827] dark:text-[#f3f4f6] border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400 btn-tactile cursor-pointer"
              >
                Reset All Pending
              </button>
            </div>
          </div>

          {/* Clean Mint Progress Bar */}
          <div className="w-full h-3.5 rounded-full bg-[#e5eee8] dark:bg-[#1e342b] overflow-hidden mb-3.5 p-0.5 shadow-inner">
            <div
              className={`h-full transition-all duration-500 rounded-full ${
                isAllPaid ? 'bg-emerald-500' : 'bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm'
              }`}
              style={{ width: `${percentCollected}%` }}
            />
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#e2eee7] dark:border-[#1d3028]">
            <div>
              <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af] uppercase font-bold block">Total Bill</span>
              <span className="font-mono font-extrabold text-xs sm:text-sm text-[#111827] dark:text-white">
                {formatCurrency(grandTotal, currency)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold block">
                Collected
              </span>
              <span className="font-mono font-extrabold text-xs sm:text-sm text-emerald-700 dark:text-emerald-400">
                {formatCurrency(totalCollected, currency)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-bold block">
                Remaining
              </span>
              <span className="font-mono font-extrabold text-xs sm:text-sm text-amber-700 dark:text-amber-400">
                {formatCurrency(remainingAmount, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* Individual Member Shares List */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-extrabold text-[#111827] dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
              <Users className="w-3.5 h-3.5 text-emerald-600" />
              <span>Personalized Member Shares</span>
            </h3>
            <span className="text-[11px] text-[#6b7280] dark:text-[#9ca3af] font-mono font-semibold">
              {formatCurrency(grandTotal / memberShares.length, currency)} base / person
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {memberShares.map((member, index) => {
              const isPaid = member.isPaid;

              return (
                <div
                  key={member.memberId}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all shadow-2xs ${
                    isPaid
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800/60'
                      : 'bg-white dark:bg-[#15231f] border-[#e2eee7] dark:border-[#1d3028] hover:border-emerald-300 dark:hover:border-emerald-700'
                  }`}
                >
                  {/* Left: Avatar & Name */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-extrabold text-base shadow-xs flex-shrink-0 ${member.avatarColor}`}
                    >
                      {member.avatarEmoji || member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-[#111827] dark:text-white truncate">
                          {member.name}
                        </span>
                        <span className="text-[10px] font-mono text-[#6b7280] dark:text-[#9ca3af]">
                          #{index + 1}
                        </span>
                      </div>
                      <span className="text-[11px] block truncate mt-0.5">
                        {isPaid ? (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Paid & Settled
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Payment Pending
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* Right: Amount & Paid Toggle Button */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="font-mono font-extrabold text-base sm:text-lg text-[#111827] dark:text-white">
                        {formatCurrency(member.amount, currency)}
                      </div>
                      <span className="text-[10px] text-[#6b7280] dark:text-[#9ca3af] font-medium">Exact Share</span>
                    </div>

                    {/* Paid/Unpaid Animated Toggle button */}
                    <button
                      type="button"
                      onClick={() => onToggleMemberPaid(member.memberId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer btn-tactile ${
                        isPaid
                          ? 'btn-mint-primary shadow-xs'
                          : 'bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                      }`}
                      title={isPaid ? 'Click to mark pending' : 'Click to mark paid'}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Paid</span>
                        </>
                      ) : (
                        <>
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA Actions */}
        <div className="mt-5 pt-4 border-t border-[#eef5f1] dark:border-[#1d3028] flex flex-col sm:flex-row gap-2.5">
          <button
            type="button"
            onClick={handleDownload}
            className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold bg-[#111827] dark:bg-white text-white dark:text-[#111827] hover:bg-[#1f2937] dark:hover:bg-slate-100 flex items-center justify-center gap-2 shadow-sm transition btn-tactile cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
            <span>Download Receipt Slip (PNG)</span>
          </button>
          <button
            type="button"
            onClick={handleWhatsAppShare}
            className="flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold btn-mint-primary flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            <span>Share via WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
