'use client';

import React, { useState } from 'react';
import { X, Upload, CheckCircle2, AlertCircle, Layers, RefreshCw } from 'lucide-react';
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
                Pilih Brand
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

            {/* Brand Voucher Auto-Generation Rule Notice */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-900">
                Voucher Bawaan {currentBrand?.icon} {currentBrand?.name}:
              </span>
              {currentBrand?.type === 'kopi_kenangan' && (
                <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 mt-1 space-y-0.5 font-medium">
                  <p>🟢 1 Voucher Tanpa Min</p>
                  <p>🟢 1 Voucher Min 50K</p>
                  <p>🟢 1 Voucher Min 70K</p>
                  <p className="text-[11px] text-slate-500 font-normal pt-1">
                    Setiap akun otomatis mendapatkan 3 voucher di atas dengan status 🟢 Tersedia.
                  </p>
                </div>
              )}
              {currentBrand?.type === 'kopken_baperan' && (
                <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 mt-1 font-medium">
                  <p>🟢 1 Voucher Kopken Baperan (1 akun = 1 voucher)</p>
                </div>
              )}
              {currentBrand?.type === 'tomoro' && (
                <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 mt-1 space-y-0.5 font-medium">
                  <p>🟢 1 Voucher B1G1</p>
                  <p>🟢 1 Voucher 50%</p>
                </div>
              )}
              {currentBrand?.type === 'custom' && (
                <div className="text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-100 mt-1 font-medium">
                  <p>🟢 1 Voucher Bawaan {currentBrand?.name}</p>
                </div>
              )}
            </div>

            {/* Paste Data Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Daftar Nomor Telepon <span className="text-rose-500">*</span>
                </label>
                <span className="text-xs text-slate-500 font-mono font-semibold">
                  {lineCount} nomor terdeteksi
                </span>
              </div>
              <textarea
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                placeholder={`081234567890\n081234567891\n081234567892\n081234567893`}
                rows={8}
                required
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-mono text-sm placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all leading-relaxed"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Paste nomor telepon, setiap nomor dipisahkan dengan Enter.
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
            
            <div className="text-center py-1">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-2.5 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Proses Import Selesai</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Brand Target: <strong className="text-slate-800">{currentBrand?.icon} {currentBrand?.name}</strong>
              </p>
            </div>

            {/* Summary Stats */}
            <div className="space-y-2">
              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <span>✅</span> Berhasil mengimport
                </span>
                <span className="text-lg font-extrabold text-emerald-900 font-mono">
                  {importResult.successCount} akun
                </span>
              </div>

              {importResult.failedCount > 0 && (
                <div className="bg-rose-50/80 p-3.5 rounded-2xl border border-rose-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-rose-800 flex items-center gap-1.5">
                    <span>❌</span> Gagal mengimport
                  </span>
                  <span className="text-lg font-extrabold text-rose-900 font-mono">
                    {importResult.failedCount} akun
                  </span>
                </div>
              )}
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
                      <span className="text-[11px] px-2 py-0.5 bg-rose-50 text-rose-700 rounded-md border border-rose-200/60 font-sans font-medium">
                        ({item.reason})
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
