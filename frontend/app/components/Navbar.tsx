"use client";

/**
 * Navbar Component
 * Main navigation bar with:
 * - Logo and branding
 * - Search bar (Smart Search)
 * - Navigation links (Home, Products, Shipping, Wishlist)
 * - Shopping cart icon
 * - Mobile menu for small screens
 *
 * Catalog mode: login / account / notifications hidden in the nav.
 * To restore: search RESTORE_AUTH_NAV — uncomment imports, hooks, and JSX blocks below.
 */
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import ShoppingCartIcon from "./ShoppingCartIcon";
// import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/lib/context/AuthContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import {
  Home,
  Package,
  Truck,
  Heart,
  Menu,
  X,
  Search,
  Loader2,
  LogOut,
  User,
} from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { wishlistIds, loading: wishlistLoading } = useWishlist();
  const { user, logout, loading } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <>
      <nav className="relative z-50 w-full flex items-center justify-between border-b border-slate-700/50 shadow-lg px-4 md:px-6 lg:px-8 py-3 md:py-4 bg-slate-900 backdrop-blur-sm">
        {/* LEFT - Logo Section */}
        <Link href="/" className="flex items-center gap-2 md:gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-orange-400 to-yellow-400 rounded-full blur-md opacity-30"></div>
            <Image
              src="/assets/images/623751947_122121815517039514_5435805212431744753_n.jpg"
              alt="Didostati Logo"
              width={40}
              height={40}
              className="relative w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-orange-400/50"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-base md:text-lg font-bold tracking-wide bg-linear-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
              დიდოსტატი
            </p>
            <p className="text-[9px] md:text-[10px] text-slate-400 tracking-wider -mt-1 font-medium">
              სარემონტო მასალები
            </p>
          </div>
        </Link>

        {/* RIGHT - Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2 lg:gap-4 min-w-0 flex-1 justify-end">
          <div className="min-w-0 max-w-md flex-1 mr-1 lg:mr-2">
            <SearchBar />
          </div>

          {/* Notifications intentionally hidden (catalog mode). */}

          <div className="flex items-center gap-1 lg:gap-2 shrink-0 flex-wrap justify-end">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 lg:px-3 hover:bg-orange-950/30 transition-all group touch-manipulation">
              <Home
                className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-orange-500 transition-colors"
                aria-hidden
              />
              <span className="text-sm font-medium text-slate-200 group-hover:text-orange-400 whitespace-nowrap">
                მთავარი
              </span>
            </Link>

            <Link
              href="/products"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 lg:px-3 hover:bg-orange-950/30 transition-all group touch-manipulation">
              <Package
                className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-orange-500 transition-colors"
                aria-hidden
              />
              <span className="text-sm font-medium text-slate-200 group-hover:text-orange-400 whitespace-nowrap">
                პროდუქტები
              </span>
            </Link>

            <Link
              href="/shipping"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 lg:px-3 hover:bg-orange-950/30 transition-all group touch-manipulation">
              <Truck
                className="w-5 h-5 shrink-0 text-slate-300 group-hover:text-orange-500 transition-colors"
                aria-hidden
              />
              <span className="text-sm font-medium text-slate-200 group-hover:text-orange-400 whitespace-nowrap">
                მიწოდების ფასები
              </span>
            </Link>

            <Link
              href="/wishlist"
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 lg:px-3 hover:bg-orange-950/30 transition-all group touch-manipulation">
              <span className="relative inline-flex shrink-0">
                <Heart
                  className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors"
                  aria-hidden
                />
                {wishlistLoading ? (
                  <span
                    className="absolute -top-2 -right-2 z-10 w-4 h-4 rounded-full bg-slate-800 ring-1 ring-slate-900 flex items-center justify-center"
                    aria-hidden>
                    <Loader2 className="w-2.5 h-2.5 text-slate-400 animate-spin" />
                  </span>
                ) : wishlistIds.length > 0 ? (
                  <span className="absolute -top-2 -right-2 z-10 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-[9px] leading-none tabular-nums rounded-full min-w-[14px] min-h-[14px] h-[14px] px-0.5 flex items-center justify-center font-bold shadow-sm ring-1 ring-slate-900">
                    {wishlistIds.length > 99 ? "99+" : wishlistIds.length}
                  </span>
                ) : null}
              </span>
              <span className="text-sm font-medium text-slate-200 group-hover:text-orange-400 whitespace-nowrap">
                რჩეულები
              </span>
              {/*
              RESTORE_AUTH_NAV — use auth loading on badge too:
              {loading || wishlistLoading ? ( ...spinner... ) : wishlistIds.length > 0 ? ( ...count... ) : null}
            */}
            </Link>

            <ShoppingCartIcon showLabel />
          </div>

          <div className="flex items-center justify-center min-w-22">
            {loading ? (
              <Loader2
                className="w-5 h-5 text-slate-400 animate-spin"
                aria-hidden
              />
            ) : user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2.5 rounded-lg hover:bg-orange-950/30 transition-all group touch-manipulation"
                  aria-label="User menu">
                  <User className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
                </button>
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
                    <div className="p-3 border-b border-slate-700">
                      <p className="text-sm font-semibold text-slate-100">
                        {user.name || user.email}
                      </p>
                      <p className="text-xs text-slate-400">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link
                        href="/account"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}>
                        ჩემი პროფილი
                      </Link>
                      {/* <Link
                        href="/orders"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        შეკვეთების ისტორია
                      </Link> */}
                      <Link
                        href="/wishlist"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors"
                        onClick={() => setShowUserMenu(false)}>
                        რჩეულები
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          logout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-700 transition-colors flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        გასვლა
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all text-sm">
                შესვლა
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2.5 rounded-lg hover:bg-orange-950/30 transition-all touch-manipulation">
            <Search className="w-5 h-5 text-slate-300" />
          </button>
          <ShoppingCartIcon />
          <button
            type="button"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-2.5 rounded-lg hover:bg-orange-950/30 transition-all touch-manipulation">
            {showMobileMenu ? (
              <X className="w-5 h-5 text-slate-300" />
            ) : (
              <Menu className="w-5 h-5 text-slate-300" />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile Search */}
      {showMobileSearch && (
        <div className="md:hidden px-4 py-3 bg-slate-900 border-b border-slate-700">
          <SearchBar />
        </div>
      )}

      {/* Mobile Menu — z-50 so links receive clicks above the z-40 backdrop */}
      {showMobileMenu && (
        <div className="relative z-50 md:hidden bg-slate-800 border-b border-slate-700 shadow-lg">
          <div className="px-4 py-3 space-y-2">
            <Link
              href="/"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Home className="w-5 h-5 text-slate-300" />
              <span className="text-slate-100">მთავარი</span>
            </Link>
            <Link
              href="/products"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Package className="w-5 h-5 text-slate-300" />
              <span className="text-slate-100">პროდუქტები</span>
            </Link>
            <Link
              href="/shipping"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Truck className="w-5 h-5 text-slate-300" />
              <span className="text-slate-100">მიწოდების ფასები</span>
            </Link>
            <Link
              href="/wishlist"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Heart className="w-5 h-5 text-slate-300" />
              <span className="text-slate-100">რჩეულები</span>
              {!wishlistLoading && wishlistIds.length > 0 && (
                <span className="ml-auto bg-linear-to-r from-orange-500 to-yellow-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>

            {loading ? (
              <div className="flex items-center justify-center gap-3 px-4 py-3 text-slate-400">
                <Loader2 className="w-5 h-5 animate-spin" aria-hidden />
                <span className="text-sm">იტვირთება...</span>
              </div>
            ) : user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                  <User className="w-5 h-5 text-slate-300" />
                  <span className="text-slate-100">ჩემი პროფილი</span>
                </Link>
                <Link
                  href="/orders"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                  <Package className="w-5 h-5 text-slate-300" />
                  <span className="text-slate-100">შეკვეთები</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors text-red-400">
                  <LogOut className="w-5 h-5" />
                  <span>გასვლა</span>
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setShowMobileMenu(false)}
                className="block w-full text-center px-4 py-3 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all">
                შესვლა
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Click outside to close mobile menu */}
      {(showUserMenu || showMobileMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowUserMenu(false);
            setShowMobileMenu(false);
          }}
        />
      )}
    </>
  );
};

export default Navbar;
