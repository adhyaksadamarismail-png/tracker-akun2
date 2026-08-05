'use client';

import React, { useState, useEffect } from 'react';
import { X, Plus, Phone, Notebook, Layers } from 'lucide-react';
import { Brand, CreateAccountInput } from '../lib/types';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  onSubmit: (input: CreateAccountInput) => void;
  initialBrandId?: string;
}

export default function AddAccountModal({
  isOpen,
  onClose,
  brands,
  onSubmit,
  initialBrandId,
}: AddAccountModalProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [status, setStatus] = useState('Aktif');
  const [notes, setNotes] = useState('');

  // Kopi Kenangan voucher counts
  const [tanpaMinCount, setTanpaMinCount] = useState<number>(1);
  const [min50kCount, setMin50kCount] = useState<number>(1);
  const [min70kCount, setMin70kCount] = useState<number>(1);

  // Custom brand vouchers
  const [customVoucherTitle, setCustomVoucherTitle] = useState('');
  const [customVouchers, setCustomVouchers] = useState<string[]>([]);

  useEffect(() => {
    if (brands.length > 0) {
      if (initialBrandId && brands.some((b) => b.id === initialBrandId)) {
        setSelectedBrandId(initialBrandId);
      } else {
        setSelectedBrandId(brands[0].id);
      }
    }
  }, [brands, initialBrandId, isOpen]);

  if (!isOpen) return null;

  const currentBrand = brands.find((b) => b.id === selectedBrandId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !selectedBrandId) return;

    onSubmit({
      brand_id: selectedBrandId,
      phone_number: phoneNumber,
      status,
      notes,
      tanpa_min_count: Number(tanpaMinCount) || 0,
      min_50k_count: Number(min50kCount) || 0,
      min_70k_count: Number(min70kCount) || 0,
      custom_vouchers: customVouchers.map((title) => ({ title })),
    });

    // Reset form
    setPhoneNumber('');
    setNotes('');
    setTanpaMinCount(1);
    setMin50kCount(1);
    setMin70kCount(1);
    setCustomVouchers([]);
    onClose();
  };

  const handleAddCustomVoucher = () => {
    if (customVoucherTitle.trim()) {
      setCustomVouchers([...customVouchers, customVoucherTitle.trim()]);
      setCustomVoucherTitle('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📱</span>
            <h2 className="text-lg font-bold text-slate-900">Tambah Akun Voucher</h2>
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
          
          {/* Brand Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Pilih Brand
            </label>
            <div className="relative">
              <select
                value={selectedBrandId}
                onChange={(e) => setSelectedBrandId(e.target.value)}
                className="w-full pl-3.5 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none cursor-pointer"
              >
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.icon} {brand.name}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <Layers className="w-4 h-4" />
              </div>
            </div>
          </div>

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
                placeholder="Contoh: 08123456789"
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
              placeholder="Misal: Aktif, Cadangan, Utama"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Catatan / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Catatan (Opsional)
            </label>
            <div className="relative">
              <div className="absolute top-3 left-3.5 pointer-events-none text-slate-400">
                <Notebook className="w-4 h-4" />
              </div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Catatan tambahan mengenai akun..."
                rows={2}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>

          {/* Brand-Specific Voucher Rules Input */}
          <div className="pt-3 border-t border-slate-100">
            {currentBrand?.type === 'kopi_kenangan' && (
              <div className="space-y-3 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>☕</span> Pengisian Voucher Kopi Kenangan
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Tanpa Min
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={tanpaMinCount}
                      onChange={(e) => setTanpaMinCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Min 50K
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={min50kCount}
                      onChange={(e) => setMin50kCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Min 70K
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={min70kCount}
                      onChange={(e) => setMin70kCount(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-center text-sm font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentBrand?.type === 'kopken_baperan' && (
              <div className="bg-rose-50/40 p-4 rounded-2xl border border-rose-100 text-xs text-rose-800 flex items-center gap-2">
                <span>💔</span>
                <span>
                  <strong>Kopken Baperan:</strong> 1 akun otomatis dibuat dengan 1 voucher Kopken Baperan.
                </span>
              </div>
            )}

            {currentBrand?.type === 'tomoro' && (
              <div className="bg-sky-50/40 p-4 rounded-2xl border border-sky-100 text-xs text-sky-800 flex items-center gap-2">
                <span>🧋</span>
                <span>
                  <strong>Tomoro:</strong> Otomatis dibuat 2 voucher: <strong>1 Voucher B1G1</strong> dan <strong>1 Voucher 50%</strong>.
                </span>
              </div>
            )}

            {currentBrand?.type === 'custom' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Daftar Voucher Kustom
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customVoucherTitle}
                    onChange={(e) => setCustomVoucherTitle(e.target.value)}
                    placeholder="Nama voucher (misal: Diskon 20k)"
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomVoucher}
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold"
                  >
                    + Tambah
                  </button>
                </div>
                {customVouchers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {customVouchers.map((v, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 flex items-center gap-1"
                      >
                        {v}
                        <button
                          type="button"
                          onClick={() => setCustomVouchers(customVouchers.filter((_, idx) => idx !== i))}
                          className="text-slate-400 hover:text-rose-500 ml-1"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3">
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
              <Plus className="w-4 h-4" />
              <span>Simpan Akun</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
