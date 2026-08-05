'use client';

import React, { useState } from 'react';
import { Phone, Copy, Check, Edit2, Trash2, Tag, StickyNote } from 'lucide-react';
import { Account } from '../lib/types';

interface AccountCardProps {
  account: Account;
  onToggleVoucher: (voucherId: string, accountId: string) => void;
  onEdit: (account: Account) => void;
  onDelete: (account: Account) => void;
  bagianLabel?: string; // e.g. "Nomor 1", "Nomor 2", "Nomor 3"
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

  const availableVouchers = account.vouchers?.filter((v) => v.status === 'tersedia') || [];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200 flex flex-col justify-between relative group">
      <div>
        {/* Optional Bagian Label Badge (e.g. "Nomor 1") */}
        {bagianLabel && (
          <div className="mb-2.5 flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200/60 font-mono">
              {bagianLabel}
            </span>
          </div>
        )}

        {/* Top bar: Phone number & actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-slate-900 text-base tracking-tight font-mono">
                  {account.phone_number}
                </span>
                <button
                  onClick={handleCopyPhone}
                  title="Salin nomor"
                  className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                  {account.status || 'Aktif'}
                </span>
                <span className="text-[11px] text-slate-400">
                  {availableVouchers.length} tersedia / {account.vouchers?.length || 0} total
                </span>
              </div>
            </div>
          </div>

          {/* Edit & Delete Action Buttons */}
          <div className="flex items-center gap-1 opacity-90 sm:opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(account)}
              title="Edit Akun"
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-xl transition-colors cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(account)}
              title="Hapus Akun"
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Notes / Catatan if present */}
        {account.notes && (
          <div className="mb-4 bg-slate-50/80 rounded-xl p-2.5 text-xs text-slate-600 border border-slate-100 flex items-start gap-1.5">
            <StickyNote className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
            <span className="line-clamp-2">{account.notes}</span>
          </div>
        )}

        {/* Voucher List & Badges */}
        <div className="mt-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Tag className="w-3 h-3" />
            <span>Daftar Voucher</span>
          </div>

          {account.vouchers && account.vouchers.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {account.vouchers.map((voucher) => {
                const isTersedia = voucher.status === 'tersedia';
                return (
                  <button
                    key={voucher.id}
                    onClick={() => onToggleVoucher(voucher.id, account.id)}
                    title={isTersedia ? 'Klik untuk tandai Sudah Digunakan' : 'Klik untuk tandai Tersedia'}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer select-none active:scale-95 ${
                      isTersedia
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100/90 shadow-2xs'
                        : 'bg-slate-100 text-slate-400 border-slate-200/60 hover:bg-slate-200/70 line-through'
                    }`}
                  >
                    <span className="text-xs">{isTersedia ? '🟢' : '✅'}</span>
                    <span>{voucher.title}</span>
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">Tidak ada voucher</p>
          )}
        </div>
      </div>
    </div>
  );
}
