import { Member, MemberShare, CalculationResult } from '../types';

export const AVATAR_COLORS = [
  'bg-emerald-500 text-white',
  'bg-blue-500 text-white',
  'bg-violet-500 text-white',
  'bg-amber-500 text-white',
  'bg-rose-500 text-white',
  'bg-cyan-500 text-white',
  'bg-indigo-500 text-white',
  'bg-fuchsia-500 text-white',
  'bg-teal-500 text-white',
  'bg-orange-500 text-white',
];

export const AVATAR_EMOJIS = ['😊', '😎', '🥳', '🤠', '🤩', '🚀', '🌟', '🍕', '🎉', '☕', '🔥', '💎'];

export const CURRENCIES = [
  { symbol: '₹', code: 'INR', name: 'Indian Rupee (₹)' },
  { symbol: '$', code: 'USD', name: 'US Dollar ($)' },
  { symbol: '€', code: 'EUR', name: 'Euro (€)' },
  { symbol: '£', code: 'GBP', name: 'British Pound (£)' },
  { symbol: '¥', code: 'JPY', name: 'Japanese Yen (¥)' },
  { symbol: 'AED', code: 'AED', name: 'UAE Dirham (AED)' },
  { symbol: 'C$', code: 'CAD', name: 'Canadian Dollar (C$)' },
  { symbol: 'A$', code: 'AUD', name: 'Australian Dollar (A$)' },
];

export function formatCurrency(amount: number, symbol = '₹'): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return `${symbol}0.00`;
  }
  const formatted = Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function calculateExactSplit(
  subtotal: number,
  taxPercent: number,
  tipType: 'percentage' | 'fixed',
  tipValue: number,
  members: Member[],
  occasionName: string,
  currency: string
): CalculationResult {
  const safeSubtotal = Math.max(0, subtotal);
  
  // Tax calculation rounded to 2 decimals
  const taxAmount = Math.round(safeSubtotal * (taxPercent / 100) * 100) / 100;
  
  // Tip calculation
  let tipAmount = 0;
  let tipLabel = 'No Tip';
  if (tipType === 'percentage') {
    tipAmount = Math.round(safeSubtotal * (tipValue / 100) * 100) / 100;
    tipLabel = tipValue > 0 ? `${tipValue}% Tip` : '0% Tip';
  } else {
    tipAmount = Math.round(tipValue * 100) / 100;
    tipLabel = tipValue > 0 ? `Custom Tip` : 'No Tip';
  }

  // Exact Grand Total in cents/paise to avoid IEEE 754 float drift
  const subtotalCents = Math.round(safeSubtotal * 100);
  const taxCents = Math.round(taxAmount * 100);
  const tipCents = Math.round(tipAmount * 100);
  const grandTotalCents = subtotalCents + taxCents + tipCents;
  const grandTotal = grandTotalCents / 100;

  const count = Math.max(1, members.length);
  const baseCents = Math.floor(grandTotalCents / count);
  const remainderCents = grandTotalCents % count;

  let computedSharesSumCents = 0;

  const memberShares: MemberShare[] = members.map((member, index) => {
    // Distribute remainder cents 1 by 1 to first `remainderCents` members
    const memberShareCents = index < remainderCents ? baseCents + 1 : baseCents;
    computedSharesSumCents += memberShareCents;
    const shareAmount = memberShareCents / 100;

    return {
      memberId: member.id,
      name: member.name.trim() || `Person ${index + 1}`,
      avatarColor: member.avatarColor || AVATAR_COLORS[index % AVATAR_COLORS.length],
      avatarEmoji: member.avatarEmoji || AVATAR_EMOJIS[index % AVATAR_EMOJIS.length],
      amount: shareAmount,
      isPaid: Boolean(member.isPaid),
    };
  });

  const sumOfShares = computedSharesSumCents / 100;
  const discrepancy = Math.abs(grandTotal - sumOfShares);
  const isExactMatch = discrepancy < 0.0001;

  return {
    id: `bill-${Date.now()}`,
    occasionName: occasionName.trim() || 'Untitled Bill',
    subtotal: safeSubtotal,
    taxPercent,
    taxAmount,
    tipAmount,
    tipLabel,
    grandTotal,
    memberShares,
    sumOfShares,
    discrepancy,
    isExactMatch,
    currency,
    calculatedAt: new Date().toISOString(),
  };
}

export function generateShareText(result: CalculationResult): string {
  const symbol = result.currency;
  const paidCount = result.memberShares.filter(m => m.isPaid).length;
  const totalCollected = result.memberShares
    .filter(m => m.isPaid)
    .reduce((sum, m) => sum + m.amount, 0);
  const remaining = Math.max(0, result.grandTotal - totalCollected);

  const lines = [
    `🧾 *BILL BUDDY Bill Summary*`,
    `🎉 *Occasion:* ${result.occasionName}`,
    `📅 *Date:* ${new Date(result.calculatedAt).toLocaleDateString()} ${new Date(result.calculatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
    `--------------------------------`,
    `💵 *Subtotal:* ${formatCurrency(result.subtotal, symbol)}`,
  ];

  if (result.taxAmount > 0) {
    lines.push(`🏛️ *Tax (${result.taxPercent}%):* +${formatCurrency(result.taxAmount, symbol)}`);
  }
  if (result.tipAmount > 0) {
    lines.push(`🎁 *Tip (${result.tipLabel}):* +${formatCurrency(result.tipAmount, symbol)}`);
  }

  lines.push(`💰 *Grand Total:* ${formatCurrency(result.grandTotal, symbol)}`);
  lines.push(`👥 *People:* ${result.memberShares.length} members`);
  lines.push(`--------------------------------`);
  lines.push(`📋 *Individual Shares:*`);

  result.memberShares.forEach((m, idx) => {
    const status = m.isPaid ? '✅ Paid' : '⏳ Pending';
    lines.push(`${idx + 1}. *${m.name}*: ${formatCurrency(m.amount, symbol)} [${status}]`);
  });

  lines.push(`--------------------------------`);
  lines.push(`📊 *Collection Status:*`);
  lines.push(`• Paid (${paidCount}/${result.memberShares.length}): ${formatCurrency(totalCollected, symbol)}`);
  lines.push(`• Remaining to collect: ${formatCurrency(remaining, symbol)}`);
  lines.push(`✨ *Exact Total Match:* Guaranteed 100% accurate split (${formatCurrency(result.sumOfShares, symbol)} = ${formatCurrency(result.grandTotal, symbol)})`);
  lines.push(`\nSplit smartly with BILL BUDDY.`);

  return lines.join('\n');
}

export function downloadReceiptImage(result: CalculationResult): void {
  const canvas = document.createElement('canvas');
  const width = 640;
  // Dynamic height based on number of members
  const memberLineHeight = 36;
  const height = 620 + result.memberShares.length * memberLineHeight;
  canvas.width = width * 2; // high res
  canvas.height = height * 2;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.scale(2, 2);

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // Decorative receipt header banner
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, width, 8);

  // Receipt container border
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(16, 16, width - 32, height - 32);

  // Brand Name
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 24px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BILL BUDDY', width / 2, 54);

  ctx.fillStyle = '#059669';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('OFFICIAL BILL BUDDY SHARE RECEIPT', width / 2, 74);

  // Occasion Title
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 18px "Plus Jakarta Sans", sans-serif';
  ctx.fillText(result.occasionName.toUpperCase(), width / 2, 108);

  const dateStr = new Date(result.calculatedAt).toLocaleString();
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.fillText(`Receipt ID: ${result.id.slice(0, 16)} • ${dateStr}`, width / 2, 128);

  // Dashed separator line
  const drawDashedLine = (y: number) => {
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.moveTo(36, y);
    ctx.lineTo(width - 36, y);
    ctx.stroke();
    ctx.setLineDash([]);
  };

  drawDashedLine(148);

  // Financial Breakdown
  let currentY = 175;
  const drawRow = (label: string, value: string, isBold = false, isHighlight = false) => {
    ctx.font = isBold ? 'bold 14px "Plus Jakarta Sans", sans-serif' : '13px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = isHighlight ? '#0f172a' : '#475569';
    ctx.fillText(label, 40, currentY);

    ctx.textAlign = 'right';
    ctx.fillStyle = isHighlight ? '#0284c7' : '#0f172a';
    ctx.font = isBold ? 'bold 14px "JetBrains Mono", monospace' : '13px "JetBrains Mono", monospace';
    ctx.fillText(value, width - 40, currentY);
    currentY += 24;
  };

  drawRow('Original Bill Amount', formatCurrency(result.subtotal, result.currency));
  if (result.taxAmount > 0) {
    drawRow(`Tax (${result.taxPercent}%)`, `+${formatCurrency(result.taxAmount, result.currency)}`);
  }
  if (result.tipAmount > 0) {
    drawRow(`Tip (${result.tipLabel})`, `+${formatCurrency(result.tipAmount, result.currency)}`);
  }

  currentY += 4;
  drawDashedLine(currentY);
  currentY += 28;

  // Grand Total Highlight
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(36, currentY - 20, width - 72, 42);
  ctx.strokeRect(36, currentY - 20, width - 72, 42);

  ctx.textAlign = 'left';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('GRAND TOTAL PAYABLE', 48, currentY + 6);

  ctx.textAlign = 'right';
  ctx.font = 'bold 20px "JetBrains Mono", monospace';
  ctx.fillStyle = '#059669';
  ctx.fillText(formatCurrency(result.grandTotal, result.currency), width - 48, currentY + 7);

  currentY += 46;

  // Exact Match Verified badge
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(36, currentY - 14, width - 72, 26);
  ctx.strokeStyle = '#a7f3d0';
  ctx.strokeRect(36, currentY - 14, width - 72, 26);

  ctx.textAlign = 'center';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#065f46';
  ctx.fillText(`✓ EXACT 100% MATCH: Individual shares sum equals grand total precisely`, width / 2, currentY + 3);

  currentY += 34;

  // Member shares section header
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('MEMBER BREAKDOWN & PAYMENT STATUS', 40, currentY);
  currentY += 16;
  drawDashedLine(currentY);
  currentY += 22;

  // Members list
  result.memberShares.forEach((m, idx) => {
    // member box
    ctx.fillStyle = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
    ctx.fillRect(38, currentY - 16, width - 76, 30);

    // Number + Name
    ctx.textAlign = 'left';
    ctx.font = 'bold 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#1e293b';
    ctx.fillText(`${idx + 1}. ${m.name}`, 46, currentY + 4);

    // Paid status badge
    ctx.textAlign = 'right';
    if (m.isPaid) {
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('[ PAID ]', width - 150, currentY + 4);
    } else {
      ctx.fillStyle = '#d97706';
      ctx.font = '11px "Plus Jakarta Sans", sans-serif';
      ctx.fillText('[ PENDING ]', width - 150, currentY + 4);
    }

    // Share Amount
    ctx.font = 'bold 14px "JetBrains Mono", monospace';
    ctx.fillStyle = '#0f172a';
    ctx.fillText(formatCurrency(m.amount, result.currency), width - 46, currentY + 4);

    currentY += memberLineHeight;
  });

  drawDashedLine(currentY);
  currentY += 24;

  // Collected summary
  const paidCount = result.memberShares.filter(m => m.isPaid).length;
  const totalCollected = result.memberShares
    .filter(m => m.isPaid)
    .reduce((sum, m) => sum + m.amount, 0);
  const remaining = Math.max(0, result.grandTotal - totalCollected);

  ctx.textAlign = 'left';
  ctx.font = '12px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText(`Collected (${paidCount}/${result.memberShares.length}): ${formatCurrency(totalCollected, result.currency)}`, 40, currentY);

  ctx.textAlign = 'right';
  ctx.fillText(`Remaining: ${formatCurrency(remaining, result.currency)}`, width - 40, currentY);

  currentY += 30;

  // Footer notes & barcode imitation
  ctx.textAlign = 'center';
  ctx.font = '11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#64748b';
  ctx.fillText('Thank you for splitting fairly with BILL BUDDY!', width / 2, currentY);

  // Barcode imitation
  currentY += 14;
  ctx.fillStyle = '#0f172a';
  const startX = width / 2 - 100;
  for (let i = 0; i < 40; i++) {
    const barW = (i % 3 === 0 ? 3 : (i % 2 === 0 ? 1.5 : 2.5));
    const posX = startX + i * 5;
    ctx.fillRect(posX, currentY, barW, 20);
  }

  // Trigger download reliably across all browsers
  const link = document.createElement('a');
  link.download = `Receipt-${(result.occasionName || 'Bill').replace(/\s+/g, '_')}-${Date.now()}.png`;
  link.href = canvas.toDataURL('image/png');
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    if (document.body.contains(link)) {
      document.body.removeChild(link);
    }
  }, 200);
}
