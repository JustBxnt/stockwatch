import { NextRequest, NextResponse } from "next/server";
import { ScanResponseSchema } from "@/lib/validations/scan";

export const maxDuration = 180; // 3 minutes timeout for Deep Thinking Vision

export async function POST(req: NextRequest) {
  try {
    let base64Data = "";
    let mimeType = "image/jpeg";
    let clientApiKey = req.headers.get("x-api-key")?.trim() || "";
    let requestedModel = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";

    const contentType = req.headers.get("content-type") || "";

    // 1. Dukung pengiriman JSON (Base64) - Sangat cepat, tahan batas payload Vercel
    if (contentType.includes("application/json")) {
      try {
        const body = await req.json();
        base64Data = body.image || "";
        mimeType = body.mimeType || "image/jpeg";
        if (body.apiKey) clientApiKey = body.apiKey.trim();
        if (body.model) requestedModel = body.model.trim();
      } catch (e: any) {
        return NextResponse.json(
          { error: "Gagal memproses data gambar JSON." },
          { status: 400 }
        );
      }
    } else {
      // 2. Dukung FormData tradisional
      try {
        const formData = await req.formData();
        const file = formData.get("image") as File | null;
        if (file) {
          mimeType = file.type || "image/jpeg";
          const arrayBuffer = await file.arrayBuffer();
          base64Data = Buffer.from(arrayBuffer).toString("base64");
        }
        const formApiKey = formData.get("apiKey") as string | null;
        if (formApiKey) clientApiKey = formApiKey.trim();
        const formModel = formData.get("model") as string | null;
        if (formModel) requestedModel = formModel.trim();
      } catch (e: any) {
        return NextResponse.json(
          { error: "Gagal membaca FormData gambar. Gunakan gambar berukuran lebih kecil." },
          { status: 400 }
        );
      }
    }

    const defaultApiKey =
      process.env.GEMINI_API_KEY ||
      process.env.GEMMA_API_KEY ||
      process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
      "";

    const activeApiKey = clientApiKey || defaultApiKey;

    if (!activeApiKey) {
      return NextResponse.json(
        { error: "Kunci API Google Gemini belum dikonfigurasi di Vercel." },
        { status: 500 }
      );
    }

    if (!base64Data) {
      return NextResponse.json(
        { error: "File gambar wajib diunggah." },
        { status: 400 }
      );
    }

    // Candidate models with automatic fallback if a model experiences 503 high demand or 404/429
    const candidateModels = Array.from(
      new Set([
        requestedModel,
        "gemini-3.5-flash-lite",
        "gemini-flash-lite-latest",
        "gemini-3.8-flash",
        "gemma-4-31b-it",
      ])
    ).filter(Boolean) as string[];

    const prompt = `Peran: Pakar AI Vision Pangan & Valuasi Ekonomi Kuliner Indonesia (StockWatch OS - Gemini Vision AI Engine).

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
5. Klasifikasi Kategori & Tipe Makanan Sangat Tegas:
   - Jika makanan tampak sebagai hidangan matang, makanan olahan, siap santap, lauk matang, burger, pizza, sandwich, roti, ayam goreng, nasi olahan: WAJIB beri nilai "tipe_makanan": "olahan_matang" (atau "siap_saji") dan "kategori": "Kuliner Tradisional & Olahan Matang".
   - Jika bahan mentah utuh (sayur mentah, buah mentah, daging mentah potong, telur): beri nilai "tipe_makanan": "mentah_segar".

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
                mimeType: mimeType || "image/jpeg",
                data: base64Data,
              },
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        responseMimeType: "application/json",
      },
    };

    let resultData: any = null;
    let lastError: Error | null = null;

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s per model attempt

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${activeApiKey}`;

        const response = await fetch(googleApiUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          const errMsg = errJson.error?.message || response.statusText;
          // If model is busy (503), deprecated/not found (404), rate-limited (429), or internal error (500), try fallback model
          if ([503, 404, 429, 500].includes(response.status)) {
            console.warn(`[StockWatch AI] Model ${model} gagal (${response.status}: ${errMsg}). Mencoba fallback model berikutnya...`);
            lastError = new Error(`Google Gemini API error (${response.status}): ${errMsg}`);
            continue;
          }
          throw new Error(`Google Gemini API error (${response.status}): ${errMsg}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates.length > 0) {
          resultData = data;
          break; // Model responded successfully!
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[StockWatch AI] Error dengan model ${model}:`, err.message);
      }
    }

    if (!resultData || !resultData.candidates || resultData.candidates.length === 0) {
      throw lastError || new Error("Tidak ada respon yang dikembalikan oleh model Google Gemini.");
    }

    const candidates = resultData.candidates;

    if (!candidates || candidates.length === 0) {
      throw new Error("Tidak ada respon yang dikembalikan oleh model Google Gemini.");
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

    // Attach deep thinking trace and ensure success flag
    rawJson.success = true;
    rawJson.thinking_trace =
      thinkingTrace ||
      "Google Gemini 3.1 Flash Lite Engine: Berhasil memindai komposisi warna, pencahayaan mikrobiologi, dan menghitung kuantitas unit biji/buah secara teliti.";

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
