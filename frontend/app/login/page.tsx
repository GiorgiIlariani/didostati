"use client";

import { useState, Suspense, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/context/AuthContext";
import { otpAPI } from "@/lib/api";
import GoogleSignInButton from "@/app/components/GoogleSignInButton";
import {
  ArrowLeft,
  Mail,
  Lock,
  LogIn,
  Smartphone,
  Loader2,
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";
  const { login, loginWithPhone, loginWithGoogle } = useAuth();

  const [mode, setMode] = useState<"phone" | "email">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [devCode, setDevCode] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const goAfterAuth = useCallback(() => {
    router.push(redirect);
    router.refresh();
  }, [router, redirect]);

  const handleSendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await otpAPI.send(phone, "login");
      setCodeSent(true);
      if (res.data?.devCode) setDevCode(res.data.devCode);
      else setDevCode(null);
    } catch (err: any) {
      setError(err.message || "კოდის გაგზავნა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await loginWithPhone(phone, code);
      goAfterAuth();
    } catch (err: any) {
      setError(err.message || "შესვლა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      goAfterAuth();
    } catch (err: any) {
      setError(err.message || "შესვლა ვერ მოხერხდა");
    } finally {
      setLoading(false);
    }
  };

  const onGoogle = useCallback(
    async (credential: string) => {
      setError("");
      setLoading(true);
      try {
        await loginWithGoogle(credential);
        goAfterAuth();
      } catch (err: any) {
        setError(err.message || "Google შესვლა ვერ მოხერხდა");
      } finally {
        setLoading(false);
      }
    },
    [loginWithGoogle, goAfterAuth],
  );

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-orange-400 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />
          მთავარი
        </Link>

        <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">
            <span className="bg-linear-to-r from-orange-500 to-yellow-500 bg-clip-text text-transparent">
              შესვლა
            </span>
          </h1>
          <p className="text-slate-400 text-sm mb-6">
            {redirect.includes("checkout")
              ? "შეკვეთისთვის საჭიროა ავტორიზაცია"
              : "შედით ნომრით ან Google-ით"}
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === "phone" && (
            <form
              onSubmit={codeSent ? handlePhoneLogin : handleSendCode}
              className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  მობილურის ნომერი
                </label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    disabled={codeSent}
                    placeholder="5XXXXXXXX"
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 placeholder-slate-500 focus:border-orange-500 outline-none disabled:opacity-60"
                  />
                </div>
              </div>

              {codeSent && (
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    SMS კოდი
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                    }
                    required
                    maxLength={6}
                    autoComplete="one-time-code"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 text-center text-xl tracking-widest focus:border-orange-500 outline-none"
                    placeholder="••••••"
                  />
                  {devCode && (
                    <p className="mt-2 text-xs text-amber-400/90">
                      Dev კოდი: <strong>{devCode}</strong>
                    </p>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || (codeSent && code.length !== 6)}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg hover:from-orange-600 hover:to-yellow-600 disabled:opacity-50 min-h-[52px]">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : codeSent ? (
                  <>
                    <LogIn className="w-5 h-5" />
                    შესვლა
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    კოდის მიღება
                  </>
                )}
              </button>

              {codeSent && (
                <button
                  type="button"
                  onClick={() => {
                    setCodeSent(false);
                    setCode("");
                    setDevCode(null);
                  }}
                  className="w-full text-sm text-slate-400 hover:text-slate-200">
                  ნომრის შეცვლა
                </button>
              )}
            </form>
          )}

          {mode === "email" && (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  ელფოსტა
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 text-sm font-medium mb-2">
                  პაროლი
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-100 focus:border-orange-500 outline-none"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-linear-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-lg disabled:opacity-50 min-h-[52px]">
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <LogIn className="w-5 h-5" />
                    შესვლა
                  </>
                )}
              </button>
            </form>
          )}

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-slate-800 text-slate-500">ან</span>
            </div>
          </div>

          <GoogleSignInButton
            onCredential={onGoogle}
            onError={(msg) => setError(msg)}
          />
          {!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && (
            <p className="text-xs text-slate-500 text-center mt-2">
              Google შესვლა ჩაირთვება NEXT_PUBLIC_GOOGLE_CLIENT_ID-ის შემდეგ
            </p>
          )}

          <button
            type="button"
            onClick={() => setMode(mode === "phone" ? "email" : "phone")}
            className="mt-6 w-full text-sm text-slate-400 hover:text-orange-400 transition-colors">
            {mode === "phone"
              ? "ელფოსტით შესვლა"
              : "ნომრით შესვლა (რეკომენდებული)"}
          </button>

          <p className="mt-4 text-center text-sm text-slate-500">
            ანგარიში არ გაქვთ? ნომრით პირველი შესვლა ავტომატურად
            დაგირეგისტრირებთ.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
        </div>
      }>
      <LoginForm />
    </Suspense>
  );
}
