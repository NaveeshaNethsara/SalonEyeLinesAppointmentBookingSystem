"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, AlertTriangle, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Authentication failed. Please verify your credentials.");
        setIsLoading(false);
        return;
      }

      // Successful login
      if (typeof window !== "undefined") {
        if (data?.token) {
          localStorage.setItem("salon_admin_token", data.token);
          sessionStorage.setItem("salon_admin_token", data.token);
        }
        if (data?.user) {
          localStorage.setItem("salon_admin_user", JSON.stringify(data.user));
          sessionStorage.setItem("salon_admin_user", JSON.stringify(data.user));
        }
      }
      window.location.href = "/admin";
    } catch (err) {
      console.error(err);
      setErrorMsg("An unexpected connection error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gold-light/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center space-y-3">
        <div className="w-16 h-16 rounded-full bg-white border border-gold-primary/40 shadow-gold flex items-center justify-center mx-auto overflow-hidden p-2">
          <Image
            src="/images/salon_eyelines_logo.jpg"
            alt="Salon EyeLines"
            width={48}
            height={48}
            className="rounded-full object-cover"
          />
        </div>
        <div>
          <span className="text-xs uppercase tracking-[0.25em] text-gold-deep font-semibold block">
            Security Gateway
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-light text-stone-900 mt-1">
            Salon EyeLines Admin
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Sign in with your verified administrative credentials.
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-gold-primary/30 shadow-card space-y-6">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2.5 animate-shake">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-700 font-semibold mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@saloneyelines.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 transition"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs uppercase tracking-wider text-stone-700 font-semibold mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-gold-primary/50 transition font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-600 transition"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-luxury shimmer-gold py-3.5 px-4 rounded-xl bg-gold-primary hover:bg-gold-hover text-white text-xs font-semibold uppercase tracking-widest shadow-gold transition flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin-slow text-white" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Sign In to Management Portal</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Security & Access Notice */}
          <div className="pt-4 border-t border-stone-100 text-center space-y-1.5">
            <span className="text-[11px] text-stone-600 font-medium flex items-center justify-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-gold-deep" />
              <span>Authorized Salon EyeLines Personnel Only</span>
            </span>
            <p className="text-[10px] text-stone-400 font-light">
              Protected with encrypted session security.
            </p>
          </div>
        </div>

        {/* Back Link to Public Site */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-xs text-stone-500 hover:text-gold-deep transition inline-flex items-center gap-1 font-light"
          >
            ← Return to Salon EyeLines Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
