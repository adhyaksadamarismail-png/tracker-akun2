'use client';

import React, { useState } from 'react';
import { X, Plus, FolderPlus } from 'lucide-react';
import { BrandType } from '../lib/types';

interface AddBrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, icon: string, type: BrandType) => void;
}

const EMOJI_PRESETS = ['☕', '💔', '🧋', '🥤', '🧃', '🍵', '🥠', '🍕', '🍔', '🍦', '🍩', '🎁', '📦', '🏷️'];

export default function AddBrandModal({ isOpen, onClose, onSubmit }: AddBrandModalProps) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('☕');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit(name, icon, 'custom');
    setName('');
    setIcon('☕');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-xl border border-slate-100 overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">Tambah Brand Baru</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Brand Name */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Nama Brand <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Janji Jiwa, Point Coffee"
              required
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              autoFocus
            />
          </div>

          {/* Icon / Emoji */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
              Ikon / Emoji Brand
            </label>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl p-2.5 bg-slate-50 border border-slate-200 rounded-2xl">
                {icon}
              </span>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                maxLength={4}
                className="w-20 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-center text-lg focus:outline-hidden"
              />
            </div>
            
            {/* Quick Emoji selector */}
            <div className="flex flex-wrap gap-2 pt-1">
              {EMOJI_PRESETS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`p-2 rounded-xl text-lg hover:bg-slate-100 transition-colors cursor-pointer ${
                    icon === emoji ? 'bg-emerald-50 border border-emerald-300 ring-2 ring-emerald-400/20' : ''
                  }`}
                >
                  {emoji}
                </button>
              ))}
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
              <Plus className="w-4 h-4" />
              <span>Simpan Brand</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
