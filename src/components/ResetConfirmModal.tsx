'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { Brand } from '../lib/types';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand: Brand | null;
  onConfirm: (brandId: string) => void;
}

export default function ResetConfirmModal({
  isOpen,
  onClose,
  brand,
  onConfirm,
}: ResetConfirmModalProps) {
  if (!isOpen || !brand) return null;

  const handleConfirm = () => {
    onConfirm(brand.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 p-6 relative animate-in fade-in zoom-in-95 duration-200">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
          <AlertTriangle className="w-6 h-6 stroke-[2]" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 mb-2">
          Reset Semua Akun {brand.icon} {brand.name}?
        </h3>
        
        <div className="text-xs text-slate-600 space-y-2 mb-6 bg-slate-50 p-3.5 rounded-2xl border border-slate-150 leading-relaxed">
          <p>
            Anda yakin ingin mereset seluruh akun pada brand <strong className="text-slate-900 font-semibold">{brand.name}</strong>?
          </p>
          <p className="text-slate-500">
            Semua akun, voucher, status voucher, dan data yang berkaitan dengan brand ini akan dihapus secara permanen.
          </p>
          <p className="text-rose-600 font-semibold">
            ⚠️ Tindakan ini tidak dapat dibatalkan.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Ya, Reset Semua</span>
          </button>
        </div>

      </div>
    </div>
  );
}
