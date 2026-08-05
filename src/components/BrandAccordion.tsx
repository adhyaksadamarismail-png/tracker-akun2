'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Ticket, PhoneCall, Package, RotateCcw } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

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

  // PERMANENT BAGIAN GROUPING FOR KOPI KENANGAN
  // Map accounts to fixed (bagian_number, slot_number)
  const maxBagian = isKopiKenangan
    ? Math.max(1, ...accounts.map((a) => a.bagian_number || 1))
    : 0;

  // Build Bagian map: { [bagianNumber]: { [slotNumber]: Account } }
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
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-6 transition-all">
      {/* Accordion Header */}
      <div className="w-full px-5 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border-b border-slate-100">
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-between text-left cursor-pointer hover:opacity-90 transition-opacity"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl p-2 bg-slate-50 rounded-2xl border border-slate-100/80 shadow-2xs">
              {brand.icon || '📦'}
            </span>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{brand.name}</span>
              </h2>
              <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1 font-medium text-slate-600">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                  {totalAccounts} Akun
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 font-medium text-emerald-700">
                  <Ticket className="w-3.5 h-3.5 text-emerald-500" />
                  {totalAvailableVouchers} Voucher Tersedia
                </span>
                {isKopiKenangan && maxBagian > 0 && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-sky-700">
                      <Package className="w-3.5 h-3.5 text-sky-500" />
                      {maxBagian} Bagian
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-semibold">
              {totalAvailableVouchers} / {totalVouchers}
            </span>
            <div className="p-1.5 text-slate-400 rounded-xl bg-slate-50">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-600" />
              )}
            </div>
          </div>
        </button>

        {/* Reset Brand Accounts Button */}
        <div className="flex items-center justify-end pt-2 sm:pt-0 sm:border-l sm:border-slate-100 sm:pl-3">
          <button
            onClick={() => onResetBrand(brand)}
            title={`Reset Semua Akun ${brand.name}`}
            className="py-1.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Semua Akun</span>
          </button>
        </div>

      </div>

      {/* Accordion Content */}
      {isExpanded && (
        <div className="p-5 sm:p-6 bg-slate-50/50">
          {accounts.length > 0 ? (
            isKopiKenangan ? (
              /* KOPI KENANGAN: PERMANENT BAGIAN & SLOTS SYSTEM */
              <div className="space-y-6">
                {Array.from({ length: maxBagian }, (_, idx) => {
                  const bagianNum = idx + 1;
                  const slots = bagianMap[bagianNum] || {};
                  const activeSlotsCount = Object.keys(slots).length;

                  return (
                    <div
                      key={bagianNum}
                      className="bg-white/90 rounded-3xl p-5 border border-slate-200/90 shadow-2xs"
                    >
                      {/* Bagian Header */}
                      <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-200/60 font-mono">
                            📦
                          </div>
                          <h3 className="text-base font-bold text-slate-900 font-mono tracking-tight">
                            Bagian {bagianNum}
                          </h3>
                        </div>
                        <span className="text-xs text-slate-400 font-medium font-mono">
                          {activeSlotsCount} / 3 akun
                        </span>
                      </div>

                      {/* 3 Permanent Slots Grid (Nomor 1, Nomor 2, Nomor 3) */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[1, 2, 3].map((slotNum) => {
                          const account = slots[slotNum];
                          return account ? (
                            <AccountCard
                              key={account.id}
                              account={account}
                              bagianLabel={`Nomor ${slotNum}`}
                              onToggleVoucher={onToggleVoucher}
                              onEdit={onEditAccount}
                              onDelete={onDeleteAccount}
                            />
                          ) : (
                            /* Vacant Empty Slot Card */
                            <div
                              key={`empty_${bagianNum}_${slotNum}`}
                              className="border-2 border-dashed border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-center min-h-[160px] bg-slate-50/40 text-center select-none"
                            >
                              <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-200/60 text-slate-500 font-mono mb-2">
                                Nomor {slotNum}
                              </span>
                              <p className="text-xs font-semibold text-slate-400">Slot Kosong</p>
                              <p className="text-[11px] text-slate-400/80 mt-0.5">
                                Siap diisi akun baru / import
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* STANDARD BRANDS: Grid of Account Cards */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-slate-200 p-6">
              <span className="text-3xl block mb-2">{brand.icon}</span>
              <p className="text-sm font-semibold text-slate-700">Belum ada akun untuk brand {brand.name}</p>
              <p className="text-xs text-slate-400 mt-1">
                Klik <strong>+ Tambah Akun</strong> atau <strong>📥 Import Akun</strong> untuk mulai memasukkan data.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
