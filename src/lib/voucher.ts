export interface VoucherRule {
  id: string;
  name: string;
  minSpend: number;
  discountPct: number;
  maxDiscount: number;
  description: string;
}

export interface VoucherEvaluationResult {
  rule: VoucherRule;
  isEligible: boolean;
  shortfall: number; // Amount needed to reach minSpend
  rawDiscount: number; // subtotal * 50%
  discountAmount: number; // capped discount
  totalToPay: number; // subtotal - discountAmount
}

export interface OptimalVoucherResult {
  subtotal: number;
  selectedVoucher: VoucherEvaluationResult | null;
  allEvaluations: VoucherEvaluationResult[];
  nextMilestoneHint: string | null;
}

export const VOUCHER_RULES: VoucherRule[] = [
  {
    id: 'tanpa-minimal',
    name: 'Voucher Tanpa Minimal',
    minSpend: 0,
    discountPct: 50,
    maxDiscount: 35000,
    description: 'Minimal Pembelian Rp0 • Diskon 50% • Maksimal Diskon Rp35.000',
  },
  {
    id: 'min-50k',
    name: 'Voucher Minimal Rp50.000',
    minSpend: 50000,
    discountPct: 50,
    maxDiscount: 30000,
    description: 'Minimal Pembelian Rp50.000 • Diskon 50% • Maksimal Diskon Rp30.000',
  },
  {
    id: 'min-70k',
    name: 'Voucher Minimal Rp70.000',
    minSpend: 70000,
    discountPct: 50,
    maxDiscount: 30000,
    description: 'Minimal Pembelian Rp70.000 • Diskon 50% • Maksimal Diskon Rp70.000',
  },
];

/**
 * Format numbers as Indonesian Rupiah (Rp XX.XXX)
 */
export function formatRupiah(amount: number): string {
  if (isNaN(amount)) return 'Rp0';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount).replace('IDR', 'Rp').trim();
}

/**
 * Calculate all voucher evaluations and return the optimal voucher calculation result
 */
export function calculateOptimalVoucher(subtotal: number): OptimalVoucherResult {
  if (subtotal <= 0) {
    const allEvaluations: VoucherEvaluationResult[] = VOUCHER_RULES.map((rule) => ({
      rule,
      isEligible: rule.minSpend === 0,
      shortfall: rule.minSpend,
      rawDiscount: 0,
      discountAmount: 0,
      totalToPay: 0,
    }));

    return {
      subtotal: 0,
      selectedVoucher: null,
      allEvaluations,
      nextMilestoneHint: 'Tambahkan menu ke keranjang untuk mulai menghitung diskon optimal.',
    };
  }

  const allEvaluations: VoucherEvaluationResult[] = VOUCHER_RULES.map((rule) => {
    const isEligible = subtotal >= rule.minSpend;
    const shortfall = isEligible ? 0 : rule.minSpend - subtotal;
    const rawDiscount = subtotal * (rule.discountPct / 100);
    const discountAmount = isEligible ? Math.min(rawDiscount, rule.maxDiscount) : 0;
    const totalToPay = Math.max(0, subtotal - discountAmount);

    return {
      rule,
      isEligible,
      shortfall,
      rawDiscount,
      discountAmount,
      totalToPay,
    };
  });

  // Filter eligible vouchers
  const eligible = allEvaluations.filter((ev) => ev.isEligible);

  let selectedVoucher: VoucherEvaluationResult | null = null;

  if (eligible.length > 0) {
    // Sort by discount amount descending, then by highest maxDiscount, then by lowest minSpend
    eligible.sort((a, b) => {
      if (b.discountAmount !== a.discountAmount) {
        return b.discountAmount - a.discountAmount;
      }
      if (b.rule.maxDiscount !== a.rule.maxDiscount) {
        return b.rule.maxDiscount - a.rule.maxDiscount;
      }
      return a.rule.minSpend - b.rule.minSpend;
    });

    selectedVoucher = eligible[0];
  }

  // Next milestone hint calculation
  let nextMilestoneHint: string | null = null;
  const ineligible = allEvaluations.filter((ev) => !ev.isEligible);
  if (ineligible.length > 0) {
    // Find the next closest voucher threshold
    ineligible.sort((a, b) => a.shortfall - b.shortfall);
    const closestIneligible = ineligible[0];
    nextMilestoneHint = `Tambah ${formatRupiah(closestIneligible.shortfall)} lagi untuk mengaktifkan ${closestIneligible.rule.name}!`;
  }

  return {
    subtotal,
    selectedVoucher,
    allEvaluations,
    nextMilestoneHint,
  };
}
