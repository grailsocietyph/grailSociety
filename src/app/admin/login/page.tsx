"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminAuth } from "@/context/AdminAuthContext";
import { Lock, ArrowRight, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [passcode, setPasscode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const { login } = useAdminAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(passcode);
    if (success) {
      router.push("/admin");
    } else {
      setError(true);
      setPasscode("");
    }
  };

  return (
    <main className="min-h-screen bg-white flex flex-col justify-center items-center px-4 font-helvetica">
      <div className="w-full max-w-md bg-neutral-50 border border-neutral-200 p-8 rounded-3xl shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="w-12 h-12 bg-black text-white rounded-2xl flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
        </div>

        <h1 className="text-2xl font-black text-center text-neutral-900 tracking-tight">Admin Portal</h1>
        <p className="text-xs text-center text-neutral-500 mt-1 mb-8">Enter your secure passcode to manage inventory.</p>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={passcode}
              onChange={(e) => { setPasscode(e.target.value); setError(false); }}
              placeholder="Enter secure passcode..."
              className="w-full pl-4 pr-12 py-3.5 bg-white border border-neutral-300 rounded-xl text-sm focus:outline-none focus:border-black transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black transition-colors cursor-pointer"
              title={showPassword ? "Hide passcode" : "Show passcode"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium text-center">Invalid passcode. Please try again.</p>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-black text-white text-sm font-medium rounded-xl hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Access Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link href="/" className="text-xs text-neutral-500 hover:text-black transition-colors underline">
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </main>
  );
}