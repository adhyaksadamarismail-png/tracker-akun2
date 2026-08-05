'use client';

import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Phone, Layers, RefreshCw } from 'lucide-react';
import { Brand } from '../lib/types';

export interface ImportResult {
  successCount: number;
  failedCount: number;
  failedDetails: Array<{ phone: string; reason: string }>;
}

interface ImportAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  brands: Brand[];
  onImport: (brandId: string, rawText: string) => ImportResult;
}

export default function ImportAccountModal({
  isOpen,
  onClose,
  brands,
  onImport,
}: ImportAccountModalProps) {
  const [selectedBrandId, setSelectedBrandId] = useState<string>(brands[0]?.id || '');
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  if (!isOpen) return null;

  const currentBrand = brands.find((b) => b.id === (selectedBrandId || brands[0]?.id));

  const handleReset = () => {
    setImportResult(null);
    setRawText('');
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawText.trim() || !selectedBrandId) return;

    setIsProcessing(true);

    setTimeout(() => {
      const result = onImport(selectedBrandId, rawText);
      setImportResult(result);
      setIsProcessing(false);
    }, 150);
  };

  // Calculate non-empty lines count
  const lineCount = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xl">📥</span>
            <h2 className="text-lg font-bold text-slate-900">Import Akun (Bulk)</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        {!importResult ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
            
            {/* Brand Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Pilih Brand Target
              </label>
              <div className="relative">
                <select
                  value={selectedBrandId || (brands[0]?.id ?? '')}
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

            {/* Brand Voucher Rule Notice */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-600">
              <span className="font-semibold text-slate-800">Aturan Voucher Import ({currentBrand?.name}):</span>
              {currentBrand?.type === 'kopi_kenangan' && (
                <p className="mt-1 text-slate-500">
                  Akun dibuat dengan 0 voucher awal (Tanpa Min: 0, Min 50K: 0, Min 70K: 0). Dapat ditambah nanti via Edit.
                </p>
              )}
              {currentBrand?.type === 'kopken_baperan' && (
                <p className="mt-1 text-slate-500">
                  Otomatis dibuat <strong>1 Voucher Kopken Baperan (🟢 Tersedia)</strong> per akun.
                </p>
              )}
              {currentBrand?.type === 'tomoro' && (
                <p className="mt-1 text-slate-500">
                  Otomatis dibuat <strong>1 Voucher B1G1</strong> dan <strong>1 Voucher 50% (🟢 Tersedia)</strong> per akun.
                </p>
              )}
              {currentBrand?.type === 'custom' && (
                <p className="mt-1 text-slate-500">
                  Otomatis dibuat 1 voucher default per akun.
                </p>
              )}
            </div>

            {/* Paste Data Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Paste Daftar Nomor Telepon <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-400 font-mono">
                  {lineCount} nomor terdeteksi
                </span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`Contoh:\n081234567890\n081234567891\n081234567892`}
                rows={8}
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Setiap nomor dipisahkan dengan Enter (satu nomor per baris).
              </p>
            </div>

            {/* Actions */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-2xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={isProcessing || lineCount === 0}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-2xl shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <span className="inline-block animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Import {lineCount > 0 ? `${lineCount} Akun` : ''}</span>
                  </>
                )}
              </button>
            </div>

          </form>
        ) : (
          /* Import Results Summary Screen */
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            
            <div className="text-center py-2">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Proses Import Selesai</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Brand: <strong className="text-slate-800">{currentBrand?.name}</strong>
              </p>
            </div>

            {/* Success & Failed Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-100 text-center">
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                  ✅ Berhasil
                </span>
                <span className="text-2xl font-extrabold text-emerald-800">
                  {importResult.successCount}
                </span>
                <span className="text-xs text-emerald-600 block mt-0.5">akun ditambahkan</span>
              </div>

              <div className={`p-4 rounded-2xl border text-center ${
                importResult.failedCount > 0 ? 'bg-rose-50/80 border-rose-100' : 'bg-slate-50 border-slate-200'
              }`}>
                <span className={`text-[11px] font-bold uppercase tracking-wider block mb-1 ${
                  importResult.failedCount > 0 ? 'text-rose-700' : 'text-slate-500'
                }`}>
                  ❌ Gagal
                </span>
                <span className={`text-2xl font-extrabold ${
                  importResult.failedCount > 0 ? 'text-rose-800' : 'text-slate-600'
                }`}>
                  {importResult.failedCount}
                </span>
                <span className={`text-xs block mt-0.5 ${
                  importResult.failedCount > 0 ? 'text-rose-600' : 'text-slate-400'
                }`}>
                  akun ditolak
                </span>
              </div>
            </div>

            {/* List of Failed Numbers & Reasons */}
            {importResult.failedDetails.length > 0 && (
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>Daftar Nomor Gagal Import ({importResult.failedDetails.length}):</span>
                </div>
                <div className="max-h-48 overflow-y-auto pr-1 space-y-1.5">
                  {importResult.failedDetails.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs font-mono"
                    >
                      <span className="text-slate-800 font-semibold">{item.phone}</span>
                      <span className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-200/60 font-sans">
                        {item.reason}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-3 flex items-center justify-between border-t border-slate-100">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-2xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Import Lagi</span>
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-2xl shadow-xs transition-colors cursor-pointer"
              >
                Selesai
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
