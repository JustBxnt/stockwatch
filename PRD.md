# PRODUCT REQUIREMENT DOCUMENT (PRD)
## StockWatch OS: Kulkas Pintar & AI Vision Zero-Waste Food Management (PWA)

---

### 1. INFORMASI DOKUMEN & PRODUK
- **Nama Produk**: StockWatch OS
- **Versi**: 1.0.0 (Production Ready)
- **Tipe Aplikasi**: Progressive Web App (PWA) - Mobile-First & Desktop Responsive
- **Teknologi Utama**: Next.js 16 (App Router), React 18, TypeScript, Tailwind CSS 3.4, Google Gemini Vision AI (`gemini-2.5-flash`), Zod Validation, Supabase.
- **Repository**: [https://github.com/JustBxnt/stockwatch](https://github.com/JustBxnt/stockwatch)

---

### 2. EXECUTIVE SUMMARY & LATAR BELAKANG

#### 2.1 Problem Statement
- **Food Waste Rumah Tangga**: Di Indonesia dan lingkungan perkotaan, jutaan ton bahan pangan terbuang setiap tahun karena terlupakan di dalam kulkas hingga busuk atau melewati tanggal kedaluwarsa.
- **Belanja Impulsif & Boros**: Ketiadaan daftar kebutuhan yang terorganisir menyebabkan pembelian bahan ganda di supermarket/pasar tradisional.
- **Data Fatigue & Churn Pengguna**: Aplikasi pencatat dapur konvensional ditinggalkan pengguna karena proses input manual yang lambat dan data kulkas cepat menjadi usang (*stale*).
- **Kebingungan Mengolah Sisa Dapur**: Pengguna sering kesulitan memadukan bahan mentah yang hampir layu dengan lauk matang sisa semalam menjadi hidangan baru yang layak makan.

#### 2.2 Solusi: StockWatch OS
StockWatch OS hadir sebagai asisten cerdas dapur berbasis PWA dengan pendekatan:
1. **Quick Add (<5 Detik)** dengan bantuan kamera AI Vision (Gemini 2.5 Flash) untuk mengenali bahan secara instan.
2. **Audit Kulkas Kilat 60 Detik (Weekend Fridge Audit)** tiap akhir pekan agar inventori selalu sinkron tanpa rasa bersalah (*zero-guilt*).
3. **Mesin Rekomendasi Resep Zero-Waste Kilat (10 Menit)** yang memadukan bahan mentah kritis dan lauk sisa.
4. **Daftar Belanja Anti-Impulsif Terintegrasi** yang otomatis terisi dari bahan yang habis/dibuang saat audit.
5. **Kalkulator Penghematan Finansial Riil** yang memperlihatkan nilai rupiah bahan makanan yang berhasil diselamatkan dari tempat sampah.

---

### 3. USER PERSONA & TARGET AUDIENCE

| Atribut | Persona 1: "Keluarga & Homemaker Cermat" | Persona 2: "Anak Kos / Pekerja Urban Sibuk" |
|---|---|---|
| **Nama Representatif** | Ibu Rina (34 tahun) | Dimas (24 tahun) |
| **Karakteristik** | Mengelola belanja mingguan keluarga, memasak rutin | Sering memesan makanan online, belanja bahan tapi lupa masak |
| **Pain Points** | Sayur di crisper sering busuk sebelum dimasak, pengeluaran belanja membengkak | Sering buang lauk sisa kemarin dan bahan instan yang kedaluwarsa |
| **Tujuan** | Hemat anggaran belanja bulanan, kulkas tertata rapi | Rekomendasi masak kilat <15 menit dari sisa kulkas |
| **Fitur Favorit** | Weekend Fridge Audit 60s & Daftar Belanja Otomatis | Olah Resep Zero-Waste & Quick Add AI Camera |

---

### 4. ARSITEKTUR INFORMASI & STRUKTUR NAVIGASI

Aplikasi menggunakan pola navigasi **Fixed Bottom Navigation Bar** dengan 5 menu utama:

```
StockWatch OS
├── [1] Tab Stok (Dashboard Kulkas & Urgensi)
│   ├── Financial Metric Banner (Hemat Finansial Rp 285.000+)
│   ├── Weekend Fridge Audit Banner (Pemicu Modal 60 Detik)
│   ├── Target Filter (Semua, Bahan Masak, Siap Saji)
│   ├── Storage Filter (Semua, Kulkas, Freezer)
│   ├── High-Urgency Food Alert (<24 Jam / H-1)
│   └── Kartu Inventori Dapur (dengan Tombol Aksi & Modal Edit)
├── [2] Tab Olah (Mesin Rekomendasi Resep Zero-Waste)
│   ├── Alert Bahan Kritis Hari Ini (Kombinasi Bahan Mentah + Lauk Sisa)
│   ├── Kartu Resep Kilat (Langkah Praktis, Bahan Lengkap, Estimasi Waktu)
│   └── Tombol "Masak & Selamatkan Finansial" (Akumulasi Saldo Hemat)
├── [3] Tab Quick Add (+) (AI Vision & Manual Add)
│   ├── AI Camera Viewfinder & Foto Unggah
│   ├── JSON Metadata Card (Nama, ROI Harga Pasar, Kedaluwarsa, Lokasi)
│   ├── Interactive Quantity Selector (- / +)
│   └── Tombol Simpan Otomatis ke Kulkas
├── [4] Tab Belanja (Daftar Belanja Anti-Impulsif)
│   ├── Daftar Kebutuhan (Sinkron dari Audit Bahan Habis)
│   ├── Interaksi Centang / Strikethrough (Auto-Masuk Kulkas)
│   ├── Estimasi Total Pengeluaran Terkendali
│   └── Modal Tambah Belanja Manual
└── [5] Tab Setting (Pengaturan PWA & Local-First Storage)
    ├── Pengaturan Web Push Notifications (H-3 sore, H-1 pagi)
    ├── Anti-Spam Daily Digest Toggle
    └── Local-First Backup (Ekspor JSON & Impor Cadangan)
```

---

### 5. SPESIFIKASI FITUR DETAIL (FUNCTIONAL REQUIREMENTS)

#### FR-01: Modul Stok & Metrik Finansial
- **FR-01.1 Dynamic Urgency Detection**: Sistem otomatis menandai bahan makanan dengan level urgensi:
  - Merah (`border-l-[#E11D48]`): Batas simpan <24 jam (H-1).
  - Amber (`border-l-[#D97706]`): Batas simpan 2-3 hari (H-3).
  - Hijau (`border-l-[#059669]`): Aman (>4 hari).
- **FR-01.2 Financial ROI Accumulator**: Setiap kali pengguna memasak menu atau menyelesaikan audit, saldo rupiah bahan yang diselamatkan bertambah ke *Hero Financial Card*.
- **FR-01.3 Dual-Filter System**: Filter kategori (*Bahan Masak / Siap Saji*) dan filter rak kulkas (*Semua / Kulkas Chiller / Freezer*).
- **FR-01.4 Edit Item Modal**: Memungkinkan pengeditan nama bahan, kuantitas, zona rak, atau menghapus item dari stok.

#### FR-02: Modul Olah Resep Zero-Waste
- **FR-02.1 Smart Pairing Logic**: Menggabungkan bahan mentah yang hampir layu dengan lauk matang yang belum habis.
- **FR-02.2 10-Minute Recipe Cards**: Resep instan dilengkapi durasi waktu, tingkat kesulitan, status kelengkapan bahan (*"Bahan Lengkap!"*), dan panduan langkah kilat wajan.
- **FR-02.3 Auto Inventory Depletion**: Tombol *"Masak Menu Ini"* otomatis menghapus bahan-bahan yang digunakan dari daftar stok kulkas dan memicu toast konfirmasi penghematan finansial.

#### FR-03: Modul Quick Add & AI Camera
- **FR-03.1 Visual Capture**: Antarmuka kamera dengan panduan bingkai bidik hijau untuk pemindaian bahan atau struk belanjaan.
- **FR-03.2 Reactive Quantity Control**: Kontrol `-` dan `+` yang secara real-time mengalikan estimasi harga pasar lokal (ROI) dan menyesuaikan porsi saat disimpan.
- **FR-03.3 Instant Fridge Placement**: Mengklik konfirmasi langsung menambahkan item ke inventori dan mengembalikan layar ke dashboard stok.

#### FR-04: Modul Daftar Belanja Anti-Impulsif
- **FR-04.1 Closed-Loop Shopping**: Bahan yang ditandai terbuang/habis saat audit akhir pekan otomatis masuk ke daftar belanja dengan label prioritas belanja.
- **FR-04.2 Auto-Restock on Purchase**: Ketika checkbox belanja dicentang (*"Dibeli"*), sistem langsung membuat bahan baru di stok kulkas dengan estimasi kedaluwarsa standar.
- **FR-04.3 Budget Summary**: Kalkulasi total estimasi pengeluaran mingguan untuk mencegah belanja impulsif di supermarket.

#### FR-05: Modul Pengaturan PWA & Local-First Storage
- **FR-05.1 Push Notification Preferences**: Pengaturan granular untuk Web Push, Pengingat sore H-3, Pengingat pagi H-1, dan Rangkuman Harian Anti-Spam.
- **FR-05.2 Data Portability**: Kemampuan ekspor inventori lengkap dalam format JSON terenkripsi peramban dan pemulihan cadangan via file picker.

#### FR-06: Weekend Fridge Audit Modal (60 Detik)
- **FR-06.1 Quick Carousel/Step Assessment**: Menyajikan item kulkas satu per satu untuk dinilai statusnya dalam 3 opsi:
  - *Terlanjur Dibuang*: Menghapus dari kulkas dan memindahkannya ke daftar belanja.
  - *Sudah Dimasak*: Menghapus dari kulkas dan menambah saldo hemat finansial (+Rp 15.000).
  - *Masih Ada*: Mempertahankan bahan di kulkas dan melanjutkan ke bahan berikutnya.
- **FR-06.2 Completion Screen**: Menampilkan skor sinkronisasi kulkas 100% dan ringkasan bahan terorganisir.

---

### 6. DATA MODEL & SCHEMA (TYPESCRIPT)

```typescript
export interface InventoryItem {
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

export interface ShoppingItem {
  id: number;
  name: string;
  subtitle: string;
  subtitleColor: string;
  price: number;
  priceDisplay: string;
  checked: boolean;
  statusNote?: string;
}

export interface RecipeRecommendation {
  id: string;
  title: string;
  durationMinutes: number;
  difficulty: "Sangat Mudah" | "Mudah" | "Sedang";
  savingValue: number;
  requiredIngredients: string[];
  steps: string[];
  isComplete: boolean;
}
```

---

### 7. NON-FUNCTIONAL REQUIREMENTS (NFR)

1. **Responsiveness & Cross-Device**: Antarmuka bekerja mulus dari layar ponsel (360px - 430px) hingga tablet dan desktop widescreen (1920px+).
2. **Offline-First Resilience**: Data aplikasi tersimpan di local-first storage peramban sehingga tetap bisa dibuka di area dapur tanpa sinyal internet.
3. **Kecepatan & Performa**: Waktu muat awal PWA < 1.5 detik dengan optimasi Turbopack Next.js 16.
4. **Security & Privacy**: Kunci API AI dan kredensial database tidak diekspos di client-side bundle. Menggunakan Server Route Handlers Next.js untuk pemrosesan AI Vision.

---

### 8. ACCEPTANCE CRITERIA

| No | Modul / Skenario | Kriteria Keberhasilan | Status |
|---|---|---|---|
| 1 | Weekend Fridge Audit | Modal dapat dibuka, item dapat dinilai satu per satu, dan saldo hemat/daftar belanja tersinkronisasi otomatis | PASS (Verified) |
| 2 | Manajemen Stok | Klik icon pensil memunculkan modal edit, perubahan nama/qty/lokasi langsung tersimpan di UI | PASS (Verified) |
| 3 | Quick Add Quantity | Tombol `-` dan `+` mengubah angka kuantitas dan harga ROI secara real-time, serta tersimpan ke stok | PASS (Verified) |
| 4 | Olah Resep | Mengklik masak menu resep memotong bahan terpakai dan menambah saldo hemat finansial di dashboard | PASS (Verified) |
| 5 | Daftar Belanja | Mencentang item belanja memindahkan bahan ke kulkas dan memperbarui status belanja | PASS (Verified) |
| 6 | Pengaturan PWA | Switch toggle notifikasi responsif dan tombol ekspor/impor JSON berjalan lancar | PASS (Verified) |
