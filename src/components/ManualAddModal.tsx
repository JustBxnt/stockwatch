"use client";

import React, { useState } from "react";
import { X, Plus, Package, Calendar, Coins, MapPin } from "lucide-react";

interface ManualAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: any) => void;
  showToast: (msg: string, icon?: string) => void;
}

export default function ManualAddModal({
  isOpen,
  onClose,
  onAddItem,
  showToast,
}: ManualAddModalProps) {
  const [name, setName] = useState("");
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState("biji");
  const [zone, setZone] = useState("suhu_ruang");
  const [price, setPrice] = useState(10000);
  const [expDays, setExpDays] = useState(5);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama bahan tidak boleh kosong", "⚠️");
      return;
    }

    const today = new Date();
    today.setDate(today.getDate() + expDays);
    const expDateStr = today.toISOString().split("T")[0];

    const zoneLabel =
      zone === "kulkas_chiller"
        ? "❄️ Chiller Kulkas"
        : zone === "suhu_ruang"
        ? "🥗 Crisper Sayur"
        : "🧊 Freezer Beku";

    const newItem = {
      id: Date.now(),
      name: `${name.trim()} (${qty} ${unit})`,
      rawName: name.trim(),
      qty: Number(qty) || 1,
      satuan: unit,
      quantityDisplay: `${qty} ${unit}`,
      price: Number(price) || 0,
      unitPrice: Math.round((Number(price) || 0) / (Number(qty) || 1)),
      exp: expDateStr,
      loc: zoneLabel,
      zone: zone,
      cat: "Bahan Segar",
      condition: "Input manual inventori",
      storageTip: "Simpan rapi di kulkas",
      status: expDays <= 2 ? "danger" : expDays <= 4 ? "warning" : "safe",
    };

    onAddItem(newItem);
    showToast(`✅ "${newItem.name}" berhasil ditambahkan ke inventori!`, "🎉");
    setName("");
    setQty(1);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex w-full max-w-md flex-col rounded-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-3 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950/70 dark:text-emerald-400">
              <Plus className="h-4 w-4" />
            </span>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Tambah Bahan Makanan Manual
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Nama Bahan Makanan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Tomat Cherry, Wortel, Telur..."
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:outline-none font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Jumlah / Kuantitas
              </label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:outline-none font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Satuan Fisik
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:outline-none font-medium cursor-pointer"
              >
                <option value="biji">Biji</option>
                <option value="butir">Butir</option>
                <option value="buah">Buah</option>
                <option value="potong">Potong</option>
                <option value="lembar">Lembar</option>
                <option value="ikat">Ikat</option>
                <option value="ekor">Ekor</option>
                <option value="porsi">Porsi</option>
                <option value="bungkus">Bungkus</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Zona Penyimpanan Kulkas
            </label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value)}
              className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:outline-none font-medium cursor-pointer"
            >
              <option value="suhu_ruang">🥗 Crisper Sayur & Buah</option>
              <option value="kulkas_chiller">❄️ Chiller Kulkas (Dingin)</option>
              <option value="freezer_beku">🧊 Freezer Beku</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Estimasi Harga Total (Rp)
              </label>
              <input
                type="number"
                step="500"
                value={price}
                onChange={(e) => setPrice(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:outline-none font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Masa Simpan (Hari)
              </label>
              <input
                type="number"
                min="1"
                value={expDays}
                onChange={(e) => setExpDays(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/80 p-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:border-emerald-500 focus:outline-none font-bold"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 active:scale-95 transition"
            >
              Simpan ke Inventori
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
