'use client';

import React, { useState, useEffect, useMemo } from 'react';
import LoginGate from '../components/LoginGate';
import Header from '../components/Header';
import BrandAccordion from '../components/BrandAccordion';
import AddAccountModal from '../components/AddAccountModal';
import EditAccountModal from '../components/EditAccountModal';
import AddBrandModal from '../components/AddBrandModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import ImportAccountModal from '../components/ImportAccountModal';
import ResetConfirmModal from '../components/ResetConfirmModal';
import { useVoucherTracker } from '../lib/store';
import { Account, Brand, CreateAccountInput, BrandType } from '../lib/types';
import { Search, Sparkles, CheckCircle2 } from 'lucide-react';

const AUTH_KEY = 'tracker_voucher_auth_status';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals visibility state
  const [isAddAccountOpen, setIsAddAccountOpen] = useState(false);
  const [isImportAccountOpen, setIsImportAccountOpen] = useState(false);
  const [isEditAccountOpen, setIsEditAccountOpen] = useState(false);
  const [isAddBrandOpen, setIsAddBrandOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // Selected targets for edit/delete/reset
  const [selectedAccountForEdit, setSelectedAccountForEdit] = useState<Account | null>(null);
  const [selectedAccountForDelete, setSelectedAccountForDelete] = useState<Account | null>(null);
  const [selectedBrandForReset, setSelectedBrandForReset] = useState<Brand | null>(null);

  // Tracker store hook
  const {
    brands,
    accounts,
    isLoading,
    addBrand,
    addAccount,
    importAccountsBatch,
    toggleVoucherStatus,
    updateAccount,
    deleteAccount,
    resetBrandAccounts,
    generateId,
  } = useVoucherTracker();

  // Show Toast Message helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Check auth session on load
  useEffect(() => {
    try {
      const authSession = sessionStorage.getItem(AUTH_KEY);
      if (authSession === 'true') {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Session check error:', e);
    }
    setIsAuthChecking(false);
  }, []);

  const handleLoginSuccess = () => {
    try {
      sessionStorage.setItem(AUTH_KEY, 'true');
    } catch (e) {
      console.error('Session save error:', e);
    }
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {
      console.error('Session remove error:', e);
    }
    setIsAuthenticated(false);
  };

  // Filter accounts based on search query (realtime by phone number)
  const filteredAccounts = useMemo(() => {
    if (!searchQuery.trim()) return accounts;
    const query = searchQuery.trim().toLowerCase();
    return accounts.filter((acc) => acc.phone_number.toLowerCase().includes(query));
  }, [accounts, searchQuery]);

  // Overall statistics
  const stats = useMemo(() => {
    let totalAccs = accounts.length;
    let availableVouchers = 0;
    let totalVouchers = 0;

    accounts.forEach((acc) => {
      acc.vouchers?.forEach((v) => {
        totalVouchers++;
        if (v.status === 'tersedia') availableVouchers++;
      });
    });

    return { totalAccs, availableVouchers, totalVouchers };
  }, [accounts]);

  // Handle Edit modal open
  const handleOpenEdit = (account: Account) => {
    setSelectedAccountForEdit(account);
    setIsEditAccountOpen(true);
  };

  // Handle Delete modal open
  const handleOpenDelete = (account: Account) => {
    setSelectedAccountForDelete(account);
    setIsDeleteConfirmOpen(true);
  };

  // Handle Reset modal open
  const handleOpenResetBrand = (brand: Brand) => {
    setSelectedBrandForReset(brand);
    setIsResetConfirmOpen(true);
  };

  // Handlers for forms
  const handleCreateAccount = (input: CreateAccountInput) => {
    addAccount(input);
  };

  const handleImportAccounts = (brandId: string, rawText: string) => {
    return importAccountsBatch(brandId, rawText);
  };

  const handleCreateBrand = (name: string, icon: string, type: BrandType) => {
    addBrand(name, icon, type);
  };

  const handleSaveEditAccount = (
    accountId: string,
    phoneNumber: string,
    status: string,
    notes: string,
    vouchers: Account['vouchers'] = []
  ) => {
    updateAccount(accountId, phoneNumber, status, notes, vouchers);
  };

  const handleConfirmDeleteAccount = (accountId: string) => {
    deleteAccount(accountId);
  };

  const handleConfirmResetBrand = (brandId: string) => {
    const targetBrand = brands.find((b) => b.id === brandId);
    resetBrandAccounts(brandId);
    if (targetBrand) {
      showToast(`✅ Seluruh akun ${targetBrand.name} berhasil direset.`);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginGate onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-16 relative">
      
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-700 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenAddAccount={() => setIsAddAccountOpen(true)}
        onOpenImportAccount={() => setIsImportAccountOpen(true)}
        onOpenAddBrand={() => setIsAddBrandOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 pt-3 sm:pt-4 flex-1 w-full">
        
        {/* Quick Summary Card */}
        <div className="bg-white rounded-2xl p-3 border border-slate-150 shadow-2xs mb-3 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm border border-emerald-100 shrink-0">
              ⚡
            </div>
            <div>
              <h2 className="text-xs font-bold text-slate-900">Ringkasan Voucher</h2>
              <p className="text-[10px] text-slate-500">Realtime sync</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[9px] font-semibold uppercase">Akun</span>
              <span className="font-bold text-slate-800 text-xs">{stats.totalAccs}</span>
            </div>
            <div className="bg-emerald-50/60 px-2.5 py-1 rounded-xl border border-emerald-100">
              <span className="text-emerald-700 block text-[9px] font-semibold uppercase">Tersedia</span>
              <span className="font-bold text-emerald-800 text-xs">🟢 {stats.availableVouchers}</span>
            </div>
            <div className="bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[9px] font-semibold uppercase">Total</span>
              <span className="font-bold text-slate-700 text-xs">{stats.totalVouchers}</span>
            </div>
          </div>
        </div>

        {/* Search Active Notification */}
        {searchQuery.trim() && (
          <div className="mb-4 bg-sky-50 border border-sky-100 rounded-2xl px-4 py-3 flex items-center justify-between text-xs text-sky-900">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-sky-600" />
              <span>
                Menampilkan hasil pencarian untuk &quot;<strong>{searchQuery}</strong>&quot; ({filteredAccounts.length} akun ditemukan)
              </span>
            </div>
            <button
              onClick={() => setSearchQuery('')}
              className="text-xs font-semibold text-sky-700 hover:text-sky-900 underline cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        )}

        {/* Brand Accordions List */}
        {isLoading ? (
          <div className="py-20 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-3 border-emerald-500 border-t-transparent mb-2" />
            <p className="text-xs text-slate-400">Memuat data akun...</p>
          </div>
        ) : brands.length > 0 ? (
          <div>
            {brands.map((brand) => {
              const brandAccounts = filteredAccounts.filter((acc) => acc.brand_id === brand.id);
              if (searchQuery.trim() && brandAccounts.length === 0) {
                return null;
              }
              return (
                <BrandAccordion
                  key={brand.id}
                  brand={brand}
                  accounts={brandAccounts}
                  onToggleVoucher={toggleVoucherStatus}
                  onEditAccount={handleOpenEdit}
                  onDeleteAccount={handleOpenDelete}
                  onResetBrand={handleOpenResetBrand}
                  defaultExpanded={true}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-150 p-8">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">Belum ada brand terdaftar</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Tambahkan brand pertama Anda untuk mulai mencatat voucher.</p>
            <button
              onClick={() => setIsAddBrandOpen(true)}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-semibold cursor-pointer"
            >
              + Tambah Brand
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      <AddAccountModal
        isOpen={isAddAccountOpen}
        onClose={() => setIsAddAccountOpen(false)}
        brands={brands}
        onSubmit={handleCreateAccount}
      />

      <ImportAccountModal
        isOpen={isImportAccountOpen}
        onClose={() => setIsImportAccountOpen(false)}
        brands={brands}
        onImport={handleImportAccounts}
      />

      <EditAccountModal
        isOpen={isEditAccountOpen}
        onClose={() => setIsEditAccountOpen(false)}
        account={selectedAccountForEdit}
        onSave={handleSaveEditAccount}
        generateId={generateId}
      />

      <AddBrandModal
        isOpen={isAddBrandOpen}
        onClose={() => setIsAddBrandOpen(false)}
        onSubmit={handleCreateBrand}
      />

      <DeleteConfirmModal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        account={selectedAccountForDelete}
        onConfirm={handleConfirmDeleteAccount}
      />

      <ResetConfirmModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        brand={selectedBrandForReset}
        onConfirm={handleConfirmResetBrand}
      />
    </div>
  );
}
