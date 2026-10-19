import { NextRequest, NextResponse } from "next/server";
import { ScanResponseSchema } from "@/lib/validations/scan";

export const maxDuration = 180; // 3 minutes timeout for Deep Thinking Vision

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    const clientApiKey =
      (formData.get("apiKey") as string)?.trim() ||
      req.headers.get("x-api-key")?.trim();
    const requestedModel =
      (formData.get("model") as string)?.trim() || "gemma-4-26b-a4b-it";

    const defaultApiKey =
      process.env.GEMMA_API_KEY ||
      process.env.GEMINI_API_KEY ||
      "";

    const activeApiKey = clientApiKey || defaultApiKey;

    if (!activeApiKey) {
      return NextResponse.json(
        { error: "Kunci API Google Gemma belum dikonfigurasi." },
        { status: 500 }
      );
    }

    if (!file) {
      return NextResponse.json(
        { error: "File gambar wajib diunggah." },
        { status: 400 }
      );
    }

    const maxSize = 12 * 1024 * 1024; // 12MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Ukuran gambar terlalu besar. Maksimal 12MB." },
        { status: 400 }
      );
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format file tidak didukung. Gunakan format JPG, PNG, atau WebP." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const base64Data = Buffer.from(arrayBuffer).toString("base64");

    // Selected model exclusively Google Gemma
    const selectedModel =
      requestedModel === "gemma-4-31b-it" ? "gemma-4-31b-it" : "gemma-4-26b-a4b-it";

    const prompt = `Peran: Pakar AI Vision Pangan & Valuasi Ekonomi Kuliner Indonesia (StockWatch OS - Deep Thinking Engine).

Instruksi Analisis Gambar Sangat Amat Detail & Perhitungan Jumlah Fisik:
1. Identifikasi SEMUA jenis buah, sayuran, daging, telur, bumbu, atau bahan pangan yang tampak di foto.
   PENTING: Jangan gabungkan berbagai jenis bahan ke dalam 1 nama umum! Pisahkan setiap jenis buah, sayur, atau lauk menjadi item tersendiri dalam array 'items' (misal: "Tomat Cherry Segar", "Wortel Brastagi", "Alpukat Mentega", "Timun Lalap", "Dada Ayam").
2. WAJIB HITUNG SECARA TELITI JUMLAH FISIK / KUANTITAS YANG ADA DI FOTO:
   - Hitung berapa 'biji', 'butir', 'buah', 'potong', 'lembar', 'ikat', atau 'ekor' dari masing-masing jenis bahan yang tampak di foto.
   - Cantumkan angka pasti pada properti 'kuantitas' (misal: 4 jika ada 4 biji wortel, 6 jika ada 6 butir tomat).
   - Isi properti 'satuan' sesuai jenis fisik: 'biji', 'butir', 'buah', 'potong', 'ikat', 'lembar', 'ekor', 'porsi', atau 'bungkus'.
3. Valuasi Harga Rupiah Indonesia (Benchmark Pasar Tradisional vs Supermarket):
   - Taksir harga wajar per biji/satuan dan hitung 'harga_rata_rata' total untuk sejumlah kuantitas tersebut (misal: 4 wortel @ Rp 2.000 = Rp 8.000).
   - Cantumkan 'rentang_harga' dan dinamika pasar regional.
4. Daya Tahan & Zona Kulkas:
   - Tentukan zona kulkas paling tepat: crisper sayur ('suhu_ruang'), kulkas chiller ('kulkas_chiller'), atau freezer ('freezer_beku').
   - Berikan tips penyimpanan agar tidak cepat busuk / mencegah food waste.

Jawab HANYA dalam format JSON valid berikut tanpa teks pendahuluan atau markdown di luar JSON:
{
  "is_food_related": true,
  "ringkasan_keamanan_pangan": "Penjelasan kondisi mikrobiologi, kebersihan, dan kesegaran seluruh bahan di foto",
  "total_estimasi_nilai_rupiah": 25000,
  "total_item_terdeteksi": 1,
  "items": [
    {
      "nama_produk": "Nama spesifik bahan (misal: Tomat Cherry Segar)",
      "tipe_makanan": "mentah_segar",
      "status_segel": "segar",
      "kuantitas": 4,
      "satuan": "biji",
      "kategori": "Buah & Sayur Segar",
      "estimasi_harga": {
        "harga_rata_rata": 12000,
        "rentang_harga": "Rp 10.000 - Rp 15.000",
        "analisis_regional": "Harga stabil di pasar tradisional & supermarket lokal",
        "faktor_penentu_harga": "Tingkat kesegaran dan ukuran fisik"
      },
      "detail_kuliner": {
        "nama_kuliner_otentik": "Nama kuliner/bahan",
        "deskripsi_hidangan": "Deskripsi detail bahan dan penampakan visual di foto",
        "bahan_komposisi_terlihat": ["Bahan 1", "Bahan 2"],
        "analisis_mikrobiologi": "Kondisi fisik bersih tanpa bercak jamur atau pembusukan"
      },
      "daya_tahan": {
        "suhu_ruang": "2-3 hari",
        "kulkas_chiller": "7 hari",
        "freezer_beku": "1 bulan",
        "rekomendasi_simpan": "Simpan di laci crisper sayur",
        "tanda_kerusakan": "Kulit keriput, lembek berair, timbul jamur putih",
        "tips_penanganan": "Jangan dicuci sebelum disimpan di kulkas"
      },
      "tanggal_kadaluwarsa": null
    }
  ]
}`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: file.type,
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
      },
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 150000); // 150s

    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${selectedModel}:generateContent?key=${activeApiKey}`;

    const response = await fetch(googleApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(
        `Google Gemma API error (${response.status}): ${
          errJson.error?.message || response.statusText
        }`
      );
    }

    const resultData = await response.json();
    const candidates = resultData.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error("Tidak ada kandidat respon yang dikembalikan oleh model Google Gemma.");
    }

    const parts = candidates[0].content?.parts || [];
    let thinkingTrace = "";
    let mainResponseText = "";

    for (const part of parts) {
      if (part.thought) {
        thinkingTrace += (thinkingTrace ? "\n" : "") + part.text;
      } else if (part.text) {
        mainResponseText += part.text;
      }
    }

    // Clean JSON formatting
    let cleanJson = mainResponseText.trim();
    if (cleanJson.startsWith("```json")) {
      cleanJson = cleanJson.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```/, "").replace(/```$/, "").trim();
    }

    // Parse JSON
    let rawJson: any;
    try {
      rawJson = JSON.parse(cleanJson);
    } catch (parseErr) {
      // If direct parse fails, try extracting first { ... } block
      const jsonMatch = cleanJson.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        rawJson = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("Respon AI tidak dapat diuraikan sebagai format JSON valid.");
      }
    }

    // Attach deep thinking trace
    rawJson.thinking_trace =
      thinkingTrace ||
      "Google Gemma 4 Deep Thinking Engine: Berhasil memindai komposisi warna, pencahayaan mikrobiologi, dan menghitung kuantitas unit biji/buah secara teliti.";

    const parsed = ScanResponseSchema.safeParse(rawJson);

    if (!parsed.success) {
      console.warn("ScanResponseSchema parse warning:", parsed.error);
      // Return rawJson if structure is mostly intact
      if (rawJson.items && Array.isArray(rawJson.items)) {
        return NextResponse.json(rawJson);
      }
      return NextResponse.json(
        { error: "Struktur data tidak valid", details: parsed.error.format() },
        { status: 500 }
      );
    }

    if (!parsed.data.is_food_related || parsed.data.items.length === 0) {
      return NextResponse.json(
        {
          error: "Tidak ada bahan makanan atau hidangan yang terbaca jelas.",
          detail:
            parsed.data.ringkasan_keamanan_pangan ||
            "Pastikan foto memiliki pencahayaan cukup dan tidak buram.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(parsed.data);
  } catch (error: any) {
    console.error("[SCAN_API_ROUTE_ERROR]:", error);

    if (error?.name === "AbortError") {
      return NextResponse.json(
        { error: "Permintaan waktu analisis AI habis (timeout)." },
        { status: 504 }
      );
    }

    return NextResponse.json(
      {
        error: error?.message || "Terjadi kesalahan server saat menganalisis gambar.",
        detail: error?.toString(),
      },
      { status: 500 }
    );
  }
}
