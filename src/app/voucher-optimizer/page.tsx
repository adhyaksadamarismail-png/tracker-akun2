'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import LoginGate from '../../components/LoginGate';
import Sidebar from '../../components/Sidebar';
import { getMenu, MenuItem } from '../../lib/api';
import { defaultMenuList } from '../../data/defaultMenu';
import {
  calculateOptimalVoucher,
  formatRupiah,
  OptimalVoucherResult,
  VOUCHER_RULES,
} from '../../lib/voucher';
import {
  Search,
  Zap,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Copy,
  CheckCircle2,
  RefreshCw,
  Tag,
  Trophy,
  Info,
  Menu as MenuIcon,
  Coffee,
  Sparkles,
  ArrowLeft,
  Store,
  AlertCircle,
} from 'lucide-react';

const AUTH_KEY = 'tracker_voucher_auth_status';

export interface CartItem {
  menu: MenuItem;
  qty: number;
}

export default function VoucherOptimizerPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthChecking, setIsAuthChecking] = useState<boolean>(true);

  // Sidebar mobile drawer state
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState<boolean>(false);

  // API Data state
  const [outletCode, setOutletCode] = useState<string>('');
  const [menuList, setMenuList] = useState<MenuItem[]>(defaultMenuList);
  const [isLoadingMenu, setIsLoadingMenu] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');

  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);

  // Toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual calculation trigger effect flag
  const [calcTimestamp, setCalcTimestamp] = useState<number>(Date.now());

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Auth session check
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

  // Fetch Menu from API endpoint via src/lib/api.ts
  const fetchMenuData = async (codeToFetch?: string) => {
    setIsLoadingMenu(true);
    setApiError(null);
    try {
      const data = await getMenu(codeToFetch || outletCode);
      setMenuList(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal terhubung ke API Menu.';
      setApiError(msg);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenuData();
    }
  }, [isAuthenticated]);

  // Dynamic Categories from fetched API menu
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('Semua');
    menuList.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [menuList]);

  // Filtered Menu Items (realtime search & category filter)
  const filteredMenuList = useMemo(() => {
    return menuList.filter((item) => {
      const matchesSearch =
        !searchQuery.trim() ||
        item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
        (item.code && item.code.toLowerCase().includes(searchQuery.trim().toLowerCase()));

      const matchesCategory =
        selectedCategory === 'Semua' || item.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [menuList, searchQuery, selectedCategory]);

  // Cart operations
  const addToCart = (menu: MenuItem) => {
    if (menu.isSoldOut) return;
    setCart((prevCart) => {
      const existing = prevCart.find((ci) => String(ci.menu.id) === String(menu.id));
      if (existing) {
        return prevCart.map((ci) =>
          String(ci.menu.id) === String(menu.id)
            ? { ...ci, qty: ci.qty + 1 }
            : ci
        );
      }
      return [...prevCart, { menu, qty: 1 }];
    });
  };

  const updateCartQty = (menuId: string | number, delta: number) => {
    setCart((prevCart) => {
      return prevCart
        .map((ci) => {
          if (String(ci.menu.id) === String(menuId)) {
            const newQty = ci.qty + delta;
            return newQty > 0 ? { ...ci, qty: newQty } : null;
          }
          return ci;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (menuId: string | number) => {
    setCart((prevCart) => prevCart.filter((ci) => String(ci.menu.id) !== String(menuId)));
  };

  const clearCart = () => {
    setCart([]);
    showToast('🛒 Keranjang telah dikosongkan.');
  };

  // Subtotal Calculation using origPrice
  const cartSubtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.menu.origPrice * item.qty, 0);
  }, [cart]);

  // Optimal Voucher Calculation
  const voucherResult: OptimalVoucherResult = useMemo(() => {
    // We pass cartSubtotal and recalcTimestamp to force recalculation on demand
    return calculateOptimalVoucher(cartSubtotal);
  }, [cartSubtotal, calcTimestamp]);

  const handleRecalculate = () => {
    setCalcTimestamp(Date.now());
    showToast('⚡ Perhitungan voucher diperbarui!');
  };

  // Copy Results to Clipboard
  const handleCopyResults = () => {
    if (cart.length === 0) {
      showToast('⚠️ Keranjang masih kosong!');
      return;
    }

    const sel = voucherResult.selectedVoucher;
    if (!sel) return;

    let text = `📦 *RINGKASAN OPTIMASI VOUCHER KOPI KENANGAN*\n`;
    text += `----------------------------------------\n`;
    text += `🛒 *Detail Keranjang (${cart.reduce((a, b) => a + b.qty, 0)} Item):*\n`;
    cart.forEach((item, index) => {
      text += `${index + 1}. ${item.menu.name} x${item.qty} (${formatRupiah(
        item.menu.origPrice * item.qty
      )})\n`;
    });
    text += `----------------------------------------\n`;
    text += `💰 Subtotal (Harga Normal): ${formatRupiah(voucherResult.subtotal)}\n`;
    text += `🏆 Voucher Paling Optimal: ${sel.rule.name}\n`;
    text += `📌 Minimal Pembelian: ${formatRupiah(sel.rule.minSpend)}\n`;
    text += `🏷️ Persentase Diskon: ${sel.rule.discountPct}%\n`;
    text += `🛑 Maksimal Diskon: ${formatRupiah(sel.rule.maxDiscount)}\n`;
    text += `🎉 Diskon Diperoleh: ${formatRupiah(sel.discountAmount)}\n`;
    text += `----------------------------------------\n`;
    text += `💳 *TOTAL DIBAYAR: ${formatRupiah(sel.totalToPay)}*\n`;
    text += `✨ *TOTAL HEMAT: ${formatRupiah(sel.discountAmount)}*\n`;

    if (voucherResult.nextMilestoneHint) {
      text += `\n💡 Hint: ${voucherResult.nextMilestoneHint}`;
    }

    navigator.clipboard.writeText(text);
    showToast('📋 Hasil kalkulasi berhasil disalin!');
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-sky-500 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginGate onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-800 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Sidebar Navigation Component */}
      <Sidebar
        onLogout={handleLogout}
        isOpenMobile={isSidebarOpenMobile}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
      />

      {/* Main Content Area offset for desktop sidebar */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Bar Header */}
        <header className="bg-white border-b border-slate-150 sticky top-0 z-30 shadow-2xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* Mobile Sidebar Toggle Button */}
              <button
                onClick={() => setIsSidebarOpenMobile(true)}
                className="lg:hidden p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Buka Menu Navigasi"
              >
                <MenuIcon className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center font-bold text-lg">
                  ⚡
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-none">
                    Voucher Optimizer
                  </h1>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Kalkulator Diskon Otomatis Menu Kopi Kenangan
                  </p>
                </div>
              </div>
            </div>

            {/* Outlet Code API Selector & Links */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden sm:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs">
                <Store className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 text-[11px] font-medium">Outlet:</span>
                <input
                  type="text"
                  value={outletCode}
                  onChange={(e) => setOutletCode(e.target.value)}
                  placeholder="Opsional (misal: JKT01)"
                  className="w-28 bg-transparent text-slate-800 font-semibold focus:outline-hidden text-xs placeholder:text-slate-400"
                />
                <button
                  onClick={() => fetchMenuData()}
                  className="text-sky-600 hover:text-sky-700 font-medium text-[11px] hover:underline cursor-pointer ml-1"
                  title="Ambil ulang data menu"
                >
                  Reload
                </button>
              </div>

              <Link
                href="/"
                className="py-2 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tracker Akun</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Page Main POS Layout */}
        <main className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex-1">
          {/* Main Grid: 3 Layout Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* ============================================================== */}
            {/* SECTION 1: DAFTAR MENU (lg:col-span-7)                          */}
            {/* ============================================================== */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* Search & Category Filter Controls Card */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-150 shadow-2xs space-y-3.5">
                
                {/* Search Bar */}
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari menu Kopi Kenangan..."
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* Category Filter Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
                  {categories.map((cat) => {
                    const isSel = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                          isSel
                            ? 'bg-sky-500 text-white shadow-2xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Menu Grid List / Loading / Error / Empty States */}
              {isLoadingMenu ? (
                /* Loading Skeleton Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl p-3 border border-slate-150 shadow-2xs animate-pulse space-y-3"
                    >
                      <div className="w-full h-28 bg-slate-100 rounded-2xl" />
                      <div className="h-4 bg-slate-100 rounded-md w-3/4" />
                      <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                      <div className="h-5 bg-slate-100 rounded-md w-2/3" />
                    </div>
                  ))}
                </div>
              ) : apiError ? (
                /* API Error State */
                <div className="bg-white rounded-3xl border border-rose-100 p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">Gagal Memuat Data Menu</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">{apiError}</p>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Endpoint: <code className="bg-slate-100 px-1.5 py-0.5 rounded">process.env.NEXT_PUBLIC_API_BASE</code>
                  </p>
                  <button
                    onClick={() => fetchMenuData()}
                    className="px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Coba Lagi</span>
                  </button>
                </div>
              ) : filteredMenuList.length > 0 ? (
                /* Menu Items Cards Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                  {filteredMenuList.map((item) => {
                    const cartEntry = cart.find(
                      (ci) => String(ci.menu.id) === String(item.id)
                    );
                    const isSoldOut = Boolean(item.isSoldOut);

                    return (
                      <div
                        key={item.id}
                        onClick={() => !isSoldOut && addToCart(item)}
                        className={`bg-white rounded-3xl p-3 border border-slate-150 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden ${
                          isSoldOut
                            ? 'opacity-60 cursor-not-allowed'
                            : 'cursor-pointer hover:border-sky-300'
                        }`}
                      >
                        {/* Image Container */}
                        <div className="relative w-full aspect-square bg-slate-50 rounded-2xl overflow-hidden mb-2.5 flex items-center justify-center border border-slate-100">
                          {item.img ? (
                            <img
                              src={item.img}
                              alt={item.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                // Fallback icon on image error
                                (e.target as HTMLElement).style.display = 'none';
                                const parent = (e.target as HTMLElement).parentElement;
                                if (parent) {
                                  parent.classList.add('flex', 'items-center', 'justify-center');
                                }
                              }}
                            />
                          ) : (
                            <Coffee className="w-10 h-10 text-slate-300" />
                          )}

                          {/* Badges: IS NEW / SOLD OUT */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {item.isNew && (
                              <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                BARU
                              </span>
                            )}
                            {isSoldOut && (
                              <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                                HABIS
                              </span>
                            )}
                          </div>

                          {/* Cart Quantity Badge if selected */}
                          {cartEntry && cartEntry.qty > 0 && (
                            <div className="absolute top-2 right-2 bg-sky-600 text-white font-bold text-xs w-6 h-6 rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
                              {cartEntry.qty}
                            </div>
                          )}
                        </div>

                        {/* Text Details */}
                        <div className="space-y-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block truncate">
                            {item.category || 'Menu'}
                          </span>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">
                            {item.name}
                          </h4>
                          <div className="pt-1 flex items-center justify-between">
                            <span className="text-xs font-extrabold text-sky-600">
                              {formatRupiah(item.origPrice)}
                            </span>
                            {!isSoldOut && (
                              <span className="w-6 h-6 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs group-hover:bg-sky-500 group-hover:text-white transition-colors">
                                +
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Empty Filter Result */
                <div className="bg-white rounded-3xl border border-slate-150 p-10 text-center space-y-2">
                  <Coffee className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <h3 className="text-sm font-bold text-slate-700">Menu Tidak Ditemukan</h3>
                  <p className="text-xs text-slate-400">
                    Coba kata kunci pencarian atau kategori lain.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('Semua');
                    }}
                    className="text-xs font-semibold text-sky-600 hover:underline pt-2 inline-block cursor-pointer"
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* SECTION 2 & SECTION 3: STICKY KERANJANG & HASIL VOUCHER       */}
            {/* ============================================================== */}
            <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-20">
              
              {/* SECTION 2: KERANJANG */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-2xs overflow-hidden">
                {/* Cart Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Keranjang Pesanan</h3>
                      <p className="text-[11px] text-slate-500">
                        {cart.reduce((a, b) => a + b.qty, 0)} item dipilih
                      </p>
                    </div>
                  </div>

                  {cart.length > 0 && (
                    <button
                      onClick={clearCart}
                      className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-all flex items-center gap-1 font-semibold cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Kosongkan</span>
                    </button>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="p-4 max-h-72 overflow-y-auto space-y-3 divide-y divide-slate-100">
                  {cart.length === 0 ? (
                    <div className="py-8 text-center text-slate-400 space-y-2">
                      <ShoppingCart className="w-8 h-8 stroke-[1.5] mx-auto text-slate-300" />
                      <p className="text-xs font-medium">Keranjang masih kosong</p>
                      <p className="text-[11px] text-slate-400">
                        Klik menu di samping untuk menambahkan item
                      </p>
                    </div>
                  ) : (
                    cart.map((ci) => (
                      <div key={ci.menu.id} className="pt-3 first:pt-0 flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 truncate">
                            {ci.menu.name}
                          </h5>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {formatRupiah(ci.menu.origPrice)} x {ci.qty} ={' '}
                            <span className="font-semibold text-slate-700">
                              {formatRupiah(ci.menu.origPrice * ci.qty)}
                            </span>
                          </p>
                        </div>

                        {/* Qty controls */}
                        <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
                          <button
                            onClick={() => updateCartQty(ci.menu.id, -1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-xs font-bold text-slate-800">
                            {ci.qty}
                          </span>
                          <button
                            onClick={() => updateCartQty(ci.menu.id, 1)}
                            className="w-6 h-6 rounded-lg bg-white text-slate-600 hover:bg-slate-200 flex items-center justify-center font-bold text-xs transition-colors cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Subtotal Bar */}
                <div className="p-4 border-t border-slate-150 bg-slate-50/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-600">Subtotal (Harga Normal)</span>
                  <span className="text-base font-extrabold text-slate-900">
                    {formatRupiah(cartSubtotal)}
                  </span>
                </div>
              </div>

              {/* ============================================================== */}
              {/* SECTION 3: HASIL VOUCHER                                      */}
              {/* ============================================================== */}
              <div className="bg-white rounded-3xl border border-slate-150 shadow-2xs p-5 space-y-4">
                
                {/* Header & Calculate Button */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-900">Hasil Perhitungan Voucher</h3>
                  </div>
                </div>

                {/* Primary Action Button: Hitung Voucher Optimal */}
                <button
                  onClick={handleRecalculate}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 active:from-sky-700 active:to-sky-800 text-white font-bold rounded-2xl shadow-xs hover:shadow-md transition-all text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-sky-100 fill-sky-100" />
                  <span>Hitung Voucher Optimal</span>
                </button>

                {/* Optimal Voucher Badge & Result Card */}
                {voucherResult.selectedVoucher ? (
                  <div className="bg-gradient-to-br from-sky-500/10 via-sky-50 to-blue-50/40 rounded-3xl p-4 sm:p-5 border border-sky-200/80 space-y-4">
                    
                    {/* Badge 🏆 Voucher Paling Optimal */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="px-3 py-1 bg-amber-400 text-slate-950 font-black text-[11px] rounded-full shadow-xs flex items-center gap-1.5 uppercase tracking-wide">
                        🏆 Voucher Paling Optimal
                      </span>
                      <button
                        onClick={handleCopyResults}
                        className="px-2.5 py-1 bg-white hover:bg-sky-100 text-sky-700 border border-sky-200 rounded-xl text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Hasil</span>
                      </button>
                    </div>

                    {/* Voucher Title */}
                    <div>
                      <h4 className="text-base font-extrabold text-slate-900">
                        {voucherResult.selectedVoucher.rule.name}
                      </h4>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {voucherResult.selectedVoucher.rule.description}
                      </p>
                    </div>

                    {/* Calculation Metrics Breakdown */}
                    <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                      <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-150">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Subtotal
                        </span>
                        <span className="font-bold text-slate-800 text-xs">
                          {formatRupiah(voucherResult.subtotal)}
                        </span>
                      </div>

                      <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-150">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Min. Pembelian
                        </span>
                        <span className="font-bold text-slate-800 text-xs">
                          {formatRupiah(voucherResult.selectedVoucher.rule.minSpend)}
                        </span>
                      </div>

                      <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-150">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Persentase Diskon
                        </span>
                        <span className="font-bold text-sky-700 text-xs">
                          {voucherResult.selectedVoucher.rule.discountPct}%
                        </span>
                      </div>

                      <div className="bg-white/80 backdrop-blur-xs p-2.5 rounded-2xl border border-slate-150">
                        <span className="text-[10px] font-semibold text-slate-400 block uppercase">
                          Maksimal Diskon
                        </span>
                        <span className="font-bold text-slate-800 text-xs">
                          {formatRupiah(voucherResult.selectedVoucher.rule.maxDiscount)}
                        </span>
                      </div>

                      <div className="bg-emerald-500/10 p-2.5 rounded-2xl border border-emerald-200 col-span-2 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-emerald-800 block uppercase">
                            Diskon Diperoleh
                          </span>
                          <span className="text-base font-black text-emerald-700">
                            {formatRupiah(voucherResult.selectedVoucher.discountAmount)}
                          </span>
                        </div>
                        <span className="text-2xl">🎉</span>
                      </div>
                    </div>

                    {/* Total To Pay Summary */}
                    <div className="pt-2 border-t border-sky-200/80 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 block">Total yang Harus Dibayar</span>
                        <span className="text-xl font-black text-slate-900">
                          {formatRupiah(voucherResult.selectedVoucher.totalToPay)}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-bold text-emerald-600 block uppercase">
                          Total Hemat
                        </span>
                        <span className="text-sm font-extrabold text-emerald-600">
                          {formatRupiah(voucherResult.selectedVoucher.discountAmount)}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Empty state before adding items */
                  <div className="bg-slate-50 rounded-2xl p-6 text-center border border-dashed border-slate-200">
                    <Tag className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-600">
                      Belum ada menu yang dipilih
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Tambahkan menu ke keranjang untuk melihat voucher paling hemat.
                    </p>
                  </div>
                )}

                {/* Voucher Milestone / Requirement Info Banner */}
                {voucherResult.nextMilestoneHint && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex items-start gap-2.5 text-xs text-amber-900">
                    <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-[11px] uppercase text-amber-800">
                        Informasi Minimal Pembelian
                      </p>
                      <p className="text-xs mt-0.5 text-amber-900">
                        {voucherResult.nextMilestoneHint}
                      </p>
                    </div>
                  </div>
                )}

                {/* All Voucher Rules Status Comparison */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-500" />
                    <span>Status Semua Voucher:</span>
                  </h4>

                  <div className="space-y-2">
                    {voucherResult.allEvaluations.map((ev) => {
                      const isSelected =
                        voucherResult.selectedVoucher?.rule.id === ev.rule.id;

                      return (
                        <div
                          key={ev.rule.id}
                          className={`p-3 rounded-2xl border text-xs transition-all ${
                            isSelected
                              ? 'bg-sky-50 border-sky-300 shadow-2xs'
                              : ev.isEligible
                              ? 'bg-white border-slate-200'
                              : 'bg-slate-50 border-slate-200 opacity-70'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="font-bold text-slate-800 flex items-center gap-1.5">
                              {isSelected && <span>🏆</span>}
                              <span>{ev.rule.name}</span>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ev.isEligible
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-700'
                              }`}
                            >
                              {ev.isEligible ? 'Memenuhi Syarat' : 'Belum Memenuhi'}
                            </span>
                          </div>

                          <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                            <span>{ev.rule.description}</span>
                            <span className="font-semibold text-slate-700">
                              {ev.isEligible
                                ? `Diskon: ${formatRupiah(ev.discountAmount)}`
                                : `Kurang ${formatRupiah(ev.shortfall)}`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
