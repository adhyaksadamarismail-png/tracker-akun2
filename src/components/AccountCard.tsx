'use client';

import React, { useState } from 'react';
import { Copy, Check, Edit2, Trash2, StickyNote } from 'lucide-react';
import { Account } from '../lib/types';

interface AccountCardProps {
  account: Account;
  onToggleVoucher: (voucherId: string, accountId: string) => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  bagianLabel?: string; // e.g. "Slot 1", "Slot 2", "Slot 3"
}

export default function AccountCard({
  account,
  onToggleVoucher,
  onEdit,
  onDelete,
  bagianLabel,
}: AccountCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyPhone = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(account.phone_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="bg-white rounded-xl p-2.5 sm:p-3 border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between relative group">
      <div>
        {/* Header line: Slot label, Phone number & Action buttons */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            {bagianLabel && (
              <span className="px-1.5 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200/70 font-mono shrink-0">
                {bagianLabel}
              </span>
            )}
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-slate-400 text-xs shrink-0">📱</span>
              <span className="font-bold text-slate-900 text-[15px] sm:text-[16px] tracking-tight font-mono truncate">
                {account.phone_number}
              </span>
              <button
                onClick={handleCopyPhone}
                title="Salin nomor"
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer shrink-0"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Small Icon Action Buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => onEdit(account)}
              title="Edit Akun"
              className="py-1 px-2 text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200/70 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3 text-sky-600" />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onDelete(account)}
              title="Hapus Akun"
              className="py-1 px-2 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/70 rounded-lg text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1"
            >
              <Trash2 className="w-3 h-3 text-rose-600" />
              <span>Hapus</span>
            </button>
          </div>
        </div>

        {/* Optional Notes */}
        {account.notes && (
          <div className="mb-2 bg-slate-50 rounded-lg px-2 py-1 text-[11px] text-slate-500 border border-slate-150 flex items-center gap-1">
            <StickyNote className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{account.notes}</span>
          </div>
        )}

        {/* Voucher List as compact chips / badges */}
        {account.vouchers && account.vouchers.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-slate-100">
            {account.vouchers.map((voucher) => {
              const isTersedia = voucher.status === 'tersedia';
              return (
                <button
                  key={voucher.id}
                  onClick={() => onToggleVoucher(voucher.id, account.id)}
                  title={
                    isTersedia
                      ? 'Status: Tersedia (Klik untuk ubah ke Terpakai)'
                      : 'Status: Terpakai (Klik untuk ubah ke Tersedia)'
                  }
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] sm:text-[13px] font-medium border transition-all cursor-pointer select-none active:scale-95 ${
                    isTersedia
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 line-through'
                  }`}
                >
                  <span className="text-[11px]">{isTersedia ? '🟢' : '🔴'}</span>
                  <span>{voucher.title}</span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic pt-0.5">Tidak ada voucher</p>
        )}
      </div>
    </div>
  );
}
