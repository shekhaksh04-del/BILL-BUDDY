import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { IntroSection } from './components/IntroSection';
import { BillForm } from './components/BillForm';
import { MemberList } from './components/MemberList';
import { ResultSection } from './components/ResultSection';
import { HistoryModal } from './components/HistoryModal';
import { Toast } from './components/Toast';
import { BillFormState, Member, CalculationResult, BillHistoryRecord } from './types';
import { calculateExactSplit, AVATAR_COLORS, AVATAR_EMOJIS } from './utils/billCalculator';

const STORAGE_KEYS = {
  FORM: 'billbuddy_form_v1',
  MEMBERS: 'billbuddy_members_v1',
  RESULT: 'billbuddy_result_v1',
  HISTORY: 'billbuddy_history_v1',
  THEME: 'billbuddy_theme_v1',
  CURRENCY: 'billbuddy_currency_v1',
};

// Initial starting state with NO prefilled entries
const DEFAULT_MEMBERS: Member[] = [
  {
    id: 'm-1',
    name: 'Person 1',
    avatarColor: AVATAR_COLORS[0],
    avatarEmoji: AVATAR_EMOJIS[0],
    isPaid: false,
  },
  {
    id: 'm-2',
    name: 'Person 2',
    avatarColor: AVATAR_COLORS[1],
    avatarEmoji: AVATAR_EMOJIS[1],
    isPaid: false,
  },
];

// Clean empty form at starting
const EMPTY_INITIAL_FORM: BillFormState = {
  occasionName: '',
  billAmount: '',
  numberOfPeople: 2,
  taxPercent: '',
  tipPercent: '',
  tipType: 'percentage',
  fixedTipAmount: '',
  currency: '₹',
};

export default function App() {
  // 1. Theme State (Clean Mint: default light or persisted)
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved) return saved === 'dark';
      return false; // Default to Clean Mint light theme
    } catch {
      return false;
    }
  });

  // Sync theme class to document element and body
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
      document.body.classList.add('dark');
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, 'dark');
      } catch {}
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
      document.body.classList.remove('dark');
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, 'light');
      } catch {}
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // 2. Currency State
  const [currency, setCurrency] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEYS.CURRENCY) || '₹';
    } catch {
      return '₹';
    }
  });

  const handleCurrencyChange = (newCurrency: string) => {
    setCurrency(newCurrency);
    setFormState((prev) => ({ ...prev, currency: newCurrency }));
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, newCurrency);
    } catch {}

    if (result) {
      setResult((prev) => (prev ? { ...prev, currency: newCurrency } : null));
    }
  };

  // 3. Form State: starts with NO filled entries
  const [formState, setFormState] = useState<BillFormState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FORM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch {}
    return EMPTY_INITIAL_FORM;
  });

  // 4. Members State: starts with Person 1 and Person 2
  const [members, setMembers] = useState<Member[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 2) return parsed;
      }
    } catch {}
    return DEFAULT_MEMBERS;
  });

  // 5. Calculation Result State: starts NULL (no calculation at starting)
  const [result, setResult] = useState<CalculationResult | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.RESULT);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.grandTotal > 0) return parsed;
      }
    } catch {}
    return null;
  });

  // 6. History Records State
  const [history, setHistory] = useState<BillHistoryRecord[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  // UI Modals & Toasts
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FORM, JSON.stringify(formState));
    } catch {}
  }, [formState]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    } catch {}
  }, [members]);

  useEffect(() => {
    try {
      if (result) {
        localStorage.setItem(STORAGE_KEYS.RESULT, JSON.stringify(result));
      } else {
        localStorage.removeItem(STORAGE_KEYS.RESULT);
      }
    } catch {}
  }, [result]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Member Management Handlers
  const handleUpdateMember = (id: string, updates: Partial<Member>) => {
    setMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
    );

    if (result) {
      setResult((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          memberShares: prev.memberShares.map((m) =>
            m.memberId === id
              ? {
                  ...m,
                  name: updates.name !== undefined ? updates.name : m.name,
                  avatarColor: updates.avatarColor !== undefined ? updates.avatarColor : m.avatarColor,
                  avatarEmoji: updates.avatarEmoji !== undefined ? updates.avatarEmoji : m.avatarEmoji,
                }
              : m
          ),
        };
      });
    }
  };

  const handleAddMember = () => {
    const nextIndex = members.length + 1;
    const newMember: Member = {
      id: `m-${Date.now()}-${nextIndex}`,
      name: `Person ${nextIndex}`,
      avatarColor: AVATAR_COLORS[(nextIndex - 1) % AVATAR_COLORS.length],
      avatarEmoji: AVATAR_EMOJIS[(nextIndex - 1) % AVATAR_EMOJIS.length],
      isPaid: false,
    };
    setMembers((prev) => [...prev, newMember]);
    showToast(`Added Person ${nextIndex}`);
  };

  const handleRemoveMember = (id: string) => {
    if (members.length <= 2) {
      showToast('Minimum 2 members required.');
      return;
    }
    setMembers((prev) => prev.filter((m) => m.id !== id));
    showToast('Member removed');
  };

  // Perform split calculation with exact penny matching & sync remaining members
  const performCalculation = (saveToHistory = true) => {
    const rawSubtotal = parseFloat(formState.billAmount);
    if (isNaN(rawSubtotal) || rawSubtotal <= 0) {
      showToast('⚠️ Please enter a bill amount greater than 0.');
      return;
    }

    const effectiveOccasionName = formState.occasionName.trim() || 'Shared Bill';
    if (!formState.occasionName.trim()) {
      setFormState((prev) => ({ ...prev, occasionName: 'Shared Bill' }));
    }

    let workingMembers = [...members];
    const targetPeople = Math.max(1, formState.numberOfPeople);

    if (workingMembers.length < targetPeople) {
      const diff = targetPeople - workingMembers.length;
      const additional: Member[] = [];
      for (let i = 0; i < diff; i++) {
        const nextIdx = workingMembers.length + i + 1;
        additional.push({
          id: `m-${Date.now()}-${nextIdx}`,
          name: `Person ${nextIdx}`,
          avatarColor: AVATAR_COLORS[(nextIdx - 1) % AVATAR_COLORS.length],
          avatarEmoji: AVATAR_EMOJIS[(nextIdx - 1) % AVATAR_EMOJIS.length],
          isPaid: false,
        });
      }
      workingMembers = [...workingMembers, ...additional];
      setMembers(workingMembers);
    } else if (workingMembers.length > targetPeople) {
      workingMembers = workingMembers.slice(0, targetPeople);
      setMembers(workingMembers);
    }

    const taxPercent = parseFloat(formState.taxPercent || '0');
    const tipValue =
      formState.tipType === 'percentage'
        ? parseFloat(formState.tipPercent || '0')
        : parseFloat(formState.fixedTipAmount || '0');

    const calculated = calculateExactSplit(
      rawSubtotal,
      isNaN(taxPercent) ? 0 : taxPercent,
      formState.tipType,
      isNaN(tipValue) ? 0 : tipValue,
      workingMembers,
      effectiveOccasionName,
      currency
    );

    setResult(calculated);

    if (saveToHistory) {
      const historyItem: BillHistoryRecord = {
        id: calculated.id,
        occasionName: calculated.occasionName,
        currency: calculated.currency,
        subtotal: calculated.subtotal,
        taxAmount: calculated.taxAmount,
        tipAmount: calculated.tipAmount,
        grandTotal: calculated.grandTotal,
        numberOfPeople: calculated.memberShares.length,
        memberShares: calculated.memberShares,
        createdAt: calculated.calculatedAt,
        paidCount: calculated.memberShares.filter((m) => m.isPaid).length,
        totalCollected: 0,
        isFullyPaid: false,
      };

      setHistory((prev) => [historyItem, ...prev.filter((h) => h.id !== historyItem.id)]);
      showToast('Bill split calculated & saved! 🚀');
    }
  };

  // Toggle paid status for an individual member
  const handleToggleMemberPaid = (memberId: string) => {
    if (!result) return;

    const updatedShares = result.memberShares.map((m) =>
      m.memberId === memberId ? { ...m, isPaid: !m.isPaid } : m
    );

    const updatedResult = {
      ...result,
      memberShares: updatedShares,
    };
    setResult(updatedResult);

    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, isPaid: !m.isPaid } : m))
    );

    setHistory((prev) =>
      prev.map((h) => {
        if (h.id === result.id) {
          const paidCount = updatedShares.filter((s) => s.isPaid).length;
          const totalCollected = updatedShares
            .filter((s) => s.isPaid)
            .reduce((sum, s) => sum + s.amount, 0);
          return {
            ...h,
            memberShares: updatedShares,
            paidCount,
            totalCollected,
            isFullyPaid: paidCount === updatedShares.length,
          };
        }
        return h;
      })
    );
  };

  // Mark all paid / mark all pending
  const handleMarkAllPaid = (paid: boolean) => {
    if (!result) return;

    const updatedShares = result.memberShares.map((m) => ({
      ...m,
      isPaid: paid,
    }));

    const updatedResult = {
      ...result,
      memberShares: updatedShares,
    };
    setResult(updatedResult);

    setMembers((prev) => prev.map((m) => ({ ...m, isPaid: paid })));

    setHistory((prev) =>
      prev.map((h) => {
        if (h.id === result.id) {
          const totalCollected = paid ? result.grandTotal : 0;
          return {
            ...h,
            memberShares: updatedShares,
            paidCount: paid ? updatedShares.length : 0,
            totalCollected,
            isFullyPaid: paid,
          };
        }
        return h;
      })
    );

    showToast(paid ? 'All members marked as PAID! ✅' : 'All members marked as PENDING ⏳');
  };

  // Load a record from History into current editor
  const handleLoadHistoryRecord = (record: BillHistoryRecord) => {
    setFormState({
      occasionName: record.occasionName,
      billAmount: record.subtotal.toFixed(2),
      numberOfPeople: record.numberOfPeople,
      taxPercent: '0',
      tipPercent: '0',
      tipType: 'percentage',
      fixedTipAmount: '',
      currency: record.currency,
    });
    setCurrency(record.currency);

    const loadedMembers: Member[] = record.memberShares.map((share, idx) => ({
      id: share.memberId,
      name: share.name,
      avatarColor: share.avatarColor || AVATAR_COLORS[idx % AVATAR_COLORS.length],
      avatarEmoji: share.avatarEmoji || AVATAR_EMOJIS[idx % AVATAR_EMOJIS.length],
      isPaid: share.isPaid,
      shareAmount: share.amount,
    }));

    setMembers(loadedMembers);

    const fullResult: CalculationResult = {
      id: record.id,
      occasionName: record.occasionName,
      subtotal: record.subtotal,
      taxPercent: 0,
      taxAmount: record.taxAmount,
      tipAmount: record.tipAmount,
      tipLabel: record.tipAmount > 0 ? 'Included' : '',
      grandTotal: record.grandTotal,
      memberShares: record.memberShares,
      sumOfShares: record.grandTotal,
      discrepancy: 0,
      isExactMatch: true,
      currency: record.currency,
      calculatedAt: record.createdAt,
    };

    setResult(fullResult);
    showToast(`Loaded "${record.occasionName}" into editor`);
  };

  // Delete history item
  const handleDeleteHistory = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    showToast('Record deleted from history');
  };

  // Clear all history
  const handleClearAllHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch {}
    showToast('All history cleared');
  };

  // Reset current bill to start fresh with completely empty fields
  const handleResetBill = () => {
    setFormState(EMPTY_INITIAL_FORM);
    setMembers(DEFAULT_MEMBERS);
    setResult(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.FORM);
      localStorage.removeItem(STORAGE_KEYS.MEMBERS);
      localStorage.removeItem(STORAGE_KEYS.RESULT);
    } catch {}
    showToast('Cleared current bill. Ready for new entry! ✨');
  };

  return (
    <div
      className={`min-h-screen bg-clean-mint-pattern ${
        isDark ? 'dark text-[#F3F4F6]' : 'text-[#111827]'
      } flex flex-col transition-colors selection:bg-emerald-500 selection:text-white relative overflow-hidden`}
    >
      {/* Decorative Mint-green ambient gradients & floating graphic watermark */}
      <div className="pointer-events-none fixed -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-400/20 via-teal-300/15 to-transparent blur-3xl" />
      <div className="pointer-events-none fixed -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-tr from-emerald-400/15 via-teal-200/10 to-transparent blur-3xl" />

      {/* Floating subtle background currency/finance vector art */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05] flex justify-between items-center px-12 z-0">
        <svg className="w-80 h-80 text-emerald-600" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.67v-1.93c-1.71-.36-3.16-1.46-3.27-3.4h1.96c.1 1.05.82 1.87 2.31 1.87 1.55 0 2.22-.88 2.22-1.68 0-.96-.73-1.49-2.38-1.92-2.14-.56-3.41-1.39-3.41-3.21 0-1.68 1.34-2.91 3.17-3.29V6h2.67v1.89c1.62.38 2.76 1.54 2.89 3.09h-1.97c-.15-.81-.72-1.54-1.92-1.54-1.22 0-2.07.65-2.07 1.59 0 .86.68 1.37 2.37 1.83 2.18.59 3.44 1.48 3.44 3.32-.01 1.83-1.4 3.01-3.35 3.31z" />
        </svg>
        <svg className="w-96 h-96 text-teal-600 hidden md:block" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm6 12H6v-1.4c0-2 4-3.1 6-3.1s6 1.1 6 3.1V18z" />
        </svg>
      </div>

      {/* Top Header */}
      <Header
        isDark={isDark}
        onToggleTheme={toggleTheme}
        currency={currency}
        onCurrencyChange={handleCurrencyChange}
        historyCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onReset={handleResetBill}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 relative z-10">
        {/* Intro Section banner */}
        <IntroSection />

        {/* Two-column layout on large screens */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Create Bill & Members Configuration */}
          <div className="lg:col-span-6 space-y-6">
            <BillForm
              formState={formState}
              onChange={(fields) => setFormState((prev) => ({ ...prev, ...fields }))}
              onSplitBill={() => performCalculation(true)}
              currency={currency}
              memberCount={members.length}
              onSyncPeopleCount={(count) => {
                setFormState((prev) => ({ ...prev, numberOfPeople: count }));
              }}
            />

            <MemberList
              members={members}
              onUpdateMember={handleUpdateMember}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              targetCount={formState.numberOfPeople}
              onSyncTargetCount={(newTarget) => {
                setFormState((prev) => ({ ...prev, numberOfPeople: newTarget }));
              }}
            />
          </div>

          {/* Right Column: Split Result, Exact Total Match Audit, & Actions */}
          <div className="lg:col-span-6">
            <ResultSection
              result={result}
              onToggleMemberPaid={handleToggleMemberPaid}
              onMarkAllPaid={handleMarkAllPaid}
              onShowToast={showToast}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e5efe9] dark:border-[#1a2d26] py-6 text-center text-xs text-[#4b5563] dark:text-[#9ca3af] transition-colors relative z-10 bg-white/60 dark:bg-black/40 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong className="text-[#111827] dark:text-white">BILL BUDDY</strong> — Split fairly, pay easily. Exact sum guaranteed down to 0.01.
          </div>
          <div className="flex items-center gap-4 text-[11px] font-medium">
            <span>Clean Mint Edition</span>
            <span>•</span>
            <span>WhatsApp Ready</span>
            <span>•</span>
            <span>Receipt Slip Download</span>
          </div>
        </div>
      </footer>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadRecord={handleLoadHistoryRecord}
        onDeleteRecord={handleDeleteHistory}
        onClearAll={handleClearAllHistory}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
