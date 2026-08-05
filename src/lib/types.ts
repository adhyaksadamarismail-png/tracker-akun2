export type BrandType = 'kopi_kenangan' | 'kopken_baperan' | 'tomoro' | 'custom';

export type VoucherStatus = 'tersedia' | 'used';

export interface Voucher {
  id: string;
  account_id: string;
  title: string;
  category?: string;
  status: VoucherStatus;
  created_at?: string;
}

export interface Account {
  id: string;
  brand_id: string;
  phone_number: string;
  status: string; // e.g. 'Aktif', 'Nonaktif' or custom note
  notes?: string;
  bagian_number?: number; // Bagian number (1, 2, 3...) for Kopi Kenangan
  slot_number?: number;   // Slot number (1, 2, 3) inside Bagian
  created_at?: string;
  vouchers?: Voucher[];
}

export interface Brand {
  id: string;
  name: string;
  icon: string;
  type: BrandType;
  sort_order?: number;
  created_at?: string;
}

export interface CreateAccountInput {
  brand_id: string;
  phone_number: string;
  status: string;
  notes: string;
  // Brand Kopi Kenangan quantities
  tanpa_min_count?: number;
  min_50k_count?: number;
  min_70k_count?: number;
  // Custom brand initial vouchers
  custom_vouchers?: Array<{ title: string; category?: string }>;
}

export interface EditAccountInput {
  id: string;
  phone_number: string;
  status: string;
  notes: string;
  vouchers: Voucher[];
}
