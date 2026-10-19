# StockWatch OS 🍎
> **Kulkas Pintar & AI Vision Zero-Waste Food Management (Progressive Web App)**

StockWatch adalah aplikasi web modern berbasis PWA (Progressive Web App) yang dirancang untuk membantu pengelolaan inventori bahan makanan dapur, mencegah pembusukan makanan (*zero-waste*), mengontrol pengeluaran finansial belanja secara terencana, serta mengolah bahan kulkas yang mendekati batas simpan menjadi hidangan lezat.

---

## 📱 Fitur Interface & Layar Utama

Aplikasi dilengkapi dengan bilah navigasi terpadu (*bottom navigation*) dengan 5 menu utama:

### 1. 📋 Stok (Dashboard & Inventori Kulkas)
- **Financial Metric Card**: Menampilkan total saldo finansial yang berhasil diselamatkan dari bahan yang tidak terbuang (Rp 285.000+).
- **Dual-Tab Category Filter**: Pemisahan praktis antara *Semua*, *Bahan Masak*, dan *Siap Saji*.
- **Storage Zone Filter**: Filter instan berdasarkan letak penyimpanan (*Semua*, *Kulkas*, *Freezer*).
- **High-Urgency Alert Banner**: Notifikasi bahan kritis yang harus segera diolah (<24 jam).
- **Weekend Fridge Audit (60s)**: Mode audit kilat 60 detik akhir pekan untuk mengecek kondisi kulkas.

### 2. 🍳 Olah (Rekomendasi Resep Zero-Waste)
- **Kombinasi Bahan Kritis**: Mendeteksi otomatis bahan mentah dan lauk matang yang hampir kedaluwarsa (misal: *Kangkung H-1* dan *Ayam Geprek Sisa*).
- **Resep Cepat 10 Menit**:
  - *Nasi Goreng Ayam Suwir Kangkung* (12 Menit, Sangat Mudah).
  - *Tumis Kangkung Terasi & Crispy Chicken* (8 Menit, Wajan Kering).
- **Langkah Kilat Dapur**: Panduan memasak ringkas bernomor tanpa langkah berbelit.
- **Kalkulator Finansial**: Tombol *Masak & Selamatkan Finansial* yang otomatis menambahkan saldo hemat ke akun pengguna.

### 3. ⚡ Quick Add (+) & AI Smart Scan
- **AI Vision Scanner**: Pemindaian foto struk belanjaan atau bahan mentah menggunakan Google Gemini Vision AI (`gemini-2.5-flash`).
- **Structured JSON Output**: Hasil pemindaian langsung tervalidasi menggunakan Zod Schema.
- **Client-Side Image Compression**: Mengompresi ukuran foto kamera sebelum dikirim ke AI untuk kecepatan maksimal (<5 detik) dan hemat kuota.
- **Smart Shelf-Life Estimator**: Prediksi otomatis tanggal kadaluwarsa berdasarkan kategori makanan.

### 4. 🛒 Belanja (Daftar Belanja Anti-Impulsif)
- **Audit-Driven Shopping List**: Otomatis terisi dari bahan makanan yang habis saat audit kulkas.
- **Checklist Interaktif**: Menandai barang yang sudah dibeli dengan efek strikethrough dan otomatis masuk kembali ke stok.
- **Estimasi Total Belanja**: Menampilkan ringkasan budget belanja mingguan (Rp 50.000) berstatus *Terkendali & Terencana*.
- **Tambah Barang Manual**: Popup cepat untuk menambahkan kebutuhan belanjaan ekstra beserta perkiraan harganya.

### 5. ⚙️ Setting (Pengaturan PWA & Local-First Storage)
- **Preferensi Pengingat (Anti-Spam)**:
  - *Web Push Notification*: Pengingat langsung ke HP tanpa perlu download native app.
  - *Pengingat H-3 (Persiapan Dapur)*: Notifikasi hening pukul 17:00 sore.
  - *Pengingat H-1 (Peringatan Kritis)*: Prioritas tinggi pukul 09:00 pagi.
  - *Anti-Spam Digest*: Maksimal 1 notifikasi rangkuman harian agar tidak mengganggu pengguna.
- **Local-First Offline Storage**:
  - Data tersimpan aman di peramban lokal (IndexedDB / LocalStorage) sehingga tetap dapat digunakan di dapur meski tanpa sinyal internet.
  - Tombol **💾 Ekspor Data (JSON)** untuk backup data inventori.
  - Tombol **🔄 Impor Cadangan** untuk pemulihan data.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Library Frontend**: [React 18](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/)
- **AI Vision Engine**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (`gemini-2.5-flash`)
- **Validasi Data**: [Zod](https://zod.dev/)
- **Kompresi Gambar**: [browser-image-compression](https://www.npmjs.com/package/browser-image-compression)
- **Database / Backend**: [Supabase](https://supabase.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Kloning Repositori
```bash
git clone https://github.com/JustBxnt/stockwatch.git
cd stockwatch
```

### 2. Pasang Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variable
Salin file `.env.local.example` menjadi `.env.local`:
```bash
cp .env.local.example .env.local
```
Isi konfigurasi pada file `.env.local`:
```env
# Google AI Studio API Key (Gemini)
GEMINI_API_KEY="your-gemini-api-key-here"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
```

### 4. Menjalankan Server Development
```bash
npm run dev
```
Buka peramban pada tautan [http://localhost:3000](http://localhost:3000).

### 5. Menjalankan Lewat Batch Script (Windows)
Cukup klik dua kali pada file `run.bat` untuk otomatis melakukan build dan membuka browser.

---

## 📁 Struktur Direktori

```
stockwatch/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── scan/
│   │   │       └── route.ts          # Route Handler Gemini AI Vision Structured Output
│   │   ├── globals.css               # Gaya global & Tailwind directives
│   │   ├── layout.tsx                # Layout root & font styling
│   │   └── page.tsx                  # Controller utama 5 View (Stok, Olah, Add, Belanja, Setting)
│   ├── components/
│   │   ├── SmartScanModal.tsx        # Modal AI Camera Scanner & Preview
│   │   ├── RecipeModal.tsx           # Modal eksplorasi resep
│   │   ├── ManualAddModal.tsx        # Modal input inventori manual
│   │   └── SettingsModal.tsx         # Modal pengaturan preferensi
│   └── lib/
│       ├── validations/
│       │   └── scan.ts               # Skema Zod & tipe data inventori
│       ├── compressImage.ts          # Kompresi gambar client-side
│       ├── shelfLifeEstimator.ts     # Penaksir otomatis masa kedaluwarsa
│       └── supabase.ts               # Klien koneksi Supabase
├── public/                           # Aset statis & manifest
├── .env.local.example                # Templat environment variable
├── run.bat                           # Script launcher instan Windows
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📄 Lisensi
Didistribusikan di bawah lisensi MIT. Silakan digunakan dan dikembangkan untuk keperluan edukasi maupun manajemen dapur pintar.
