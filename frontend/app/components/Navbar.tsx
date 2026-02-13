"use client";

/**
 * Navbar Component
 * Main navigation bar with:
 * - Logo and branding
 * - Search bar (Smart Search)
 * - Navigation links (Home, Products, Wishlist)
 * - Shopping cart icon
 * - User menu (when logged in) or login button
 * - Mobile menu for small screens
 */
import Image from "next/image";
import Link from "next/link";
import SearchBar from "./SearchBar";
import ShoppingCartIcon from "./ShoppingCartIcon";
import NotificationDropdown from "./NotificationDropdown";
import { useAuth } from "@/lib/context/AuthContext";
import { useWishlist } from "@/lib/context/WishlistContext";
import { Home, Package, LogOut, User, Heart, Menu, X, Search } from "lucide-react";
import { useState } from "react";

const Navbar = () => {
  const { user, logout, loading } = useAuth();
  const { wishlistIds } = useWishlist();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <>
      <nav className="relative z-50 w-full flex items-center justify-between border-b border-slate-700/50 shadow-lg px-4 md:px-6 lg:px-8 py-3 md:py-4 bg-slate-900 backdrop-blur-sm">
        {/* LEFT - Logo Section */}
        <Link href="/" className="flex items-center gap-2 md:gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-linear-to-r from-orange-400 to-yellow-400 rounded-full blur-md opacity-30 group-hover:opacity-70 transition-opacity duration-300"></div>
            <Image
              src="/assets/images/623751947_122121815517039514_5435805212431744753_n.jpg"
              alt="Didostati Logo"
              width={40}
              height={40}
              className="relative w-8 h-8 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-orange-400/50 group-hover:ring-orange-500 transition-all duration-300"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-base md:text-lg font-bold tracking-wide bg-linear-to-r from-orange-500 to-yellow-400 bg-clip-text text-transparent">
              DIDOSTATI
            </p>
            <p className="text-[9px] md:text-[10px] text-slate-400 tracking-wider -mt-1 font-medium">
              სარემონტო მასალები
            </p>
          </div>
        </Link>

        {/* RIGHT - Desktop Navigation */}
        <div className="hidden md:flex items-center gap-4 lg:gap-6">
          <SearchBar />
          
          {/* Notifications */}
          {user && <NotificationDropdown />}

          <Link 
            href="/" 
            className="p-2.5 rounded-lg hover:bg-orange-950/30 transition-all group touch-manipulation">
            <Home className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
          </Link>
          
          <Link 
            href="/products" 
            className="p-2.5 rounded-lg hover:bg-orange-950/30 transition-all group touch-manipulation">
            <Package className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
          </Link>

          <Link 
            href="/wishlist" 
            className="relative p-2.5 rounded-lg hover:bg-orange-950/30 transition-all group touch-manipulation">
            <Heart className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-linear-to-r from-orange-500 to-yellow-500 text-white text-[10px] rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center font-bold shadow-md ring-2 ring-slate-900">
                {wishlistIds.length > 99 ? '99+' : wishlistIds.length}
              </span>
            )}
          </Link>

          <ShoppingCartIcon />

          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="p-2.5 rounded-lg hover:bg-orange-950/30 transition-all group touch-manipulation">
                <User className="w-5 h-5 text-slate-300 group-hover:text-orange-500 transition-colors" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-xl border border-slate-700 overflow-hidden">
                  <div className="p-3 border-b border-slate-700">
                    <p className="text-sm font-semibold text-slate-100">{user.name || user.email}</p>
                    <p className="text-xs text-slate-400">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      href="/account"
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                      ჩემი პროფილი
                    </Link>
                    <Link
                      href="/orders"
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                      შეკვეთების ისტორია
                    </Link>
                    <Link
                      href="/wishlist"
                      className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                      რჩეულები
                    </Link>
                    {user.role === 'admin' && (
                      <Link
                        href="/admin/orders"
                        className="block px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 transition-colors">
                        Admin Panel
                      </Link>
                    )}
                    <button
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

        {/* Mobile Navigation */}
        <div className="md:hidden flex items-center gap-2">
          <button
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="p-2.5 rounded-lg hover:bg-orange-950/30 transition-all touch-manipulation">
            <Search className="w-5 h-5 text-slate-300" />
          </button>
          <ShoppingCartIcon />
          <button
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

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-slate-800 border-b border-slate-700 shadow-lg">
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
              href="/wishlist"
              onClick={() => setShowMobileMenu(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
              <Heart className="w-5 h-5 text-slate-300" />
              <span className="text-slate-100">რჩეულები</span>
              {wishlistIds.length > 0 && (
                <span className="ml-auto bg-linear-to-r from-orange-500 to-yellow-500 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                  {wishlistIds.length}
                </span>
              )}
            </Link>
            {user ? (
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
                {user.role === 'admin' && (
                  <Link
                    href="/admin/orders"
                    onClick={() => setShowMobileMenu(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors">
                    <Package className="w-5 h-5 text-slate-300" />
                    <span className="text-slate-100">Admin Panel</span>
                  </Link>
                )}
                <button
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

      {/* Click outside to close menus */}
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
