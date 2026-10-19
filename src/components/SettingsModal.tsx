"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Activity,
  Zap,
} from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (apiKey: string, model: string) => void;
  showToast: (msg: string, icon?: string) => void;
}

export default function SettingsModal({
  isOpen,
  onClose,
  showToast,
}: SettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [testing, setTesting] = useState(false);

  // Status for Vision 1 and Vision 2
  const [vision1Status, setVision1Status] = useState<"online" | "testing" | "error">("online");
  const [vision1Latency, setVision1Latency] = useState<number | null>(null);

  const [vision2Status, setVision2Status] = useState<"online" | "testing" | "error">("online");
  const [vision2Latency, setVision2Latency] = useState<number | null>(null);

  const defaultKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedKey =
        localStorage.getItem("stockwatch_gemma_key") ||
        localStorage.getItem("stockwatch_gemini_key") ||
        defaultKey;
      setApiKey(savedKey);
      localStorage.setItem("stockwatch_gemma_model", "gemma-4-26b-a4b-it");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Single model ping helper
  const pingModel = async (modelName: string) => {
    const startTime = performance.now();
    const keyToUse = apiKey || defaultKey;
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${keyToUse}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: "Ping",
                },
              ],
            },
          ],
        }),
      }
    );
    const latency = Math.round(performance.now() - startTime);
    const data = await res.json();
    if (res.ok && data.candidates) {
      return { ok: true, latency };
    } else {
      return {
        ok: false,
        latency,
        error: data.error?.message || `HTTP ${res.status}`,
      };
    }
  };

  // Dual Ping handler for Vision 1 & Vision 2
  const handleTestConnection = async () => {
    setTesting(true);
    setVision1Status("testing");
    setVision2Status("testing");
    setVision1Latency(null);
    setVision2Latency(null);
    showToast("Menguji koneksi Dual Vision (Vision 1 & Vision 2)...", "⏳");

    try {
      // Ping both Vision 1 (26B Multimodal) and Vision 2 (31B Deep Thinking) in parallel
      const [res1, res2] = await Promise.all([
        pingModel("gemma-4-26b-a4b-it"),
        pingModel("gemma-4-31b-it"),
      ]);

      // Update Vision 1 state
      if (res1.ok) {
        setVision1Status("online");
        setVision1Latency(res1.latency);
      } else {
        setVision1Status("error");
        setVision1Latency(res1.latency);
      }

      // Update Vision 2 state
      if (res2.ok) {
        setVision2Status("online");
        setVision2Latency(res2.latency);
      } else {
        setVision2Status("error");
        setVision2Latency(res2.latency);
      }

      // Show comprehensive Toast
      if (res1.ok && res2.ok) {
        showToast(
          `✅ Dual Ping Berhasil! Vision 1 (${res1.latency}ms) & Vision 2 (${res2.latency}ms) aktif.`,
          "🎉"
        );
      } else if (res1.ok && !res2.ok) {
        showToast(
          `⚠️ Vision 1 Online (${res1.latency}ms), tetapi Vision 2 sibuk (${res2.error}).`,
          "⚠️"
        );
      } else if (!res1.ok && res2.ok) {
        showToast(
          `⚠️ Vision 2 Online (${res2.latency}ms), tetapi Vision 1 sibuk (${res1.error}).`,
          "⚠️"
        );
      } else {
        showToast("❌ Kedua Vision gagal terhubung ke server.", "❌");
      }
    } catch (err: any) {
      setVision1Status("error");
      setVision2Status("error");
      showToast(`❌ Gagal terhubung: ${err.message}`, "❌");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
              <Cpu className="h-4 w-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                Status Google Gemma Vision AI
              </h3>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Dual-Pipeline AI Pangan & Penghitung Presisi
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* API Key Status Bar (Tanpa Kolom Input) */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
            </span>
            <div>
              <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                Google Cloud API Key
                <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" /> Terotentikasi
                </span>
              </div>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                Otentikasi cloud otomatis (Tersambung Aktif)
              </p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-400/30">
            TERKONEKSI
          </span>
        </div>

        {/* Vision Status Displays (Vision 1 : Online & Vision 2 : Online) */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-emerald-600" /> Status Dual Vision Engine
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Vision 1 Card */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                vision1Status === "online"
                  ? "border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/40"
                  : vision1Status === "testing"
                  ? "border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/40"
                  : "border-red-500/30 bg-red-50/60 dark:bg-red-950/40"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  {vision1Status === "testing" ? (
                    <Loader2 className="h-2.5 w-2.5 text-amber-500 animate-spin" />
                  ) : vision1Status === "online" ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  <span
                    className={`text-xs font-black ${
                      vision1Status === "online"
                        ? "text-emerald-900 dark:text-emerald-200"
                        : vision1Status === "testing"
                        ? "text-amber-900 dark:text-amber-200"
                        : "text-red-900 dark:text-red-200"
                    }`}
                  >
                    {vision1Status === "testing"
                      ? "Vision 1 : Pinging..."
                      : vision1Status === "online"
                      ? "Vision 1 : Online"
                      : "Vision 1 : Offline"}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {vision1Latency !== null
                    ? `Multimodal Counter (${vision1Latency}ms)`
                    : "Multimodal Food Counter"}
                </p>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                  vision1Status === "online"
                    ? "bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-400/40"
                    : vision1Status === "testing"
                    ? "bg-amber-200/70 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border-amber-400/40"
                    : "bg-red-200/70 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-400/40"
                }`}
              >
                {vision1Status === "online"
                  ? "AKTIF"
                  : vision1Status === "testing"
                  ? "PING..."
                  : "OFFLINE"}
              </span>
            </div>

            {/* Vision 2 Card */}
            <div
              className={`flex items-center justify-between p-3 rounded-xl border transition ${
                vision2Status === "online"
                  ? "border-emerald-500/30 bg-emerald-50/60 dark:bg-emerald-950/40"
                  : vision2Status === "testing"
                  ? "border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/40"
                  : "border-red-500/30 bg-red-50/60 dark:bg-red-950/40"
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  {vision2Status === "testing" ? (
                    <Loader2 className="h-2.5 w-2.5 text-amber-500 animate-spin" />
                  ) : vision2Status === "online" ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  ) : (
                    <span className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  <span
                    className={`text-xs font-black ${
                      vision2Status === "online"
                        ? "text-emerald-900 dark:text-emerald-200"
                        : vision2Status === "testing"
                        ? "text-amber-900 dark:text-amber-200"
                        : "text-red-900 dark:text-red-200"
                    }`}
                  >
                    {vision2Status === "testing"
                      ? "Vision 2 : Pinging..."
                      : vision2Status === "online"
                      ? "Vision 2 : Online"
                      : "Vision 2 : Offline"}
                  </span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
                  {vision2Latency !== null
                    ? `Deep Thinking (${vision2Latency}ms)`
                    : "Deep Thinking Pangan"}
                </p>
              </div>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${
                  vision2Status === "online"
                    ? "bg-emerald-200/70 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-300 border-emerald-400/40"
                    : vision2Status === "testing"
                    ? "bg-amber-200/70 dark:bg-amber-900 text-amber-800 dark:text-amber-300 border-amber-400/40"
                    : "bg-red-200/70 dark:bg-red-900 text-red-800 dark:text-red-300 border-red-400/40"
                }`}
              >
                {vision2Status === "online"
                  ? "AKTIF"
                  : vision2Status === "testing"
                  ? "PING..."
                  : "OFFLINE"}
              </span>
            </div>
          </div>

          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed bg-zinc-50 dark:bg-zinc-800/40 p-2.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800">
            💡 Saat menekan <strong>Tes Koneksi</strong>, sistem langsung melakukan <strong>Dual Ping</strong> ke server Google Generative Language untuk memastikan <strong>Vision 1</strong> (Penghitung Fisik) dan <strong>Vision 2</strong> (Deep Thinking Pangan) keduanya responsif.
          </p>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-2.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition active:scale-95 disabled:opacity-50 shadow-sm"
          >
            {testing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600/30" />
            )}
            {testing ? "Mem-ping 2 Vision..." : "Tes Koneksi (Dual Ping)"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-5 py-2.5 text-xs font-bold shadow hover:bg-zinc-800 dark:hover:bg-zinc-200 active:scale-95 transition"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
}
