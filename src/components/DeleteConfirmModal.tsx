'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Account } from '../lib/types';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onConfirm: (accountId: string) => void;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  account,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen || !account) return null;

  const handleConfirm = () => {
    onConfirm(account.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-xl border border-slate-100 p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
          <AlertTriangle className="w-6 h-6 stroke-[2]" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-1">
          Hapus Akun Voucher?
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Apakah Anda yakin ingin menghapus akun dengan nomor{' '}
          <strong className="text-slate-800 font-mono">{account.phone_number}</strong>? Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Hapus</span>
          </button>
        </div>

      </div>
    </div>
  );
}
