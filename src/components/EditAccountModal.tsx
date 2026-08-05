'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, Tag, Phone, Notebook } from 'lucide-react';
import { Account, Voucher, VoucherStatus } from '../lib/types';

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: Account | null;
  onSave: (
    accountId: string,
    phoneNumber: string,
    status: string,
    notes: string,
    vouchers: Voucher[]
  ) => void;
  generateId: () => string;
}

export default function EditAccountModal({
  isOpen,
  onClose,
  account,
  onSave,
  generateId,
}: EditAccountModalProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [newVoucherTitle, setNewVoucherTitle] = useState('');

  useEffect(() => {
    if (account) {
      setPhoneNumber(account.phone_number);
      setStatus(account.status || 'Aktif');
      setNotes(account.notes || '');
      setVouchers(account.vouchers ? [...account.vouchers] : []);
    }
  }, [account, isOpen]);

  if (!isOpen || !account) return null;

  const handleToggleVoucher = (voucherId: string) => {
    setVouchers((prev) =>
      prev.map((v) => {
        if (v.id === voucherId) {
          const nextStatus: VoucherStatus = v.status === 'tersedia' ? 'used' : 'tersedia';
          return { ...v, status: nextStatus };
        }
        return v;
      })
    );
  };

  const handleRemoveVoucher = (voucherId: string) => {
    setVouchers((prev) => prev.filter((v) => v.id !== voucherId));
  };

  const handleAddVoucher = () => {
    if (newVoucherTitle.trim()) {
      const newV: Voucher = {
        id: generateId(),
        account_id: account.id,
        title: newVoucherTitle.trim(),
        status: 'tersedia',
      };
      setVouchers([...vouchers, newV]);
      setNewVoucherTitle('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    onSave(account.id, phoneNumber, status, notes, vouchers);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">✏️</span>
            <h2 className="text-lg font-bold text-slate-900">Edit Akun Voucher</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Nomor Telepon <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Status Akun
            </label>
            <input
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Catatan / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Catatan
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <Notebook className="w-4 h-4" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Vouchers Management Section */}
          <div className="pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Kelola Voucher Akun Ini</span>
              </label>
              <span className="text-[11px] text-slate-400">Klik status untuk ubah</span>
            </div>

            {/* List existing vouchers */}
            {vouchers.length > 0 ? (
              <div className="space-y-2 mb-3 max-h-48 overflow-y-auto pr-1">
                {vouchers.map((v) => {
                  const isTersedia = v.status === 'tersedia';
                  return (
                    <div
                      key={v.id}
                      className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/70"
                    >
                      <button
                        type="button"
                        onClick={() => handleToggleVoucher(v.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-medium border cursor-pointer ${
                          isTersedia
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-slate-200 text-slate-500 border-slate-300 line-through'
                        }`}
                      >
                        <span>{isTersedia ? '🟢 Tersedia' : '✅ Sudah Digunakan'}</span>
                      </button>

                      <span className="text-xs font-medium text-slate-800 flex-1 ml-3 truncate">
                        {v.title}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveVoucher(v.id)}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-lg transition-colors ml-2"
                        title="Hapus Voucher Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic mb-3">Belum ada voucher pada akun ini.</p>
            )}

            {/* Add New Voucher Item */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newVoucherTitle}
                onChange={(e) => setNewVoucherTitle(e.target.value)}
                placeholder="+ Tambah voucher baru..."
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <button
                type="button"
                onClick={handleAddVoucher}
                className="px-3 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-2xl transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-2xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
