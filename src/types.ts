export interface Member {
  id: string;
  name: string;
  avatarColor: string;
  avatarEmoji: string;
  isPaid: boolean;
  shareAmount?: number;
}

export interface BillFormState {
  occasionName: string;
  billAmount: string; // raw input for controlled editing
  numberOfPeople: number;
  taxPercent: string;
  tipPercent: string;
  tipType: 'percentage' | 'fixed';
  fixedTipAmount: string;
  currency: string;
}

export interface MemberShare {
  memberId: string;
  name: string;
  avatarColor: string;
  avatarEmoji: string;
  amount: number;
  isPaid: boolean;
}

export interface CalculationResult {
  id: string;
  occasionName: string;
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  tipAmount: number;
  tipLabel: string;
  grandTotal: number;
  memberShares: MemberShare[];
  sumOfShares: number;
  discrepancy: number; // should be 0.00
  isExactMatch: boolean;
  currency: string;
  calculatedAt: string;
}

export interface BillHistoryRecord {
  id: string;
  occasionName: string;
  currency: string;
  subtotal: number;
  taxAmount: number;
  tipAmount: number;
  grandTotal: number;
  numberOfPeople: number;
  memberShares: MemberShare[];
  createdAt: string;
  paidCount: number;
  totalCollected: number;
  isFullyPaid: boolean;
}
