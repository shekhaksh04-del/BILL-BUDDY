import React, { useState } from 'react';
import { Sparkles, AlertCircle, Percent, DollarSign, Users, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { BillFormState } from '../types';
import { formatCurrency } from '../utils/billCalculator';

interface BillFormProps {
  formState: BillFormState;
  onChange: (fields: Partial<BillFormState>) => void;
  onSplitBill: () => void;
  currency: string;
  memberCount: number;
  onSyncPeopleCount: (count: number) => void;
}

export const BillForm: React.FC<BillFormProps> = ({
  formState,
  onChange,
  onSplitBill,
  currency,
  memberCount,
  onSyncPeopleCount,
}) => {
  const [showTaxTip, setShowTaxTip] = useState(false);
  const [touched, setTouched] = useState({
    occasionName: false,
    billAmount: false,
    numberOfPeople: false,
    taxPercent: false,
    tip: false,
  });

  const rawAmount = parseFloat(formState.billAmount);

  // Validation rules (flag negatives immediately even if not yet blurred)
  const isNegativeAmount = formState.billAmount.trim().startsWith('-') || (!isNaN(rawAmount) && rawAmount < 0);
  const isNegativePeople = formState.numberOfPeople < 1;

  const occasionError =
    touched.occasionName && !formState.occasionName.trim()
      ? 'Occasion name is required (e.g., Birthday Party, Dinner).'
      : '';

  let amountError = '';
  if (isNegativeAmount) {
    amountError = 'Negative amounts are invalid. Bill must be a positive number greater than zero.';
  } else if (touched.billAmount) {
    if (formState.billAmount.trim() === '') {
      amountError = 'Bill amount cannot be empty.';
    } else if (isNaN(rawAmount)) {
      amountError = 'Please enter a valid numeric amount.';
    } else if (rawAmount === 0) {
      amountError = 'Bill amount must be greater than zero.';
    } else if (formState.billAmount.includes('.') && formState.billAmount.split('.')[1].length > 2) {
      amountError = 'Maximum 2 decimal places allowed (e.g., 5000.00).';
    }
  }

  let peopleError = '';
  if (isNegativePeople) {
    peopleError = 'Number of people cannot be zero or negative. Minimum 1 person required.';
  } else if (touched.numberOfPeople) {
    if (!Number.isInteger(formState.numberOfPeople)) {
      peopleError = 'Number of people must be a whole number.';
    }
  }

  const rawTax = parseFloat(formState.taxPercent || '0');
  const taxError =
    touched.taxPercent && (isNaN(rawTax) || rawTax < 0 || rawTax > 100)
      ? 'Tax percentage must be between 0% and 100%.'
      : '';

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange({ billAmount: val });
  };

  const handlePeopleChange = (newCount: number) => {
    const cleanCount = Math.max(1, Math.floor(newCount));
    onChange({ numberOfPeople: cleanCount });
    onSyncPeopleCount(cleanCount);
  };

  // Preview calculations
  const parsedSubtotal = !isNaN(rawAmount) && rawAmount > 0 ? rawAmount : 0;
  const parsedTaxPercent = !isNaN(rawTax) && rawTax >= 0 ? rawTax : 0;
  const taxPreview = Math.round(parsedSubtotal * (parsedTaxPercent / 100) * 100) / 100;

  let tipPreview = 0;
  if (formState.tipType === 'percentage') {
    const pTip = parseFloat(formState.tipPercent || '0');
    if (!isNaN(pTip) && pTip > 0) {
      tipPreview = Math.round(parsedSubtotal * (pTip / 100) * 100) / 100;
    }
  } else {
    const fTip = parseFloat(formState.fixedTipAmount || '0');
    if (!isNaN(fTip) && fTip > 0) {
      tipPreview = Math.round(fTip * 100) / 100;
    }
  }
  const estimatedTotal = parsedSubtotal + taxPreview + tipPreview;

  const isFormValid =
    formState.occasionName.trim().length > 0 &&
    !isNaN(rawAmount) &&
    rawAmount > 0 &&
    formState.numberOfPeople >= 1 &&
    !amountError &&
    !taxError;

  return (
    <div className="bg-white dark:bg-[#121c19] rounded-2xl border border-[#e2eee7] dark:border-[#1d3028] shadow-[0_10px_30px_-4px_rgba(18,43,31,0.05)] p-5 sm:p-6 transition-colors">
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#eef5f1] dark:border-[#1d3028]">
        <div>
          <h2 className="text-base sm:text-lg font-extrabold text-[#111827] dark:text-white flex items-center gap-2">
            <span>1. Create Bill</span>
          </h2>
          <p className="text-xs text-[#4b5563] dark:text-[#9ca3af] mt-0.5 font-medium">
            Enter the occasion details and total amount to split
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Occasion Name */}
        <div>
          <label className="block text-xs font-bold text-[#1f2937] dark:text-[#e5e7eb] mb-1.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Occasion / Event Name <span className="text-rose-500">*</span>
            </span>
            <span className="text-[11px] font-medium text-[#6b7280] dark:text-[#9ca3af]">e.g. Birthday Party, Goa Trip</span>
          </label>
          <input
            type="text"
            value={formState.occasionName}
            onChange={(e) => onChange({ occasionName: e.target.value })}
            onBlur={() => setTouched((prev) => ({ ...prev, occasionName: true }))}
            placeholder="e.g. Birthday Party, Friday Dinner, Office Lunch"
            className={`w-full px-4 py-2.5 rounded-xl bg-[#f8faf9] dark:bg-[#182823] border text-[#111827] dark:text-[#f3f4f6] text-sm focus:outline-none focus:ring-2 font-medium transition shadow-2xs ${
              occasionError
                ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                : 'border-[#d6e5dd] dark:border-[#21372e] focus:ring-emerald-500 focus:border-emerald-500'
            }`}
          />
          {occasionError && (
            <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {occasionError}
            </p>
          )}
        </div>

        {/* Bill Amount & Number of People in Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Bill Amount */}
          <div>
            <label className="block text-xs font-bold text-[#1f2937] dark:text-[#e5e7eb] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                Bill Amount ({currency}) <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-mono text-[#6b7280] dark:text-[#9ca3af]">2 decimals</span>
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-emerald-600 dark:text-emerald-400 font-mono font-bold text-sm pointer-events-none">
                {currency}
              </span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formState.billAmount}
                onChange={handleAmountChange}
                onBlur={() => setTouched((prev) => ({ ...prev, billAmount: true }))}
                placeholder="5000.00"
                className={`w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#f8faf9] dark:bg-[#182823] border font-mono font-semibold text-[#111827] dark:text-[#f3f4f6] text-sm focus:outline-none focus:ring-2 transition shadow-2xs ${
                  amountError
                    ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/50 dark:bg-rose-950/20'
                    : 'border-[#d6e5dd] dark:border-[#21372e] focus:ring-emerald-500 focus:border-emerald-500'
                }`}
              />
            </div>
            {amountError && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {amountError}
              </p>
            )}
          </div>

          {/* Number of People */}
          <div>
            <label className="block text-xs font-bold text-[#1f2937] dark:text-[#e5e7eb] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Number of People <span className="text-rose-500">*</span>
              </span>
              <span className="text-[11px] font-medium text-[#6b7280] dark:text-[#9ca3af]">Current: {memberCount}</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePeopleChange(formState.numberOfPeople - 1)}
                disabled={formState.numberOfPeople <= 2}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#182823] border border-[#d6e5dd] dark:border-[#21372e] text-[#111827] dark:text-[#f3f4f6] font-extrabold hover:bg-emerald-50 dark:hover:bg-[#1f372f] hover:border-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center text-lg btn-tactile cursor-pointer"
                title="Decrease members"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                step="1"
                value={formState.numberOfPeople}
                onChange={(e) => handlePeopleChange(parseInt(e.target.value) || 1)}
                onBlur={() => setTouched((prev) => ({ ...prev, numberOfPeople: true }))}
                className={`w-full py-2.5 px-3 rounded-xl bg-[#f8faf9] dark:bg-[#182823] border text-center font-bold text-[#111827] dark:text-[#f3f4f6] text-sm focus:outline-none focus:ring-2 shadow-2xs ${
                  peopleError
                    ? 'border-rose-400 focus:ring-rose-400'
                    : 'border-[#d6e5dd] dark:border-[#21372e] focus:ring-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => handlePeopleChange(formState.numberOfPeople + 1)}
                className="w-10 h-10 rounded-xl bg-white dark:bg-[#182823] border border-[#d6e5dd] dark:border-[#21372e] text-[#111827] dark:text-[#f3f4f6] font-extrabold hover:bg-emerald-50 dark:hover:bg-[#1f372f] hover:border-emerald-400 transition flex items-center justify-center text-lg btn-tactile cursor-pointer"
                title="Increase members"
              >
                +
              </button>
            </div>
            {peopleError && (
              <p className="mt-1.5 text-xs text-rose-500 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                {peopleError}
              </p>
            )}
          </div>
        </div>

        {/* Optional Tip and Tax Section Accordion */}
        <div className="rounded-2xl border border-[#dce8e1] dark:border-[#1d3028] bg-[#f8faf9]/90 dark:bg-[#14231e]/60 overflow-hidden transition shadow-2xs">
          <button
            type="button"
            onClick={() => setShowTaxTip(!showTaxTip)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-bold text-[#1f2937] dark:text-[#f3f4f6] hover:bg-emerald-50/50 dark:hover:bg-[#1a2e27] transition cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-300">
                <Percent className="w-3.5 h-3.5" />
              </div>
              <span className="font-bold">Optional Tax & Tip Calculator</span>
              {(taxPreview > 0 || tipPreview > 0) && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-extrabold shadow-2xs">
                  + {formatCurrency(taxPreview + tipPreview, currency)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
              <span>{showTaxTip ? 'Close' : 'Configure'}</span>
              {showTaxTip ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </div>
          </button>

          {showTaxTip && (
            <div className="p-4 pt-1 border-t border-[#e2eee7] dark:border-[#1d3028] space-y-4">
              {/* Tax configuration */}
              <div>
                <label className="block text-xs font-bold text-[#1f2937] dark:text-[#e5e7eb] mb-1.5 flex items-center justify-between">
                  <span>Tax / GST Percentage (%)</span>
                  {taxPreview > 0 && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                      Tax: +{formatCurrency(taxPreview, currency)}
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={formState.taxPercent}
                      onChange={(e) => {
                        setTouched((p) => ({ ...p, taxPercent: true }));
                        onChange({ taxPercent: e.target.value });
                      }}
                      placeholder="0"
                      className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-[#182823] border border-[#d6e5dd] dark:border-[#21372e] text-[#111827] dark:text-[#f3f4f6] text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    />
                    <span className="absolute right-3 top-2 text-xs text-[#6b7280] font-bold">%</span>
                  </div>
                  {/* Preset Tax Chips */}
                  <div className="flex gap-1.5">
                    {[0, 5, 12, 18].map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => onChange({ taxPercent: t.toString() })}
                        className={`px-2.5 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer btn-tactile ${
                          formState.taxPercent === t.toString()
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                            : 'bg-white dark:bg-[#182823] text-[#374151] dark:text-[#d1d5db] border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400'
                        }`}
                      >
                        {t}%
                      </button>
                    ))}
                  </div>
                </div>
                {taxError && (
                  <p className="mt-1 text-xs text-rose-500 font-medium">{taxError}</p>
                )}
              </div>

              {/* Tip configuration */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#1f2937] dark:text-[#e5e7eb]">
                    Tip / Gratuity
                  </label>
                  {tipPreview > 0 && (
                    <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono font-bold">
                      Tip: +{formatCurrency(tipPreview, currency)}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => onChange({ tipType: 'percentage' })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer btn-tactile ${
                      formState.tipType === 'percentage'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#182823] text-[#4b5563] dark:text-[#d1d5db] border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-300'
                    }`}
                  >
                    Tip by %
                  </button>
                  <button
                    type="button"
                    onClick={() => onChange({ tipType: 'fixed' })}
                    className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer btn-tactile ${
                      formState.tipType === 'fixed'
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                        : 'bg-white dark:bg-[#182823] text-[#4b5563] dark:text-[#d1d5db] border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-300'
                    }`}
                  >
                    Fixed Amount ({currency})
                  </button>
                </div>

                {formState.tipType === 'percentage' ? (
                  <div className="space-y-1.5">
                    <div className="flex gap-1.5">
                      {[0, 5, 10, 15, 20].map((tp) => (
                        <button
                          key={tp}
                          type="button"
                          onClick={() => onChange({ tipPercent: tp.toString() })}
                          className={`flex-1 py-1.5 text-xs rounded-xl font-bold transition-all cursor-pointer btn-tactile ${
                            formState.tipPercent === tp.toString()
                              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs'
                              : 'bg-white dark:bg-[#182823] text-[#374151] dark:text-[#d1d5db] border border-[#d6e5dd] dark:border-[#21372e] hover:border-emerald-400'
                          }`}
                        >
                          {tp}%
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-emerald-600 dark:text-emerald-400 font-mono text-xs pointer-events-none font-bold">
                      {currency}
                    </span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formState.fixedTipAmount}
                      onChange={(e) => onChange({ fixedTipAmount: e.target.value })}
                      placeholder="e.g. 100.00"
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-white dark:bg-[#182823] border border-[#d6e5dd] dark:border-[#21372e] text-[#111827] dark:text-[#f3f4f6] text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500 shadow-2xs"
                    />
                  </div>
                )}
              </div>

              {/* Total Summary Preview Box */}
              <div className="mt-3 p-3.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-900/60 text-xs space-y-1.5">
                <div className="flex justify-between text-[#374151] dark:text-[#d1d5db] font-medium">
                  <span>Base Bill:</span>
                  <span className="font-mono font-bold text-[#111827] dark:text-white">{formatCurrency(parsedSubtotal, currency)}</span>
                </div>
                {taxPreview > 0 && (
                  <div className="flex justify-between text-[#374151] dark:text-[#d1d5db] font-medium">
                    <span>Tax ({formState.taxPercent}%):</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">+{formatCurrency(taxPreview, currency)}</span>
                  </div>
                )}
                {tipPreview > 0 && (
                  <div className="flex justify-between text-[#374151] dark:text-[#d1d5db] font-medium">
                    <span>Tip:</span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">+{formatCurrency(tipPreview, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-[#111827] dark:text-white pt-1.5 border-t border-emerald-200 dark:border-emerald-800 text-sm">
                  <span>Estimated Total:</span>
                  <span className="font-mono text-emerald-700 dark:text-emerald-300 font-extrabold">{formatCurrency(estimatedTotal, currency)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Split Bill Action Button with Clean Mint Gradient and Shimmer Animation */}
        <button
          type="button"
          onClick={() => {
            setTouched({
              occasionName: true,
              billAmount: true,
              numberOfPeople: true,
              taxPercent: true,
              tip: true,
            });
            if (!formState.billAmount.trim() || isNaN(rawAmount) || rawAmount <= 0) {
              return;
            }
            if (!formState.occasionName.trim()) {
              onChange({ occasionName: 'Shared Bill' });
            }
            onSplitBill();
          }}
          className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all group cursor-pointer ${
            !amountError && formState.billAmount.trim() !== '' && !isNegativeAmount
              ? 'btn-mint-primary animate-shimmer'
              : 'bg-emerald-700/80 hover:bg-emerald-600 text-white shadow-md'
          }`}
        >
          <Sparkles className="w-5 h-5 text-white transition-transform group-hover:rotate-12 group-hover:scale-110 duration-300" />
          <span>Split Bill Accurately</span>
        </button>
      </div>
    </div>
  );
};
