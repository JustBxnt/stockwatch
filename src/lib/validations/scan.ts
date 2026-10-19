import { z } from "zod";

export const FoodCategoryEnum = z.enum([
  "Kuliner Tradisional & Olahan Matang",
  "Buah & Sayur Segar",
  "Daging, Unggas & Seafood Mentah",
  "Produk Susu, Telur & Olahan",
  "Makanan Kemasan / Pabrikan",
  "Bumbu, Saus & Sambal",
  "Roti, Kue & Camilan",
  "Makanan Beku (Frozen Food)",
  "Makanan Kering & Pokok",
  "Minuman",
  "Lainnya",
]);

export const PriceEstimationSchema = z.object({
  harga_rata_rata: z.number().describe("Estimasi nilai rata-rata harga nasional dalam Rupiah (IDR)"),
  rentang_harga: z.string().describe("Rentang harga di Indonesia (misal: 'Rp 15.000 - Rp 25.000')"),
  analisis_regional: z.string().describe("Perbandingan harga Jabodetabek, Jawa/Bandung, dan Luar Jawa"),
  faktor_penentu_harga: z.string().describe("Komponen topping atau kualitas bahan yang mempengaruhi harga"),
});

export const ShelfLifeDetailSchema = z.object({
  suhu_ruang: z.string(),
  kulkas_chiller: z.string(),
  freezer_beku: z.string().optional(),
  rekomendasi_simpan: z.string(),
  tanda_kerusakan: z.string(),
  tips_penanganan: z.string(),
});

export const DeepFoodAnalysisSchema = z.object({
  nama_kuliner_otentik: z.string(),
  deskripsi_hidangan: z.string(),
  bahan_komposisi_terlihat: z.array(z.string()),
  analisis_mikrobiologi: z.string(),
});

export const ScannedItemSchema = z.object({
  nama_produk: z.string().min(1, "Nama produk wajib diisi").trim(),
  tipe_makanan: z.enum(["mentah_segar", "olahan_matang", "kemasan_pabrik"]).default("olahan_matang"),
  status_segel: z.string().optional(),
  spesifikasi: z.string().optional(),
  kuantitas: z.coerce.number().int().positive().default(1),
  satuan: z.string().default("porsi"),
  estimasi_harga: PriceEstimationSchema,
  detail_kuliner: DeepFoodAnalysisSchema.optional(),
  daya_tahan: ShelfLifeDetailSchema,
  tanggal_kadaluwarsa: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD")
    .nullable()
    .catch(null),
  kategori: FoodCategoryEnum.default("Kuliner Tradisional & Olahan Matang"),
});

export const ScanResponseSchema = z.object({
  success: z.boolean(),
  is_food_related: z.boolean(),
  ringkasan_keamanan_pangan: z.string().optional(),
  thinking_trace: z.string().optional(),
  total_estimasi_nilai_rupiah: z.number().optional().describe("Akumulasi total taksiran harga seluruh item dalam Rupiah"),
  total_item_terdeteksi: z.number().optional(),
  items: z.array(ScannedItemSchema),
});

export type ScannedItem = z.infer<typeof ScannedItemSchema>;
export type ScanResponse = z.infer<typeof ScanResponseSchema>;
export type PriceEstimation = z.infer<typeof PriceEstimationSchema>;
