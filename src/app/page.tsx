"use client";

import React, { useState, useRef } from "react";
import SettingsModal from "@/components/SettingsModal";
import RecipeModal from "@/components/RecipeModal";
import ManualAddModal from "@/components/ManualAddModal";

interface InventoryItem {
  id: number;
  name: string;
  qty: string;
  expiryText: string;
  expiryColor: string;
  borderColor: string;
  location: string;
  locationIcon: string;
  category: "cook" | "ready";
  locationType: "fridge" | "freezer";
  iconEmoji: string;
  actionIcon: "search" | "plate" | "edit";
}

interface ShoppingItem {
  id: number;
  name: string;
  subtitle: string;
  subtitleColor: string;
  price: number;
  priceDisplay: string;
  checked: boolean;
  statusNote?: string;
}

export default function Home() {
  // Page mode: "dashboard" (Screen 1), "quickadd" (Screen 2), "olah" (Screen 3), "belanja" (Screen 4), or "setting" (Screen 5)
  const [currentView, setCurrentView] = useState<"dashboard" | "quickadd" | "olah" | "belanja" | "setting">("dashboard");
  const [financialSaved, setFinancialSaved] = useState<number>(285000);

  // Weekend Fridge Audit State (Figma 04)
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditStep, setAuditStep] = useState(0);

  // Edit Item State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // QuickAdd Scanner state
  const [scanQty, setScanQty] = useState(2);

  // Offline file input ref for settings
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Settings PWA States
  const [settingsToggles, setSettingsToggles] = useState({
    webPush: true,
    h3Reminder: true,
    h1Critical: true,
    antiSpamDigest: true,
  });

  const toggleSetting = (key: keyof typeof settingsToggles) => {
    setSettingsToggles((prev) => {
      const nextVal = !prev[key];
      showToast(nextVal ? "Pengaturan diaktifkan" : "Pengaturan dinonaktifkan", "⚙️");
      return { ...prev, [key]: nextVal };
    });
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `stockwatch-backup-${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    showToast("Data inventori berhasil diekspor (JSON)!", "💾");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported) && imported.length > 0) {
          setItems(imported);
          showToast(`Berhasil mengimpor ${imported.length} bahan dari cadangan!`, "🎉");
        } else {
          showToast("Format file JSON tidak sesuai", "⚠️");
        }
      } catch (err) {
        showToast("Gagal membaca file JSON", "❌");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleImportData = () => {
    fileInputRef.current?.click();
  };

  // Shopping List States matching Figma exactly
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([
    {
      id: 1,
      name: "Telur Ayam Kampung (10 butir)",
      subtitle: "Dibeli • Otomatis masuk stok kulkas!",
      subtitleColor: "text-[#059669]",
      price: 0,
      priceDisplay: "",
      checked: true,
      statusNote: "Dibeli • Otomatis masuk stok kulkas!",
    },
    {
      id: 2,
      name: "Tahu Sutra / Bandung (2 papan)",
      subtitle: "Habis kemarin • Prioritas Belanja",
      subtitleColor: "text-[#E11D48]",
      price: 10000,
      priceDisplay: "~Rp 10.000",
      checked: false,
    },
    {
      id: 3,
      name: "Bawang Merah & Putih (250g)",
      subtitle: "Pantry hampir habis",
      subtitleColor: "text-[#D97706]",
      price: 18000,
      priceDisplay: "~Rp 18.000",
      checked: false,
    },
    {
      id: 4,
      name: "Susu UHT Full Cream (1 Liter)",
      subtitle: "Kebutuhan sarapan mingguan",
      subtitleColor: "text-[#64748B]",
      price: 22000,
      priceDisplay: "~Rp 22.000",
      checked: false,
    },
  ]);
  const [isAddShoppingModalOpen, setIsAddShoppingModalOpen] = useState(false);
  const [newShoppingName, setNewShoppingName] = useState("");
  const [newShoppingPrice, setNewShoppingPrice] = useState("");

  const estimatedShoppingTotal = shoppingItems
    .filter((item) => !item.checked)
    .reduce((sum, item) => sum + item.price, 0);

  const toggleShopItem = (id: number) => {
    setShoppingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextChecked = !item.checked;
          if (nextChecked) {
            // Automatically add to inventory
            const cleanName = item.name.split("(")[0].trim();
            const cleanQty = item.name.includes("(")
              ? item.name.split("(")[1].replace(")", "").trim()
              : "1 porsi";
            const autoItem: InventoryItem = {
              id: Date.now(),
              name: cleanName,
              qty: cleanQty,
              expiryText: "7 Hari Lagi",
              expiryColor: "text-[#059669]",
              borderColor: "border-l-[#059669]",
              location: "Kulkas Utama",
              locationIcon: "❄️",
              category: "cook",
              locationType: "fridge",
              iconEmoji: item.name.includes("Telur") ? "🥚" : item.name.includes("Tahu") ? "🧈" : item.name.includes("Susu") ? "🥛" : "🧅",
              actionIcon: "edit",
            };
            setItems((prevItems) => [autoItem, ...prevItems]);
            showToast(`🛒 "${item.name}" dibeli! Otomatis masuk stok kulkas.`, "✨");
          } else {
            showToast(`Status "${item.name}" dikembalikan`, "↩️");
          }
          return {
            ...item,
            checked: nextChecked,
          };
        }
        return item;
      })
    );
  };

  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoppingName.trim()) return;
    const priceNum = parseInt(newShoppingPrice.replace(/\D/g, "")) || 0;
    const newItem: ShoppingItem = {
      id: Date.now(),
      name: newShoppingName.trim(),
      subtitle: "Kebutuhan belanja tambahan",
      subtitleColor: "text-[#64748B]",
      price: priceNum,
      priceDisplay: priceNum > 0 ? `~Rp ${priceNum.toLocaleString("id-ID")}` : "",
      checked: false,
    };
    setShoppingItems((prev) => [...prev, newItem]);
    setNewShoppingName("");
    setNewShoppingPrice("");
    setIsAddShoppingModalOpen(false);
    showToast(`"${newItem.name}" ditambahkan ke daftar belanja!`, "🛒");
  };

  // QuickAdd modal / view states
  const [quickAddTab, setQuickAddTab] = useState<"ai" | "manual">("ai");
  const [isAiScanning, setIsAiScanning] = useState(false);

  // Settings & Recipe Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [recipePrefilledItem, setRecipePrefilledItem] = useState<string | undefined>(undefined);

  // Filters for Dashboard
  const [categoryFilter, setCategoryFilter] = useState<"all" | "cook" | "ready">("all");
  const [locationFilter, setLocationFilter] = useState<"all" | "fridge" | "freezer">("all");
  const [activeTab, setActiveTab] = useState<"stok" | "olah" | "add" | "belanja" | "setting">("stok");

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string, icon: string = "✨") => {
    setToastMessage(`${icon} ${msg}`);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const handleCookRecipe = (recipeName: string, financialValue: number, itemNames: string[]) => {
    setFinancialSaved((prev) => prev + financialValue);
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !itemNames.some(
            (used) =>
              item.name.toLowerCase().includes(used.toLowerCase()) ||
              used.toLowerCase().includes(item.name.toLowerCase())
          )
      )
    );
    showToast(
      `🎉 Menu "${recipeName}" berhasil dimasak! Finansial +Rp ${financialValue.toLocaleString(
        "id-ID"
      )}, bahan kulkas otomatis berkurang.`,
      "🍳"
    );
  };

  // Sample Inventory exactly matching the Figma design
  const [items, setItems] = useState<InventoryItem[]>([
    {
      id: 1,
      name: "Kangkung Segar",
      qty: "2 ikat",
      expiryText: "Basi Besok (H-1)",
      expiryColor: "text-[#E11D48]",
      borderColor: "border-l-[#E11D48]",
      location: "Kulkas Bawah",
      locationIcon: "❄️",
      category: "cook",
      locationType: "fridge",
      iconEmoji: "🥦",
      actionIcon: "search",
    },
    {
      id: 2,
      name: "Ayam Geprek Sisa Semalam",
      qty: "1 porsi",
      expiryText: "Habiskan Hari Ini!",
      expiryColor: "text-[#7C3AED]",
      borderColor: "border-l-[#7C3AED]",
      location: "Siap Saji",
      locationIcon: "🍱",
      category: "ready",
      locationType: "fridge",
      iconEmoji: "🍗",
      actionIcon: "plate",
    },
    {
      id: 3,
      name: "Susu UHT Fresh",
      qty: "500 ml",
      expiryText: "2 Hari Lagi (H-2)",
      expiryColor: "text-[#D97706]",
      borderColor: "border-l-[#D97706]",
      location: "Pintu Kulkas",
      locationIcon: "❄️",
      category: "cook",
      locationType: "fridge",
      iconEmoji: "🥛",
      actionIcon: "edit",
    },
    {
      id: 4,
      name: "Telur Ayam Kampung",
      qty: "10 butir",
      expiryText: "12 Hari Lagi",
      expiryColor: "text-[#059669]",
      borderColor: "border-l-[#059669]",
      location: "Rak Telur",
      locationIcon: "🥫",
      category: "cook",
      locationType: "fridge",
      iconEmoji: "🥚",
      actionIcon: "edit",
    },
    {
      id: 5,
      name: "Daging Sapi Slice",
      qty: "250 gram",
      expiryText: "25 Hari Lagi",
      expiryColor: "text-[#059669]",
      borderColor: "border-l-[#059669]",
      location: "Freezer",
      locationIcon: "🧊",
      category: "cook",
      locationType: "freezer",
      iconEmoji: "🥩",
      actionIcon: "edit",
    },
  ]);

  const filteredItems = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (locationFilter !== "all" && item.locationType !== locationFilter) return false;
    return true;
  });

  const handleSimpanItem = () => {
    const newItem: InventoryItem = {
      id: Date.now(),
      name: "Kangkung Segar",
      qty: `${scanQty} ikat`,
      expiryText: "3 Hari Lagi (H-3)",
      expiryColor: "text-[#D97706]",
      borderColor: "border-l-[#D97706]",
      location: "Kulkas Sayur",
      locationIcon: "❄️",
      category: "cook",
      locationType: "fridge",
      iconEmoji: "🥦",
      actionIcon: "search",
    };
    setItems((prev) => [newItem, ...prev]);
    showToast(`"${newItem.name}" (${newItem.qty}) berhasil disimpan ke Kulkas!`, "✨");
    setTimeout(() => {
      setCurrentView("dashboard");
      setActiveTab("stok");
    }, 1000);
  };

  const handleTriggerPhoto = () => {
    setIsAiScanning(true);
    showToast("Mengambil foto & AI sedang mendeteksi...", "📸");
    setTimeout(() => {
      setIsAiScanning(false);
      showToast("AI Vision: 98% Akurat! Kangkung Segar Terdeteksi", "🥦");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#0F172A] text-white px-5 py-3 rounded-xl shadow-2xl border border-[#0D9488] z-50 flex items-center gap-2 text-sm font-semibold transition-all">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container - 1440px Centered Canvas */}
      <div className="max-w-[1440px] mx-auto px-6 pt-5">
        
        {/* ========================================================================= */}
        {/* VIEW 1: DASHBOARD (Desktop - 1)                                           */}
        {/* ========================================================================= */}
        {currentView === "dashboard" && (
          <div>
            {/* Top Header */}
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center text-lg shadow-sm">
                  🍎
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">StockWatch</h1>
              </div>

              {/* Dapur Abdyka (PWA) Badge */}
              <div
                onClick={() => setIsSettingsOpen(true)}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide cursor-pointer hover:bg-[#D1FAE5] transition-colors"
                title="Buka Pengaturan AI & API Key"
              >
                <span>🌿</span>
                <span>Dapur Abdyka (PWA)</span>
              </div>
            </header>

            {/* Weekend Fridge Audit Banner */}
            <div className="w-full bg-[#F0FDFA] border border-[#0D9488] rounded-xl px-5 py-2.5 flex items-center justify-between mb-3.5 shadow-sm">
              <div className="flex items-center gap-2.5 text-sm font-semibold text-[#0D9488]">
                <span className="text-base">📅</span>
                <span>Weekend Fridge Audit (60s)</span>
              </div>
              <button
                onClick={() => {
                  setAuditStep(0);
                  setIsAuditOpen(true);
                }}
                className="bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors shadow-sm"
              >
                Mulai (60s)
              </button>
            </div>

            {/* Hero Financial Metric Card */}
            <div className="w-full bg-[#0D9488] rounded-2xl p-6 text-white mb-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold tracking-wider text-[#CCFBF1] uppercase">
                  HEMAT FINANSIAL BULAN INI
                </span>
                <div className="bg-[#0f766e] px-3 py-1 rounded-md text-[11px] font-bold text-white flex items-center gap-1">
                  <span>✓</span>
                  <span>Bebas Sampah</span>
                </div>
              </div>
              <div className="text-4xl font-black tracking-tight mb-1.5">
                Rp {financialSaved.toLocaleString("id-ID")}
              </div>
              <div className="text-xs font-medium text-[#E6FFFA]">
                14 bahan makanan diselamatkan sebelum kedaluwarsa
              </div>
            </div>

            {/* Target Audience Dual-Tab Filter */}
            <div className="w-full bg-[#F1F5F9] rounded-xl p-1 flex items-center gap-1 mb-3.5">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                  categoryFilter === "all"
                    ? "bg-white text-[#0D9488] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Semua ({items.length})
              </button>
              <button
                onClick={() => setCategoryFilter("cook")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  categoryFilter === "cook"
                    ? "bg-white text-[#0D9488] shadow-sm font-bold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>🥗</span>
                <span>Bahan Masak ({items.filter((i) => i.category === "cook").length})</span>
              </button>
              <button
                onClick={() => setCategoryFilter("ready")}
                className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  categoryFilter === "ready"
                    ? "bg-white text-[#0D9488] shadow-sm font-bold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>🍱</span>
                <span>Siap Saji ({items.filter((i) => i.category === "ready").length})</span>
              </button>
            </div>

            {/* High Urgency Alert Banner */}
            {items.some((i) => i.expiryText.includes("H-1") || i.expiryText.includes("Hari Ini")) && (
              <div className="w-full bg-[#FFF1F2] border border-[#FECDD3] rounded-xl px-4 py-2.5 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-bold text-[#E11D48]">
                  <span className="w-2 h-2 rounded-full bg-[#E11D48] inline-block animate-pulse"></span>
                  <span>
                    {items.filter((i) => i.expiryText.includes("H-1") || i.expiryText.includes("Hari Ini")).length} Bahan Kritis! Habis dalam &lt;24 jam
                  </span>
                </div>
                <button
                  onClick={() => {
                    setActiveTab("olah");
                    setCurrentView("olah");
                  }}
                  className="bg-[#E11D48] hover:bg-[#be123c] text-white text-xs font-bold px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                >
                  Olah Cepat
                </button>
              </div>
            )}

            {/* Section Header: INVENTORI DAPUR & Storage Filter Pills */}
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xs font-extrabold tracking-wider text-[#0F172A] uppercase">
                INVENTORI DAPUR
              </h2>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setLocationFilter("all")}
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                    locationFilter === "all"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white border border-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setLocationFilter("fridge")}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                    locationFilter === "fridge"
                      ? "bg-[#0F172A] text-white font-bold"
                      : "bg-white border border-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  ❄️ Kulkas
                </button>
                <button
                  onClick={() => setLocationFilter("freezer")}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all ${
                    locationFilter === "freezer"
                      ? "bg-[#0F172A] text-white font-bold"
                      : "bg-white border border-[#E2E8F0] text-[#64748B]"
                  }`}
                >
                  🧊 Freezer
                </button>
              </div>
            </div>

            {/* Inventory Item Cards List */}
            <div className="flex flex-col gap-2.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`w-full bg-white border border-[#E2E8F0] rounded-xl px-4 py-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow border-l-4 ${item.borderColor}`}
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg flex items-center justify-center text-xl">
                      {item.iconEmoji}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-extrabold text-[#0F172A]">{item.name}</span>
                        <span className="bg-[#F1F5F9] text-[#64748B] text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                          <span>{item.locationIcon}</span>
                          <span>{item.location}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs mt-0.5">
                        <span className={`font-bold ${item.expiryColor}`}>{item.expiryText}</span>
                        <span className="text-[#94A3B8]">•</span>
                        <span className="text-[#64748B] font-medium">{item.qty}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (item.actionIcon === "search" || item.actionIcon === "plate") {
                        setRecipePrefilledItem(item.name);
                        setActiveTab("olah");
                        setCurrentView("olah");
                      } else {
                        setEditingItem({ ...item });
                      }
                    }}
                    className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center text-sm transition-colors"
                  >
                    {item.actionIcon === "search" && "🔍"}
                    {item.actionIcon === "plate" && "🍽️"}
                    {item.actionIcon === "edit" && "✏️"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: QUICK ADD AI SCAN (Desktop - 2) Sesuai Gambar Figma              */}
        {/* ========================================================================= */}
        {currentView === "quickadd" && (
          <div className="animate-in fade-in duration-200">
            {/* Top Header */}
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center text-lg shadow-sm">
                  🍎
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Quick Add</h1>
              </div>

              {/* Target <5 Detik Badge */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide">
                <span>⚡</span>
                <span>Target &lt;5 Detik</span>
              </div>
            </header>

            {/* Modal Top Handle pill */}
            <div className="w-full flex justify-center mb-2">
              <div className="w-32 h-1.5 bg-[#CBD5E1] rounded-full"></div>
            </div>

            {/* Input Mode Switcher (AI Camera vs Input Manual) */}
            <div className="w-full bg-[#F1F5F9] rounded-xl p-1 flex items-center gap-1 mb-4 border border-[#E2E8F0]">
              <button
                onClick={() => setQuickAddTab("ai")}
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  quickAddTab === "ai"
                    ? "bg-[#0D9488] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>📸</span>
                <span>AI Camera Scan (Utama)</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddTab("manual");
                  setIsManualAddOpen(true);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  quickAddTab === "manual"
                    ? "bg-[#0D9488] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <span>✍️</span>
                <span>Input Manual</span>
              </button>
            </div>

            {/* AI Camera Viewfinder Box (Dark Chassis with Scanning Reticle) */}
            <div className="w-full bg-[#0F172A] rounded-2xl p-5 mb-5 shadow-md relative overflow-hidden border border-[#1E293B]">
              <div className="w-full h-56 rounded-xl relative flex flex-col items-center justify-center border border-[#2DD4BF]/40 border-dashed">
                
                {/* Top Badges Inside Viewfinder */}
                <div className="absolute top-3 left-4 bg-[#0D9488] text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#4ADE80] animate-pulse"></span>
                  <span>AI Vision Aktif</span>
                </div>

                <div className="absolute top-3 right-4 bg-black/70 text-[#34D399] px-3.5 py-1 rounded-full text-xs font-bold">
                  98% Akurat
                </div>

                {/* Center Detected Food Emoji */}
                <div className="text-7xl select-none filter drop-shadow-md my-auto">
                  🥦
                </div>

                {/* Camera Trigger Button (Circle) */}
                <button
                  onClick={handleTriggerPhoto}
                  className="w-12 h-12 rounded-full bg-[#0D9488] hover:bg-[#0f766e] border-2 border-white text-white flex items-center justify-center text-lg shadow-lg active:scale-90 transition-transform mb-3"
                  title="Ambil Foto Cepat"
                >
                  📷
                </button>
              </div>
            </div>

            {/* AI Result Card (HASIL ANALISA CERDAS AI) */}
            <div className="w-full bg-white border border-[#0D9488] rounded-2xl p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
                  <span>🧠</span>
                  <span>HASIL ANALISA CERDAS AI</span>
                </div>
                <span className="bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] text-[11px] font-bold px-3 py-1 rounded-full">
                  Otomatis Terisi
                </span>
              </div>

              {/* 4 Metadata Cards Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {/* Card 1: Nama Makanan */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                  <span className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                    NAMA MAKANAN
                  </span>
                  <div className="text-sm font-extrabold text-[#0F172A] mb-1">
                    Kangkung Segar ({scanQty} Ikat)
                  </div>
                  <div className="text-[11px] font-bold text-[#059669] flex items-center gap-1">
                    <span>🥗</span>
                    <span>Bahan Mentah</span>
                  </div>
                </div>

                {/* Card 2: Estimasi Harga */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                  <span className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                    ESTIMASI HARGA (ROI)
                  </span>
                  <div className="text-sm font-extrabold text-[#0D9488] mb-1">
                    Rp {(4500 * scanQty).toLocaleString("id-ID")}
                  </div>
                  <div className="text-[11px] font-bold text-[#059669] flex items-center gap-1">
                    <span>📊</span>
                    <span>Rata Pasar Lokal</span>
                  </div>
                </div>

                {/* Card 3: Prediksi Kedaluwarsa */}
                <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-xl p-3">
                  <span className="text-[10px] font-bold tracking-wider text-[#E11D48] uppercase block mb-1">
                    PREDIKSI KEDALUWARSA
                  </span>
                  <div className="text-sm font-extrabold text-[#E11D48] mb-1">3 Hari Lagi (H-3)</div>
                  <div className="text-[11px] font-bold text-[#E11D48] flex items-center gap-1">
                    <span>❄️</span>
                    <span>Chiller Kulkas</span>
                  </div>
                </div>

                {/* Card 4: Lokasi Penyimpanan */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                  <span className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                    LOKASI PENYIMPANAN
                  </span>
                  <div className="text-sm font-extrabold text-[#0F172A] mb-1">❄️ Kulkas Sayur</div>
                  <div className="text-[11px] font-medium text-[#64748B]">Suhu Chiller 4°C</div>
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSimpanItem}
                  className="flex-1 bg-[#0D9488] hover:bg-[#0f766e] text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>✨</span>
                  <span>Konfirmasi &amp; Simpan ke Kulkas</span>
                </button>
                <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-1">
                  <button
                    onClick={() => setScanQty((prev) => Math.max(1, prev - 1))}
                    className="w-9 h-11 text-[#64748B] hover:text-[#0F172A] font-bold text-lg flex items-center justify-center transition-colors"
                    title="Kurangi kuantitas"
                  >
                    -
                  </button>
                  <span className="w-7 text-center font-extrabold text-sm text-[#0F172A]">{scanQty}</span>
                  <button
                    onClick={() => setScanQty((prev) => prev + 1)}
                    className="w-9 h-11 text-[#64748B] hover:text-[#0F172A] font-bold text-lg flex items-center justify-center transition-colors"
                    title="Tambah kuantitas"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Bottom Note */}
              <p className="text-xs text-[#94A3B8] font-medium mt-3">
                Otomatis menambah saldo hemat Rp 4.500 saat dimasak!
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: OLAH RESEP (Screen 3) Sesuai Desain Olah Resep                    */}
        {/* ========================================================================= */}
        {currentView === "olah" && (
          <div className="animate-in fade-in duration-200">
            {/* Top Header */}
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center text-lg shadow-sm">
                  🍎
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Olah Resep</h1>
              </div>

              {/* Anti Bahan Basi Badge */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide">
                <span>🔍</span>
                <span>Anti Bahan Basi</span>
              </div>
            </header>

            {/* Hero Alert: 2 Bahan Harus Dihabiskan Hari Ini */}
            <div className="w-full bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-5 mb-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#E11D48] mb-1">
                <span>⚠️</span>
                <span>2 BAHAN HARUS DIHABISKAN HARI INI!</span>
              </div>
              <p className="text-xs text-[#64748B] mb-3">
                Paduan bahan mentah &amp; lauk matang yang hampir basi:
              </p>

              <div className="flex flex-wrap items-center gap-2.5">
                <div className="bg-white border border-[#FECDD3] rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <span>🥬</span>
                  <span className="text-xs font-bold text-[#E11D48]">Kangkung (H-1)</span>
                </div>

                <div className="bg-white border border-[#E9D5FF] rounded-full px-4 py-1.5 flex items-center gap-1.5 shadow-sm">
                  <span>🍗</span>
                  <span className="text-xs font-bold text-[#7C3AED]">Ayam Geprek Sisa</span>
                </div>
              </div>
            </div>

            {/* Section Title */}
            <h2 className="text-xs font-extrabold tracking-wider text-[#0F172A] uppercase mb-3.5">
              REKOMENDASI RESEP ZERO-WASTE (10 MENIT)
            </h2>

            {/* Recipe Card 1: Nasi Goreng Ayam Suwir Kangkung */}
            <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-2.5">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Nasi Goreng Ayam Suwir Kangkung</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                    <span>⏱</span>
                    <span>12 Menit • Level: Sangat Mudah • Porsi 1 Orang</span>
                  </div>
                </div>

                <span className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  Bahan Lengkap!
                </span>
              </div>

              {/* Langkah Kilat Dapur Box */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4 border border-[#F1F5F9] max-w-xl">
                <div className="font-bold text-xs text-[#0F172A] mb-1.5">Langkah Kilat Dapur:</div>
                <div className="text-xs text-[#475569] space-y-1 leading-relaxed">
                  <div>1. Suwir daging ayam geprek, tumis dengan bawang merah &amp; cabe.</div>
                  <div>2. Masukkan potongan kangkung, oseng cepat 1 menit.</div>
                  <div>3. Masukkan nasi dingin &amp; 1 sdm kecap manis. Aduk rata!</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  handleCookRecipe("Nasi Goreng Ayam Suwir Kangkung", 35000, ["Kangkung Segar", "Ayam Geprek Sisa Semalam"])
                }
                className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0f766e] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <span>✅</span>
                <span>Masak &amp; Selamatkan Finansial Rp 35.000</span>
              </button>
            </div>

            {/* Recipe Card 2: Tumis Kangkung Terasi & Crispy Chicken */}
            <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-6 mb-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-2.5">
                <div>
                  <h3 className="text-lg font-bold text-[#0F172A]">Tumis Kangkung Terasi &amp; Crispy Chicken</h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                    <span>⏱</span>
                    <span>8 Menit • Oseng Wajan Kering Cepat</span>
                  </div>
                </div>

                <span className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">
                  Bahan Lengkap!
                </span>
              </div>

              {/* Langkah Kilat Dapur Box */}
              <div className="bg-[#F8FAFC] rounded-xl p-4 mb-4 border border-[#F1F5F9] max-w-xl">
                <div className="font-bold text-xs text-[#0F172A] mb-1.5">Langkah Kilat Dapur:</div>
                <div className="text-xs text-[#475569] space-y-1 leading-relaxed">
                  <div>1. Panaskan ayam di wajan tanpa minyak agar kulit garing kembali.</div>
                  <div>2. Di wajan lain, tumis bawang putih, cabe rawit, dan terasi.</div>
                  <div>3. Masukkan kangkung segar, oseng api besar 2 menit. Taburi ayam.</div>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() =>
                  handleCookRecipe("Tumis Kangkung Terasi & Crispy Chicken", 25000, ["Kangkung Segar", "Ayam Geprek Sisa Semalam"])
                }
                className="inline-flex items-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white text-sm font-bold px-6 py-3 rounded-xl shadow-sm transition-all active:scale-95"
              >
                <span>✅</span>
                <span>Masak Menu Ini</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 4: DAFTAR BELANJA (Screen 4) Sesuai Gambar Daftar Belanja            */}
        {/* ========================================================================= */}
        {currentView === "belanja" && (
          <div className="animate-in fade-in duration-200">
            {/* Top Header */}
            <header className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center text-lg shadow-sm">
                  🍎
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Daftar Belanja</h1>
              </div>

              {/* Anti-Impulsif Badge */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide">
                <span>🛒</span>
                <span>Anti-Impulsif</span>
              </div>
            </header>

            {/* Subtitle */}
            <p className="text-xs text-[#64748B] mb-5">
              Otomatis terisi dari bahan yang habis saat audit kulkas.
            </p>

            {/* Shopping Items List */}
            <div className="space-y-3 mb-5">
              {shoppingItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleShopItem(item.id)}
                  className="w-full bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 flex items-center justify-between shadow-xs hover:border-[#CBD5E1] transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Checkbox */}
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                        item.checked
                          ? "bg-[#0D9488] text-white"
                          : "border-2 border-[#CBD5E1] bg-white hover:border-[#0D9488]"
                      }`}
                    >
                      {item.checked && <span className="text-xs font-bold">✓</span>}
                    </div>

                    {/* Text Details */}
                    <div>
                      <div
                        className={`text-sm ${
                          item.checked
                            ? "text-[#94A3B8] font-semibold"
                            : "text-[#0F172A] font-bold"
                        }`}
                      >
                        {item.name}
                      </div>
                      <div
                        className={`text-xs mt-0.5 ${
                          item.checked ? "text-[#059669] font-medium" : item.subtitleColor
                        }`}
                      >
                        {item.checked
                          ? "Dibeli • Otomatis masuk stok kulkas!"
                          : item.subtitle}
                      </div>
                    </div>
                  </div>

                  {/* Price Tag */}
                  {!item.checked && item.priceDisplay && (
                    <div className="text-sm font-bold text-[#64748B]">
                      {item.priceDisplay}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Shopping Item Button */}
            <button
              onClick={() => setIsAddShoppingModalOpen(true)}
              className="w-full py-3.5 rounded-xl border border-[#0D9488] bg-white hover:bg-[#F0FDFA] text-[#0D9488] font-bold text-sm flex items-center justify-center gap-2 mb-5 transition-colors shadow-xs"
            >
              <span>+ Tambah Barang Belanjaan Manual</span>
            </button>

            {/* Bottom Budget Summary Banner */}
            <div className="w-full bg-[#0F172A] rounded-2xl p-6 text-white mb-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold tracking-wider text-[#94A3B8] uppercase">
                  ESTIMASI TOTAL BELANJA MINGGU INI
                </span>
                <span className="text-xs font-bold text-[#34D399]">
                  Terkendali &amp; Terencana
                </span>
              </div>
              <div className="text-2xl md:text-3xl font-black tracking-tight mb-2">
                Rp {estimatedShoppingTotal.toLocaleString("id-ID")}
              </div>
              <p className="text-xs text-[#64748B]">
                Menghindari pembengkakan belanja impulsif di pasar/supermarket.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 5: PENGATURAN PWA (Screen 5) Sesuai Gambar Pengaturan PWA            */}
        {/* ========================================================================= */}
        {currentView === "setting" && (
          <div className="animate-in fade-in duration-200">
            {/* Top Header */}
            <header className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center text-lg shadow-sm text-white">
                  🍎
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Pengaturan PWA</h1>
              </div>

              {/* Notifikasi Cerdas Badge */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide">
                <span>⚙️</span>
                <span>Notifikasi Cerdas</span>
              </div>
            </header>

            {/* Section 1: Preferensi Pengingat (Anti-Spam) */}
            <div className="mb-6">
              <h2 className="text-xs font-extrabold tracking-wider text-[#0F172A] uppercase mb-3.5">
                PREFERENSI PENGINGAT (ANTI-SPAM)
              </h2>

              <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm divide-y divide-[#F1F5F9]">
                {/* Setting 1: Web Push */}
                <div className="flex items-center justify-between pb-4">
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">Web Push Notification</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">Pengingat langsung ke HP tanpa unduh native app</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("webPush")}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      settingsToggles.webPush ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                        settingsToggles.webPush ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Setting 2: H-3 Reminder */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">Pengingat H-3 (Persiapan Dapur)</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">Notifikasi hening pukul 17:00 sore</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("h3Reminder")}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      settingsToggles.h3Reminder ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                        settingsToggles.h3Reminder ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Setting 3: H-1 Critical */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">Pengingat H-1 (Peringatan Kritis)</div>
                    <div className="text-xs text-[#E11D48] font-medium mt-0.5">Prioritas tinggi pukul 09:00 pagi</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("h1Critical")}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      settingsToggles.h1Critical ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                        settingsToggles.h1Critical ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>

                {/* Setting 4: Anti-Spam Digest */}
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">Anti-Spam Digest (Gabung Notif)</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">Maksimal 1 notifikasi rangkuman per hari</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("antiSpamDigest")}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${
                      settingsToggles.antiSpamDigest ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                    }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${
                        settingsToggles.antiSpamDigest ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Local-First Offline Storage */}
            <div className="mb-6">
              <h2 className="text-xs font-extrabold tracking-wider text-[#0F172A] uppercase mb-3.5">
                LOCAL-FIRST OFFLINE STORAGE
              </h2>

              <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <div className="text-sm font-bold text-[#0F172A] mb-1">
                  Data Tersimpan Aman di Peramban Anda
                </div>
                <p className="text-xs text-[#64748B] mb-4">
                  Aplikasi tetap bisa digunakan saat memasak di dapur tanpa sinyal.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <span>💾</span>
                    <span>Ekspor Data (JSON)</span>
                  </button>

                  <button
                    onClick={handleImportData}
                    className="px-4 py-2.5 bg-[#F1F5F9] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#0F172A] flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <span>🔄</span>
                    <span>Impor Cadangan</span>
                  </button>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImportFile}
                    accept=".json"
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating / Sticky Bottom Navigation Bar matching the Figma Design exactly */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E2E8F0] shadow-lg z-40">
        <div className="max-w-[720px] mx-auto h-20 flex items-center justify-around px-6 relative">
          
          {/* Stok Tab */}
          <button
            onClick={() => {
              setActiveTab("stok");
              setCurrentView("dashboard");
            }}
            className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#0D9488] transition-colors"
          >
            <span className="text-2xl">📋</span>
            <span
              className={`text-xs font-bold ${
                currentView === "dashboard" && activeTab === "stok"
                  ? "text-[#0D9488]"
                  : "text-[#64748B]"
              }`}
            >
              Stok
            </span>
          </button>

          {/* Olah Tab */}
          <button
            onClick={() => {
              setActiveTab("olah");
              setCurrentView("olah");
            }}
            className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#0D9488] transition-colors"
          >
            <span className="text-2xl">🍳</span>
            <span
              className={`text-xs font-semibold ${
                currentView === "olah" || activeTab === "olah"
                  ? "text-[#0D9488] font-bold"
                  : "text-[#64748B]"
              }`}
            >
              Olah
            </span>
          </button>

          {/* Floating Plus Button (Quick Add) -> Switches to Quick Add Screen 2 */}
          <div className="relative -top-4">
            <button
              onClick={() => {
                if (currentView === "quickadd") {
                  setCurrentView("dashboard");
                  setActiveTab("stok");
                } else {
                  setCurrentView("quickadd");
                  setActiveTab("add");
                }
              }}
              className="w-14 h-14 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-lg shadow-[#0D9488]/40 border-4 border-white transition-transform active:scale-95"
              title="Quick Add Cepat (<5 Detik)"
            >
              +
            </button>
          </div>

          {/* Belanja Tab */}
          <button
            onClick={() => {
              setActiveTab("belanja");
              setCurrentView("belanja");
            }}
            className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#0D9488] transition-colors"
          >
            <span className="text-2xl">🛒</span>
            <span
              className={`text-xs font-semibold ${
                currentView === "belanja" || activeTab === "belanja"
                  ? "text-[#0D9488] font-bold"
                  : "text-[#64748B]"
              }`}
            >
              Belanja
            </span>
          </button>

          {/* Setting Tab (Previously Notif) */}
          <button
            onClick={() => {
              setActiveTab("setting");
              setCurrentView("setting");
            }}
            className="flex flex-col items-center gap-1 text-[#64748B] hover:text-[#0D9488] transition-colors"
          >
            <span className="text-2xl">⚙️</span>
            <span
              className={`text-xs font-semibold ${
                currentView === "setting" || activeTab === "setting"
                  ? "text-[#0D9488] font-bold"
                  : "text-[#64748B]"
              }`}
            >
              Setting
            </span>
          </button>
        </div>
      </nav>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        showToast={showToast}
      />

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={isRecipeOpen}
        onClose={() => setIsRecipeOpen(false)}
        prefilledItemName={recipePrefilledItem}
        showToast={showToast}
        onCookRecipe={(usedIngredients) => {
          handleCookRecipe("Menu Masakan Kulkas", 25000, usedIngredients);
          setIsRecipeOpen(false);
        }}
        inventory={items.map((i) => ({
          id: i.id,
          name: i.name,
          rawName: i.name,
          qty: 1,
          satuan: i.qty,
          price: 10000,
          exp: "2026-10-12",
          loc: i.location,
          zone: "fridge",
          cat: i.category,
          status: "danger",
        }))}
      />

      {/* Manual Add Modal */}
      <ManualAddModal
        isOpen={isManualAddOpen}
        onClose={() => setIsManualAddOpen(false)}
        showToast={showToast}
        onAddItem={(newItem) => {
          const itemToAdd: InventoryItem = {
            id: newItem.id || Date.now(),
            name: newItem.rawName || newItem.name.split("(")[0].trim(),
            qty: newItem.quantityDisplay || `${newItem.qty} ${newItem.satuan || "pcs"}`,
            expiryText: "5 Hari Lagi",
            expiryColor: "text-[#059669]",
            borderColor: "border-l-[#059669]",
            location: newItem.loc || "Kulkas Utama",
            locationIcon: "❄️",
            category: "cook",
            locationType: newItem.zone === "freezer_beku" ? "freezer" : "fridge",
            iconEmoji: "🥬",
            actionIcon: "edit",
          };
          setItems((prev) => [itemToAdd, ...prev]);
          showToast(`"${itemToAdd.name}" ditambahkan ke inventori!`, "✨");
        }}
      />

      {/* Modal Tambah Barang Belanjaan Manual */}
      {isAddShoppingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <h3 className="text-base font-extrabold text-[#0F172A] mb-4 flex items-center gap-2">
              <span>🛒</span> Tambah Barang Belanjaan Manual
            </h3>
            <form onSubmit={handleAddShoppingItem} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">
                  Nama Barang Belanja
                </label>
                <input
                  type="text"
                  value={newShoppingName}
                  onChange={(e) => setNewShoppingName(e.target.value)}
                  placeholder="Misal: Minyak Goreng 2L, Tempe..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488]"
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">
                  Estimasi Harga (Opsional)
                </label>
                <input
                  type="number"
                  value={newShoppingPrice}
                  onChange={(e) => setNewShoppingPrice(e.target.value)}
                  placeholder="Misal: 15000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488]"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddShoppingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newShoppingName.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#0f766e] text-white disabled:opacity-50 transition"
                >
                  + Tambah ke Daftar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL AUDIT KULKAS (60s Weekend Fridge Audit Sesuai Figma)                */}
      {/* ========================================================================= */}
      {isAuditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-[#F8FAFC] rounded-2xl w-full max-w-md shadow-2xl border border-[#CBD5E1] overflow-hidden animate-in zoom-in-95 duration-150">
            {/* Modal Top Header */}
            <div className="bg-white border-b border-[#E2E8F0] px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#0D9488] rounded-lg flex items-center justify-center text-sm text-white">
                  🍎
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A]">Audit Kulkas</h3>
                  <div className="text-[10px] text-[#64748B]">Sinkronisasi cepat mingguan</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-[11px] font-bold text-[#059669]">
                  ⏱️ 60 Detik
                </span>
                <button
                  onClick={() => {
                    setIsAuditOpen(false);
                    setAuditStep(0);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center font-bold text-base transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Audit Body */}
            <div className="p-5">
              {auditStep < Math.min(items.length, 4) ? (
                <>
                  {/* Explainer Banner */}
                  <div className="bg-[#F0FDFA] border border-[#0D9488]/30 rounded-xl p-3 mb-4 text-xs">
                    <div className="font-bold text-[#0D9488] flex items-center gap-1.5 mb-0.5">
                      <span>✨</span>
                      <span>Sinkronisasi Kulkas Tanpa Ribet</span>
                    </div>
                    <p className="text-[11px] text-[#0F766E] leading-relaxed">
                      Pilih status bahan untuk perbarui stok &amp; hitung penghematan mingguan.
                    </p>
                  </div>

                  {/* Step Counter */}
                  <div className="text-center text-[10px] font-extrabold tracking-wider text-[#94A3B8] uppercase mb-3">
                    ITEM {auditStep + 1} DARI {Math.min(items.length, 4)} UNTUK DICEK
                  </div>

                  {/* Active Audit Card */}
                  {items[auditStep] && (
                    <div className="bg-white border-2 border-[#0D9488] rounded-2xl p-6 text-center shadow-md mb-4">
                      <div className="w-20 h-20 bg-[#F8FAFC] border border-[#F1F5F9] rounded-full flex items-center justify-center text-4xl mx-auto mb-3">
                        {items[auditStep].iconEmoji}
                      </div>

                      <h4 className="text-lg font-black text-[#0F172A] mb-1">
                        {items[auditStep].name}
                      </h4>
                      <div className="text-xs font-bold text-[#E11D48] mb-3">
                        Tercatat {items[auditStep].expiryText} di {items[auditStep].location} ({items[auditStep].qty})
                      </div>

                      <p className="text-xs text-[#64748B] leading-relaxed mb-5">
                        Apakah bahan ini masih ada di kulkas, sudah dimasak, atau terlanjur layu?
                      </p>

                      {/* Decision Buttons */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              const curr = items[auditStep];
                              // Hapus dari items dan masukkan ke daftar belanja
                              setItems((prev) => prev.filter((it) => it.id !== curr.id));
                              setShoppingItems((prev) => [
                                {
                                  id: Date.now(),
                                  name: curr.name,
                                  subtitle: "Habis / Dibuang saat audit",
                                  subtitleColor: "text-[#E11D48]",
                                  price: 15000,
                                  priceDisplay: "~Rp 15.000",
                                  checked: false,
                                },
                                ...prev,
                              ]);
                              showToast(`"${curr.name}" dipindahkan ke Daftar Belanja`, "🗑️");
                              setAuditStep((s) => s + 1);
                            }}
                            className="bg-[#FFF1F2] border border-[#FECDD3] hover:bg-[#FFE4E6] text-[#E11D48] text-xs font-bold py-2.5 rounded-xl transition-all"
                          >
                            🗑️ Terlanjur Dibuang
                          </button>

                          <button
                            onClick={() => {
                              const curr = items[auditStep];
                              setItems((prev) => prev.filter((it) => it.id !== curr.id));
                              setFinancialSaved((prev) => prev + 15000);
                              showToast(`🎉 "${curr.name}" dimasak! Saldo hemat +Rp 15.000`, "🍳");
                              setAuditStep((s) => s + 1);
                            }}
                            className="bg-[#ECFDF5] border border-[#A7F3D0] hover:bg-[#D1FAE5] text-[#059669] text-xs font-bold py-2.5 rounded-xl transition-all"
                          >
                            🍳 Sudah Dimasak!
                          </button>
                        </div>

                        <button
                          onClick={() => setAuditStep((s) => s + 1)}
                          className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] text-xs font-bold py-2 rounded-xl transition-all"
                        >
                          ⏩ Masih Ada di Kulkas (Lewati)
                        </button>
                      </div>
                    </div>
                  )}

                  {/* UX Rationale Box */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 text-xs">
                    <div className="font-bold text-[#0D9488] mb-1">
                      🧠 Rationale UX: Mengapa Fitur Ini Mencegah Churn?
                    </div>
                    <ul className="text-[11px] text-[#475569] space-y-0.5 list-disc list-inside">
                      <li>Cukup 60 detik tiap hari Minggu untuk re-sync tanpa input dari awal.</li>
                      <li>Bahan yang dibuang otomatis masuk usulan daftar belanja minggu depan.</li>
                    </ul>
                  </div>
                </>
              ) : (
                /* Audit Complete Screen */
                <div className="text-center py-6">
                  <div className="w-16 h-16 bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] rounded-full flex items-center justify-center text-3xl mx-auto mb-3">
                    🎉
                  </div>
                  <h4 className="text-lg font-black text-[#0F172A] mb-1">
                    Audit Kulkas Selesai!
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-xs mx-auto mb-5">
                    Data inventori kulkas Anda sekarang 100% mutakhir dan selaras dengan daftar belanja &amp; resep.
                  </p>

                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 max-w-xs mx-auto mb-5 text-left space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Kerapian Kulkas:</span>
                      <span className="font-bold text-[#059669]">100% Sinkron</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Stok Tersisa:</span>
                      <span className="font-bold text-[#0F172A]">{items.length} Bahan</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#64748B]">Daftar Belanja:</span>
                      <span className="font-bold text-[#0D9488]">Terkendali</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setIsAuditOpen(false);
                      setAuditStep(0);
                      showToast("Kulkas berhasil diaudit & disinkronkan!", "✨");
                    }}
                    className="w-full max-w-xs bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm"
                  >
                    Selesai &amp; Kembali ke Kulkas
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL EDIT ITEM INVENTORI                                                 */}
      {/* ========================================================================= */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <span>✏️</span> Ubah Bahan Makanan
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center font-bold text-base"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setItems((prev) =>
                  prev.map((it) => (it.id === editingItem.id ? editingItem : it))
                );
                showToast(`Perubahan "${editingItem.name}" berhasil disimpan`, "💾");
                setEditingItem(null);
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">
                  Nama Bahan Makanan
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">
                  Jumlah / Kuantitas
                </label>
                <input
                  type="text"
                  value={editingItem.qty}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, qty: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    Lokasi Penyimpanan
                  </label>
                  <select
                    value={editingItem.location}
                    onChange={(e) => {
                      const loc = e.target.value;
                      const isFreezer = loc.toLowerCase().includes("freezer");
                      setEditingItem({
                        ...editingItem,
                        location: loc,
                        locationIcon: isFreezer ? "🧊" : "❄️",
                        locationType: isFreezer ? "freezer" : "fridge",
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="Kulkas Sayur">❄️ Kulkas Sayur</option>
                    <option value="Kulkas Utama">❄️ Kulkas Utama</option>
                    <option value="Chiller">❄️ Chiller</option>
                    <option value="Freezer Atas">🧊 Freezer Atas</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    Kategori Bahan
                  </label>
                  <select
                    value={editingItem.category}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        category: e.target.value as "cook" | "ready",
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="cook">🥗 Bahan Masak</option>
                    <option value="ready">🍗 Siap Saji / Matang</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = editingItem;
                    setItems((prev) => prev.filter((it) => it.id !== toDelete.id));
                    showToast(`"${toDelete.name}" telah dihapus dari kulkas`, "🗑️");
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#E11D48] hover:bg-[#FFF1F2] transition"
                >
                  Hapus Item
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#0f766e] text-white transition shadow-sm"
                  >
                    Simpan Perubahan
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
