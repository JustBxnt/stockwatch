"use client";

import React, { useState } from "react";
import { X, ChefHat, Clock, Sparkles, Check, Utensils, Flame, ArrowRight } from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  rawName: string;
  qty: number;
  satuan: string;
  quantityDisplay?: string;
  price: number;
  exp: string;
  loc: string;
  zone: string;
  cat: string;
  status: "safe" | "warning" | "danger";
}

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  prefilledItemName?: string;
  onCookRecipe?: (usedItemNames: string[]) => void;
  showToast: (msg: string, icon?: string) => void;
}

export default function RecipeModal({
  isOpen,
  onClose,
  inventory,
  prefilledItemName,
  onCookRecipe,
  showToast,
}: RecipeModalProps) {
  const [selectedRecipeIndex, setSelectedRecipeIndex] = useState(0);

  if (!isOpen) return null;

  // Derive dynamic zero-waste recipes from fridge items
  const expiringItems = inventory.filter((item) => item.status === "danger" || item.status === "warning");
  const availableNames = inventory.map((i) => i.rawName || i.name);

  const recipes = [
    {
      title: "Tumis Aneka Sayur & Bumbu Saus Tiram",
      style: "Zero-Waste Cepat Saji",
      time: "15 Menit",
      difficulty: "Sangat Mudah",
      description: "Solusi kilat menghabiskan stok sayuran yang mendekati batas simpan agar tetap renyah dan bergizi tinggi.",
      fridgeIngredients: availableNames.slice(0, 3),
      pantryIngredients: ["2 siung bawang putih", "1 sdm saus tiram", "1 sdt minyak wijen", "Garam & lada secukupnya"],
      steps: [
        "Cuci bersih bahan sayuran kulkas dan potong sesuai selera.",
        "Tumis bawang putih cincang hingga harum kekuningan.",
        "Masukkan sayuran yang bertekstur keras terlebih dahulu, lalu masukkan daun-daunan.",
        "Bumbui dengan saus tiram, garam, dan lada. Aduk rata selama 3 menit hingga matang pas.",
        "Sajikan hangat bersama nasi putih."
      ]
    },
    {
      title: "Sup Bening Segar Sehat Kaldu Alami",
      style: "Hidangan Hangat Berkuah",
      time: "25 Menit",
      difficulty: "Mudah",
      description: "Memanfaatkan sayuran dan lauk untuk sup bening kaya serat yang menyegarkan tubuh.",
      fridgeIngredients: availableNames.slice(0, 2),
      pantryIngredients: ["3 siung bawang merah", "2 siung bawang putih", "750 ml air", "1 batang seledri", "Garam & kaldu jamur"],
      steps: [
        "Didihkan air dalam panci bersama irisan bawang merah dan bawang putih.",
        "Masukkan bahan sayuran dan bumbu perasa.",
        "Masak dengan api sedang hingga sayuran empuk dan kuah mengeluarkan aroma sedap.",
        "Koreksi rasa, taburi seledri, dan angkat selagi hangat."
      ]
    },
    {
      title: "Salad Buah Tropis Saus Madu Jeruk",
      style: "Camilan Segar & Kaya Vitamin",
      time: "10 Menit",
      difficulty: "Praktis",
      description: "Kombinasi buah segar kulkas dengan dressing madu alami pencegah pembusukan buah.",
      fridgeIngredients: availableNames.filter((n) => /buah|alpukat|tomat|jeruk|apel|semangka|pisang/i.test(n)).slice(0, 3),
      pantryIngredients: ["2 sdm madu murni", "1 sdm perasan jeruk nipis/lemon", "Sedikit chia seed atau keju parut"],
      steps: [
        "Kupas dan potong dadu buah-buahan segar kulkas.",
        "Campurkan perasan jeruk dan madu dalam mangkuk kecil sebagai dressing.",
        "Tuang dressing ke atas potongan buah, aduk perlahan agar tidak memar.",
        "Bisa disimpan 15 menit di chiller kulkas sebelum dinikmati dingin."
      ]
    }
  ];

  const currentRecipe = recipes[selectedRecipeIndex];

  const handleCook = () => {
    if (onCookRecipe) {
      onCookRecipe(currentRecipe.fridgeIngredients);
    }
    showToast(`🎉 Menu "${currentRecipe.title}" dimasak! Bahan kulkas terpakai otomatis berkurang.`, "🍳");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400">
              <ChefHat className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                AI Chef: Resep Zero-Waste Pintar <Sparkles className="h-4 w-4 text-amber-500" />
              </h2>
              <p className="text-xs text-zinc-500">Olah bahan kulkas yang mendekati kadaluarsa menjadi hidangan lezat</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Recipe Selector Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recipes.map((r, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedRecipeIndex(idx)}
                className={`text-xs px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition border ${
                  selectedRecipeIndex === idx
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-transparent hover:bg-zinc-200 dark:hover:bg-zinc-700"
                }`}
              >
                🍳 {r.title.split("&")[0]}
              </button>
            ))}
          </div>

          {/* Active Recipe Banner */}
          <div className="rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-emerald-500/10 border border-emerald-500/20 p-4 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {currentRecipe.style}
              </span>
              <div className="flex items-center gap-3 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-emerald-600" /> {currentRecipe.time}
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="h-3.5 w-3.5 text-amber-500" /> {currentRecipe.difficulty}
                </span>
              </div>
            </div>
            <h3 className="text-base font-black text-zinc-900 dark:text-zinc-100">{currentRecipe.title}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">{currentRecipe.description}</p>
          </div>

          {/* Ingredients Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Dari Kulkas Anda */}
            <div className="rounded-xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-3.5 space-y-2">
              <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5">
                <Utensils className="h-3.5 w-3.5 text-emerald-600" /> Bahan dari Kulkas Anda:
              </span>
              <div className="space-y-1">
                {currentRecipe.fridgeIngredients.length > 0 ? (
                  currentRecipe.fridgeIngredients.map((item, i) => (
                    <div key={i} className="text-xs flex items-center gap-1.5 text-emerald-800 dark:text-emerald-200 font-medium">
                      <span className="h-4 w-4 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-800 dark:text-emerald-100 flex items-center justify-center text-[10px] font-bold">
                        ✓
                      </span>
                      <span>{item}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-500 italic">Bahan segar umum di dapur</p>
                )}
              </div>
            </div>

            {/* Bumbu Pelengkap Dapur */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/40 p-3.5 space-y-2">
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                🧂 Bumbu Pelengkap:
              </span>
              <div className="space-y-1">
                {currentRecipe.pantryIngredients.map((item, i) => (
                  <div key={i} className="text-xs text-zinc-600 dark:text-zinc-400 font-medium flex items-center gap-1.5">
                    <span className="text-zinc-400">•</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Steps */}
          <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 space-y-2.5 bg-zinc-50/50 dark:bg-zinc-900/30">
            <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              🍳 Langkah Praktis Memasak:
            </h4>
            <div className="space-y-2">
              {currentRecipe.steps.map((step, sIdx) => (
                <div key={sIdx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                  <span className="h-5 w-5 shrink-0 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px]">
                    {sIdx + 1}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <button
            onClick={onClose}
            className="rounded-xl border border-zinc-300 px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 transition"
          >
            Tutup
          </button>
          <button
            onClick={handleCook}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-700 active:scale-95 transition"
          >
            <ChefHat className="h-4 w-4" />
            Masak Menu Ini (Kurangi Stok Otomatis)
          </button>
        </div>
      </div>
    </div>
  );
}
