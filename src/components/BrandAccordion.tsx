'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Ticket, PhoneCall, Package } from 'lucide-react';
import { Brand, Account } from '../lib/types';
import AccountCard from './AccountCard';

interface BrandAccordionProps {
  brand: Brand;
  accounts: Account[];
  onToggleVoucher: (voucherId: string, accountId: string) => void;
  onEditAccount: (account: Account) => void;
  onDeleteAccount: (account: Account) => void;
  defaultExpanded?: boolean;
}

export default function BrandAccordion({
  brand,
  accounts,
  onToggleVoucher,
  onEditAccount,
  onDeleteAccount,
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

  // Chunk accounts into "Bagian" of 3 items each for Kopi Kenangan
  const bagianChunks: Account[][] = [];
  if (isKopiKenangan) {
    for (let i = 0; i < accounts.length; i += 3) {
      bagianChunks.push(accounts.slice(i, i + 3));
    }
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden mb-6 transition-all">
      {/* Accordion Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-5 sm:px-6 py-4 flex items-center justify-between bg-white hover:bg-slate-50/80 transition-colors text-left cursor-pointer border-b border-slate-100"
      >
        <div className="flex items-center gap-3">
          <span className="text-2xl p-2 bg-slate-50 rounded-2xl border border-slate-100/80 shadow-2xs">
            {brand.icon || '📦'}
          </span>
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">
              {brand.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-medium text-slate-600">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                {totalAccounts} Akun
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <Ticket className="w-3.5 h-3.5 text-emerald-500" />
                {totalAvailableVouchers} Voucher Tersedia
              </span>
              {isKopiKenangan && bagianChunks.length > 0 && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 font-medium text-sky-700">
                    <Package className="w-3.5 h-3.5 text-sky-500" />
                    {bagianChunks.length} Bagian
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

      {/* Accordion Content */}
      {isExpanded && (
        <div className="p-5 sm:p-6 bg-slate-50/50">
          {accounts.length > 0 ? (
            isKopiKenangan ? (
              /* KOPI KENANGAN: Grouped by Bagian (Max 3 accounts per Bagian) */
              <div className="space-y-6">
                {bagianChunks.map((chunk, chunkIdx) => (
                  <div
                    key={chunkIdx}
                    className="bg-white/80 rounded-3xl p-5 border border-slate-200/90 shadow-2xs"
                  >
                    {/* Bagian Header */}
                    <div className="flex items-center justify-between border-b border-slate-150 pb-3 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-200/60">
                          📦
                        </div>
                        <h3 className="text-base font-bold text-slate-900 font-mono tracking-tight">
                          Bagian {chunkIdx + 1}
                        </h3>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {chunk.length} / 3 akun
                      </span>
                    </div>

                    {/* Account Cards Grid inside Bagian */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {chunk.map((account, itemIdx) => (
                        <AccountCard
                          key={account.id}
                          account={account}
                          bagianLabel={`Nomor ${itemIdx + 1}`}
                          onToggleVoucher={onToggleVoucher}
                          onEdit={onEditAccount}
                          onDelete={onDeleteAccount}
                        />
                      ))}
                    </div>
                  </div>
                ))}
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
            <div className="text-center py-8 bg-white rounded-2xl border border-dashed border-slate-200">
              <p className="text-sm text-slate-400">Belum ada akun untuk brand {brand.name}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
