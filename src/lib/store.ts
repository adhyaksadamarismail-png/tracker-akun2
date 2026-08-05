import { useState, useEffect, useCallback } from 'react';
import { Brand, Account, Voucher, CreateAccountInput, VoucherStatus } from './types';
import { supabase, isSupabaseConfigured } from './supabase';

const LOCAL_STORAGE_KEY_BRANDS = 'tracker_voucher_brands_v1';
const LOCAL_STORAGE_KEY_ACCOUNTS = 'tracker_voucher_accounts_v1';

export interface ImportResult {
  successCount: number;
  failedCount: number;
  failedDetails: Array<{ phone: string; reason: string }>;
}

// Seed Brands
const DEFAULT_BRANDS: Brand[] = [
  { id: 'b-1', name: 'Kopi Kenangan', icon: '☕', type: 'kopi_kenangan', sort_order: 1 },
  { id: 'b-2', name: 'Kopken Baperan', icon: '💔', type: 'kopken_baperan', sort_order: 2 },
  { id: 'b-3', name: 'Tomoro', icon: '🧋', type: 'tomoro', sort_order: 3 },
];

// Seed Accounts to demonstrate immediate usability
const DEFAULT_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    brand_id: 'b-1',
    phone_number: '081234567890',
    status: 'Aktif',
    notes: 'Akun Kopi Kenangan Utama',
    created_at: new Date().toISOString(),
    vouchers: [
      { id: 'v-1', account_id: 'acc-1', title: 'Tanpa Min', category: 'Tanpa Min', status: 'tersedia' },
      { id: 'v-2', account_id: 'acc-1', title: 'Tanpa Min', category: 'Tanpa Min', status: 'used' },
      { id: 'v-3', account_id: 'acc-1', title: 'Min 50K', category: 'Min 50K', status: 'tersedia' },
      { id: 'v-4', account_id: 'acc-1', title: 'Min 70K', category: 'Min 70K', status: 'tersedia' },
    ],
  },
  {
    id: 'acc-2',
    brand_id: 'b-2',
    phone_number: '085711223344',
    status: 'Aktif',
    notes: 'Voucher Baperan',
    created_at: new Date().toISOString(),
    vouchers: [
      { id: 'v-5', account_id: 'acc-2', title: 'Voucher Kopken Baperan', status: 'tersedia' },
    ],
  },
  {
    id: 'acc-3',
    brand_id: 'b-3',
    phone_number: '089988776655',
    status: 'Aktif',
    notes: 'Akun Tomoro Harian',
    created_at: new Date().toISOString(),
    vouchers: [
      { id: 'v-6', account_id: 'acc-3', title: 'B1G1', category: 'B1G1', status: 'tersedia' },
      { id: 'v-7', account_id: 'acc-3', title: '50%', category: '50%', status: 'used' },
    ],
  },
];

export function useVoucherTracker() {
  const [brands, setBrands] = useState<Brand[]>(DEFAULT_BRANDS);
  const [accounts, setAccounts] = useState<Account[]>(DEFAULT_ACCOUNTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to generate IDs
  const generateId = () => 'id_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();

  // Load Initial Data
  const loadData = useCallback(async () => {
    setIsLoading(true);

    if (isSupabaseConfigured) {
      try {
        const { data: dbBrands, error: bError } = await supabase
          .from('brands')
          .select('*')
          .order('sort_order', { ascending: true });

        if (!bError && dbBrands && dbBrands.length > 0) {
          setBrands(dbBrands);
        } else {
          await supabase.from('brands').insert(DEFAULT_BRANDS);
          setBrands(DEFAULT_BRANDS);
        }

        const { data: dbAccounts, error: aError } = await supabase
          .from('accounts')
          .select('*, vouchers(*)');

        if (!aError && dbAccounts) {
          setAccounts(dbAccounts);
        }
      } catch (err) {
        console.error('Supabase load error, falling back to local storage:', err);
        loadLocalData();
      }
    } else {
      loadLocalData();
    }

    setIsLoading(false);
  }, []);

  const loadLocalData = () => {
    if (typeof window === 'undefined') return;
    try {
      const storedBrands = localStorage.getItem(LOCAL_STORAGE_KEY_BRANDS);
      const storedAccounts = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNTS);

      if (storedBrands) {
        setBrands(JSON.parse(storedBrands));
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY_BRANDS, JSON.stringify(DEFAULT_BRANDS));
      }

      if (storedAccounts) {
        setAccounts(JSON.parse(storedAccounts));
      } else {
        localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(DEFAULT_ACCOUNTS));
      }
    } catch (e) {
      console.error('Local storage error:', e);
    }
  };

  const saveLocal = (newBrands: Brand[], newAccounts: Account[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_BRANDS, JSON.stringify(newBrands));
      localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNTS, JSON.stringify(newAccounts));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  };

  useEffect(() => {
    loadData();

    if (isSupabaseConfigured) {
      const channel = supabase
        .channel('realtime_voucher_tracker')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'accounts' }, () => {
          loadData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'vouchers' }, () => {
          loadData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'brands' }, () => {
          loadData();
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [loadData]);

  // 1. Add Brand
  const addBrand = async (name: string, icon: string, type: Brand['type'] = 'custom') => {
    const newBrand: Brand = {
      id: generateId(),
      name: name.trim(),
      icon: icon || '📦',
      type,
      sort_order: brands.length + 1,
      created_at: new Date().toISOString(),
    };

    const updatedBrands = [...brands, newBrand];
    setBrands(updatedBrands);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('brands').insert({
          id: newBrand.id,
          name: newBrand.name,
          icon: newBrand.icon,
          type: newBrand.type,
          sort_order: newBrand.sort_order,
        });
      } catch (err) {
        console.error('Supabase add brand error:', err);
      }
    } else {
      saveLocal(updatedBrands, accounts);
    }
  };

  // 2. Add Single Account
  const addAccount = async (input: CreateAccountInput) => {
    const targetBrand = brands.find((b) => b.id === input.brand_id);
    const newAccId = generateId();

    const createdVouchers: Voucher[] = [];

    if (targetBrand?.type === 'kopi_kenangan') {
      const { tanpa_min_count = 0, min_50k_count = 0, min_70k_count = 0 } = input;

      for (let i = 0; i < tanpa_min_count; i++) {
        createdVouchers.push({
          id: generateId(),
          account_id: newAccId,
          title: 'Tanpa Min',
          category: 'Tanpa Min',
          status: 'tersedia',
        });
      }
      for (let i = 0; i < min_50k_count; i++) {
        createdVouchers.push({
          id: generateId(),
          account_id: newAccId,
          title: 'Min 50K',
          category: 'Min 50K',
          status: 'tersedia',
        });
      }
      for (let i = 0; i < min_70k_count; i++) {
        createdVouchers.push({
          id: generateId(),
          account_id: newAccId,
          title: 'Min 70K',
          category: 'Min 70K',
          status: 'tersedia',
        });
      }
    } else if (targetBrand?.type === 'kopken_baperan') {
      createdVouchers.push({
        id: generateId(),
        account_id: newAccId,
        title: 'Voucher Kopken Baperan',
        status: 'tersedia',
      });
    } else if (targetBrand?.type === 'tomoro') {
      createdVouchers.push({
        id: generateId(),
        account_id: newAccId,
        title: 'B1G1',
        category: 'B1G1',
        status: 'tersedia',
      });
      createdVouchers.push({
        id: generateId(),
        account_id: newAccId,
        title: '50%',
        category: '50%',
        status: 'tersedia',
      });
    } else {
      if (input.custom_vouchers && input.custom_vouchers.length > 0) {
        input.custom_vouchers.forEach((v) => {
          createdVouchers.push({
            id: generateId(),
            account_id: newAccId,
            title: v.title,
            category: v.category,
            status: 'tersedia',
          });
        });
      } else {
        createdVouchers.push({
          id: generateId(),
          account_id: newAccId,
          title: 'Voucher ' + (targetBrand?.name || 'Kustom'),
          status: 'tersedia',
        });
      }
    }

    const newAccount: Account = {
      id: newAccId,
      brand_id: input.brand_id,
      phone_number: input.phone_number.trim(),
      status: input.status || 'Aktif',
      notes: input.notes || '',
      created_at: new Date().toISOString(),
      vouchers: createdVouchers,
    };

    const updatedAccounts = [newAccount, ...accounts];
    setAccounts(updatedAccounts);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('accounts').insert({
          id: newAccount.id,
          brand_id: newAccount.brand_id,
          phone_number: newAccount.phone_number,
          status: newAccount.status,
          notes: newAccount.notes,
        });

        if (createdVouchers.length > 0) {
          await supabase.from('vouchers').insert(
            createdVouchers.map((v) => ({
              id: v.id,
              account_id: v.account_id,
              title: v.title,
              category: v.category,
              status: v.status,
            }))
          );
        }
      } catch (err) {
        console.error('Supabase add account error:', err);
      }
    } else {
      saveLocal(brands, updatedAccounts);
    }
  };

  // 3. BULK IMPORT ACCOUNTS
  const importAccountsBatch = (brandId: string, rawText: string): ImportResult => {
    const targetBrand = brands.find((b) => b.id === brandId);
    if (!targetBrand) {
      return { successCount: 0, failedCount: 0, failedDetails: [] };
    }

    // Split raw text by newline or comma/space
    const lines = rawText
      .split(/[\r\n]+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const existingPhoneSet = new Set(accounts.map((acc) => acc.phone_number.trim()));
    const processedInCurrentBatch = new Set<string>();

    const newAccounts: Account[] = [];
    const allNewVouchers: Voucher[] = [];
    const failedDetails: Array<{ phone: string; reason: string }> = [];

    // Phone validation regex: 8-15 digits, starting with 0, +62, 62 or normal digits
    const phoneRegex = /^(\+?62|0)?[0-9]{8,13}$/;

    lines.forEach((line) => {
      // Clean phone number (strip spaces/dashes)
      const cleanPhone = line.replace(/[\s\-]/g, '');

      // Validation 1: Format Check
      if (!cleanPhone || !phoneRegex.test(cleanPhone)) {
        failedDetails.push({ phone: line, reason: 'nomor tidak valid' });
        return;
      }

      // Validation 2: Duplicate Check against DB / State or within current batch
      if (existingPhoneSet.has(cleanPhone) || processedInCurrentBatch.has(cleanPhone)) {
        failedDetails.push({ phone: cleanPhone, reason: 'sudah ada' });
        return;
      }

      // Mark as processed in this batch
      processedInCurrentBatch.add(cleanPhone);

      const accId = generateId();
      const accountVouchers: Voucher[] = [];

      // Generate Vouchers per Brand Rule
      if (targetBrand.type === 'kopi_kenangan') {
        // Default: 0 vouchers for Tanpa Min, Min 50K, Min 70K
        // accountVouchers remains []
      } else if (targetBrand.type === 'kopken_baperan') {
        // 1 Voucher Kopken Baperan (🟢 Tersedia)
        accountVouchers.push({
          id: generateId(),
          account_id: accId,
          title: 'Voucher Kopken Baperan',
          status: 'tersedia',
        });
      } else if (targetBrand.type === 'tomoro') {
        // 1 Voucher B1G1 and 1 Voucher 50% (🟢 Tersedia)
        accountVouchers.push({
          id: generateId(),
          account_id: accId,
          title: 'B1G1',
          category: 'B1G1',
          status: 'tersedia',
        });
        accountVouchers.push({
          id: generateId(),
          account_id: accId,
          title: '50%',
          category: '50%',
          status: 'tersedia',
        });
      } else {
        // Custom brand: 1 default voucher
        accountVouchers.push({
          id: generateId(),
          account_id: accId,
          title: `Voucher ${targetBrand.name}`,
          status: 'tersedia',
        });
      }

      const accObj: Account = {
        id: accId,
        brand_id: brandId,
        phone_number: cleanPhone,
        status: 'Aktif',
        notes: 'Hasil Bulk Import',
        created_at: new Date().toISOString(),
        vouchers: accountVouchers,
      };

      newAccounts.push(accObj);
      allNewVouchers.push(...accountVouchers);
    });

    if (newAccounts.length > 0) {
      const updatedAccounts = [...newAccounts, ...accounts];
      setAccounts(updatedAccounts);

      if (isSupabaseConfigured) {
        // Batch Insert to Supabase asynchronously
        (async () => {
          try {
            await supabase.from('accounts').insert(
              newAccounts.map((a) => ({
                id: a.id,
                brand_id: a.brand_id,
                phone_number: a.phone_number,
                status: a.status,
                notes: a.notes,
              }))
            );

            if (allNewVouchers.length > 0) {
              await supabase.from('vouchers').insert(
                allNewVouchers.map((v) => ({
                  id: v.id,
                  account_id: v.account_id,
                  title: v.title,
                  category: v.category,
                  status: v.status,
                }))
              );
            }
          } catch (err) {
            console.error('Supabase batch import error:', err);
          }
        })();
      } else {
        saveLocal(brands, updatedAccounts);
      }
    }

    return {
      successCount: newAccounts.length,
      failedCount: failedDetails.length,
      failedDetails,
    };
  };

  // 4. Toggle Voucher Status
  const toggleVoucherStatus = async (voucherId: string, accountId: string) => {
    let nextStatus: VoucherStatus = 'tersedia';

    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === accountId && acc.vouchers) {
        const updatedVouchers = acc.vouchers.map((v) => {
          if (v.id === voucherId) {
            nextStatus = v.status === 'tersedia' ? 'used' : 'tersedia';
            return { ...v, status: nextStatus };
          }
          return v;
        });
        return { ...acc, vouchers: updatedVouchers };
      }
      return acc;
    });

    setAccounts(updatedAccounts);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('vouchers').update({ status: nextStatus }).eq('id', voucherId);
      } catch (err) {
        console.error('Supabase toggle voucher error:', err);
      }
    } else {
      saveLocal(brands, updatedAccounts);
    }
  };

  // 5. Update Account
  const updateAccount = async (
    accountId: string,
    phone_number: string,
    status: string,
    notes: string,
    updatedVouchers: Voucher[]
  ) => {
    const updatedAccounts = accounts.map((acc) => {
      if (acc.id === accountId) {
        return {
          ...acc,
          phone_number: phone_number.trim(),
          status,
          notes,
          vouchers: updatedVouchers,
        };
      }
      return acc;
    });

    setAccounts(updatedAccounts);

    if (isSupabaseConfigured) {
      try {
        await supabase
          .from('accounts')
          .update({
            phone_number: phone_number.trim(),
            status,
            notes,
          })
          .eq('id', accountId);

        const currentAcc = accounts.find((a) => a.id === accountId);
        const existingVoucherIds = (currentAcc?.vouchers || []).map((v) => v.id);
        const updatedVoucherIds = updatedVouchers.map((v) => v.id);

        const toDeleteIds = existingVoucherIds.filter((id) => !updatedVoucherIds.includes(id));

        if (toDeleteIds.length > 0) {
          await supabase.from('vouchers').delete().in('id', toDeleteIds);
        }

        if (updatedVouchers.length > 0) {
          await supabase.from('vouchers').upsert(
            updatedVouchers.map((v) => ({
              id: v.id,
              account_id: accountId,
              title: v.title,
              category: v.category,
              status: v.status,
            }))
          );
        }
      } catch (err) {
        console.error('Supabase update account error:', err);
      }
    } else {
      saveLocal(brands, updatedAccounts);
    }
  };

  // 6. Delete Account
  const deleteAccount = async (accountId: string) => {
    const updatedAccounts = accounts.filter((acc) => acc.id !== accountId);
    setAccounts(updatedAccounts);

    if (isSupabaseConfigured) {
      try {
        await supabase.from('accounts').delete().eq('id', accountId);
      } catch (err) {
        console.error('Supabase delete account error:', err);
      }
    } else {
      saveLocal(brands, updatedAccounts);
    }
  };

  return {
    brands,
    accounts,
    isLoading,
    addBrand,
    addAccount,
    importAccountsBatch,
    toggleVoucherStatus,
    updateAccount,
    deleteAccount,
    generateId,
  };
}
