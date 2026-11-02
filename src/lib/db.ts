import { supabase, isSupabaseConfigured } from "./supabase";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  isDemo?: boolean;
}

export interface InventoryItemDB {
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
  actionIcon: "search" | "plate" | "edit";
  price?: number;
}

export interface ShoppingItemDB {
  id: number;
  name: string;
  subtitle: string;
  subtitleColor: string;
  price: number;
  priceDisplay: string;
  checked: boolean;
  qty?: string;
  category?: "cook" | "ready";
  locationType?: "fridge" | "freezer";
  location?: string;
  expiryDays?: number;
}

export interface UserAppData {
  items: InventoryItemDB[];
  shoppingItems: ShoppingItemDB[];
  financialSaved: number;
  savedCount: number;
}

const LOCAL_STORAGE_USERS_KEY = "stockwatch_mock_users";
const LOCAL_STORAGE_SESSION_KEY = "stockwatch_active_user";
const LOCAL_STORAGE_DATA_PREFIX = "stockwatch_user_data_";

// =========================================================================
// AUTHENTICATION
// =========================================================================

export async function getCurrentUser(): Promise<UserProfile | null> {
  // 1. Coba baca dari Supabase Auth terlebih dahulu
  if (isSupabaseConfigured()) {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!error && session?.user) {
        const user = session.user;
        const profile: UserProfile = {
          id: user.id,
          email: user.email || "",
          fullName: user.user_metadata?.full_name || user.email?.split("@")[0] || "Pengguna",
          isDemo: false,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(profile));
        }
        return profile;
      }
    } catch (e) {
      console.warn("Gagal mengecek sesi Supabase, beralih ke cache lokal:", e);
    }
  }

  // 2. Selalu gunakan cache sesi lokal agar pengguna tidak ter-logout saat refresh browser
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {}
  }
  return null;
}

export async function signUpUser(
  email: string,
  pass: string,
  fullName: string
): Promise<{ user: UserProfile | null; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: pass,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          fullName: fullName.trim() || cleanEmail.split("@")[0],
          isDemo: false,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(profile));
          localStorage.removeItem("stockwatch_inventory_items");
          localStorage.removeItem("stockwatch_financial_saved");
          localStorage.removeItem("stockwatch_saved_count");
          localStorage.removeItem("stockwatch_shopping_items");
        }
        await saveUserData(profile.id, {
          items: [],
          shoppingItems: [],
          financialSaved: 0,
          savedCount: 0,
        });
        return { user: profile };
      }
    } catch (e: any) {
      return { user: null, error: e.message || "Gagal mendaftar ke server" };
    }
  }

  // Local simulated signup fallback
  try {
    const rawUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    const users: Array<UserProfile & { password?: string }> = rawUsers ? JSON.parse(rawUsers) : [];

    const existing = users.find((u) => u.email === cleanEmail);
    if (existing) {
      return { user: null, error: "Email sudah terdaftar. Silakan masuk!" };
    }

    const newUser: UserProfile & { password?: string } = {
      id: "usr_" + Date.now() + "_" + Math.random().toString(36).substr(2, 6),
      email: cleanEmail,
      fullName: fullName.trim() || cleanEmail.split("@")[0],
      password: pass,
      isDemo: false,
    };

    users.push(newUser);
    localStorage.setItem(LOCAL_STORAGE_USERS_KEY, JSON.stringify(users));

    const userProfile: UserProfile = {
      id: newUser.id,
      email: newUser.email,
      fullName: newUser.fullName,
      isDemo: false,
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userProfile));

    return { user: userProfile };
  } catch (err: any) {
    return { user: null, error: "Gagal menyimpan akun baru di memori lokal" };
  }
}

export async function signInUser(
  email: string,
  pass: string
): Promise<{ user: UserProfile | null; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: pass,
      });

      if (error) {
        return { user: null, error: error.message };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || cleanEmail,
          fullName:
            data.user.user_metadata?.full_name ||
            data.user.email?.split("@")[0] ||
            "Pengguna",
          isDemo: false,
        };
        if (typeof window !== "undefined") {
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(profile));
        }
        return { user: profile };
      }
    } catch (e: any) {
      return { user: null, error: e.message || "Gagal masuk ke server" };
    }
  }

  // Local simulated signin fallback
  try {
    const rawUsers = localStorage.getItem(LOCAL_STORAGE_USERS_KEY);
    const users: Array<UserProfile & { password?: string }> = rawUsers ? JSON.parse(rawUsers) : [];

    const found = users.find((u) => u.email === cleanEmail && u.password === pass);
    if (!found) {
      // Izinkan akun demo default jika belum ada user
      if (cleanEmail === "demo@stockwatch.id" && pass === "demo123") {
        const demoUser: UserProfile = {
          id: "usr_demo_123",
          email: "demo@stockwatch.id",
          fullName: "Demo Chef",
          isDemo: true,
        };
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(demoUser));
        return { user: demoUser };
      }
      return { user: null, error: "Email atau kata sandi tidak cocok." };
    }

    const userProfile: UserProfile = {
      id: found.id,
      email: found.email,
      fullName: found.fullName,
      isDemo: false,
    };
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userProfile));
    return { user: userProfile };
  } catch (err: any) {
    return { user: null, error: "Terjadi kesalahan saat memproses data akun" };
  }
}

export async function signInDemoUser(): Promise<UserProfile> {
  const demoUser: UserProfile = {
    id: "usr_demo_vip",
    email: "demo@stockwatch.id",
    fullName: "Dapur Demo (PWA)",
    isDemo: true,
  };
  if (typeof window !== "undefined") {
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(demoUser));
  }
  return demoUser;
}

export async function signOutUser(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch {}
  }
  if (typeof window !== "undefined") {
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
  }
}

// =========================================================================
// DATABASE SYNC & PERSISTENCE
// =========================================================================

function isDemoFoodItem(id: number, _name?: string): boolean {
  // Hanya filter ID bawaan demo dummy (1 s/d 10). Makanan buatan user memiliki ID timestamp Date.now()
  return id > 0 && id <= 10;
}

function isDemoShopItem(id: number, _name?: string): boolean {
  // Hanya filter ID bawaan demo dummy (1 s/d 10)
  return id > 0 && id <= 10;
}

export async function loadUserData(userId: string): Promise<UserAppData | null> {
  const isDemoAccount = userId === "usr_demo_vip";

  if (isSupabaseConfigured()) {
    try {
      const [invRes, shopRes, metricRes] = await Promise.all([
        supabase.from("inventory_items").select("*").eq("user_id", userId),
        supabase.from("shopping_items").select("*").eq("user_id", userId),
        supabase.from("user_metrics").select("*").eq("user_id", userId).maybeSingle(),
      ]);

      // Query database Supabase berhasil (error null)
      if (!invRes.error) {
        let items: InventoryItemDB[] = (invRes.data || []).map((row: any) => ({
          id: Number(row.id),
          name: row.name,
          qty: row.qty,
          expiryText: row.expiry_text || "5 Hari Lagi",
          expiryColor: row.expiry_color || "text-[#059669]",
          borderColor: row.border_color || "border-l-[#059669]",
          location: row.location || "Kulkas Utama",
          category: row.category || "cook",
          locationType: row.location_type || "fridge",
          actionIcon: row.action_icon || "edit",
          price: Number(row.price) || 0,
        }));

        let shoppingItems: ShoppingItemDB[] = (shopRes.data || []).map((row: any) => ({
          id: Number(row.id),
          name: row.name,
          subtitle: row.subtitle || "",
          subtitleColor: row.subtitle_color || "text-[#64748B]",
          price: Number(row.price) || 0,
          priceDisplay: row.price_display || `~Rp ${Number(row.price || 0).toLocaleString("id-ID")}`,
          checked: Boolean(row.checked),
          category: row.category,
          locationType: row.location_type,
          location: row.location,
          expiryDays: row.expiry_days,
        }));

        let financialSaved = Number(metricRes.data?.financial_saved) || 0;
        let savedCount = Number(metricRes.data?.saved_count) || 0;

        // Auto recovery: Jika database Supabase kosong, pulihkan dari cache localStorage pengguna
        if (items.length === 0 && typeof window !== "undefined") {
          try {
            const cached = localStorage.getItem(`${LOCAL_STORAGE_DATA_PREFIX}${userId}`);
            if (cached) {
              const parsedCached: UserAppData = JSON.parse(cached);
              if (parsedCached && Array.isArray(parsedCached.items) && parsedCached.items.length > 0) {
                items = parsedCached.items.map((i, idx) => ({
                  ...i,
                  id: Math.floor(Number(i.id)) || Math.floor(Date.now() + idx),
                }));
                if (Array.isArray(parsedCached.shoppingItems) && shoppingItems.length === 0) {
                  shoppingItems = parsedCached.shoppingItems;
                }
                // Sinkronkan kembali data yang terselamatkan ke Supabase
                saveUserData(userId, { items, shoppingItems, financialSaved, savedCount });
              }
            }
          } catch {}
        }

        // Jika bukan akun demo resmi, bersihkan semua residu demo bawaan agar akun pengguna selalu bersih murni
        if (!isDemoAccount) {
          const hadDemoItems = items.some((i) => isDemoFoodItem(i.id, i.name));
          const hadDemoShopping = shoppingItems.some((s) => isDemoShopItem(s.id, s.name));
          
          if (hadDemoItems) {
            items = items.filter((i) => !isDemoFoodItem(i.id, i.name));
          }
          if (hadDemoShopping) {
            shoppingItems = shoppingItems.filter((s) => !isDemoShopItem(s.id, s.name));
          }
          if (hadDemoItems && items.length === 0) {
            financialSaved = 0;
            savedCount = 0;
          }

          // Jika ada data demo yang dibersihkan, sinkronkan pembersihan ini ke database Supabase
          if (hadDemoItems || hadDemoShopping) {
            saveUserData(userId, { items, shoppingItems, financialSaved, savedCount });
          }
        }

        const result: UserAppData = { items, shoppingItems, financialSaved, savedCount };

        // Perbarui cache per user di browser
        if (typeof window !== "undefined") {
          localStorage.setItem(`${LOCAL_STORAGE_DATA_PREFIX}${userId}`, JSON.stringify(result));
        }

        return result;
      }
    } catch (e) {
      console.warn("Gagal memuat data dari Supabase, beralih ke cache lokal:", e);
    }
  }

  // Fallback to local storage per user
  if (typeof window !== "undefined") {
    try {
      const saved = localStorage.getItem(`${LOCAL_STORAGE_DATA_PREFIX}${userId}`);
      if (saved !== null) {
        const parsed: UserAppData = JSON.parse(saved);
        if (!isDemoAccount) {
          const hadDemoItems = (parsed.items || []).some((i) => isDemoFoodItem(i.id, i.name));
          parsed.items = (parsed.items || []).filter((i) => !isDemoFoodItem(i.id, i.name));
          parsed.shoppingItems = (parsed.shoppingItems || []).filter((s) => !isDemoShopItem(s.id, s.name));
          if (hadDemoItems && parsed.items.length === 0) {
            parsed.financialSaved = 0;
            parsed.savedCount = 0;
          }
        }
        return parsed;
      }
    } catch {}
  }

  // Akun baru: kembalikan data bersih murni (0 inventori, 0 belanjaan, Rp 0)
  return { items: [], shoppingItems: [], financialSaved: 0, savedCount: 0 };
}

export async function saveUserData(
  userId: string,
  data: UserAppData
): Promise<{ success: boolean; error?: string }> {
  // Always update local cache first for instant UI response & offline safety
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(
        `${LOCAL_STORAGE_DATA_PREFIX}${userId}`,
        JSON.stringify(data)
      );
    } catch {}
  }

  if (isSupabaseConfigured()) {
    try {
      // 1. Upsert Inventory Items
      if (data.items.length > 0) {
        const rows = data.items.map((i, idx) => ({
          id: Math.floor(Number(i.id)) || Math.floor(Date.now() + idx),
          user_id: userId,
          name: i.name,
          qty: i.qty,
          expiry_text: i.expiryText,
          expiry_color: i.expiryColor,
          border_color: i.borderColor,
          location: i.location,
          category: i.category,
          location_type: i.locationType,
          action_icon: i.actionIcon,
          price: i.price || 0,
        }));
        await supabase.from("inventory_items").delete().eq("user_id", userId);
        const { error: insErr } = await supabase.from("inventory_items").insert(rows);
        if (insErr) {
          console.error("Gagal simpan inventori ke Supabase:", insErr);
        }
      } else {
        await supabase.from("inventory_items").delete().eq("user_id", userId);
      }

      // 2. Upsert Shopping Items
      if (data.shoppingItems.length > 0) {
        const shopRows = data.shoppingItems.map((s, idx) => ({
          id: Math.floor(Number(s.id)) || Math.floor(Date.now() + idx),
          user_id: userId,
          name: s.name,
          subtitle: s.subtitle,
          subtitle_color: s.subtitleColor,
          price: s.price,
          price_display: s.priceDisplay,
          checked: s.checked,
          category: s.category || "cook",
          location_type: s.locationType || "fridge",
          location: s.location || "Kulkas Utama",
          expiry_days: s.expiryDays || 7,
        }));
        await supabase.from("shopping_items").delete().eq("user_id", userId);
        const { error: shopErr } = await supabase.from("shopping_items").insert(shopRows);
        if (shopErr) {
          console.error("Gagal simpan belanjaan ke Supabase:", shopErr);
        }
      } else {
        await supabase.from("shopping_items").delete().eq("user_id", userId);
      }

      // 3. Upsert User Metrics
      await supabase.from("user_metrics").upsert({
        user_id: userId,
        financial_saved: data.financialSaved,
        saved_count: data.savedCount,
        updated_at: new Date().toISOString(),
      });

      return { success: true };
    } catch (e: any) {
      console.warn("Gagal sinkronisasi data ke Supabase:", e);
      return { success: false, error: e.message };
    }
  }

  return { success: true };
}

