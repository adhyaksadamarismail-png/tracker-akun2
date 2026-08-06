'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import { Brand, Account } from '../lib/types';
import AccountCard from './AccountCard';

interface BrandAccordionProps {
  brand: Brand;
  accounts: Account[];
  onToggleVoucher: (voucherId: string, accountId: string) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  onResetBrand: (brand: Brand) => void;
  defaultExpanded?: boolean;
}

export default function BrandAccordion({
  brand,
  accounts,
  onToggleVoucher,
  onEditAccount,
  onDeleteAccount,
  onResetBrand,
  defaultExpanded = true,
}: BrandAccordionProps) {
  const [isBrandExpanded, setIsBrandExpanded] = useState(defaultExpanded);

  // Bagian Accordion state: default ONLY Bagian 1 is open
  const [openBagianMap, setOpenBagianMap] = useState<Record<number, boolean>>({ 1: true });

  const toggleBagian = (bagianNum: number) => {
    setOpenBagianMap((prev) => ({
      ...prev,
      [bagianNum]: !prev[bagianNum],
    }));
  };

  // Calculate statistics
  const totalAccounts = accounts.length;
  let totalAvailableVouchers = 0;
  let totalVouchers = 0;

  accounts.forEach((acc) => {
    acc.vouchers?.forEach((v) => {
      totalVouchers++;
      if (v.status === 'tersedia') {
        totalAvailableVouchers++;
      }
    });
  });

  const isKopiKenangan = brand.type === 'kopi_kenangan' || brand.name.toLowerCase().includes('kenangan');

  // Map accounts to fixed (bagian_number, slot_number)
  const maxBagian = isKopiKenangan
    ? Math.max(1, ...accounts.map((a) => a.bagian_number || 1))
    : 0;

  const bagianMap: Record<number, Record<number, Account>> = {};
  if (isKopiKenangan) {
    accounts.forEach((acc) => {
      const b = acc.bagian_number || 1;
      const s = acc.slot_number || 1;
      if (!bagianMap[b]) bagianMap[b] = {};
      bagianMap[b][s] = acc;
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden mb-3.5 transition-all">
      {/* Brand Accordion Header */}
      <div className="w-full px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2 bg-white border-b border-slate-100">
        
        <button
          onClick={() => setIsBrandExpanded(!isBrandExpanded)}
          className="flex-1 flex items-center justify-between text-left cursor-pointer hover:opacity-90 transition-opacity min-w-0"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xl p-1.5 bg-slate-50 rounded-xl border border-slate-150 shrink-0">
              {brand.icon || '📦'}
            </span>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-slate-900 tracking-tight truncate flex items-center gap-1.5">
                <span>{brand.name}</span>
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
                <span className="font-medium text-slate-600">{totalAccounts} Akun</span>
                <span>•</span>
                <span className="font-medium text-emerald-700">{totalAvailableVouchers} Tersedia</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[11px] font-mono font-semibold">
              {totalAvailableVouchers}/{totalVouchers}
            </span>
            <div className="p-1 text-slate-400 rounded-lg bg-slate-50">
              {isBrandExpanded ? (
                <ChevronUp className="w-4 h-4 text-slate-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-600" />
              )}
            </div>
          </div>
        </button>

        {/* Reset Brand Accounts Button */}
        <div className="flex items-center shrink-0 pl-1">
          <button
            onClick={() => onResetBrand(brand)}
            title={`Reset Semua Akun ${brand.name}`}
            className="py-1 px-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3 h-3" />
            <span>↺ Reset</span>
          </button>
        </div>

      </div>

      {/* Brand Accordion Content */}
      {isBrandExpanded && (
        <div className="p-2.5 sm:p-3 bg-slate-50/50">
          {accounts.length > 0 ? (
            isKopiKenangan ? (
              /* KOPI KENANGAN: ACCORDION PER BAGIAN */
              <div className="space-y-2">
                {Array.from({ length: maxBagian }, (_, idx) => {
                  const bagianNum = idx + 1;
                  const slots = bagianMap[bagianNum] || {};
                  const activeSlotsCount = Object.keys(slots).length;
                  const isBagianOpen = !!openBagianMap[bagianNum];

                  return (
                    <div
                      key={bagianNum}
                      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden"
                    >
                      {/* Bagian Accordion Header (Header Bagian) */}
                      <button
                        onClick={() => toggleBagian(bagianNum)}
                        className="w-full px-3 py-2.5 flex items-center justify-between bg-slate-50/90 hover:bg-slate-100/90 border-b border-slate-150 transition-colors cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm">📦</span>
                          <span className="text-sm font-bold text-slate-800 font-mono">
                            Bagian {bagianNum}
                          </span>
                          <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-600 text-[11px] font-mono font-medium">
                            ({activeSlotsCount}/3)
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-500">
                          {isBagianOpen ? (
                            <ChevronUp className="w-4 h-4 text-slate-600" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-600" />
                          )}
                        </div>
                      </button>

                      {/* Bagian Accordion Content (Slot 1, Slot 2, Slot 3) */}
                      {isBagianOpen && (
                        <div className="p-2 sm:p-2.5 space-y-2">
                          {[1, 2, 3].map((slotNum) => {
                            const account = slots[slotNum];
                            return account ? (
                              <AccountCard
                                key={account.id}
                                account={account}
                                bagianLabel={`Slot ${slotNum}`}
                                onToggleVoucher={onToggleVoucher}
                                onEdit={onEditAccount}
                                onDelete={onDeleteAccount}
                              />
                            ) : (
                              /* Empty Vacant Slot Card */
                              <div
                                key={`empty_${bagianNum}_${slotNum}`}
                                className="border border-dashed border-slate-200 rounded-xl p-2 sm:p-2.5 flex items-center justify-between bg-slate-50/40 text-slate-400 font-mono text-[11px] select-none"
                              >
                                <span className="font-semibold text-slate-500">Slot {slotNum}</span>
                                <span className="italic text-[10px]">Slot Kosong</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* STANDARD BRANDS LIST */
              <div className="space-y-2">
                {accounts.map((account) => (
                  <AccountCard
                    key={account.id}
                    account={account}
                    onToggleVoucher={onToggleVoucher}
                    onEdit={onEditAccount}
                    onDelete={onDeleteAccount}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="text-center py-5 bg-white rounded-xl border border-dashed border-slate-200 p-4">
              <span className="text-2xl block mb-1">{brand.icon}</span>
              <p className="text-xs font-semibold text-slate-700">Belum ada akun untuk brand {brand.name}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Klik <strong>+ Tambah Akun</strong> atau <strong>📥 Import Akun</strong>.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
