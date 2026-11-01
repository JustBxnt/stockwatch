"use client";

import React, { useState, useRef, useEffect } from "react";
import SettingsModal from "@/components/SettingsModal";
import RecipeModal from "@/components/RecipeModal";
import ManualAddModal from "@/components/ManualAddModal";
import AuthModal from "@/components/AuthModal";
import { supabase } from "@/lib/supabase";
import {
  getCurrentUser,
  signOutUser,
  saveUserData,
  loadUserData,
  UserProfile,
} from "@/lib/db";
import {
  Apple,
  Leaf,
  Calendar,
  Check,
  CheckCircle2,
  Salad,
  Utensils,
  CookingPot,
  Snowflake,
  Refrigerator,
  Search,
  Pencil,
  ShoppingCart,
  Settings,
  ClipboardList,
  ChefHat,
  Camera,
  Brain,
  Save,
  RefreshCw,
  Trash2,
  AlertTriangle,
  AlertCircle,
  PartyPopper,
  X,
  Drumstick,
  Beef,
  Milk,
  Egg,
  Package,
  ShieldCheck,
  Clock,
  Plus,
  Coins,
  Sparkles,
  ArrowRight,
  Info,
  Zap,
  Upload,
  Image as ImageIcon,
  RotateCcw,
  User,
  LogOut,
  Database,
  Download,
  Smartphone,
  BellRing,
} from "lucide-react";

interface InventoryItem {
  id: number;
  name: string;
  qty: string;
  expiryText: string;
  expiryColor: string;
  borderColor: string;
  location: string;
  locationIcon?: string;
  category: "cook" | "ready";
  locationType: "fridge" | "freezer";
  iconEmoji?: string;
  actionIcon: "search" | "plate" | "edit";
  price?: number;
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
  qty?: string;
  category?: "cook" | "ready";
  locationType?: "fridge" | "freezer";
  location?: string;
  expiryDays?: number;
}

const renderFoodIcon = (item: { name: string; category?: string }, className: string = "w-5 h-5") => {
  const n = item.name.toLowerCase();
  if (n.includes("telur") || n.includes("egg")) {
    return <Egg className={`${className} text-[#059669]`} />;
  }
  if (
    n.includes("kangkung") ||
    n.includes("bayam") ||
    n.includes("sayur") ||
    n.includes("tahu") ||
    n.includes("tempe") ||
    n.includes("wortel") ||
    n.includes("bawang")
  ) {
    return <Salad className={`${className} text-[#059669]`} />;
  }
  if (
    n.includes("ayam") ||
    n.includes("geprek") ||
    n.includes("bebek") ||
    n.includes("ungker")
  ) {
    return <Drumstick className={`${className} text-[#7C3AED]`} />;
  }
  if (
    n.includes("susu") ||
    n.includes("uht") ||
    n.includes("keju") ||
    n.includes("yogurt") ||
    n.includes("milk") ||
    n.includes("taro")
  ) {
    return <Milk className={`${className} text-[#D97706]`} />;
  }
  if (
    n.includes("daging") ||
    n.includes("sapi") ||
    n.includes("steak") ||
    n.includes("slice") ||
    n.includes("kornet")
  ) {
    return <Beef className={`${className} text-[#E11D48]`} />;
  }
  if (item.category === "ready") {
    return <CookingPot className={`${className} text-[#0D9488]`} />;
  }
  return <Package className={`${className} text-[#64748B]`} />;
};

const DEFAULT_ITEMS: InventoryItem[] = [
  {
    id: 1,
    name: "Kangkung Segar",
    qty: "2 ikat",
    expiryText: "Basi Besok (H-1)",
    expiryColor: "text-[#E11D48]",
    borderColor: "border-l-[#E11D48]",
    location: "Kulkas Bawah",
    category: "cook",
    locationType: "fridge",
    actionIcon: "search",
    price: 25000,
  },
  {
    id: 2,
    name: "Ayam Geprek Sisa Semalam",
    qty: "1 porsi",
    expiryText: "Habiskan Hari Ini!",
    expiryColor: "text-[#7C3AED]",
    borderColor: "border-l-[#7C3AED]",
    location: "Siap Saji",
    category: "ready",
    locationType: "fridge",
    actionIcon: "plate",
    price: 45000,
  },
  {
    id: 3,
    name: "Susu UHT Fresh",
    qty: "500 ml",
    expiryText: "2 Hari Lagi (H-2)",
    expiryColor: "text-[#D97706]",
    borderColor: "border-l-[#D97706]",
    location: "Pintu Kulkas",
    category: "cook",
    locationType: "fridge",
    actionIcon: "edit",
    price: 35000,
  },
  {
    id: 4,
    name: "Telur Ayam Kampung",
    qty: "10 butir",
    expiryText: "12 Hari Lagi",
    expiryColor: "text-[#059669]",
    borderColor: "border-l-[#059669]",
    location: "Rak Telur",
    category: "cook",
    locationType: "fridge",
    actionIcon: "edit",
    price: 60000,
  },
  {
    id: 5,
    name: "Daging Sapi Slice",
    qty: "250 gram",
    expiryText: "25 Hari Lagi",
    expiryColor: "text-[#059669]",
    borderColor: "border-l-[#059669]",
    location: "Freezer",
    category: "cook",
    locationType: "freezer",
    actionIcon: "edit",
    price: 120000,
  },
];

const DEFAULT_SHOPPING_ITEMS: ShoppingItem[] = [
  {
    id: 1,
    name: "Telur Ayam Kampung (10 butir)",
    subtitle: "Kebutuhan protein mingguan",
    subtitleColor: "text-[#64748B]",
    price: 26000,
    priceDisplay: "~Rp 26.000",
    checked: false,
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
];

interface DynamicRecipe {
  id: string;
  title: string;
  time: string;
  level: string;
  serving: string;
  badge: string;
  usedItems: InventoryItem[];
  financialSaved: number;
  steps: string[];
  isPrimary?: boolean;
  isReadyFood?: boolean;
}

export function isReadyFood(item?: { name?: string; category?: string; location?: string } | null): boolean {
  if (!item) return false;
  if (item.category === "ready") return true;
  const loc = (item.location || "").toLowerCase();
  if (loc.includes("saji") || loc.includes("matang") || loc.includes("meja")) return true;
  const n = (item.name || "").toLowerCase();
  const readyKeywords = [
    "burger", "pizza", "nasi goreng", "nasi uduk", "nasi padang", "nasi kuning", "nasi campur",
    "ayam geprek", "ayam goreng", "ayam bakar", "ayam krispi", "fried chicken", "nugget",
    "mie goreng", "mie rebus", "mie ayam", "bakso", "soto", "sate", "rendang",
    "martabak", "roti", "sandwich", "donut", "donat", "kue", "pastry", "croissant",
    "sisa lauk", "lauk matang", "makanan jadi", "makanan matang", "gulai", "rawon", "pecel", "capcay",
    "siomay", "batagor", "dimsum", "hotdog", "taco", "kebab", "pasta", "spaghetti", "lasagna",
    "olahan matang", "siap saji"
  ];
  return readyKeywords.some((kw) => n.includes(kw));
}

export function isDemoFoodItem(id: number, _name?: string): boolean {
  // Hanya filter ID bawaan demo dummy (1 s/d 10). Makanan buatan user memiliki ID timestamp Date.now()
  return id > 0 && id <= 10;
}

export function isDemoShopItem(id: number, _name?: string): boolean {
  // Hanya filter ID bawaan demo dummy (1 s/d 10)
  return id > 0 && id <= 10;
}

function isSweetItem(name: string): boolean {
  const n = (name || "").toLowerCase();
  return (
    n.includes("martabak") ||
    n.includes("cokelat") ||
    n.includes("coklat") ||
    n.includes("kue") ||
    n.includes("roti") ||
    n.includes("manis") ||
    n.includes("puding") ||
    n.includes("dessert") ||
    n.includes("biskuit") ||
    n.includes("wafer") ||
    n.includes("cake") ||
    n.includes("donat") ||
    n.includes("taro") ||
    n.includes("pisang")
  );
}

function isDrinkItem(name: string): boolean {
  const n = (name || "").toLowerCase();
  return (
    n.includes("susu") ||
    n.includes("milk") ||
    n.includes("ultra") ||
    n.includes("teh") ||
    n.includes("kopi") ||
    n.includes("jus") ||
    n.includes("juice") ||
    n.includes("sirup") ||
    n.includes("minuman") ||
    n.includes("yogurt")
  );
}

function getDynamicRecipes(
  allItems: InventoryItem[],
  selectedItems: InventoryItem[],
  prefilledItemName?: string
): {
  criticalItems: InventoryItem[];
  recipes: DynamicRecipe[];
} {
  if (!allItems || allItems.length === 0) {
    return { criticalItems: [], recipes: [] };
  }

  // Identifikasi bahan yang hampir kedaluwarsa dari seluruh kulkas
  const criticalItems = allItems.filter((it) => {
    const text = (it.expiryText || "").toLowerCase();
    const color = (it.expiryColor || "").toLowerCase();
    return (
      text.includes("basi") ||
      text.includes("hari ini") ||
      text.includes("h-1") ||
      text.includes("h-2") ||
      color.includes("e11d48") ||
      color.includes("7c3aed") ||
      color.includes("d97706")
    );
  });

  // Jika tidak ada bahan yang dipilih oleh user
  if (!selectedItems || selectedItems.length === 0) {
    return { criticalItems, recipes: [] };
  }

  // KASUS 1: HANYA 1 BAHAN TERPILIH
  if (selectedItems.length === 1) {
    const item = selectedItems[0];
    const n = item.name.toLowerCase();
    const itemPrice = item.price || 25000;

    // A. MAKANAN SUDAH JADI / SIAP SAJI (Prioritas Cepat Dikonsumsi, Bukan Resep Masak dari Nol)
    if (isReadyFood(item)) {
      return {
        criticalItems,
        recipes: [
          {
            id: `ready-eat-${item.id}-1`,
            title: `Santap Kilat / Hangatkan (${item.name})`,
            time: "2-3 Menit",
            level: "Siap Santap (Cepat Konsumsi)",
            serving: item.qty || "Porsi 1-2 Orang",
            badge: "⚡ Makanan Jadi - Prioritas Konsumsi",
            usedItems: [item],
            financialSaved: itemPrice,
            isReadyFood: true,
            steps: [
              `1. Status Pangan: "${item.name}" adalah hidangan sudah matang / siap saji. Masa simpannya di kulkas sangat singkat, prioritaskan untuk segera dihabiskan agar tekstur dan kelezatannya tetap prima.`,
              `2. Opsi Hangatkan Kilat: Jika ingin dinikmati hangat, hangatkan di microwave selama 30-60 detik atau panaskan di atas wajan teflon api kecil bertutup rapat selama 2-3 menit (tanpa minyak tambahan).`,
              `3. Siap Disantap: Nikmati selagi hangat! Tidak perlu dimasak ulang dari awal atau ditambah bumbu mentah lainnya.`
            ],
            isPrimary: true,
          },
          {
            id: `ready-eat-${item.id}-2`,
            title: `Tips Simpan Aman Jika Ditunda (${item.name})`,
            time: "1 Menit",
            level: "Penyimpanan Sementara",
            serving: item.qty || "Porsi 1 Orang",
            badge: "Cegah Basi",
            usedItems: [item],
            financialSaved: Math.round(itemPrice * 0.9),
            isReadyFood: true,
            steps: [
              `1. Jika belum ingin disantap saat ini, segera simpan "${item.name}" ke dalam wadah kedap udara (food container).`,
              `2. Tempatkan di chiller kulkas (suhu 4°C) maksimal 24 jam ke depan, atau di freezer jika ingin diawetkan lebih lama.`,
              `3. Usahakan untuk tetap menghabiskannya pada jam makan terdekat untuk mencegah berkembangnya bakteri.`
            ],
            isPrimary: false,
          },
        ],
      };
    }

    // B. Olahan Makanan Manis / Martabak / Kue / Roti / Dessert
    if (isSweetItem(item.name)) {
      return {
        criticalItems,
        recipes: [
          {
            id: "single-sweet-1",
            title: `Hangatkan Krispi Teflon Lumer (${item.name})`,
            time: "5 Menit",
            level: "Praktis & Lumer",
            serving: "Porsi 1-2 Orang",
            badge: "Lumer & Renyah Kembali",
            usedItems: [item],
            financialSaved: itemPrice,
            steps: [
              `1. Panaskan wajan teflon anti lengket di atas api paling kecil tanpa perlu menambah minyak atau margarin.`,
              `2. Letakkan potongan ${item.name} (${item.qty}) di teflon, tutup wajan selama 2-3 menit agar panas merata hingga ke bagian isian.`,
              `3. Setelah kulit bawahnya kembali garing renyah dan isian cokelat kejunya meleleh harum, angkat dan nikmati selagi hangat!`
            ],
            isPrimary: true,
          },
          {
            id: "single-sweet-2",
            title: `Dessert Box Camilan Kafe (${item.name})`,
            time: "3 Menit",
            level: "Camilan Manis Cepat",
            serving: "Porsi 1 Orang",
            badge: "Kreasi Kafe",
            usedItems: [item],
            financialSaved: Math.round(itemPrice * 0.8),
            steps: [
              `1. Potong potongan ${item.name} menjadi ukuran dadu kecil bite-sized ke dalam mangkuk dessert atau gelas kaca.`,
              "2. Tambahkan sedikit susu kental manis, keju parut, atau 1 scoop es krim jika tersedia di kulkas.",
              "3. Nikmati sebagai hidangan penutup manis zero-waste yang nikmat dan memanjakan lidah."
            ],
            isPrimary: false,
          },
        ],
      };
    }

    // B. Olahan Minuman / Susu / Ultra Milk / Taro
    if (isDrinkItem(item.name)) {
      return {
        criticalItems,
        recipes: [
          {
            id: "single-drink-1",
            title: `Puding Lembut Creamy (${item.name})`,
            time: "10 Menit",
            level: "Praktis & Sehat",
            serving: "Porsi 2-3 Mangkuk",
            badge: "Bahan Lengkap (Solusi 1 Bahan)",
            usedItems: [item],
            financialSaved: itemPrice,
            steps: [
              `1. Tuang ${item.name} (${item.qty}) ke panci kecil, tambahkan 1 sdm gula pasir dan sejumput bubuk agar-agar/jelly.`,
              "2. Panaskan dengan api sedang sambil diaduk perlahan hingga mendidih dan aroma wangi keluar.",
              "3. Tuang ke mangkuk cetakan, dinginkan sejenak di kulkas hingga kenyal set. Siap dinikmati dingin!"
            ],
            isPrimary: true,
          },
          {
            id: "single-drink-2",
            title: `Minuman Es Creamy Spesial (${item.name})`,
            time: "3 Menit",
            level: "Segar Langsung Jadi",
            serving: "Porsi 1-2 Gelas",
            badge: "Bahan Lengkap",
            usedItems: [item],
            financialSaved: Math.round(itemPrice * 0.7),
            steps: [
              "1. Siapkan gelas saji tinggi dan masukkan beberapa bongkah es batu secukupnya.",
              `2. Tuangkan ${item.name} dingin secara perlahan ke dalam gelas.`,
              "3. Tambahkan sedikit susu kental manis, seduhan kopi, atau topping favorit bila ada. Aduk rata dan nikmati segar!"
            ],
            isPrimary: false,
          },
        ],
      };
    }

    // C. Olahan Telur
    if (n.includes("telur") || n.includes("egg")) {
      return {
        criticalItems,
        recipes: [
          {
            id: "single-egg-1",
            title: `Telur Dadar Gulung Gurih Mentega (${item.name})`,
            time: "7 Menit",
            level: "Sangat Mudah",
            serving: "Porsi 1-2 Orang",
            badge: "Bahan Lengkap (Solusi 1 Bahan)",
            usedItems: [item],
            financialSaved: itemPrice,
            steps: [
              `1. Pecahkan ${item.name} (${item.qty}) ke dalam mangkuk, beri sejumput garam dan merica, kocok hingga rata.`,
              "2. Panaskan teflon dengan sedikit margarin di atas api kecil.",
              "3. Tuang adonan telur tipis-tipis, gulung perlahan dari pinggir ke tengah hingga matang keemasan lembut."
            ],
            isPrimary: true,
          },
          {
            id: "single-egg-2",
            title: `Telur Ceplok Masak Kecap Pedas Manis (${item.name})`,
            time: "8 Menit",
            level: "Lauk Kilat",
            serving: "Porsi 1-2 Orang",
            badge: "Bahan Lengkap",
            usedItems: [item],
            financialSaved: Math.round(itemPrice * 0.8),
            steps: [
              `1. Goreng ${item.name} menjadi mata sapi sesuai selera kematangan, sisihkan.`,
              "2. Tumis irisan bawang putih dan cabe rawit di wajan dengan sedikit minyak.",
              "3. Masukkan 2 sdm kecap manis dan 3 sdm air, masak telur ceplok hingga kuah mengental meresap gurih."
            ],
            isPrimary: false,
          },
        ],
      };
    }

    // D. Olahan Sayuran (Kangkung, Bayam, Sawi, dll)
    if (n.includes("kangkung") || n.includes("bayam") || n.includes("sayur") || n.includes("sawi") || n.includes("wortel")) {
      return {
        criticalItems,
        recipes: [
          {
            id: "single-veg-1",
            title: `Tumis ${item.name} Bawang Putih Saus Tiram Kilat`,
            time: "6 Menit",
            level: "Renyah Segar Kilat",
            serving: "Porsi 1-2 Orang",
            badge: "Bahan Lengkap (Solusi 1 Bahan)",
            usedItems: [item],
            financialSaved: itemPrice,
            steps: [
              `1. Bersihkan ${item.name} (${item.qty}) dan tiriskan airnya hingga kesat.`,
              "2. Panaskan wajan dengan 1 sdm minyak api besar, tumis bawang putih cincang hingga harum kekuningan.",
              `3. Masukkan ${item.name}, tambahkan 1 sdm saus tiram dan sedikit garam. Oseng cepat 2 menit lalu angkat.`
            ],
            isPrimary: true,
          },
          {
            id: "single-veg-2",
            title: `Sayur Bening Segar ${item.name} Kaldu Bawang`,
            time: "8 Menit",
            level: "Kuah Hangat Segar",
            serving: "Porsi 1-2 Mangkuk",
            badge: "Bahan Lengkap",
            usedItems: [item],
            financialSaved: Math.round(itemPrice * 0.8),
            steps: [
              "1. Didihkan 500ml air di panci bersama irisan bawang merah dan sedikit garam.",
              `2. Masukkan ${item.name} saat air bergolak mendidih.`,
              "3. Rebus sebentar selama 2 menit, matikan api agar daun tetap renyah segar dan warna cerah."
            ],
            isPrimary: false,
          },
        ],
      };
    }

    // E. Olahan Daging / Ayam / Lauk Hewani
    if (n.includes("daging") || n.includes("sapi") || n.includes("ayam") || n.includes("ikan") || n.includes("geprek") || n.includes("steak")) {
      return {
        criticalItems,
        recipes: [
          {
            id: "single-meat-1",
            title: `Tumis ${item.name} Saus Lada Hitam Gurih`,
            time: "10 Menit",
            level: "Lauk Kaya Protein",
            serving: "Porsi 1-2 Orang",
            badge: "Bahan Lengkap (Solusi 1 Bahan)",
            usedItems: [item],
            financialSaved: itemPrice,
            steps: [
              "1. Panaskan 1 sdm mentega di wajan, tumis bawang putih hingga harum semerbak.",
              `2. Masukkan potongan ${item.name} (${item.qty}), oseng cepat hingga berubah warna kecokelatan.`,
              "3. Tambahkan 2 sdm saus lada hitam atau saus tiram dan sedikit air, aduk rata hingga bumbu meresap gurih."
            ],
            isPrimary: true,
          },
          {
            id: "single-meat-2",
            title: `Nasi Goreng Gurih Topping ${item.name}`,
            time: "12 Menit",
            level: "Praktis Zero-Waste",
            serving: "Porsi 1 Orang",
            badge: "Bahan Lengkap",
            usedItems: [item],
            financialSaved: Math.round(itemPrice * 0.8),
            steps: [
              `1. Suwir atau potong kecil ${item.name}, oseng sebentar di wajan panas.`,
              "2. Masukkan sepiring nasi dingin, kecap manis, garam, dan lada bubuk.",
              "3. Besarkan api dan aduk cepat hingga nasi wangi berasap sedap dan bumbu merata."
            ],
            isPrimary: false,
          },
        ],
      };
    }

    // F. Bahan Apapun Lainnya (Fleksibel Otomatis)
    return {
      criticalItems,
      recipes: [
        {
          id: "single-gen-1",
          title: `Tumis Kilat Gurih Dapur (${item.name})`,
          time: "8 Menit",
          level: "Cepat & Bergizi",
          serving: "Porsi 1-2 Orang",
          badge: "Bahan Lengkap (Solusi 1 Bahan)",
          usedItems: [item],
          financialSaved: itemPrice,
          steps: [
            `1. Bersihkan dan potong ${item.name} (${item.qty}) sesuai selera ukuran sajian.`,
            "2. Tumis bawang putih cincang dengan sedikit margarin/minyak hingga harum kekuningan.",
            `3. Masukkan ${item.name}, bumbui dengan garam, lada, dan sedikit kecap/saus tiram. Oseng hingga matang merata.`
          ],
          isPrimary: true,
        },
        {
          id: "single-gen-2",
          title: `Olahan Sup Gurih Hangat (${item.name})`,
          time: "12 Menit",
          level: "Kuah Alami Sehat",
          serving: "Porsi 1 Mangkuk",
          badge: "Bahan Lengkap",
          usedItems: [item],
          financialSaved: Math.round(itemPrice * 0.8),
          steps: [
            "1. Rebus air dalam panci bersama irisan bawang putih dan bawang merah hingga harum.",
            `2. Masukkan ${item.name} dan bumbu kaldu sesuai selera.`,
            "3. Masak dengan api sedang hingga matang merata dan kuah terasa sedap menghangatkan."
          ],
          isPrimary: false,
        },
      ],
    };
  }

  // KASUS 2: ADA 2 ATAU LEBIH BAHAN TERPILIH
  const item1 = selectedItems[0];
  const item2 = selectedItems[1];
  const totalValue = (item1.price || 25000) + (item2.price || 25000);

  const isReady1 = isReadyFood(item1);
  const isReady2 = isReadyFood(item2);

  // KASUS 2-READY: KEDUANYA ADALAH MAKANAN SUDAH JADI / SIAP SANTAP
  if (isReady1 && isReady2) {
    return {
      criticalItems,
      recipes: [
        {
          id: `combo-ready-both`,
          title: `Paket Santap Kilat: ${item1.name} & ${item2.name}`,
          time: "3-5 Menit",
          level: "Langsung Santap Tanpa Masak",
          serving: "Porsi 1-2 Orang",
          badge: "⚡ Menu Siap Saji - Konsumsi Sekarang",
          usedItems: [item1, item2],
          financialSaved: totalValue,
          isReadyFood: true,
          steps: [
            `1. Kedua hidangan ini (${item1.name} & ${item2.name}) adalah makanan siap saji yang sudah matang. Prioritaskan untuk dihabiskan segera hari ini demi mencegah basi dan food-waste.`,
            `2. Hangatkan sebentar di microwave atau teflon api kecil selama 2-3 menit jika ingin dinikmati hangat.`,
            `3. Sajikan langsung di meja makan sebagai santapan praktis zero-waste tanpa memerlukan proses memasak lama!`
          ],
          isPrimary: true,
        },
        {
          id: `single-ready-p1`,
          title: `Santap Cepat Prioritas Utama (${item1.name})`,
          time: "2 Menit",
          level: "Siap Santap",
          serving: "Porsi 1 Orang",
          badge: "Prioritas Konsumsi",
          usedItems: [item1],
          financialSaved: item1.price || 25000,
          isReadyFood: true,
          steps: [
            `1. Dahulukan untuk menghabiskan ${item1.name} terlebih dahulu sebelum menyentuh stok lainnya.`,
            `2. Hangatkan 1-2 menit hingga aroma harum keluar, lalu santap selagi hangat.`
          ],
          isPrimary: false,
        },
      ],
    };
  }

  // KASUS 2-HYBRID: SATU MAKANAN JADI + SATU BAHAN MENTAH
  if (isReady1 || isReady2) {
    const readyItem = isReady1 ? item1 : item2;
    const rawItem = isReady1 ? item2 : item1;

    return {
      criticalItems,
      recipes: [
        {
          id: `combo-ready-raw`,
          title: `Santap Cepat ${readyItem.name} + Pendamping Sayur ${rawItem.name}`,
          time: "5-7 Menit",
          level: "Santap Cepat Bergizi",
          serving: "Porsi 1-2 Orang",
          badge: "⚡ Makanan Jadi + Lauk Pendamping",
          usedItems: [readyItem, rawItem],
          financialSaved: totalValue,
          isReadyFood: true,
          steps: [
            `1. Makanan Siap Saji: ${readyItem.name} sudah matang. Cukup hangatkan 1-2 menit di teflon api kecil atau microwave.`,
            `2. Bahan Mentah Pendamping: Tumis kilat ${rawItem.name} dengan sedikit bawang putih dan garam selama 3 menit sebagai pelengkap serat bergizi.`,
            `3. Sajikan ${readyItem.name} bersama sayur ${rawItem.name} hangat untuk makan siang/malam seimbang tanpa membuang stok dapur!`
          ],
          isPrimary: true,
        },
        {
          id: `single-ready-direct`,
          title: `Santap Langsung ${readyItem.name} (Tanpa Masak)`,
          time: "2 Menit",
          level: "Siap Santap",
          serving: "Porsi 1 Orang",
          badge: "Habiskan Segera",
          usedItems: [readyItem],
          financialSaved: readyItem.price || 25000,
          isReadyFood: true,
          steps: [
            `1. Jangan biarkan ${readyItem.name} menginap terlalu lama di kulkas karena sudah matang.`,
            `2. Hangatkan sebentar bila perlu, lalu habiskan sekarang juga.`
          ],
          isPrimary: false,
        },
      ],
    };
  }

  const isSweet1 = isSweetItem(item1.name) || isDrinkItem(item1.name);
  const isSweet2 = isSweetItem(item2.name) || isDrinkItem(item2.name);

  // KASUS 2A: KEDUANYA MAKANAN MANIS / MINUMAN (seperti Martabak Manis + Ultra Milk Taro)
  if (isSweet1 && isSweet2) {
    return {
      criticalItems,
      recipes: [
        {
          id: "combo-sweet-drink-1",
          title: `Paket Sore Santai: ${item1.name} Hangat & ${item2.name} Dingin`,
          time: "5 Menit",
          level: "Camilan Santai Kafe",
          serving: "Porsi 1-2 Orang",
          badge: "Paduan Manis & Segar!",
          usedItems: [item1, item2],
          financialSaved: totalValue,
          steps: [
            `1. Panaskan ${item1.name} di atas teflon api kecil selama 2-3 menit hingga kulitnya kembali garing renyah dan isian lumer wangi.`,
            `2. Siapkan gelas saji berisi beberapa es batu, lalu tuangkan ${item2.name} dingin ke dalamnya.`,
            `3. Nikmati camilan ${item1.name} hangat lumer bersama kesegaran ${item2.name} chilled. Kombinasi camilan manis yang pas!`
          ],
          isPrimary: true,
        },
        {
          id: "combo-sweet-drink-2",
          title: `Puding Parfait Kreasi (${item1.name} & ${item2.name})`,
          time: "8 Menit",
          level: "Dessert Kafe Kekinian",
          serving: "Porsi 2 Mangkuk",
          badge: "Kreasi Manis Zero-Waste",
          usedItems: [item1, item2],
          financialSaved: totalValue,
          steps: [
            `1. Potong dadu potongan ${item1.name} dan susun rapi di dasar mangkuk atau gelas dessert.`,
            `2. Hangatkan ${item2.name} di panci kecil dengan sedikit bubuk agar-agar/jelly dan aduk hingga mendidih.`,
            `3. Tuangkan perlahan ke atas potongan ${item1.name}, dinginkan 10 menit di kulkas hingga kenyal creamy.`
          ],
          isPrimary: false,
        },
      ],
    };
  }

  // KASUS 2B: SATU MANIS SATU GURIH (misal Telur + Martabak Manis)
  if (isSweet1 !== isSweet2) {
    const sweetItem = isSweet1 ? item1 : item2;
    const savoryItem = isSweet1 ? item2 : item1;

    return {
      criticalItems,
      recipes: [
        {
          id: "combo-sweet-savory-1",
          title: `Paket Menu Lengkap: Lauk Gurih Utama & Dessert (${savoryItem.name} + ${sweetItem.name})`,
          time: "12 Menit",
          level: "Menu Komplit Praktis",
          serving: "Porsi 1-2 Orang",
          badge: "Gurih & Manis Berimbang",
          usedItems: [item1, item2],
          financialSaved: totalValue,
          steps: [
            `1. Olah ${savoryItem.name} menjadi lauk gurih praktis dengan bumbu dapur (bawang putih, garam, merica) hingga matang sedap.`,
            `2. Panaskan ${sweetItem.name} di teflon api kecil selama 2 menit hingga hangat dan lumer.`,
            `3. Nikmati santapan lauk gurih ${savoryItem.name} terlebih dahulu, lalu akhiri dengan camilan manis ${sweetItem.name}!`
          ],
          isPrimary: true,
        },
        {
          id: "combo-sweet-savory-2",
          title: `Kreasi Olahan Gurih Cepat (${savoryItem.name})`,
          time: "8 Menit",
          level: "Cepat & Praktis",
          serving: "Porsi 1 Orang",
          badge: "Lauk Utama",
          usedItems: [savoryItem],
          financialSaved: savoryItem.price || 25000,
          steps: [
            `1. Siapkan potongan ${savoryItem.name} di atas wajan panas.`,
            "2. Beri bumbu bawang dan sedikit kecap manis atau saus tiram.",
            "3. Oseng cepat 2-3 menit hingga matang sempurna dan sajikan hangat."
          ],
          isPrimary: false,
        },
      ],
    };
  }

  // KASUS 2C: KEDUANYA GURIH (Sayur + Lauk / Telur / Daging)
  const pName = item1.name.toLowerCase();
  const sName = item2.name.toLowerCase();

  let comboRecipe: DynamicRecipe;
  if (
    (pName.includes("kangkung") || pName.includes("sayur")) &&
    (sName.includes("ayam") || sName.includes("geprek") || sName.includes("daging") || sName.includes("telur"))
  ) {
    comboRecipe = {
      id: "combo-1",
      title: `Nasi Goreng Gurih ${item2.name} & ${item1.name}`,
      time: "12 Menit",
      level: "Level: Sangat Mudah",
      serving: "Porsi 1-2 Orang",
      badge: "Bahan Lengkap!",
      usedItems: [item1, item2],
      financialSaved: totalValue,
      steps: [
        `1. Suwir/potong ${item2.name}, tumis dengan bawang merah & cabe di wajan panas.`,
        `2. Masukkan potongan ${item1.name}, oseng cepat 1 menit dengan api besar.`,
        "3. Masukkan nasi dingin & 1 sdm kecap manis. Aduk rata hingga berasap harum dan matang sempurna!"
      ],
      isPrimary: true,
    };
  } else if ((pName.includes("daging") && sName.includes("telur")) || (pName.includes("telur") && sName.includes("daging"))) {
    comboRecipe = {
      id: "combo-beef-egg",
      title: `Gyudon Beef Bowl Telur Setengah Matang (${item1.name} & ${item2.name})`,
      time: "12 Menit",
      level: "Ala Resto Jepang",
      serving: "Porsi 1-2 Orang",
      badge: "Bahan Lengkap!",
      usedItems: [item1, item2],
      financialSaved: totalValue,
      steps: [
        `1. Tumis irisan bawang bombay bersama ${pName.includes("daging") ? item1.name : item2.name} dengan saus teriyaki dan kecap manis hingga matang.`,
        `2. Ceplok ${pName.includes("telur") ? item1.name : item2.name} setengah matang hingga kuning telur lumer sempurna.`,
        "3. Tata daging di atas mangkuk nasi hangat dan letakkan telur ceplok di atasnya. Sajikan selagi hangat!"
      ],
      isPrimary: true,
    };
  } else {
    comboRecipe = {
      id: "combo-gen",
      title: `Tumis Harmonis Zero-Waste (${item1.name} & ${item2.name})`,
      time: "10 Menit",
      level: "Praktis Cepat Saji",
      serving: "Porsi 1-2 Orang",
      badge: "Bahan Lengkap!",
      usedItems: [item1, item2],
      financialSaved: totalValue,
      steps: [
        "1. Panaskan wajan dengan 1 sdm minyak/mentega, tumis bawang putih hingga harum kekuningan.",
        `2. Masukkan ${item1.name} dan ${item2.name} secara bertahap sesuai tekstur bahan.`,
        "3. Bumbui dengan 1 sdm saus tiram, kecap manis, dan sedikit garam. Oseng cepat hingga bumbu meresap sedap."
      ],
      isPrimary: true,
    };
  }

  const singleRecipe: DynamicRecipe = {
    id: "combo-quick-single",
    title: `Oseng Kilat Gurih Dapur (${item1.name})`,
    time: "7 Menit",
    level: "Zero-Waste Praktis",
    serving: "Porsi 1 Orang",
    badge: "Bahan Lengkap!",
    usedItems: [item1],
    financialSaved: item1.price || 25000,
    steps: [
      "1. Panaskan wajan dengan 1 sdm minyak goreng atau mentega.",
      `2. Masukkan ${item1.name}, tumis dengan bawang putih cincang hingga harum.`,
      "3. Beri garam, merica, dan sedikit kecap manis. Aduk rata 2 menit lalu angkat."
    ],
    isPrimary: false,
  };

  return {
    criticalItems,
    recipes: [comboRecipe, singleRecipe],
  };
}

export default function Home() {
  // User Authentication & Database States
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Page mode: "dashboard" (Screen 1), "quickadd" (Screen 2), "olah" (Screen 3), "belanja" (Screen 4), or "setting" (Screen 5)
  const [currentView, setCurrentView] = useState<"dashboard" | "quickadd" | "olah" | "belanja" | "setting">("dashboard");
  const [financialSaved, setFinancialSaved] = useState<number>(0);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isClientLoaded, setIsClientLoaded] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);

  // Refs untuk mencegah race condition sinkronisasi data saat login & logout
  const isUserDataLoadedRef = useRef(false);
  const isSigningOutRef = useRef(false);

  // Load persisted state from Database or localStorage on mount
  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const user = await getCurrentUser();
        if (user && isMounted) {
          isUserDataLoadedRef.current = false;
          setCurrentUser(user);
          const userData = await loadUserData(user.id);
          if (userData !== null) {
            const cleanItems = (userData.items || []).filter((it) => !isDemoFoodItem(it.id, it.name));
            const cleanShopping = (userData.shoppingItems || []).filter((it) => !isDemoShopItem(it.id, it.name));
            const cleanFinancial = cleanItems.length > 0 ? (userData.financialSaved || 0) : 0;
            const cleanSavedCount = cleanItems.length > 0 ? (userData.savedCount || 0) : 0;

            setItems(cleanItems);
            setShoppingItems(cleanShopping);
            setFinancialSaved(cleanFinancial);
            setSavedCount(cleanSavedCount);

            if (cleanItems.length !== (userData.items || []).length || cleanShopping.length !== (userData.shoppingItems || []).length) {
              saveUserData(user.id, {
                items: cleanItems,
                shoppingItems: cleanShopping,
                financialSaved: cleanFinancial,
                savedCount: cleanSavedCount,
              });
            }
          } else {
            setItems([]);
            setShoppingItems([]);
            setFinancialSaved(0);
            setSavedCount(0);
          }
          isUserDataLoadedRef.current = true;
          setIsClientLoaded(true);
          return;
        }

        // Mode Tamu (Guest Mode) ketika belum ada user login
        const storedItems = localStorage.getItem("stockwatch_inventory_items");
        let initialGuestItems: InventoryItem[] = [];
        if (storedItems !== null) {
          const parsed = JSON.parse(storedItems);
          if (Array.isArray(parsed)) {
            initialGuestItems = parsed
              .filter((it: InventoryItem) => !isDemoFoodItem(it.id, it.name))
              .map((it: InventoryItem) => {
                if (it.category !== "ready" && isReadyFood(it)) {
                  return { ...it, category: "ready" as const };
                }
                return it;
              });
          }
        }
        setItems(initialGuestItems);

        let initialShopItems: ShoppingItem[] = [];
        const storedShopping = localStorage.getItem("stockwatch_shopping_items");
        if (storedShopping !== null) {
          const parsed = JSON.parse(storedShopping);
          if (Array.isArray(parsed)) {
            initialShopItems = parsed.filter((it: ShoppingItem) => !isDemoShopItem(it.id, it.name));
          }
        }
        setShoppingItems(initialShopItems);

        if (initialGuestItems.length === 0) {
          setFinancialSaved(0);
          setSavedCount(0);
          localStorage.setItem("stockwatch_financial_saved", "0");
          localStorage.setItem("stockwatch_saved_count", "0");
        } else {
          const storedFinancial = localStorage.getItem("stockwatch_financial_saved");
          setFinancialSaved(storedFinancial ? Number(storedFinancial) || 0 : 0);
          const storedCount = localStorage.getItem("stockwatch_saved_count");
          setSavedCount(storedCount ? Number(storedCount) || 0 : 0);
        }
        isUserDataLoadedRef.current = true;
      } catch (e) {
        console.error("Gagal membaca database / localStorage:", e);
      } finally {
        if (isMounted) {
          setIsClientLoaded(true);
        }
      }
    };

    initData();

    // Listener Supabase Auth State Change agar tidak pernah ter-logout saat refresh
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;
      if (session?.user) {
        isUserDataLoadedRef.current = false;
        const uProfile: UserProfile = {
          id: session.user.id,
          email: session.user.email || "",
          fullName: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "Pengguna",
          isDemo: false,
        };
        setCurrentUser(uProfile);
        localStorage.setItem("stockwatch_active_user", JSON.stringify(uProfile));

        // Bersihkan sampah guest localStorage agar tidak mencemari akun pengguna
        localStorage.removeItem("stockwatch_inventory_items");
        localStorage.removeItem("stockwatch_financial_saved");
        localStorage.removeItem("stockwatch_saved_count");
        localStorage.removeItem("stockwatch_shopping_items");

        // Muat data spesifik akun dari database Supabase
        const data = await loadUserData(uProfile.id);
        if (data !== null) {
          const cleanItems = (data.items || []).filter((it) => !isDemoFoodItem(it.id, it.name));
          const cleanShopping = (data.shoppingItems || []).filter((it) => !isDemoShopItem(it.id, it.name));
          const cleanFinancial = cleanItems.length > 0 ? (data.financialSaved || 0) : 0;
          const cleanSavedCount = cleanItems.length > 0 ? (data.savedCount || 0) : 0;

          setItems(cleanItems);
          setShoppingItems(cleanShopping);
          setFinancialSaved(cleanFinancial);
          setSavedCount(cleanSavedCount);
        } else {
          setItems([]);
          setShoppingItems([]);
          setFinancialSaved(0);
          setSavedCount(0);
        }
        isUserDataLoadedRef.current = true;
        setIsClientLoaded(true);
      } else if (event === "SIGNED_OUT") {
        isSigningOutRef.current = true;
        isUserDataLoadedRef.current = false;
        setCurrentUser(null);
        localStorage.removeItem("stockwatch_active_user");
        localStorage.removeItem("stockwatch_inventory_items");
        localStorage.removeItem("stockwatch_financial_saved");
        localStorage.removeItem("stockwatch_saved_count");
        localStorage.removeItem("stockwatch_shopping_items");
        setItems([]);
        setShoppingItems([]);
        setFinancialSaved(0);
        setSavedCount(0);
        setTimeout(() => {
          isSigningOutRef.current = false;
        }, 1000);
      }
    });

    return () => {
      isMounted = false;
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Sync to database and localStorage whenever data states change
  useEffect(() => {
    if (!isClientLoaded) return;
    if (isSigningOutRef.current) return; // Jangan timpa data saat proses logout!
    try {
      if (currentUser) {
        if (!isUserDataLoadedRef.current) return; // Jangan simpan sebelum data user selesai dimuat!
        localStorage.setItem(`stockwatch_user_data_${currentUser.id}`, JSON.stringify({
          items,
          shoppingItems,
          financialSaved,
          savedCount,
        }));
        saveUserData(currentUser.id, {
          items,
          shoppingItems,
          financialSaved,
          savedCount,
        });
      } else {
        localStorage.setItem("stockwatch_inventory_items", JSON.stringify(items));
        localStorage.setItem("stockwatch_financial_saved", financialSaved.toString());
        localStorage.setItem("stockwatch_saved_count", savedCount.toString());
        localStorage.setItem("stockwatch_shopping_items", JSON.stringify(shoppingItems));
      }
    } catch (e) {
      console.error("Gagal sinkronisasi data:", e);
    }
  }, [items, financialSaved, savedCount, shoppingItems, isClientLoaded, currentUser]);

  const handleAuthSuccess = async (user: UserProfile) => {
    isUserDataLoadedRef.current = false;
    setCurrentUser(user);
    // Bersihkan residu guest localStorage
    localStorage.removeItem("stockwatch_inventory_items");
    localStorage.removeItem("stockwatch_financial_saved");
    localStorage.removeItem("stockwatch_saved_count");
    localStorage.removeItem("stockwatch_shopping_items");

    try {
      const data = await loadUserData(user.id);
      if (data !== null) {
        const cleanItems = (data.items || []).filter((it) => !isDemoFoodItem(it.id, it.name));
        const cleanShopping = (data.shoppingItems || []).filter((it) => !isDemoShopItem(it.id, it.name));
        const cleanFinancial = cleanItems.length > 0 ? (data.financialSaved || 0) : 0;
        const cleanSavedCount = cleanItems.length > 0 ? (data.savedCount || 0) : 0;

        setItems(cleanItems);
        setShoppingItems(cleanShopping);
        setFinancialSaved(cleanFinancial);
        setSavedCount(cleanSavedCount);

        if (cleanItems.length !== (data.items || []).length || cleanShopping.length !== (data.shoppingItems || []).length) {
          saveUserData(user.id, {
            items: cleanItems,
            shoppingItems: cleanShopping,
            financialSaved: cleanFinancial,
            savedCount: cleanSavedCount,
          });
        }
        isUserDataLoadedRef.current = true;
        showToast(`Dapur "${user.fullName}" berhasil disinkronkan!`, "success");
      } else {
        // Pengguna baru pertama kali mendaftar
        setItems([]);
        setShoppingItems([]);
        setFinancialSaved(0);
        setSavedCount(0);
        await saveUserData(user.id, {
          items: [],
          shoppingItems: [],
          financialSaved: 0,
          savedCount: 0,
        });
        isUserDataLoadedRef.current = true;
        showToast(`Akun "${user.fullName}" siap! Dapur Anda bersih dan siap diisi.`, "success");
      }
    } catch (e) {
      console.error("Gagal sinkronisasi saat login:", e);
      isUserDataLoadedRef.current = true;
    }
  };

  const handleSignOut = async () => {
    isSigningOutRef.current = true;
    isUserDataLoadedRef.current = false;
    await signOutUser();
    setCurrentUser(null);
    localStorage.removeItem("stockwatch_active_user");
    localStorage.removeItem("stockwatch_inventory_items");
    localStorage.removeItem("stockwatch_financial_saved");
    localStorage.removeItem("stockwatch_saved_count");
    localStorage.removeItem("stockwatch_shopping_items");
    setItems([]);
    setShoppingItems([]);
    setFinancialSaved(0);
    setSavedCount(0);
    showToast("Anda telah keluar dari akun. Berpindah ke mode tamu.", "info");
    setTimeout(() => {
      isSigningOutRef.current = false;
    }, 1000);
  };

  const handleClearAccountData = async () => {
    setItems([]);
    setShoppingItems([]);
    setFinancialSaved(0);
    setSavedCount(0);
    try {
      localStorage.removeItem("stockwatch_inventory_items");
      localStorage.removeItem("stockwatch_financial_saved");
      localStorage.removeItem("stockwatch_saved_count");
      localStorage.removeItem("stockwatch_shopping_items");
      if (currentUser) {
        localStorage.removeItem(`stockwatch_user_data_${currentUser.id}`);
        await saveUserData(currentUser.id, {
          items: [],
          shoppingItems: [],
          financialSaved: 0,
          savedCount: 0,
        });
      }
    } catch (e) {}
    showToast("Seluruh inventori dan daftar belanja berhasil dikosongkan bersih!", "success");
  };

  const handleResetToDefault = () => {
    try {
      localStorage.removeItem("stockwatch_inventory_items");
      localStorage.removeItem("stockwatch_financial_saved");
      localStorage.removeItem("stockwatch_saved_count");
      localStorage.removeItem("stockwatch_shopping_items");
    } catch (e) {}
    setItems(DEFAULT_ITEMS);
    setFinancialSaved(285000);
    setSavedCount(5);
    setShoppingItems(DEFAULT_SHOPPING_ITEMS);
    showToast("Data inventori berhasil direset ke bawaan demo!", "success");
  };

  // Weekend Fridge Audit State (Figma 04)
  const [isAuditOpen, setIsAuditOpen] = useState(false);
  const [auditStep, setAuditStep] = useState(0);

  // Edit Item State
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Delete Item Confirmation Modal State
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);

  // QuickAdd Scanner state
  const [scanQty, setScanQty] = useState(2);

  // PWA Installation state
  const [pwaPrompt, setPwaPrompt] = useState<any>(null);
  const [isPwaInstalled, setIsPwaInstalled] = useState(false);

  // Settings Reminder States (Disimpan permanen di localStorage)
  const [settingsToggles, setSettingsToggles] = useState({
    webPush: true,
    h3Reminder: true,
    h1Critical: true,
    antiSpamDigest: true,
  });

  // Listener PWA Prompt & Pemuatan Pengaturan Pengingat
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Cek apakah sudah berjalan di mode PWA (standalone)
    if (window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone) {
      setIsPwaInstalled(true);
    }

    const handlePrompt = (e: any) => {
      e.preventDefault();
      setPwaPrompt(e);
    };

    const handleInstalled = () => {
      setIsPwaInstalled(true);
      setPwaPrompt(null);
      showToast("StockWatch OS berhasil dipasang sebagai aplikasi!", "success");
    };

    window.addEventListener("beforeinstallprompt", handlePrompt);
    window.addEventListener("appinstalled", handleInstalled);

    try {
      const saved = localStorage.getItem("stockwatch_reminder_settings");
      if (saved) {
        setSettingsToggles(JSON.parse(saved));
      }
    } catch {}

    return () => {
      window.removeEventListener("beforeinstallprompt", handlePrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  // Fungsi Pemicu Instalasi PWA dengan Satu Klik
  const handleInstallPwa = async () => {
    if (pwaPrompt) {
      pwaPrompt.prompt();
      const choice = await pwaPrompt.userChoice;
      if (choice.outcome === "accepted") {
        showToast("Memasang StockWatch OS ke perangkat...", "success");
      }
      setPwaPrompt(null);
    } else {
      const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIos) {
        showToast("Di Safari iOS: Ketuk tombol 'Share' lalu pilih 'Add to Home Screen'.", "info");
      } else {
        showToast("Klik ikon 'Install' di bilah alamat browser untuk memasang aplikasi.", "info");
      }
    }
  };

  // Fungsi Pembantu Notifikasi Universal (Mendukung Android Chrome, iOS PWA, dan Desktop)
  const displaySystemNotification = async (title: string, options: any = {}): Promise<boolean> => {
    try {
      const defaultOptions = {
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [200, 100, 200],
        tag: "stockwatch-reminder",
        renotify: true,
        ...options,
      };

      // 1. Prioritaskan Service Worker Registration (WAJIB untuk Chrome di Android / Mobile PWA)
      if (typeof navigator !== "undefined" && "serviceWorker" in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && "showNotification" in reg) {
            await reg.showNotification(title, defaultOptions);
            return true;
          }
        } catch (swErr) {
          console.warn("ServiceWorker showNotification coba fallback:", swErr);
        }
      }

      // 2. Fallback untuk Desktop browser yang mendukung new Notification constructor
      if (typeof window !== "undefined" && "Notification" in window) {
        try {
          new Notification(title, defaultOptions);
          return true;
        } catch (notifErr) {
          console.warn("new Notification constructor gagal:", notifErr);
        }
      }

      return false;
    } catch (err) {
      console.error("displaySystemNotification error:", err);
      return false;
    }
  };

  // Toggle Pengaturan dengan Izin Notification API Langsung
  const toggleSetting = async (key: keyof typeof settingsToggles) => {
    const nextVal = !settingsToggles[key];
    const updated = { ...settingsToggles, [key]: nextVal };
    setSettingsToggles(updated);
    try {
      localStorage.setItem("stockwatch_reminder_settings", JSON.stringify(updated));
    } catch {}

    if (key === "webPush") {
      if (nextVal) {
        if ("Notification" in window) {
          const perm = await Notification.requestPermission();
          if (perm === "granted") {
            showToast("Web Push Notification berhasil diaktifkan!", "success");
            await displaySystemNotification("StockWatch OS - Pengingat Aktif!", {
              body: "Pengingat bahan kedaluwarsa & anti-mubazir siap memantau dapur Anda.",
            });
          } else if (perm === "denied") {
            showToast("Izin notifikasi diblokir di peramban Anda. Silakan aktifkan di ikon setelan situs peramban.", "warning");
          }
        } else {
          showToast("Peramban Anda belum mendukung Web Notification.", "warning");
        }
      } else {
        showToast("Web Push Notification dinonaktifkan", "info");
      }
    } else {
      showToast(nextVal ? "Pengaturan pengingat diaktifkan" : "Pengaturan pengingat dinonaktifkan", "settings");
    }
  };

  // Uji Coba Pengiriman Notifikasi Langsung ke Perangkat Pengguna Sesuai Preferensi Aktif
  const handleTestNotification = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      showToast("Peramban Anda tidak mendukung Web Notification.", "warning");
      return;
    }

    if (!settingsToggles.webPush) {
      showToast("Web Push Notification sedang nonaktif. Aktifkan toggle di atas terlebih dahulu.", "info");
      return;
    }

    let perm = Notification.permission;
    if (perm !== "granted") {
      perm = await Notification.requestPermission();
    }

    if (perm === "granted") {
      // Ambil bahan dari inventori yang sesuai filter kedaluwarsa
      const h1Items = items.filter((it) => {
        const t = (it.expiryText || "").toLowerCase();
        return t.includes("basi") || t.includes("hari ini") || t.includes("h-1");
      });
      const h3Items = items.filter((it) => {
        const t = (it.expiryText || "").toLowerCase();
        return t.includes("2 hari") || t.includes("h-2") || t.includes("h-3");
      });

      let notifTitle = "";
      let notifBody = "";

      if (settingsToggles.antiSpamDigest) {
        // SKENARIO A: Anti-Spam Digest Aktif (Rangkuman 1 Notif Gabungan)
        const totalAlerts = (settingsToggles.h1Critical ? h1Items.length : 0) + (settingsToggles.h3Reminder ? h3Items.length : 0);
        if (totalAlerts > 0) {
          const sampleNames = [...h1Items, ...h3Items].slice(0, 2).map((i) => i.name).join(", ");
          notifTitle = `StockWatch Digest: ${totalAlerts} Bahan Perlu Perhatian!`;
          notifBody = `Rangkuman Dapur: ${sampleNames} mendekati batas kedaluwarsa. Yuk segera olah!`;
        } else {
          notifTitle = "StockWatch Digest: Dapur Terkendali!";
          notifBody = "Rangkuman Harian: Seluruh stok bahan makanan Anda saat ini dalam kondisi aman dan segar.";
        }
      } else if (settingsToggles.h1Critical && h1Items.length > 0) {
        // SKENARIO B: Pengingat H-1 Kritis Spesifik
        notifTitle = `🚨 Peringatan Kritis (H-1): ${h1Items[0].name}!`;
        notifBody = `Masa simpan hampir habis (${h1Items[0].expiryText}). Masak sekarang untuk hemat Rp ${(h1Items[0].price || 25000).toLocaleString("id-ID")}!`;
      } else if (settingsToggles.h3Reminder && h3Items.length > 0) {
        // SKENARIO C: Pengingat H-3 Persiapan Dapur Spesifik
        notifTitle = `📅 Pengingat H-3: ${h3Items[0].name}`;
        notifBody = `Bahan ini baik dikonsumsi dalam 2-3 hari ke depan (${h3Items[0].expiryText}). Siapkan menu olahan Anda!`;
      } else {
        // SKENARIO D: Simulasi Nyata jika Inventori Kosong atau Bahan Masih Sangat Segar
        if (settingsToggles.h1Critical && !settingsToggles.h3Reminder) {
          notifTitle = "🚨 [Tes H-1] Peringatan Kritis Bahan";
          notifBody = "Prioritas Tinggi: Bahan berlabel 'Habiskan Hari Ini' atau 'Basi Besok' akan memicu peringatan ini.";
        } else if (settingsToggles.h3Reminder && !settingsToggles.h1Critical) {
          notifTitle = "📅 [Tes H-3] Persiapan Bahan Dapur";
          notifBody = "Persiapan Dapur: Notifikasi hening untuk merencanakan menu masak 2-3 hari sebelum kedaluwarsa.";
        } else {
          notifTitle = "StockWatch OS: Notifikasi Aktif!";
          notifBody = "Sistem pengingat dapur siap bekerja memantau bahan kulkas Anda sesuai preferensi yang dipilih.";
        }
      }

      const success = await displaySystemNotification(notifTitle, {
        body: notifBody,
      });

      if (success) {
        showToast("Notifikasi berhasil dikirim ke layar HP Anda!", "success");
      } else {
        showToast("Gagal memunculkan notifikasi sistem", "error");
      }
    } else {
      showToast("Izin notifikasi belum diaktifkan. Klik Izinkan pada pop-up peramban.", "warning");
    }
  };

  // Pemantau Otomatis Notifikasi Digest (Bebas Spam: 1x Per Hari)
  useEffect(() => {
    if (!isClientLoaded || items.length === 0 || !settingsToggles.webPush) return;
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;

    const todayKey = new Date().toISOString().split("T")[0];
    const lastDigest = localStorage.getItem("stockwatch_last_digest_date");

    if (settingsToggles.antiSpamDigest && lastDigest === todayKey) {
      return;
    }

    const criticalItems = items.filter((it) => {
      const t = (it.expiryText || "").toLowerCase();
      const isH1 = t.includes("basi") || t.includes("hari ini") || t.includes("h-1");
      const isH3 = t.includes("2 hari") || t.includes("h-2") || t.includes("h-3");
      if (settingsToggles.h1Critical && isH1) return true;
      if (settingsToggles.h3Reminder && isH3) return true;
      return false;
    });

    if (criticalItems.length > 0) {
      displaySystemNotification(`StockWatch: ${criticalItems.length} Bahan Butuh Perhatian!`, {
        body: `Bahan seperti "${criticalItems[0].name}" mendekati tanggal batas. Segera olah untuk cegah mubazir.`,
      }).then(() => {
        localStorage.setItem("stockwatch_last_digest_date", todayKey);
      });
    }
  }, [items, isClientLoaded, settingsToggles]);

  // Shopping List Add Modal States
  const [isAddShoppingModalOpen, setIsAddShoppingModalOpen] = useState(false);
  const [newShoppingName, setNewShoppingName] = useState("");
  const [newShoppingPrice, setNewShoppingPrice] = useState("");
  const [newShoppingQty, setNewShoppingQty] = useState("1");
  const [newShoppingUnit, setNewShoppingUnit] = useState("porsi");
  const [newShoppingCategory, setNewShoppingCategory] = useState<"cook" | "ready">("cook");
  const [newShoppingLocationType, setNewShoppingLocationType] = useState<"fridge" | "freezer">("fridge");
  const [newShoppingLocation, setNewShoppingLocation] = useState("Kulkas Utama");
  const [newShoppingExpiryDays, setNewShoppingExpiryDays] = useState(7);

  const estimatedShoppingTotal = shoppingItems
    .filter((item) => !item.checked)
    .reduce((sum, item) => sum + item.price, 0);

  const toggleShopItem = (id: number) => {
    setShoppingItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextChecked = !item.checked;
          showToast(
            nextChecked
              ? `"${item.name}" ditandai sudah dibeli`
              : `"${item.name}" ditandai belum dibeli`,
            nextChecked ? "cart" : "info"
          );
          return {
            ...item,
            checked: nextChecked,
          };
        }
        return item;
      })
    );
  };

  const handleDeleteShoppingItem = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const itemToDelete = shoppingItems.find((i) => i.id === id);
    setShoppingItems((prev) => prev.filter((i) => i.id !== id));
    showToast(`"${itemToDelete?.name || "Barang"}" dihapus dari daftar belanja`, "delete");
  };

  const handleMoveCheckedToInventory = () => {
    const checkedItems = shoppingItems.filter((i) => i.checked);
    if (checkedItems.length === 0) return;

    const newInventoryItems: InventoryItem[] = checkedItems.map((item) => {
      const cleanName = item.name.split("(")[0].trim();
      const cleanQty = item.qty || (item.name.includes("(")
        ? item.name.split("(")[1].replace(")", "").trim()
        : "1 porsi");
      
      const isReady = item.category === "ready" || isReadyFood({ name: cleanName, category: item.category });
      const isFreezer = item.locationType === "freezer";
      const expDays = item.expiryDays || 7;
      const expText = expDays <= 1 ? "1 Hari Lagi (H-1)" : `${expDays} Hari Lagi`;
      const expColor = expDays <= 2 ? "text-[#E11D48]" : expDays <= 4 ? "text-[#D97706]" : "text-[#059669]";
      const borderCol = expDays <= 2 ? "border-l-[#E11D48]" : expDays <= 4 ? "border-l-[#D97706]" : "border-l-[#059669]";

      return {
        id: Date.now() + Math.random(),
        name: cleanName,
        qty: cleanQty,
        expiryText: expText,
        expiryColor: expColor,
        borderColor: borderCol,
        location: item.location || (isFreezer ? "Freezer Utama" : "Kulkas Utama"),
        category: isReady ? "ready" : "cook",
        locationType: isFreezer ? "freezer" : "fridge",
        actionIcon: "edit",
        price: item.price || 20000,
      };
    });

    setItems((prevItems) => [...newInventoryItems, ...prevItems]);
    setShoppingItems((prev) => prev.filter((i) => !i.checked));
    showToast(
      `${checkedItems.length} barang belanjaan berhasil dimasukkan ke stok kulkas!`,
      "success"
    );
  };

  const handleAddShoppingItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShoppingName.trim()) return;
    const priceNum = parseInt(newShoppingPrice.replace(/\D/g, "")) || 0;
    const qtyFormatted = `${newShoppingQty || "1"} ${newShoppingUnit}`;
    const fullItemName = `${newShoppingName.trim()} (${qtyFormatted})`;

    const isReady = newShoppingCategory === "ready" || isReadyFood({ name: newShoppingName });
    const locationName = newShoppingLocation || (newShoppingLocationType === "freezer" ? "Freezer Utama" : "Kulkas Utama");

    const newItem: ShoppingItem = {
      id: Date.now(),
      name: fullItemName,
      subtitle: `${isReady ? "Siap Saji" : "Bahan Masak"} • Simpan di ${locationName}`,
      subtitleColor: isReady ? "text-[#7C3AED]" : "text-[#059669]",
      price: priceNum,
      priceDisplay: priceNum > 0 ? `~Rp ${priceNum.toLocaleString("id-ID")}` : "",
      checked: false,
      qty: qtyFormatted,
      category: isReady ? "ready" : "cook",
      locationType: newShoppingLocationType,
      location: locationName,
      expiryDays: newShoppingExpiryDays,
    };

    setShoppingItems((prev) => [...prev, newItem]);
    setNewShoppingName("");
    setNewShoppingPrice("");
    setNewShoppingQty("1");
    setNewShoppingUnit("porsi");
    setNewShoppingCategory("cook");
    setNewShoppingLocationType("fridge");
    setNewShoppingLocation("Kulkas Utama");
    setNewShoppingExpiryDays(7);
    setIsAddShoppingModalOpen(false);
    showToast(`"${newItem.name}" ditambahkan ke daftar belanja!`, "cart");
  };

  // QuickAdd modal / view states
  interface AiAnalysisResult {
    name: string;
    unit: string;
    category: "cook" | "ready";
    categoryLabel: string;
    pricePerUnit: number;
    expiryDays: number;
    expiryText: string;
    expiryColor: string;
    borderColor: string;
    storageLocation: string;
    storageTemp: string;
    locationType: "fridge" | "freezer";
    confidence: number;
  }

  const [quickAddTab, setQuickAddTab] = useState<"ai" | "manual">("ai");
  const [isAiScanning, setIsAiScanning] = useState(false);
  const [aiResult, setAiResult] = useState<AiAnalysisResult | null>(null);
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [isSourceModalOpen, setIsSourceModalOpen] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputGalleryRef = useRef<HTMLInputElement>(null);

  // Settings & Recipe Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isRecipeOpen, setIsRecipeOpen] = useState(false);
  const [isManualAddOpen, setIsManualAddOpen] = useState(false);
  const [recipePrefilledItem, setRecipePrefilledItem] = useState<string | undefined>(undefined);
  const [selectedOlahItemIds, setSelectedOlahItemIds] = useState<number[]>([]);

  useEffect(() => {
    if (recipePrefilledItem && items.length > 0) {
      const match = items.find(
        (it) =>
          it.name.toLowerCase().includes(recipePrefilledItem.toLowerCase()) ||
          recipePrefilledItem.toLowerCase().includes(it.name.toLowerCase())
      );
      if (match) {
        setSelectedOlahItemIds([match.id]);
      }
    }
  }, [recipePrefilledItem, items]);

  // Filters for Dashboard
  const [categoryFilter, setCategoryFilter] = useState<"all" | "cook" | "ready">("all");
  const [locationFilter, setLocationFilter] = useState<"all" | "fridge" | "freezer">("all");
  const [activeTab, setActiveTab] = useState<"stok" | "olah" | "add" | "belanja" | "setting">("stok");

  // Toast
  const [toast, setToast] = useState<{ message: string; type: string } | null>(null);

  const showToast = (msg: string, type: string = "success") => {
    const cleanMsg = msg
      .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, "")
      .trim();

    let detectedType = type;
    if (type === "settings" || type === "gear") detectedType = "settings";
    else if (type === "save") detectedType = "save";
    else if (type === "success") detectedType = "success";
    else if (type === "warning") detectedType = "warning";
    else if (type === "error") detectedType = "error";
    else if (type === "cart") detectedType = "cart";
    else if (type === "cook") detectedType = "cook";
    else if (type === "camera") detectedType = "camera";
    else if (type === "delete" || type === "trash") detectedType = "delete";
    else if (type === "info") detectedType = "info";

    setToast({ message: cleanMsg, type: detectedType });
    setTimeout(() => {
      setToast(null);
    }, 2800);
  };

  const handleCookRecipe = (recipeName: string, financialValue: number, itemNames: string[]) => {
    setFinancialSaved((prev) => prev + financialValue);
    setItems((prevItems) => {
      const next = prevItems.filter(
        (item) =>
          !itemNames.some(
            (used) =>
              item.name.toLowerCase().includes(used.toLowerCase()) ||
              used.toLowerCase().includes(item.name.toLowerCase())
          )
      );
      setSavedCount(next.length);
      return next;
    });
    setRecipePrefilledItem(undefined);
    const hasReady = itemNames.some((name) => isReadyFood({ name }));
    showToast(
      hasReady
        ? `"${recipeName}" berhasil disantap & dinikmati! Finansial terselamatkan +Rp ${financialValue.toLocaleString("id-ID")}.`
        : `Menu "${recipeName}" berhasil dimasak! Finansial +Rp ${financialValue.toLocaleString(
            "id-ID"
          )}, bahan kulkas otomatis berkurang.`,
      hasReady ? "save" : "cook"
    );
  };



  const filteredItems = items.filter((item) => {
    if (categoryFilter !== "all" && item.category !== categoryFilter) return false;
    if (locationFilter !== "all" && item.locationType !== locationFilter) return false;
    return true;
  });

  const handleSimpanItem = () => {
    if (!aiResult) return;
    const newItem: InventoryItem = {
      id: Date.now(),
      name: aiResult.name,
      qty: `${scanQty} ${aiResult.unit}`,
      expiryText: aiResult.expiryText,
      expiryColor: aiResult.expiryColor,
      borderColor: aiResult.borderColor,
      location: aiResult.storageLocation,
      category: aiResult.category,
      locationType: aiResult.locationType,
      actionIcon: "search",
      price: 25000,
    };
    setItems((prev) => [newItem, ...prev]);
    showToast(`"${newItem.name}" (${newItem.qty}) berhasil disimpan ke Kulkas!`, "success");
    setAiResult(null);
    setScannedImage(null);
    setTimeout(() => {
      setCurrentView("dashboard");
      setActiveTab("stok");
    }, 1000);
  };

  // Kompresi cerdas gambar sebelum diunggah ke Gemini AI Vision (Menghindari batasan 4.5MB Vercel)
  const compressImageForAi = (file: File): Promise<{ base64: string; dataUrl: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const maxDim = 1200;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const raw = (e.target?.result as string) || "";
            resolve({ base64: raw.split(",")[1] || "", dataUrl: raw });
          };
          reader.readAsDataURL(file);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
        const base64 = dataUrl.split(",")[1] || "";
        resolve({ base64, dataUrl });
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        const reader = new FileReader();
        reader.onload = (e) => {
          const raw = (e.target?.result as string) || "";
          resolve({ base64: raw.split(",")[1] || "", dataUrl: raw });
        };
        reader.readAsDataURL(file);
      };
      img.src = objectUrl;
    });
  };

  const handleImageSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input value to allow re-uploading same file if desired
    e.target.value = "";

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setScannedImage(dataUrl);
      setIsAiScanning(true);
      setAiResult(null);
      showToast("Mengunggah foto & sedang memproses...", "camera");

      try {
        const { base64 } = await compressImageForAi(file);
        const res = await fetch("/api/scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image: base64,
            mimeType: "image/jpeg",
            model: "gemini-3.5-flash-lite",
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || data.detail || "Gagal menganalisa gambar.");
        }

        if (!data.is_food_related || !data.items || data.items.length === 0) {
          showToast(
            data.detail || data.ringkasan_keamanan_pangan || "Tidak ada bahan makanan terdeteksi pada gambar.",
            "warning"
          );
          setIsAiScanning(false);
          return;
        }

        const primary = data.items[0];
        const qtyNumber = Number(primary.kuantitas) || 1;
        const totalEstimatedPrice = Number(primary.estimasi_harga?.harga_rata_rata) || 5000;
        const unitPrice = Math.max(1000, Math.round(totalEstimatedPrice / qtyNumber));

        // Determine category & label
        const isReady =
          primary.tipe_makanan === "olahan_matang" ||
          primary.tipe_makanan === "siap_saji" ||
          primary.tipe_makanan === "kemasan_pabrik" ||
          (primary.kategori && (
            primary.kategori.toLowerCase().includes("matang") ||
            primary.kategori.toLowerCase().includes("saji") ||
            primary.kategori.toLowerCase().includes("kuliner") ||
            primary.kategori.toLowerCase().includes("roti") ||
            primary.kategori.toLowerCase().includes("camilan")
          )) ||
          isReadyFood({ name: primary.nama_produk, location: primary.daya_tahan?.rekomendasi_simpan });
        const catLabel = primary.kategori || (isReady ? "Siap Saji" : "Bahan Mentah");

        // Determine expiry text & color
        const expiryDesc = primary.daya_tahan?.kulkas_chiller || "3 Hari Lagi (H-3)";
        let expiryColor = "text-[#059669]";
        let borderColor = "border-l-[#059669]";
        const lowerExpiry = expiryDesc.toLowerCase();
        if (
          lowerExpiry.includes("h-1") ||
          lowerExpiry.includes("besok") ||
          lowerExpiry.includes("hari ini")
        ) {
          expiryColor = "text-[#E11D48]";
          borderColor = "border-l-[#E11D48]";
        } else if (
          lowerExpiry.includes("h-2") ||
          lowerExpiry.includes("h-3") ||
          lowerExpiry.includes("2 hari") ||
          lowerExpiry.includes("3 hari")
        ) {
          expiryColor = "text-[#D97706]";
          borderColor = "border-l-[#D97706]";
        }

        // Determine storage location & temp
        const reco = primary.daya_tahan?.rekomendasi_simpan || "Kulkas Sayur";
        const isFreezer = reco.toLowerCase().includes("freezer");
        const storageTemp = isFreezer ? "Suhu Freezer -18°C" : "Suhu Chiller 4°C";

        const detected: AiAnalysisResult = {
          name: primary.nama_produk || "Bahan Makanan",
          unit: primary.satuan ? (primary.satuan.charAt(0).toUpperCase() + primary.satuan.slice(1)) : "Porsi",
          category: isReady ? "ready" : "cook",
          categoryLabel: catLabel,
          pricePerUnit: unitPrice,
          expiryDays: 3,
          expiryText: expiryDesc,
          expiryColor: expiryColor,
          borderColor: borderColor,
          storageLocation: reco,
          storageTemp: storageTemp,
          locationType: isFreezer ? "freezer" : "fridge",
          confidence: 98,
        };

        setScanQty(qtyNumber);
        setAiResult(detected);
        setIsAiScanning(false);
        showToast(
          `AI Vision: ${detected.name} (${qtyNumber} ${detected.unit}) berhasil dianalisa!`,
          "success"
        );
      } catch (err: any) {
        console.error("AI Scan Error:", err);
        setIsAiScanning(false);
        showToast(err.message || "Gagal menghubungi Gemini AI Vision", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans pb-24 sm:pb-28">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#0F172A]/95 backdrop-blur-sm text-white px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-2xl border border-[#0D9488]/40 z-50 flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold transition-all">
          {toast.type === "success" && <CheckCircle2 className="w-4 h-4 text-[#34D399] shrink-0" />}
          {toast.type === "save" && <Save className="w-4 h-4 text-[#34D399] shrink-0" />}
          {toast.type === "cart" && <ShoppingCart className="w-4 h-4 text-[#34D399] shrink-0" />}
          {toast.type === "cook" && <ChefHat className="w-4 h-4 text-[#2DD4BF] shrink-0" />}
          {toast.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />}
          {toast.type === "error" && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === "delete" && <Trash2 className="w-4 h-4 text-rose-400 shrink-0" />}
          {toast.type === "camera" && <Camera className="w-4 h-4 text-[#2DD4BF] shrink-0" />}
          {toast.type === "settings" && <Settings className="w-4 h-4 text-[#2DD4BF] shrink-0" />}
          {toast.type === "info" && <Info className="w-4 h-4 text-[#38BDF8] shrink-0" />}
          <span className="truncate">{toast.message}</span>
        </div>
      )}

      {/* Main Container - Responsive Canvas (Full Support for Windows Desktop & Mobile) */}
      <div className="max-w-2xl mx-auto px-3.5 sm:px-6 pt-3 sm:pt-6">

        {/* ========================================================================= */}
        {/* VIEW 1: DASHBOARD (Desktop - 1)                                           */}
        {/* ========================================================================= */}
        {currentView === "dashboard" && (
          <div>
            {/* Top Header */}
            <header className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="w-9 h-8 sm:w-11 sm:h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center shadow-sm">
                  <Apple className="w-4 h-4 sm:w-5 sm:h-5 text-white" strokeWidth={2.2} />
                </div>
                <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-[#0F172A]">StockWatch</h1>
              </div>

              {/* Actions & Profile in Header */}
              <div className="flex items-center gap-2">
                {!isPwaInstalled && (
                  <button
                    type="button"
                    onClick={handleInstallPwa}
                    className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] text-[10px] sm:text-xs font-bold tracking-wide transition-all shadow-2xs active:scale-95"
                    title="Pasang StockWatch OS sebagai Shortcut Aplikasi di Komputer/HP"
                  >
                    <Download className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>Install App</span>
                  </button>
                )}

                {/* User Profile or Auth Trigger */}
                {currentUser ? (
                  <div
                    onClick={() => {
                      setActiveTab("setting");
                      setCurrentView("setting");
                    }}
                    className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-[11px] sm:text-xs font-bold tracking-wide cursor-pointer hover:bg-[#D1FAE5] transition-colors"
                    title="Lihat Akun & Pengaturan Database"
                  >
                    <User className="w-3.5 h-3.5 text-[#059669]" />
                    <span className="truncate max-w-[120px] sm:max-w-[160px]">{currentUser.fullName}</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsAuthModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-[#0D9488] hover:bg-[#0f766e] text-white text-[11px] sm:text-xs font-bold tracking-wide transition-colors shadow-xs active:scale-95"
                    title="Masuk atau Daftar Akun untuk Simpan ke Database"
                  >
                    <User className="w-3.5 h-3.5 text-white" />
                    <span>Masuk / Daftar</span>
                  </button>
                )}
              </div>
            </header>

            {/* Weekend Fridge Audit Banner */}
            <div className="w-full bg-[#F0FDFA] border border-[#0D9488] rounded-xl px-4 py-2.5 sm:px-5 flex items-center justify-between mb-3.5 shadow-sm">
              <div className="flex items-center gap-2 sm:gap-2.5 text-xs sm:text-sm font-semibold text-[#0D9488]">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#0D9488]" />
                <span>Weekend Fridge Audit (60s)</span>
              </div>
              <button
                onClick={() => {
                  setAuditStep(0);
                  setIsAuditOpen(true);
                }}
                className="bg-[#0D9488] hover:bg-[#0f766e] text-white text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 rounded-lg transition-colors shadow-sm"
              >
                Mulai (60s)
              </button>
            </div>

            {/* Hero Financial Metric Card */}
            <div className="w-full bg-[#0D9488] rounded-2xl p-4 sm:p-6 text-white mb-4 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] sm:text-xs font-bold tracking-wider text-[#CCFBF1] uppercase">
                  HEMAT FINANSIAL BULAN INI
                </span>
                <div className="bg-[#0f766e] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-md text-[10px] sm:text-[11px] font-bold text-white flex items-center gap-1.5">
                  <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" strokeWidth={3} />
                  <span>Bebas Sampah</span>
                </div>
              </div>
              <div className="text-3xl sm:text-4xl font-black tracking-tight mb-1.5">
                Rp {financialSaved.toLocaleString("id-ID")}
              </div>
              <div className="text-[11px] sm:text-xs font-medium text-[#E6FFFA]">
                {savedCount} bahan makanan diselamatkan sebelum kedaluwarsa
              </div>
            </div>

            {/* Target Audience Dual-Tab Filter */}
            <div className="w-full bg-[#F1F5F9] rounded-xl p-1 grid grid-cols-3 gap-1 mb-3.5">
              <button
                onClick={() => setCategoryFilter("all")}
                className={`py-2 px-1 rounded-lg text-center text-[11px] sm:text-xs font-bold transition-all truncate ${
                  categoryFilter === "all"
                    ? "bg-white text-[#0D9488] shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                Semua ({items.length})
              </button>
              <button
                onClick={() => setCategoryFilter("cook")}
                className={`py-2 px-1 rounded-lg text-center text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all truncate ${
                  categoryFilter === "cook"
                    ? "bg-white text-[#0D9488] shadow-sm font-bold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Salad className="w-3.5 h-3.5 shrink-0 text-current hidden sm:inline" />
                <span className="truncate">Bahan Masak ({items.filter((i) => i.category === "cook").length})</span>
              </button>
              <button
                onClick={() => setCategoryFilter("ready")}
                className={`py-2 px-1 rounded-lg text-center text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-1 transition-all truncate ${
                  categoryFilter === "ready"
                    ? "bg-white text-[#0D9488] shadow-sm font-bold"
                    : "text-[#64748B] hover:text-[#0F172A]"
                }`}
              >
                <Package className="w-3.5 h-3.5 shrink-0 text-current hidden sm:inline" />
                <span className="truncate">Siap Saji ({items.filter((i) => i.category === "ready").length})</span>
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
                  className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${locationFilter === "all"
                      ? "bg-[#0F172A] text-white"
                      : "bg-white border border-[#E2E8F0] text-[#64748B]"
                    }`}
                >
                  Semua
                </button>
                <button
                  onClick={() => setLocationFilter("fridge")}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${locationFilter === "fridge"
                      ? "bg-[#0F172A] text-white font-bold"
                      : "bg-white border border-[#E2E8F0] text-[#64748B]"
                    }`}
                >
                  <Snowflake className="w-3 h-3 text-current" />
                  <span>Kulkas</span>
                </button>
                <button
                  onClick={() => setLocationFilter("freezer")}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${locationFilter === "freezer"
                      ? "bg-[#0F172A] text-white font-bold"
                      : "bg-white border border-[#E2E8F0] text-[#64748B]"
                    }`}
                >
                  <Refrigerator className="w-3 h-3 text-current" />
                  <span>Freezer</span>
                </button>
              </div>
            </div>

            {/* Inventory Item Cards List */}
            <div className="flex flex-col gap-2.5">
              {filteredItems.length === 0 ? (
                <div className="w-full bg-white border border-dashed border-[#CBD5E1] rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-150">
                  <div className="w-12 h-12 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] mb-3">
                    <Refrigerator className="w-6 h-6 opacity-60" />
                  </div>
                  <h4 className="text-sm font-extrabold text-[#0F172A] mb-1">
                    Inventori Dapur Kosong
                  </h4>
                  <p className="text-xs text-[#64748B] max-w-sm mb-4 leading-relaxed">
                    Semua bahan makanan telah dihapus atau selesai dimasak. Saldo hemat finansial disesuaikan menjadi Rp 0.
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab("add");
                        setCurrentView("quickadd");
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Bahan (Quick Add)</span>
                    </button>
                  </div>
                </div>
              ) : (
                filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className={`w-full bg-white border border-[#E2E8F0] rounded-xl px-3 sm:px-4 py-3 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow border-l-4 ${item.borderColor}`}
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 mr-2">
                      <div className="w-10 h-10 bg-[#F8FAFC] border border-[#F1F5F9] rounded-lg flex items-center justify-center shrink-0">
                        {renderFoodIcon(item, "w-5 h-5")}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span className="text-sm font-extrabold text-[#0F172A] truncate max-w-[150px] sm:max-w-none">{item.name}</span>
                          <span className="bg-[#F1F5F9] text-[#64748B] text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                            {item.locationType === "freezer" || item.location.toLowerCase().includes("freezer") ? (
                              <Refrigerator className="w-3 h-3 text-slate-500" />
                            ) : item.category === "ready" || item.location.toLowerCase().includes("saji") ? (
                              <CookingPot className="w-3 h-3 text-slate-500" />
                            ) : (
                              <Snowflake className="w-3 h-3 text-slate-500" />
                            )}
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

                    <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
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
                        className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center transition-colors"
                        title={
                          item.actionIcon === "search"
                            ? "Cari Ide Resep Olahan"
                            : item.actionIcon === "plate"
                              ? "Mulai Masak Menu Ini"
                              : "Ubah Data Bahan"
                        }
                      >
                        {item.actionIcon === "search" && <Search className="w-4 h-4 text-[#64748B]" />}
                        {item.actionIcon === "plate" && <ChefHat className="w-4 h-4 text-[#64748B]" />}
                        {item.actionIcon === "edit" && <Pencil className="w-4 h-4 text-[#64748B]" />}
                      </button>

                      <button
                        onClick={() => setItemToDelete(item)}
                        className="w-8 h-8 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:bg-rose-50 hover:border-rose-200 text-[#94A3B8] hover:text-[#E11D48] flex items-center justify-center transition-colors"
                        title="Hapus dari Inventori Kulkas"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
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
                <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center shadow-sm">
                  <Apple className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Quick Add</h1>
              </div>

              {/* Target <5 Detik Badge */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide">
                <Zap className="w-3.5 h-3.5 text-[#059669]" />
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
                className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${quickAddTab === "ai"
                    ? "bg-[#0D9488] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>AI Camera Scan (Utama)</span>
              </button>
              <button
                onClick={() => {
                  setQuickAddTab("manual");
                  setIsManualAddOpen(true);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${quickAddTab === "manual"
                    ? "bg-[#0D9488] text-white shadow-sm"
                    : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
              >
                <Pencil className="w-3.5 h-3.5" />
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
                  {isAiScanning
                    ? "Menganalisis..."
                    : aiResult
                      ? `${aiResult.confidence}% Akurat`
                      : "Menunggu Foto"}
                </div>

                {/* Center Detected Food View or Image Preview or Initial State */}
                {scannedImage ? (
                  <div className="w-24 h-24 rounded-2xl overflow-hidden relative shadow-lg border-2 border-[#2DD4BF] my-auto bg-black/50">
                    <img
                      src={scannedImage}
                      alt="Pratinjau Makanan"
                      className="w-full h-full object-cover"
                    />
                    {isAiScanning && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#4ADE80] to-transparent animate-pulse shadow-sm shadow-[#4ADE80]"></div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center my-auto px-4 select-none">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-dashed border-[#2DD4BF]/40 flex items-center justify-center mb-2 text-[#2DD4BF]">
                      <Camera className="w-8 h-8 opacity-75" />
                    </div>
                    <p className="text-xs text-[#94A3B8] font-medium max-w-xs">
                      Tekan tombol kamera di bawah untuk foto langsung atau unggah dari file
                    </p>
                  </div>
                )}

                {/* Camera Trigger Button (Circle) */}
                <button
                  onClick={() => setIsSourceModalOpen(true)}
                  className="w-12 h-12 rounded-full bg-[#0D9488] hover:bg-[#0f766e] border-2 border-white text-white flex items-center justify-center shadow-lg active:scale-90 transition-transform mb-3"
                  title="Ambil Foto Langsung atau Pilih dari File"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* AI Result Card (HASIL ANALISA CERDAS AI) */}
            <div className="w-full bg-white border border-[#0D9488] rounded-2xl p-5 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#0D9488] uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-[#0D9488]" />
                  <span>HASIL ANALISA CERDAS AI</span>
                </div>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border ${aiResult
                      ? "bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]"
                      : isAiScanning
                        ? "bg-[#F0FDFA] text-[#0D9488] border-[#99F6E4] animate-pulse"
                        : "bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]"
                    }`}
                >
                  {aiResult
                    ? "Otomatis Terisi"
                    : isAiScanning
                      ? "Sedang Menganalisis..."
                      : "Menunggu Input Gambar"}
                </span>
              </div>

              {/* State 1: Sedang Menganalisis (Loading) */}
              {isAiScanning && (
                <div className="py-12 px-4 flex flex-col items-center justify-center text-center animate-in fade-in duration-150">
                  <div className="w-9 h-9 rounded-full border-3 border-[#0D9488] border-t-transparent animate-spin mb-3"></div>
                  <div className="text-sm font-bold text-[#0F172A] mb-1">
                    Memproses...
                  </div>
                  <p className="text-xs text-[#64748B] max-w-sm">
                    Menganalisis jenis bahan pangan, taksiran harga lokal (ROI), rekomendasi penyimpanan, dan tanggal kedaluwarsa.
                  </p>
                </div>
              )}

              {/* State 2: Kosong Awal-awal (Belum Ada Gambar) */}
              {!isAiScanning && !aiResult && (
                <div className="py-10 px-4 flex flex-col items-center justify-center text-center rounded-xl border border-dashed border-[#CBD5E1] bg-[#F8FAFC]">
                  <div className="w-12 h-12 rounded-xl bg-white border border-[#E2E8F0] flex items-center justify-center text-[#0D9488] mb-2.5 shadow-2xs">
                    <Sparkles className="w-6 h-6 opacity-80" />
                  </div>
                  <div className="text-sm font-bold text-[#0F172A] mb-1">
                    Hasil Analisa Masih Kosong
                  </div>
                  <p className="text-xs text-[#64748B] max-w-sm mb-4">
                    Silakan ambil foto langsung atau pilih gambar bahan makanan dari file untuk memulai deteksi cerdas AI.
                  </p>
                  <button
                    onClick={() => setIsSourceModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold transition shadow-xs"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Pindai Gambar Sekarang</span>
                  </button>
                </div>
              )}

              {/* State 3: Hasil Analisa Sudah Tersedia */}
              {!isAiScanning && aiResult && (
                <>
                  {/* 4 Metadata Cards Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-4 animate-in fade-in duration-200">
                    {/* Card 1: Nama Makanan */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                      <span className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                        NAMA MAKANAN
                      </span>
                      <div className="text-sm font-extrabold text-[#0F172A] mb-1">
                        {aiResult.name} ({scanQty} {aiResult.unit})
                      </div>
                      <div className="text-[11px] font-bold text-[#059669] flex items-center gap-1.5">
                        {renderFoodIcon(aiResult, "w-3.5 h-3.5")}
                        <span>{aiResult.categoryLabel}</span>
                      </div>
                    </div>

                    {/* Card 2: Estimasi Harga */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                      <span className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                        ESTIMASI HARGA (ROI)
                      </span>
                      <div className="text-sm font-extrabold text-[#0D9488] mb-1">
                        Rp {(aiResult.pricePerUnit * scanQty).toLocaleString("id-ID")}
                      </div>
                      <div className="text-[11px] font-bold text-[#059669] flex items-center gap-1.5">
                        <Coins className="w-3.5 h-3.5 text-[#059669]" />
                        <span>Rata Pasar Lokal</span>
                      </div>
                    </div>

                    {/* Card 3: Prediksi Kedaluwarsa */}
                    <div className="bg-[#FFF1F2] border border-[#FECDD3] rounded-xl p-3">
                      <span className="text-[10px] font-bold tracking-wider text-[#E11D48] uppercase block mb-1">
                        PREDIKSI KEDALUWARSA
                      </span>
                      <div className="text-sm font-extrabold text-[#E11D48] mb-1">
                        {aiResult.expiryText}
                      </div>
                      <div className="text-[11px] font-bold text-[#E11D48] flex items-center gap-1.5">
                        <Snowflake className="w-3.5 h-3.5 text-[#E11D48]" />
                        <span>{aiResult.storageTemp}</span>
                      </div>
                    </div>

                    {/* Card 4: Lokasi Penyimpanan */}
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3">
                      <span className="text-[10px] font-bold tracking-wider text-[#94A3B8] uppercase block mb-1">
                        LOKASI PENYIMPANAN
                      </span>
                      <div className="text-sm font-extrabold text-[#0F172A] mb-1 flex items-center gap-1.5">
                        <Snowflake className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>{aiResult.storageLocation}</span>
                      </div>
                      <div className="text-[11px] font-medium text-[#64748B]">
                        {aiResult.storageTemp}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Row */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3">
                    <button
                      onClick={handleSimpanItem}
                      className="flex-1 bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Konfirmasi &amp; Simpan ke Kulkas</span>
                    </button>
                    <div className="flex items-center justify-between sm:justify-start gap-2">
                      <div className="flex items-center bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-1">
                        <button
                          onClick={() => setScanQty((prev) => Math.max(1, prev - 1))}
                          className="w-9 h-11 text-[#64748B] hover:text-[#0F172A] font-bold text-lg flex items-center justify-center transition-colors"
                          title="Kurangi kuantitas"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-extrabold text-sm text-[#0F172A]">
                          {scanQty}
                        </span>
                        <button
                          onClick={() => setScanQty((prev) => prev + 1)}
                          className="w-9 h-11 text-[#64748B] hover:text-[#0F172A] font-bold text-lg flex items-center justify-center transition-colors"
                          title="Tambah kuantitas"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => setIsSourceModalOpen(true)}
                        className="flex-1 sm:flex-initial px-3.5 py-3 rounded-xl border border-[#CBD5E1] bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#64748B] hover:text-[#0F172A] flex items-center justify-center transition"
                        title="Ganti atau Pindai Ulang Foto"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Bottom Note */}
                  <p className="text-xs text-[#94A3B8] font-medium mt-3">
                    Otomatis menambah saldo hemat Rp{" "}
                    {(aiResult.pricePerUnit * scanQty).toLocaleString("id-ID")} saat dimasak!
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        {/* Modal Pilihan Sumber Gambar (Kamera vs File/Galeri) */}
        {isSourceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                    <Camera className="w-4 h-4 text-[#0D9488]" />
                    <span>Pilih Sumber Gambar</span>
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Pindai bahan makanan menggunakan kamera atau galeri
                  </p>
                </div>
                <button
                  onClick={() => setIsSourceModalOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 pt-1">
                {/* Opsi 1: Ambil Gambar Langsung (Kamera) */}
                <button
                  type="button"
                  onClick={() => {
                    cameraInputRef.current?.click();
                    setIsSourceModalOpen(false);
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA] transition text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] group-hover:bg-[#0D9488] group-hover:text-white transition">
                    <Camera className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">Ambil Gambar Langsung</div>
                    <div className="text-xs text-[#64748B]">Buka kamera perangkat langsung</div>
                  </div>
                </button>

                {/* Opsi 2: Dari File / Galeri */}
                <button
                  type="button"
                  onClick={() => {
                    fileInputGalleryRef.current?.click();
                    setIsSourceModalOpen(false);
                  }}
                  className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-[#E2E8F0] hover:border-[#0D9488] hover:bg-[#F0FDFA] transition text-left group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] group-hover:bg-[#0D9488] group-hover:text-white transition">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">Pilih dari File / Galeri</div>
                    <div className="text-xs text-[#64748B]">Unggah file foto dari memori perangkat</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Inputs for QuickAdd */}
        <input
          type="file"
          ref={cameraInputRef}
          accept="image/*"
          capture="environment"
          onChange={handleImageSelected}
          className="hidden"
        />
        <input
          type="file"
          ref={fileInputGalleryRef}
          accept="image/*"
          onChange={handleImageSelected}
          className="hidden"
        />

        {/* ========================================================================= */}
        {/* VIEW 3: OLAH RESEP (Screen 3) Sesuai Desain Olah Resep                    */}
        {/* ========================================================================= */}
        {/* ========================================================================= */}
        {/* VIEW 3: OLAH RESEP (Screen 3) Sesuai Desain Olah Resep                    */}
        {/* ========================================================================= */}
        {currentView === "olah" && (() => {
          // Filter selected item IDs to only those that currently exist in items
          const validSelectedIds = selectedOlahItemIds.filter((id) =>
            items.some((it) => it.id === id)
          );
          // If user hasn't explicitly set selection, default to all items
          const effectiveSelectedIds =
            validSelectedIds.length > 0
              ? validSelectedIds
              : selectedOlahItemIds.length === 0 && items.length > 0
              ? items.map((it) => it.id)
              : [];

          const selectedItems = items.filter((it) => effectiveSelectedIds.includes(it.id));
          const { criticalItems, recipes } = getDynamicRecipes(items, selectedItems, recipePrefilledItem);

          return (
            <div className="animate-in fade-in duration-200">
              {/* Top Header */}
              <header className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center shadow-sm">
                    <Apple className="w-5 h-5 text-white" strokeWidth={2.2} />
                  </div>
                  <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Olah Resep</h1>
                </div>

                {/* Anti Bahan Basi Badge */}
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Anti Bahan Basi</span>
                </div>
              </header>

              {items.length === 0 ? (
                /* Empty state when fridge is empty */
                <div className="w-full bg-white border border-dashed border-[#CBD5E1] rounded-2xl py-14 px-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-150 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488] mb-3.5">
                    <ChefHat className="w-7 h-7" />
                  </div>
                  <h3 className="text-base font-extrabold text-[#0F172A] mb-1.5">
                    Inventori Kulkas Masih Kosong
                  </h3>
                  <p className="text-xs text-[#64748B] max-w-md mb-5 leading-relaxed">
                    Semua bahan telah selesai dimasak atau belum ada bahan terdaftar. Tambahkan bahan baru melalui fitur Quick Add untuk mencoba rekomendasi resep.
                  </p>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={() => {
                        setActiveTab("add");
                        setCurrentView("quickadd");
                      }}
                      className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold transition shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Tambah Bahan (Quick Add)</span>
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Hero Alert: Dinamis Berdasarkan Bahan Kritis Kulkas */}
                  {criticalItems.length > 0 ? (
                    <div className="w-full bg-[#FFF1F2] border border-[#FECDD3] rounded-2xl p-5 mb-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-[#E11D48] mb-1">
                        <AlertTriangle className="w-4 h-4 text-[#E11D48]" />
                        <span>
                          {criticalItems.length}{" "}
                          {criticalItems.length === 1 ? "BAHAN HARUS DIHABISKAN SEGERA!" : "BAHAN HARUS DIHABISKAN HARI INI!"}
                        </span>
                      </div>
                      <p className="text-xs text-[#64748B] mb-3">
                        Bahan kulkas berikut mendekati batas kesegaran maksimal. Olah segera agar nutrisi terjaga:
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {criticalItems.map((cItem) => (
                          <div
                            key={cItem.id}
                            className="bg-white border border-[#FECDD3] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-xs"
                          >
                            {renderFoodIcon(cItem, "w-3.5 h-3.5")}
                            <span className="text-xs font-bold text-[#E11D48]">
                              {cItem.name} ({cItem.expiryText})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="w-full bg-[#ECFDF5] border border-[#A7F3D0] rounded-2xl p-5 mb-5 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-extrabold text-[#059669] mb-1">
                        <ShieldCheck className="w-4 h-4 text-[#059669]" />
                        <span>SEMUA BAHAN KULKAS DALAM KONDISI AMAN</span>
                      </div>
                      <p className="text-xs text-[#64748B] mb-3">
                        Tidak ada bahan yang darurat basi. Berikut resep olahan hemat sesuai inventori yang tersedia:
                      </p>

                      <div className="flex flex-wrap items-center gap-2.5">
                        {items.slice(0, 3).map((sItem) => (
                          <div
                            key={sItem.id}
                            className="bg-white border border-[#A7F3D0] rounded-full px-4 py-1.5 flex items-center gap-2 shadow-xs"
                          >
                            {renderFoodIcon(sItem, "w-3.5 h-3.5")}
                            <span className="text-xs font-bold text-[#059669]">
                              {sItem.name} ({sItem.qty})
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interaktif: Pilih Bahan Apa yang Ingin Diolah */}
                  <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 mb-5 shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <CookingPot className="w-4 h-4 text-[#0D9488]" />
                        <h3 className="text-sm font-extrabold text-[#0F172A]">
                          Pilih Bahan yang Ingin Diolah ({effectiveSelectedIds.length}/{items.length})
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOlahItemIds(items.map((i) => i.id))}
                          className="px-3 py-1 rounded-lg text-xs font-bold text-[#0D9488] bg-[#F0FDFA] hover:bg-[#CCFBF1] transition border border-[#99F6E4]"
                        >
                          Pilih Semua
                        </button>
                        {items.length > 1 && effectiveSelectedIds.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSelectedOlahItemIds([items[0].id])}
                            className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition"
                          >
                            Pilih 1 Saja
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-[#64748B] mb-3.5">
                      Klik atau centang bahan di bawah ini. Rekomendasi resep akan otomatis menyesuaikan hanya dengan bahan yang Anda pilih:
                    </p>

                    <div className="flex flex-wrap gap-2.5">
                      {items.map((item) => {
                        const isSelected = effectiveSelectedIds.includes(item.id);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedOlahItemIds((prev) => {
                                  const base = prev.length === 0 ? items.map((i) => i.id) : prev;
                                  return base.filter((id) => id !== item.id);
                                });
                              } else {
                                setSelectedOlahItemIds((prev) => {
                                  const base = prev.length === 0 ? items.map((i) => i.id) : prev;
                                  return [...base, item.id];
                                });
                              }
                            }}
                            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected
                                ? "bg-[#0D9488] border-[#0D9488] text-white shadow-xs ring-2 ring-[#0D9488]/20"
                                : "bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-[#F1F5F9] hover:border-[#CBD5E1]"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded flex items-center justify-center transition-colors ${
                                isSelected ? "bg-white text-[#0D9488]" : "border border-[#CBD5E1] bg-white"
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 text-[#0D9488]" strokeWidth={3} />}
                            </div>
                            <div className="flex items-center gap-1.5">
                              {renderFoodIcon(item, isSelected ? "w-3.5 h-3.5 text-white" : "w-3.5 h-3.5")}
                              <span>{item.name}</span>
                              <span className={isSelected ? "text-white/80 font-normal" : "text-[#94A3B8] font-normal"}>
                                ({item.qty})
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section Title */}
                  <div className="flex items-center justify-between mb-3.5">
                    <h2 className="text-xs font-extrabold tracking-wider text-[#0F172A] uppercase flex items-center gap-1.5">
                      {selectedItems.some(isReadyFood) ? (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                          <span>PANDUAN CEPAT KONSUMSI MAKANAN JADI ({selectedItems.length} ITEM)</span>
                        </>
                      ) : (
                        <span>REKOMENDASI RESEP ZERO-WASTE DARI BAHAN TERPILIH ({selectedItems.length} BAHAN)</span>
                      )}
                    </h2>
                    {recipePrefilledItem && (
                      <span className="text-[11px] font-semibold text-[#0D9488] bg-[#F0FDFA] px-2.5 py-1 rounded-md border border-[#CCFBF1]">
                        Fokus: {recipePrefilledItem}
                      </span>
                    )}
                  </div>

                  {/* Dynamic Recipe Cards List */}
                  {selectedItems.length === 0 ? (
                    <div className="w-full bg-white border border-dashed border-[#CBD5E1] rounded-2xl py-10 px-6 flex flex-col items-center justify-center text-center animate-in fade-in duration-150 shadow-xs mb-6">
                      <div className="w-10 h-10 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center text-[#94A3B8] mb-2.5">
                        <CookingPot className="w-5 h-5" />
                      </div>
                      <h4 className="text-sm font-extrabold text-[#0F172A] mb-1">
                        Belum Ada Bahan yang Dipilih
                      </h4>
                      <p className="text-xs text-[#64748B] max-w-sm mb-4">
                        Centang minimal 1 bahan kulkas pada kotak pilihan di atas untuk melihat ide resep olahan lezat.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSelectedOlahItemIds(items.map((i) => i.id))}
                        className="px-4 py-2 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold transition shadow-xs"
                      >
                        Pilih Semua Bahan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4 mb-6">
                      {recipes.map((rec) => (
                        <div
                          key={rec.id}
                          className={`w-full bg-white border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition-shadow ${
                            rec.isReadyFood ? "border-amber-300 ring-1 ring-amber-100" : "border-[#E2E8F0]"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-2.5">
                            <div>
                              <h3 className="text-base sm:text-lg font-bold text-[#0F172A]">{rec.title}</h3>
                              <div className="flex items-center gap-1.5 text-xs text-[#64748B] mt-1">
                                <Clock className="w-3.5 h-3.5 text-[#64748B]" />
                                <span>
                                  {rec.time} • {rec.level} • {rec.serving}
                                </span>
                              </div>
                            </div>

                            <span
                              className={`text-[11px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1 rounded-full whitespace-nowrap border shrink-0 ${
                                rec.isReadyFood
                                  ? "bg-amber-50 border-amber-300 text-amber-800"
                                  : "bg-[#ECFDF5] border-[#A7F3D0] text-[#059669]"
                              }`}
                            >
                              {rec.badge}
                            </span>
                          </div>

                          {/* Used Ingredients Pill */}
                          <div className="flex flex-wrap items-center gap-2 mb-3.5">
                            <span className="text-[11px] font-bold text-[#64748B]">Bahan Terpakai:</span>
                            {rec.usedItems.map((uItem) => (
                              <span
                                key={uItem.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-xs font-bold text-[#0F172A]"
                              >
                                {renderFoodIcon(uItem, "w-3.5 h-3.5")}
                                <span>
                                  {uItem.name} ({uItem.qty})
                                </span>
                              </span>
                            ))}
                          </div>

                          {/* Langkah Kilat Dapur Box / Panduan Konsumsi */}
                          <div
                            className={`rounded-xl p-4 mb-4 border max-w-xl ${
                              rec.isReadyFood
                                ? "bg-amber-50/70 border-amber-200/80"
                                : "bg-[#F8FAFC] border-[#F1F5F9]"
                            }`}
                          >
                            <div
                              className={`font-bold text-xs mb-1.5 flex items-center gap-1.5 ${
                                rec.isReadyFood ? "text-amber-900 font-extrabold" : "text-[#0F172A]"
                              }`}
                            >
                              {rec.isReadyFood && <Zap className="w-3.5 h-3.5 text-amber-600" />}
                              <span>
                                {rec.isReadyFood
                                  ? "Panduan Cepat Dikonsumsi & Hangatkan:"
                                  : "Langkah Kilat Dapur:"}
                              </span>
                            </div>
                            <div
                              className={`text-xs space-y-1.5 leading-relaxed ${
                                rec.isReadyFood ? "text-amber-950 font-medium" : "text-[#475569]"
                              }`}
                            >
                              {rec.steps.map((st, sIdx) => (
                                <div key={sIdx}>{st}</div>
                              ))}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={() =>
                              handleCookRecipe(
                                rec.title,
                                rec.financialSaved,
                                rec.usedItems.map((it) => it.name)
                              )
                            }
                            className={`w-full sm:w-auto inline-flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-bold px-5 sm:px-6 py-3 rounded-xl shadow-sm transition-all active:scale-95 text-center ${
                              rec.isReadyFood
                                ? "bg-[#D97706] hover:bg-[#B45309]"
                                : rec.isPrimary
                                ? "bg-[#0D9488] hover:bg-[#0f766e]"
                                : "bg-[#0F172A] hover:bg-[#1E293B]"
                            }`}
                          >
                            {rec.isReadyFood ? (
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            ) : (
                              <Utensils className="w-4 h-4 text-white" />
                            )}
                            <span>
                              {rec.isReadyFood
                                ? `Santap Sekarang & Selamatkan Rp ${rec.financialSaved.toLocaleString("id-ID")}`
                                : rec.isPrimary
                                ? `Masak & Selamatkan Finansial Rp ${rec.financialSaved.toLocaleString("id-ID")}`
                                : "Masak Menu Ini"}
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })()}

        {/* ========================================================================= */}
        {/* VIEW 4: DAFTAR BELANJA (Screen 4) Sesuai Gambar Daftar Belanja            */}
        {/* ========================================================================= */}
        {currentView === "belanja" && (
          <div className="animate-in fade-in duration-200">
            {/* Top Header */}
            <header className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center shadow-sm">
                  <Apple className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Daftar Belanja</h1>
              </div>

              <div className="flex items-center gap-2">
                {shoppingItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setShoppingItems([]);
                      showToast("Daftar belanja berhasil dikosongkan!", "delete");
                    }}
                    className="px-3 py-1.5 rounded-full border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#E11D48] text-xs font-bold transition flex items-center gap-1.5"
                    title="Kosongkan semua daftar belanja"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kosongkan Belanjaan</span>
                  </button>
                )}
                <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide">
                  <ShoppingCart className="w-3.5 h-3.5 text-[#059669]" />
                  <span>Anti-Impulsif</span>
                </div>
              </div>
            </header>

            {/* Subtitle */}
            <p className="text-xs text-[#64748B] mb-5">
              Otomatis terisi dari bahan yang habis saat audit kulkas atau ditambahkan manual.
            </p>

            {/* Shopping Items List */}
            {shoppingItems.length === 0 ? (
              <div className="w-full bg-white border border-dashed border-[#CBD5E1] rounded-2xl py-12 px-6 flex flex-col items-center justify-center text-center shadow-xs mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#F0FDFA] border border-[#CCFBF1] flex items-center justify-center text-[#0D9488] mb-3">
                  <ShoppingCart className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-extrabold text-[#0F172A] mb-1">
                  Daftar Belanja Kosong
                </h4>
                <p className="text-xs text-[#64748B] max-w-sm mb-4">
                  Belum ada barang belanjaan terdaftar. Klik tombol di bawah untuk menambah kebutuhan belanja sesuai format inventaris.
                </p>
              </div>
            ) : (
              <div className="space-y-3 mb-5">
                {shoppingItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => toggleShopItem(item.id)}
                    className="w-full bg-white border border-[#E2E8F0] rounded-xl px-3 sm:px-5 py-3 sm:py-4 flex items-center justify-between shadow-xs hover:border-[#CBD5E1] transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 flex-1 mr-2">
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${item.checked
                            ? "bg-[#0D9488] text-white"
                            : "border-2 border-[#CBD5E1] bg-white hover:border-[#0D9488]"
                          }`}
                      >
                        {item.checked && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                      </div>

                      {/* Text Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                          <span
                            className={`text-sm truncate max-w-[150px] sm:max-w-none ${item.checked
                                ? "text-[#94A3B8] font-semibold line-through"
                                : "text-[#0F172A] font-bold"
                              }`}
                          >
                            {item.name}
                          </span>
                          {item.category && (
                            <span
                              className={`text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-md shrink-0 ${
                                item.category === "ready"
                                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {item.category === "ready" ? "Siap Saji" : "Bahan Masak"}
                            </span>
                          )}
                        </div>
                        <div
                          className={`text-xs mt-0.5 truncate ${item.checked ? "text-[#059669] font-medium" : item.subtitleColor
                            }`}
                        >
                          {item.checked
                            ? "Sudah dibeli ✓ (Klik tombol di bawah untuk masukkan ke kulkas)"
                            : item.subtitle}
                        </div>
                      </div>
                    </div>

                    {/* Price Tag & Actions */}
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {!item.checked && item.priceDisplay && (
                        <div className="text-xs sm:text-sm font-bold text-[#64748B] whitespace-nowrap">
                          {item.priceDisplay}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={(e) => handleDeleteShoppingItem(item.id, e)}
                        className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#E11D48] hover:bg-[#FFF1F2] transition-colors"
                        title="Hapus dari daftar belanja"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Transfer to Fridge Button when items are checked */}
            {shoppingItems.filter((i) => i.checked).length > 0 && (
              <button
                onClick={handleMoveCheckedToInventory}
                className="w-full py-3.5 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white font-bold text-sm flex items-center justify-center gap-2 mb-4 shadow-md transition-all active:scale-[0.99]"
              >
                <Refrigerator className="w-4 h-4 text-white" />
                <span>
                  Selesai Belanja &amp; Masukkan ({shoppingItems.filter((i) => i.checked).length}) Barang ke Kulkas
                </span>
              </button>
            )}

            {/* Add New Shopping Item Button */}
            <button
              onClick={() => setIsAddShoppingModalOpen(true)}
              className="w-full py-3.5 rounded-xl border border-[#0D9488] bg-white hover:bg-[#F0FDFA] text-[#0D9488] font-bold text-sm flex items-center justify-center gap-2 mb-5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-[#0D9488]" />
              <span>Tambah Barang Belanjaan Manual</span>
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
                <div className="w-11 h-9 bg-[#0D9488] rounded-[10px] flex items-center justify-center shadow-sm">
                  <Apple className="w-5 h-5 text-white" strokeWidth={2.2} />
                </div>
                <h1 className="text-xl font-extrabold tracking-tight text-[#0F172A]">Pengaturan PWA</h1>
              </div>

              {/* Notifikasi Cerdas Badge */}
              <div className="flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-[#A7F3D0] bg-[#ECFDF5] text-[#059669] text-xs font-bold tracking-wide">
                <Settings className="w-3.5 h-3.5 text-[#059669]" />
                <span>Notifikasi Cerdas</span>
              </div>
            </header>

            {/* Section 0: Akun Pengguna & Status Sinkronisasi Database */}
            <div className="mb-6">
              <h2 className="text-xs font-extrabold tracking-wider text-[#0F172A] uppercase mb-3 flex items-center justify-between">
                <span>AKUN &amp; PENYIMPANAN DATABASE</span>
                <span className="text-[10px] font-bold text-[#0D9488] bg-[#F0FDFA] px-2.5 py-0.5 rounded-full border border-[#CCFBF1]">
                  {currentUser ? "Akun Terhubung" : "Mode Tamu (Lokal)"}
                </span>
              </h2>

              <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                {currentUser ? (
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-12 rounded-2xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center justify-center text-[#059669] shrink-0 font-black text-base shadow-xs">
                          {currentUser.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-extrabold text-[#0F172A] truncate">
                            {currentUser.fullName}
                          </div>
                          <div className="text-xs text-[#64748B] truncate">
                            {currentUser.email}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="px-3.5 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-[#E11D48] text-xs font-bold flex items-center gap-1.5 transition shrink-0 shadow-xs"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar</span>
                      </button>
                    </div>

                    <div className="bg-[#F8FAFC] rounded-xl p-3 border border-[#E2E8F0] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Database className="w-4 h-4 text-[#0D9488]" />
                        <span className="font-semibold text-[#0F172A]">Sinkronisasi Cloud &amp; Lokal</span>
                      </div>
                      <span className="font-bold text-[#059669] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Aktif &amp; Otomatis</span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="w-11 h-11 rounded-2xl bg-[#F0FDFA] border border-[#99F6E4] flex items-center justify-center text-[#0D9488] shrink-0">
                        <User className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-[#0F172A]">
                          Masuk untuk Cadangkan Inventori Anda
                        </div>
                        <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">
                          Daftar akun gratis agar data kulkas, resep, dan belanja dapat tersimpan aman di database serta dapat diakses dari HP &amp; laptop mana saja.
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsAuthModalOpen(true)}
                      className="w-full py-2.5 px-4 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-sm"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Masuk atau Buat Akun Baru</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Section: Instalasi Aplikasi PWA */}
            <div className="mb-6">
              <h2 className="text-xs font-extrabold tracking-wider text-[#0F172A] uppercase mb-3.5">
                APLIKASI &amp; PINTASAN CEPAT (PWA)
              </h2>

              <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#0F172A] flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#0D9488]" />
                    <span>Jadikan Aplikasi di Layar Utama / Desktop</span>
                  </div>
                  <p className="text-xs text-[#64748B] mt-1 leading-relaxed">
                    {isPwaInstalled
                      ? "Aplikasi StockWatch OS sudah terpasang dan siap digunakan langsung dari layar perangkat Anda."
                      : "Pasang shortcut aplikasi StockWatch ke desktop Windows atau home screen HP Anda agar bisa dibuka cepat layaknya aplikasi native."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInstallPwa}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs shrink-0 ${
                    isPwaInstalled
                      ? "bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0] cursor-default"
                      : "bg-[#0D9488] hover:bg-[#0f766e] text-white active:scale-95"
                  }`}
                >
                  {isPwaInstalled ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#059669]" />
                      <span>Aplikasi Terpasang</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 text-white" />
                      <span>Pasang Aplikasi Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>

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
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${settingsToggles.webPush ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                      }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${settingsToggles.webPush ? "translate-x-6" : "translate-x-1"
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
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${settingsToggles.h3Reminder ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                      }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${settingsToggles.h3Reminder ? "translate-x-6" : "translate-x-1"
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
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${settingsToggles.h1Critical ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                      }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${settingsToggles.h1Critical ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {/* Setting 4: Anti-Spam Digest */}
                <div className="flex items-center justify-between py-4">
                  <div>
                    <div className="text-sm font-bold text-[#0F172A]">Anti-Spam Digest (Gabung Notif)</div>
                    <div className="text-xs text-[#94A3B8] mt-0.5">Maksimal 1 notifikasi rangkuman per hari</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleSetting("antiSpamDigest")}
                    className={`w-11 h-6 rounded-full transition-colors relative focus:outline-none ${settingsToggles.antiSpamDigest ? "bg-[#0D9488]" : "bg-[#CBD5E1]"
                      }`}
                  >
                    <span
                      className={`block w-4 h-4 rounded-full bg-white transition-transform shadow-xs ${settingsToggles.antiSpamDigest ? "translate-x-6" : "translate-x-1"
                        }`}
                    />
                  </button>
                </div>

                {/* Uji Coba Notifikasi Nyata */}
                <div className="pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-[#64748B]">
                    Uji coba apakah browser dan HP Anda siap menampilkan pop-up notifikasi
                  </div>
                  <button
                    type="button"
                    onClick={handleTestNotification}
                    className="px-3.5 py-2 rounded-xl bg-[#F0FDFA] hover:bg-[#CCFBF1] border border-[#99F6E4] text-[#0D9488] text-xs font-bold flex items-center justify-center gap-1.5 transition shrink-0 active:scale-95 shadow-2xs"
                  >
                    <BellRing className="w-3.5 h-3.5 text-[#0D9488]" />
                    <span>Tes Notifikasi Sekarang</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Section 2: Reset & Pembersihan Data */}
            <div className="mb-6">
              <h2 className="text-xs font-extrabold tracking-wider text-[#0F172A] uppercase mb-3.5">
                KONTROL &amp; PEMBERSIHAN DATA
              </h2>

              <div className="w-full bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm">
                <div className="text-sm font-bold text-[#0F172A] mb-1">
                  Kosongkan Seluruh Data
                </div>
                <p className="text-xs text-[#64748B] mb-4">
                  Anda dapat mengosongkan seluruh data stok kulkas, daftar belanja, dan saldo hemat finansial kembali ke angka 0 secara bersih.
                </p>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClearAccountData}
                    className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold text-[#E11D48] flex items-center gap-2 transition-colors shadow-xs"
                  >
                    <Trash2 className="w-4 h-4 text-[#E11D48]" />
                    <span>Kosongkan Semua Data (Reset ke 0)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Floating / Sticky Bottom Navigation Bar matching the Figma Design exactly (Supports Windows Desktop & Mobile) */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] shadow-lg z-40 pb-[env(safe-area-inset-bottom,0px)]">
        <div className="max-w-2xl mx-auto h-16 sm:h-20 flex items-center justify-around px-3 sm:px-6 relative">

          {/* Stok Tab */}
          <button
            onClick={() => {
              setActiveTab("stok");
              setCurrentView("dashboard");
            }}
            className="flex flex-col items-center gap-1 sm:gap-1.5 text-[#64748B] hover:text-[#0D9488] transition-colors py-1 px-3 touch-manipulation"
          >
            <ClipboardList
              className={`w-5 h-5 transition-colors ${currentView === "dashboard" && activeTab === "stok"
                  ? "text-[#0D9488]"
                  : "text-[#64748B]"
                }`}
            />
            <span
              className={`text-[11px] sm:text-xs font-bold ${currentView === "dashboard" && activeTab === "stok"
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
            className="flex flex-col items-center gap-1 sm:gap-1.5 text-[#64748B] hover:text-[#0D9488] transition-colors py-1 px-3 touch-manipulation"
          >
            <ChefHat
              className={`w-5 h-5 transition-colors ${currentView === "olah" || activeTab === "olah"
                  ? "text-[#0D9488]"
                  : "text-[#64748B]"
                }`}
            />
            <span
              className={`text-[11px] sm:text-xs font-semibold ${currentView === "olah" || activeTab === "olah"
                  ? "text-[#0D9488] font-bold"
                  : "text-[#64748B]"
                }`}
            >
              Olah
            </span>
          </button>

          {/* Floating Plus Button (Quick Add) -> Switches to Quick Add Screen 2 */}
          <div className="relative -top-3 sm:-top-4">
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
              className="w-12 h-12 sm:w-14 sm:h-14 bg-[#0D9488] hover:bg-[#0f766e] text-white rounded-full flex items-center justify-center shadow-lg shadow-[#0D9488]/40 border-4 border-white transition-transform active:scale-95 touch-manipulation"
              title="Quick Add Cepat (<5 Detik)"
            >
              <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5]" />
            </button>
          </div>

          {/* Belanja Tab */}
          <button
            onClick={() => {
              setActiveTab("belanja");
              setCurrentView("belanja");
            }}
            className="flex flex-col items-center gap-1 sm:gap-1.5 text-[#64748B] hover:text-[#0D9488] transition-colors py-1 px-3 touch-manipulation"
          >
            <ShoppingCart
              className={`w-5 h-5 transition-colors ${currentView === "belanja" || activeTab === "belanja"
                  ? "text-[#0D9488]"
                  : "text-[#64748B]"
                }`}
            />
            <span
              className={`text-[11px] sm:text-xs font-semibold ${currentView === "belanja" || activeTab === "belanja"
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
            className="flex flex-col items-center gap-1 sm:gap-1.5 text-[#64748B] hover:text-[#0D9488] transition-colors py-1 px-3 touch-manipulation"
          >
            <Settings
              className={`w-5 h-5 transition-colors ${currentView === "setting" || activeTab === "setting"
                  ? "text-[#0D9488]"
                  : "text-[#64748B]"
                }`}
            />
            <span
              className={`text-[11px] sm:text-xs font-semibold ${currentView === "setting" || activeTab === "setting"
                  ? "text-[#0D9488] font-bold"
                  : "text-[#64748B]"
                }`}
            >
              Setting
            </span>
          </button>
        </div>
      </nav>

      {/* User Login & Signup Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
        showToast={showToast}
      />

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
            category: "cook",
            locationType: newItem.zone === "freezer_beku" ? "freezer" : "fridge",
            actionIcon: "edit",
            price: newItem.price || 20000,
          };
          setItems((prev) => [itemToAdd, ...prev]);
          showToast(`"${itemToAdd.name}" ditambahkan ke inventori!`, "success");
        }}
      />

      {/* Modal Tambah Barang Belanjaan Manual & Custom Sesuai Format Inventaris */}
      {isAddShoppingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-100">
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-[#0D9488]" />
                <span>Tambah Barang Belanjaan Custom</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddShoppingModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddShoppingItem} className="space-y-4">
              {/* Nama Bahan */}
              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">
                  Nama Bahan / Makanan <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={newShoppingName}
                  onChange={(e) => setNewShoppingName(e.target.value)}
                  placeholder="Misal: Daging Ayam, Bayam Segar, Tahu Bandung..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488]"
                  autoFocus
                  required
                />
              </div>

              {/* Jumlah dan Satuan */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    Jumlah / Kuantitas
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newShoppingQty}
                    onChange={(e) => setNewShoppingQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    Satuan Fisik
                  </label>
                  <select
                    value={newShoppingUnit}
                    onChange={(e) => setNewShoppingUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488] bg-white"
                  >
                    <option value="porsi">Porsi</option>
                    <option value="ikat">Ikat</option>
                    <option value="buah">Buah</option>
                    <option value="butir">Butir</option>
                    <option value="ekor">Ekor</option>
                    <option value="papan">Papan</option>
                    <option value="bungkus">Bungkus</option>
                    <option value="gram">Gram</option>
                    <option value="kg">Kg</option>
                    <option value="liter">Liter</option>
                    <option value="ml">Ml</option>
                    <option value="kaleng">Kaleng</option>
                  </select>
                </div>
              </div>

              {/* Kategori Inventaris */}
              <div>
                <label className="text-xs font-bold text-[#475569] block mb-1">
                  Kategori Inventaris
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewShoppingCategory("cook")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      newShoppingCategory === "cook"
                        ? "bg-[#0D9488] text-white border-[#0D9488] shadow-xs"
                        : "bg-white text-[#475569] border-[#CBD5E1] hover:bg-zinc-50"
                    }`}
                  >
                    <Salad className="w-3.5 h-3.5" />
                    <span>Bahan Masak</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewShoppingCategory("ready")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      newShoppingCategory === "ready"
                        ? "bg-[#7C3AED] text-white border-[#7C3AED] shadow-xs"
                        : "bg-white text-[#475569] border-[#CBD5E1] hover:bg-zinc-50"
                    }`}
                  >
                    <Package className="w-3.5 h-3.5" />
                    <span>Siap Saji / Matang</span>
                  </button>
                </div>
              </div>

              {/* Zona Suhu & Posisi Rak */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    Zona Penyimpanan
                  </label>
                  <select
                    value={newShoppingLocationType}
                    onChange={(e) => {
                      const val = e.target.value as "fridge" | "freezer";
                      setNewShoppingLocationType(val);
                      setNewShoppingLocation(val === "freezer" ? "Freezer Utama" : "Kulkas Utama");
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488] bg-white"
                  >
                    <option value="fridge">Kulkas Chiller (4°C)</option>
                    <option value="freezer">Freezer Beku (-18°C)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    Posisi Rak Kulkas
                  </label>
                  <select
                    value={newShoppingLocation}
                    onChange={(e) => setNewShoppingLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488] bg-white"
                  >
                    {newShoppingLocationType === "fridge" ? (
                      <>
                        <option value="Kulkas Utama">Kulkas Utama</option>
                        <option value="Laci Sayur (Crisper)">Laci Sayur (Crisper)</option>
                        <option value="Rak Telur">Rak Telur</option>
                        <option value="Pintu Kulkas">Pintu Kulkas</option>
                        <option value="Chiller Daging">Chiller Daging</option>
                      </>
                    ) : (
                      <>
                        <option value="Freezer Utama">Freezer Utama</option>
                        <option value="Laci Daging Freezer">Laci Daging Freezer</option>
                        <option value="Kotak Es Batu">Kotak Es Batu</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              {/* Daya Simpan & Estimasi Harga */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    Daya Simpan Simpan
                  </label>
                  <select
                    value={newShoppingExpiryDays}
                    onChange={(e) => setNewShoppingExpiryDays(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488] bg-white"
                  >
                    <option value={2}>2 Hari (Cepat Basi / H-1)</option>
                    <option value={3}>3 Hari (H-3)</option>
                    <option value={7}>7 Hari (1 Minggu)</option>
                    <option value={14}>14 Hari (2 Minggu)</option>
                    <option value={30}>30 Hari (1 Bulan)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#475569] block mb-1">
                    Estimasi Harga (Rp)
                  </label>
                  <input
                    type="number"
                    value={newShoppingPrice}
                    onChange={(e) => setNewShoppingPrice(e.target.value)}
                    placeholder="Misal: 15000"
                    className="w-full px-3.5 py-2 rounded-xl border border-[#CBD5E1] text-sm focus:outline-none focus:border-[#0D9488]"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setIsAddShoppingModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#64748B] hover:bg-[#F1F5F9] transition"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={!newShoppingName.trim()}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#0D9488] hover:bg-[#0f766e] text-white disabled:opacity-50 transition shadow-sm"
                >
                  + Tambah ke Daftar Belanja
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
          <div className="bg-[#F8FAFC] rounded-2xl w-full max-w-md shadow-2xl border border-[#CBD5E1] overflow-hidden animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col">
            {/* Modal Top Header */}
            <div className="bg-white border-b border-[#E2E8F0] px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[#0D9488] rounded-lg flex items-center justify-center shadow-sm">
                  <Apple className="w-4 h-4 text-white" strokeWidth={2.2} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0F172A]">Audit Kulkas</h3>
                  <div className="text-[10px] text-[#64748B]">Sinkronisasi cepat mingguan</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 sm:px-3 py-1 bg-[#ECFDF5] border border-[#A7F3D0] rounded-full text-[10px] sm:text-[11px] font-bold text-[#059669] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#059669]" />
                  <span>60 Detik</span>
                </span>
                <button
                  onClick={() => {
                    setIsAuditOpen(false);
                    setAuditStep(0);
                  }}
                  className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Audit Body */}
            <div className="p-4 sm:p-5 overflow-y-auto">
              {auditStep < Math.min(items.length, 4) ? (
                <>
                  {/* Explainer Banner */}
                  <div className="bg-[#F0FDFA] border border-[#0D9488]/30 rounded-xl p-3 mb-4 text-xs">
                    <div className="font-bold text-[#0D9488] flex items-center gap-1.5 mb-0.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#0D9488]" />
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
                      <div className="w-20 h-20 bg-[#F8FAFC] border border-[#F1F5F9] rounded-full flex items-center justify-center mx-auto mb-3">
                        {renderFoodIcon(items[auditStep], "w-10 h-10")}
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
                              showToast(`"${curr.name}" dipindahkan ke Daftar Belanja`, "delete");
                              setAuditStep((s) => s + 1);
                            }}
                            className="bg-[#FFF1F2] border border-[#FECDD3] hover:bg-[#FFE4E6] text-[#E11D48] text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-[#E11D48]" />
                            <span>Terlanjur Dibuang</span>
                          </button>

                          <button
                            onClick={() => {
                              const curr = items[auditStep];
                              setItems((prev) => prev.filter((it) => it.id !== curr.id));
                              setFinancialSaved((prev) => prev + 15000);
                              showToast(`"${curr.name}" dimasak! Saldo hemat +Rp 15.000`, "cook");
                              setAuditStep((s) => s + 1);
                            }}
                            className="bg-[#ECFDF5] border border-[#A7F3D0] hover:bg-[#D1FAE5] text-[#059669] text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5"
                          >
                            <ChefHat className="w-3.5 h-3.5 text-[#059669]" />
                            <span>Sudah Dimasak!</span>
                          </button>
                        </div>

                        <button
                          onClick={() => setAuditStep((s) => s + 1)}
                          className="w-full bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#64748B] text-xs font-bold py-2 rounded-xl transition-all flex items-center justify-center gap-1.5"
                        >
                          <ArrowRight className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Masih Ada di Kulkas (Lewati)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* UX Rationale Box */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 text-xs">
                    <div className="font-bold text-[#0D9488] mb-1 flex items-center gap-1.5">
                      <Brain className="w-3.5 h-3.5 text-[#0D9488]" />
                      <span>Rationale UX: Mengapa Fitur Ini Mencegah Churn?</span>
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
                  <div className="w-16 h-16 bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] rounded-full flex items-center justify-center mx-auto mb-3">
                    <PartyPopper className="w-8 h-8 text-[#059669]" />
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
                      showToast("Kulkas berhasil diaudit & disinkronkan!", "success");
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
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-[#0F172A] flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#0D9488]" />
                <span>Ubah Bahan Makanan</span>
              </h3>
              <button
                onClick={() => setEditingItem(null)}
                className="w-8 h-8 rounded-lg hover:bg-[#F1F5F9] text-[#64748B] flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setItems((prev) =>
                  prev.map((it) => (it.id === editingItem.id ? editingItem : it))
                );
                showToast(`Perubahan "${editingItem.name}" berhasil disimpan`, "save");
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
                        locationType: isFreezer ? "freezer" : "fridge",
                      });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#CBD5E1] text-xs focus:outline-none focus:border-[#0D9488]"
                  >
                    <option value="Kulkas Sayur">Kulkas Sayur</option>
                    <option value="Kulkas Utama">Kulkas Utama</option>
                    <option value="Chiller">Chiller</option>
                    <option value="Freezer Atas">Freezer Atas</option>
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
                    <option value="cook">Bahan Masak</option>
                    <option value="ready">Siap Saji / Matang</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => {
                    const toDelete = editingItem;
                    setEditingItem(null);
                    setItemToDelete(toDelete);
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

      {/* Alert Modal Konfirmasi Hapus Makanan */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-[#E11D48] mb-4 mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center mb-5">
              <h3 className="text-base font-extrabold text-[#0F172A] mb-1.5">
                Hapus Bahan Makanan?
              </h3>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Apakah Anda benar-benar ingin menghapus{" "}
                <span className="font-bold text-[#0F172A]">
                  &ldquo;{itemToDelete.name}&rdquo;
                </span>{" "}
                ({itemToDelete.qty}) dari inventori dapur? Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {/* Item Preview Card */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3 flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center">
                {renderFoodIcon(itemToDelete, "w-4 h-4")}
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="text-xs font-extrabold text-[#0F172A] truncate">
                  {itemToDelete.name}
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5">
                  <span>{itemToDelete.location}</span>
                  <span>•</span>
                  <span>{itemToDelete.qty}</span>
                  {itemToDelete.price ? (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-[#0D9488]">
                        Rp {itemToDelete.price.toLocaleString("id-ID")}
                      </span>
                    </>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-[#64748B] bg-[#F1F5F9] hover:bg-[#E2E8F0] transition"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const deletedName = itemToDelete.name;
                  const itemPrice = itemToDelete.price || 0;
                  setItems((prev) => {
                    const next = prev.filter((it) => it.id !== itemToDelete.id);
                    if (next.length === 0) {
                      setFinancialSaved(0);
                      setSavedCount(0);
                    } else {
                      setFinancialSaved((prevVal) => Math.max(0, prevVal - itemPrice));
                      setSavedCount((prevVal) => Math.max(0, prevVal - 1));
                    }
                    return next;
                  });
                  showToast(
                    itemPrice > 0
                      ? `"${deletedName}" dihapus. Saldo hemat disesuaikan (-Rp ${itemPrice.toLocaleString("id-ID")})`
                      : `"${deletedName}" berhasil dihapus dari inventori`,
                    "delete"
                  );
                  setItemToDelete(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-[#E11D48] hover:bg-rose-700 shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Ya, Hapus</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
