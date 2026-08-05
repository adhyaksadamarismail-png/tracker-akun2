'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Ticket, PhoneCall } from 'lucide-react';
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
