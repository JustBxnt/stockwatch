"use client";

import React, { useState } from "react";
import {
  X,
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Apple,
  Database,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import {
  signInUser,
  signUpUser,
  signInDemoUser,
  UserProfile,
} from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserProfile) => void;
  showToast: (msg: string, type?: "success" | "warning" | "error" | "info") => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  showToast,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const isCloudDB = isSupabaseConfigured();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email.trim() || !password.trim()) {
      setErrorMessage("Silakan lengkapi email dan kata sandi.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Kata sandi minimal 6 karakter.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "signup") {
        if (!fullName.trim()) {
          setErrorMessage("Nama lengkap wajib diisi.");
          setIsLoading(false);
          return;
        }

        const res = await signUpUser(email, password, fullName);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          showToast(`Akun berhasil dibuat! Selamat datang, ${res.user.fullName}!`, "success");
          onAuthSuccess(res.user);
          onClose();
        }
      } else {
        const res = await signInUser(email, password);
        if (res.error) {
          setErrorMessage(res.error);
        } else if (res.user) {
          showToast(`Selamat datang kembali, ${res.user.fullName}!`, "success");
          onAuthSuccess(res.user);
          onClose();
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan saat memproses autentikasi.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const demoUser = await signInDemoUser();
      showToast("Berhasil masuk sebagai Akun Demo Dapur!", "success");
      onAuthSuccess(demoUser);
      onClose();
    } catch (e: any) {
      setErrorMessage("Gagal memuat mode demo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl border border-zinc-200 overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header Visual Banner */}
        <div className="bg-gradient-to-r from-[#0D9488] to-[#0F766E] p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-xs">
              <Apple className="w-5 h-5 text-white" strokeWidth={2.2} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold tracking-tight">StockWatch OS</h2>
              <p className="text-xs text-white/80">Manajemen Dapur & Inventori Anti-Basi</p>
            </div>
          </div>

          {/* Database Connection Pill */}
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-white text-[11px] font-semibold">
            <Database className="w-3.5 h-3.5 text-teal-200" />
            <span>
              {isCloudDB
                ? "Database Cloud (Supabase) Aktif"
                : "Database Lokal & Offline Terenkripsi"}
            </span>
          </div>
        </div>

        {/* Auth Body */}
        <div className="p-6 overflow-y-auto">
          {/* Mode Switcher Tabs */}
          <div className="w-full bg-[#F1F5F9] rounded-xl p-1 flex items-center mb-5 border border-[#E2E8F0]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "login"
                  ? "bg-white text-[#0D9488] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Masuk (Login)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setErrorMessage("");
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "signup"
                  ? "bg-white text-[#0D9488] shadow-xs"
                  : "text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              Daftar (Sign Up)
            </button>
          </div>

          {/* Error Alert */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name for Sign Up */}
            {mode === "signup" && (
              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">
                  Nama Lengkap / Nama Dapur
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Misal: Dapur Abdyka"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="text-xs font-bold text-[#475569] block mb-1">
                Alamat Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold text-[#475569] block mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-3" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-[#CBD5E1] text-xs sm:text-sm focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-[#94A3B8] hover:text-[#475569]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] disabled:opacity-70 mt-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>
                    {mode === "login" ? "Masuk ke Dapur Saya" : "Daftar & Buat Inventori"}
                  </span>
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-[#94A3B8] font-medium">atau</span>
            </div>
          </div>

          {/* Quick Demo Login Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#0F172A] font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Coba Cepat Akun Demo (Tanpa Registrasi)</span>
          </button>

          {/* Security note */}
          <p className="text-[11px] text-center text-[#94A3B8] mt-4 leading-relaxed">
            Data stok kulkas, riwayat olahan, dan daftar belanja tersimpan aman secara otomatis di database.
          </p>
        </div>
      </div>
    </div>
  );
}

