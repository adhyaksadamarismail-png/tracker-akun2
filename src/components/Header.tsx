'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Plus, FolderPlus, LogOut, Download, Zap } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenAddAccount: () => void;
  onOpenImportAccount: () => void;
  onOpenAddBrand: () => void;
  onLogout: () => void;
}

export default function Header({
  searchQuery,
  onSearchChange,
  onOpenAddAccount,
  onOpenImportAccount,
  onOpenAddBrand,
  onLogout,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-2xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Title and Branding */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl">📦</span>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Tracker Akun Voucher
                </h1>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Kelola akun & voucher favoritmu dengan cepat
                </p>
              </div>
            </div>

            {/* Logout button mobile */}
            <button
              onClick={onLogout}
              title="Keluar"
              className="md:hidden p-2 text-slate-400 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          {/* Controls: Search & Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
            
            {/* Search Input */}
            <div className="relative flex-1 sm:w-60">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Cari nomor telepon..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Add Brand Button */}
              <button
                onClick={onOpenAddBrand}
                className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <FolderPlus className="w-4 h-4 text-slate-600" />
                <span>+ Brand</span>
              </button>

              {/* Bulk Import Button */}
              <button
                onClick={onOpenImportAccount}
                className="py-2.5 px-3.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/80 font-medium text-xs sm:text-sm rounded-2xl transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Download className="w-4 h-4 text-sky-600" />
                <span>📥 Import Akun</span>
              </button>

              {/* Voucher Optimizer Page Link */}
              <Link
                href="/voucher-optimizer"
                className="py-2.5 px-3.5 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white font-medium text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Zap className="w-4 h-4 text-sky-100 fill-sky-100" />
                <span>⚡ Voucher Optimizer</span>
              </Link>

              {/* Add Account Button */}
              <button
                onClick={onOpenAddAccount}
                className="py-2.5 px-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-medium text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4 stroke-[2.5]" />
                <span>+ Tambah Akun</span>
              </button>

              {/* Desktop Logout Button */}
              <button
                onClick={onLogout}
                title="Keluar"
                className="hidden md:flex p-2.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all cursor-pointer border border-transparent hover:border-rose-100"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
}
