"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Lock, ArrowRight, Eye, EyeOff, User, AlertCircle, Loader2, ShieldAlert, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AdminLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login, lockoutRemaining } = useAdminAuth();
  const router = useRouter();

  const isLockedOut = lockoutRemaining > 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const res = await login(identifier, password);
      if (res.success) {
        router.push("/admin");
      } else {
        setErrorMessage(res.error || "Invalid username/email or password.");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-950 flex flex-col justify-center items-center px-4 font-helvetica relative overflow-hidden">
      {/* Subtle Background Glow for Depth */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-neutral-800/50 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-neutral-800/40 rounded-full blur-3xl pointer-events-none" />

      {/* High-Contrast Pure White Card */}
      <div className="w-full max-w-md bg-white border border-neutral-200/80 p-8 sm:p-10 rounded-3xl shadow-2xl relative z-10">
        {/* Brand Logo & Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="mb-4 inline-block hover:opacity-80 transition-opacity">
            <Image
              src="/black-logo.png"
              alt="Grail Society"
              width={160}
              height={48}
              className="h-10 w-auto object-contain"
              priority
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-100 border border-neutral-200 rounded-full text-[11px] font-bold tracking-wider text-neutral-800 uppercase">
            <Lock className="h-3 w-3 text-neutral-600" />
            <span>Staff &amp; Admin Portal</span>
          </div>
          <p className="text-xs text-center text-neutral-500 mt-2">
            Sign in with your specified Owner or Admin credentials.
          </p>
        </div>

        {/* Security Lockout Banner */}
        {isLockedOut && (
          <div className="mb-5 p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-start gap-3 text-amber-900 animate-in fade-in duration-200">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 mt-0.5 animate-pulse" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Security Timeout Active
              </h4>
              <p className="text-xs text-amber-700 mt-0.5">
                Too many consecutive failed attempts. Please wait before trying again.
              </p>
              <div className="flex items-center gap-1.5 mt-2 bg-amber-100/80 px-3 py-1.5 rounded-lg border border-amber-300 w-fit">
                <Clock className="h-3.5 w-3.5 text-amber-700" />
                <span className="text-xs font-black tracking-widest text-amber-900 font-mono">
                  {lockoutRemaining}s remaining
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {/* Identifier Input (Username or Email) */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                disabled={isLockedOut}
                autoComplete="username"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="e.g. admin or yourname@grailsociety.com"
                className="w-full pl-11 pr-4 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              />
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-xs font-bold text-neutral-800 uppercase mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                disabled={isLockedOut}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                placeholder="Enter your password..."
                className="w-full pl-11 pr-12 py-3.5 bg-neutral-50 border border-neutral-300 rounded-xl text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-black focus:bg-white focus:ring-1 focus:ring-black disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              />
              <button
                type="button"
                disabled={isLockedOut}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black disabled:opacity-40 transition-colors cursor-pointer p-1"
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {errorMessage && !isLockedOut && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-xs text-red-700 font-medium animate-in fade-in duration-200">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isLockedOut}
            className="w-full py-3.5 mt-2 bg-black text-white text-sm font-bold rounded-xl hover:bg-neutral-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Authenticating...</span>
              </>
            ) : isLockedOut ? (
              <>
                <Clock className="h-4 w-4" />
                <span>Locked Out ({lockoutRemaining}s)</span>
              </>
            ) : (
              <>
                <span>Sign In to Dashboard</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </>
            )}
          </button>
        </form>

        {/* Footer Return Link */}
        <div className="mt-8 text-center pt-6 border-t border-neutral-100">
          <Link
            href="/"
            className="text-xs text-neutral-500 hover:text-black transition-colors flex items-center justify-center gap-1.5"
          >
            <span>← Return to Storefront</span>
          </Link>
        </div>
      </div>
    </main>
  );
}