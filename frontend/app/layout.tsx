import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ApiStatus from "./components/ApiStatus";
import AdminNav from "./components/AdminNav";
import FloatingContact from "./components/FloatingContact";
import { CartProvider } from "@/lib/context/CartContext";
import { AuthProvider } from "@/lib/context/AuthContext";
import { WishlistProvider } from "@/lib/context/WishlistContext";
import { NotificationProvider } from "@/lib/context/NotificationContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Didostati - სარემონტო მასალები და სწრაფი მიწოდება",
  description: "ხარისხიანი ინსტრუმენტები, მასალები და აღჭურვილობა გორიში. თქვენი სანდო პარტნიორი სარემონტო მასალებისთვის.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ka">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-900 text-slate-100`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <NotificationProvider>
                <Navbar />
                <main className="min-h-screen">
                  {children}
                </main>
                <Footer />
                <FloatingContact />
                <ApiStatus />
                <AdminNav />
              </NotificationProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
