"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  X,
  Plus,
  ThermometerSun,
  Refrigerator,
  Snowflake,
  Utensils,
  Coins,
  MapPin,
  Sparkles,
  ChefHat,
  Video,
  RefreshCw,
  Eye,
  CheckSquare,
  Square
} from "lucide-react";
import { compressScanImage } from "@/lib/compressImage";
import { ScannedItem } from "@/lib/validations/scan";
import { estimateExpirationDate } from "@/lib/shelfLifeEstimator";

interface SmartScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveItems?: (items: any[]) => void;
}

export default function SmartScanModal({ isOpen, onClose, onSaveItems }: SmartScanModalProps) {
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [items, setItems] = useState<ScannedItem[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const [totalRupiah, setTotalRupiah] = useState<number | null>(null);
  const [safetySummary, setSafetySummary] = useState<string | null>(null);
  const [thinkingTrace, setThinkingTrace] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedStorage, setSelectedStorage] = useState<Record<number, "kulkas_chiller" | "suhu_ruang" | "freezer_beku">>({});
  const [tickerIndex, setTickerIndex] = useState(0);

  // Live Camera state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const progressNotes = [
    "Memproses citra resolusi tinggi & optimasi kompresi...",
    "Google Gemma 4 sedang menganalisis visual makanan...",
    "Mendeteksi buah, sayur, daging & produk pangan...",
    "Menghitung jumlah fisik (biji, butir, buah, potong) secara presisi...",
    "Mengkaji pigmen warna kulit, kematangan & kesegaran...",
    "Mengalkulasi harga pasar tradisional (Rp) se-Indonesia..."
  ];

  useEffect(() => {
    let interval: any;
    if (loading || compressing) {
      interval = setInterval(() => {
        setTickerIndex((prev) => (prev + 1) % progressNotes.length);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [loading, compressing]);

  // Clean up camera on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopCamera();
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setErrorMsg(null);
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn("Gagal membuka kamera:", err);
      setErrorMsg("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan di browser.");
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  const switchCamera = async () => {
    const nextMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(nextMode);
    if (isCameraActive) {
      stopCamera();
      setTimeout(() => {
        startCamera();
      }, 200);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;
      stopCamera();
      const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
      await processImageFile(file);
    }, "image/jpeg", 0.9);
  };

  const processImageFile = async (file: File) => {
    setErrorMsg(null);
    setTotalCount(null);
    setTotalRupiah(null);
    setThinkingTrace(null);

    try {
      setCompressing(true);
      const compressed = await compressScanImage(file);
      setCompressing(false);

      setLoading(true);
      const formData = new FormData();
      formData.append("image", compressed);

      // Pass user custom API key and model if configured
      const savedKey = typeof window !== "undefined" ? localStorage.getItem("stockwatch_gemma_key") || localStorage.getItem("stockwatch_gemini_key") : null;
      const savedModel = typeof window !== "undefined" ? localStorage.getItem("stockwatch_gemma_model") || localStorage.getItem("stockwatch_gemini_model") : null;
      if (savedKey) formData.append("apiKey", savedKey);
      if (savedModel) formData.append("model", savedModel);

      const res = await fetch("/api/scan", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || data.detail || "Gagal menganalisis gambar.");
      }

      const processedItems: ScannedItem[] = (data.items || []).map((item: ScannedItem) => ({
        ...item,
        satuan: item.satuan || "porsi",
        tanggal_kadaluwarsa: item.tanggal_kadaluwarsa || estimateExpirationDate(item.kategori),
      }));

      const initialStorage: Record<number, "kulkas_chiller" | "suhu_ruang" | "freezer_beku"> = {};
      processedItems.forEach((item, index) => {
        const reco = item.daya_tahan?.rekomendasi_simpan?.toLowerCase() || "";
        if (reco.includes("freezer")) {
          initialStorage[index] = "freezer_beku";
        } else if (reco.includes("kulkas") || reco.includes("chiller")) {
          initialStorage[index] = "kulkas_chiller";
        } else {
          initialStorage[index] = "suhu_ruang";
        }
      });

      setItems(processedItems);
      setSelectedIndices(processedItems.map((_, i) => i));
      setSelectedStorage(initialStorage);
      setTotalCount(data.total_item_terdeteksi || processedItems.length);
      setTotalRupiah(data.total_estimasi_nilai_rupiah || null);
      setSafetySummary(data.ringkasan_keamanan_pangan || null);
      setThinkingTrace(data.thinking_trace || null);
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan saat memindai gambar.");
    } finally {
      setLoading(false);
      setCompressing(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processImageFile(file);
  };

  const loadSampleFood = (sampleType: string) => {
    stopCamera();
    let sampleData: ScannedItem[] = [];

    if (sampleType === "wortel") {
      sampleData = [
        {
          nama_produk: "Wortel Brastagi Segar",
          tipe_makanan: "mentah_segar",
          status_segel: "Segar Tanpa Kemasan",
          spesifikasi: "Warna oranye cerah, tekstur keras dan padat, ujung daun segar",
          kuantitas: 4,
          satuan: "biji",
          kategori: "Buah & Sayur Segar",
          tanggal_kadaluwarsa: estimateExpirationDate("Buah & Sayur Segar"),
          estimasi_harga: {
            harga_rata_rata: 9000,
            rentang_harga: "Rp 7.000 - Rp 12.000",
            analisis_regional: "Pasar tradisional Jawa ~Rp 8.000, Jabodetabek ~Rp 10.000, Luar Jawa ~Rp 12.000",
            faktor_penentu_harga: "Ukuran kelurusan wortel dan tingkat kebersihan akar"
          },
          daya_tahan: {
            suhu_ruang: "3-5 hari",
            kulkas_chiller: "10-14 hari di laci crisper",
            freezer_beku: "1 bulan jika dipotong dan diblansir",
            rekomendasi_simpan: "Bungkus kertas atau wadah kedap udara di laci crisper sayur",
            tanda_kerusakan: "Tekstur lembek, berlendir atau berbau asam",
            tips_penanganan: "Potong bagian hijau pangkal sebelum disimpan agar nutrisi tidak terserap"
          }
        }
      ];
    } else if (sampleType === "tomat") {
      sampleData = [
        {
          nama_produk: "Tomat Cherry Merah Merona",
          tipe_makanan: "mentah_segar",
          status_segel: "Segar Petik",
          spesifikasi: "Kulit kencang mengilap, warna merah pekat merata, kelopak hijau segar",
          kuantitas: 6,
          satuan: "biji",
          kategori: "Buah & Sayur Segar",
          tanggal_kadaluwarsa: estimateExpirationDate("Buah & Sayur Segar"),
          estimasi_harga: {
            harga_rata_rata: 8000,
            rentang_harga: "Rp 6.000 - Rp 10.000",
            analisis_regional: "Supermarket modern ~Rp 10.000, Pasar tradisional ~Rp 7.000",
            faktor_penentu_harga: "Tingkat kematangan merah dan kesegaran kelopak"
          },
          daya_tahan: {
            suhu_ruang: "3-4 hari",
            kulkas_chiller: "7 hari di rak crisper",
            rekomendasi_simpan: "Alasi wadah tisu kering, jangan dicuci sebelum disimpan",
            tanda_kerusakan: "Kulit keriput layu, lembek dan berair",
            tips_penanganan: "Simpan dengan posisi tangkai menghadap ke bawah"
          }
        }
      ];
    } else {
      sampleData = [
        {
          nama_produk: "Alpukat Mentega Super",
          tipe_makanan: "mentah_segar",
          status_segel: "Segar Petik",
          spesifikasi: "Kulit hijau tua agak empuk saat ditekan lembut, daging kuning mentega",
          kuantitas: 2,
          satuan: "buah",
          kategori: "Buah & Sayur Segar",
          tanggal_kadaluwarsa: estimateExpirationDate("Buah & Sayur Segar"),
          estimasi_harga: {
            harga_rata_rata: 24000,
            rentang_harga: "Rp 20.000 - Rp 30.000",
            analisis_regional: "Jawa ~Rp 20.000, Luar Jawa ~Rp 28.000 per kg",
            faktor_penentu_harga: "Tingkat kelembutan daging tanpa serat hitam"
          },
          daya_tahan: {
            suhu_ruang: "2 hari (jika sudah matang)",
            kulkas_chiller: "5 hari untuk memperlambat kematangan",
            rekomendasi_simpan: "Masukkan chiller kulkas jika sudah matang sempurna",
            tanda_kerusakan: "Daging menghitam dan berbau fermentasi",
            tips_penanganan: "Olesi air lemon pada belahan alpukat sisa agar tidak teroksidasi"
          }
        }
      ];
    }

    setItems(sampleData);
    setSelectedIndices(sampleData.map((_, i) => i));
    setTotalCount(sampleData.reduce((acc, it) => acc + it.kuantitas, 0));
    setTotalRupiah(sampleData.reduce((acc, it) => acc + it.estimasi_harga.harga_rata_rata, 0));
    setSafetySummary("Bahan pangan segar alami. Kandungan nutrisi maksimal dan layak konsumsi langsung.");
    setSelectedStorage({ 0: "kulkas_chiller" });
  };

  const updateItem = (index: number, field: keyof ScannedItem, value: any) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const toggleSelectIndex = (idx: number) => {
    setSelectedIndices((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIndices.length === items.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(items.map((_, i) => i));
    }
  };

  const toggleStorageMode = (index: number, mode: "kulkas_chiller" | "suhu_ruang" | "freezer_beku") => {
    setSelectedStorage((prev) => ({ ...prev, [index]: mode }));
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    setSelectedIndices((prev) => prev.filter((i) => i !== index));
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(angka);
  };

  const handleSaveToInventory = () => {
    const selectedItems = items.filter((_, idx) => selectedIndices.includes(idx));
    if (selectedItems.length === 0) return;

    const payload = selectedItems.map((item, idx) => {
      const storageMode = selectedStorage[idx] || "kulkas_chiller";
      const zoneLabel =
        storageMode === "kulkas_chiller"
          ? "❄️ Chiller Kulkas"
          : storageMode === "suhu_ruang"
          ? "🥗 Crisper Sayur"
          : "🧊 Freezer Beku";

      return {
        id: Date.now() + Math.floor(Math.random() * 10000),
        name: `${item.nama_produk} (${item.kuantitas} ${item.satuan})`,
        rawName: item.nama_produk,
        qty: item.kuantitas,
        satuan: item.satuan,
        quantityDisplay: `${item.kuantitas} ${item.satuan}`,
        price: item.estimasi_harga.harga_rata_rata,
        unitPrice: Math.round(item.estimasi_harga.harga_rata_rata / (item.kuantitas || 1)),
        exp: item.tanggal_kadaluwarsa || estimateExpirationDate(item.kategori),
        loc: zoneLabel,
        zone: storageMode,
        cat: item.kategori,
        condition: item.spesifikasi || "Kondisi segar layak konsumsi",
        storageTip: item.daya_tahan?.rekomendasi_simpan || "Simpan rapi di kulkas",
        status: "safe",
      };
    });

    if (onSaveItems) {
      onSaveItems(payload);
    }

    handleReset();
    onClose();
  };

  const handleReset = () => {
    stopCamera();
    setItems([]);
    setSelectedIndices([]);
    setErrorMsg(null);
    setTotalCount(null);
    setTotalRupiah(null);
    setSafetySummary(null);
    setThinkingTrace(null);
    setSelectedStorage({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  if (!isOpen) return null;

  const totalSelectedPieces = items
    .filter((_, idx) => selectedIndices.includes(idx))
    .reduce((acc, it) => acc + (it.kuantitas || 1), 0);

  const totalSelectedRupiah = items
    .filter((_, idx) => selectedIndices.includes(idx))
    .reduce((acc, it) => acc + (it.estimasi_harga?.harga_rata_rata || 0), 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-4 backdrop-blur-md">
      <div className="flex max-h-[96vh] w-full max-w-3xl flex-col rounded-2xl bg-white shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-3.5 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Camera className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                Smart Vision AI Scanner <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/20">Google Gemma 4</span>
              </h2>
              <p className="text-xs text-zinc-500">Hitung presisi jumlah biji/buah, estimasi harga nasional & daya simpan</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Viewfinder / Live Camera / Upload Section */}
          {items.length === 0 && !loading && !compressing && (
            <div className="space-y-4">
              {/* If Camera is Active */}
              {isCameraActive ? (
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-emerald-500/40 shadow-inner">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder crosshair overlay */}
                  <div className="absolute inset-8 border border-white/30 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex justify-between text-[10px] font-mono text-emerald-400 font-bold">
                      <span>[HUD ACTIVE]</span>
                      <span>GEMMA_VISION_READY</span>
                    </div>
                    <div className="text-center text-xs font-medium text-white/80 bg-black/50 px-3 py-1 rounded-full mx-auto backdrop-blur-sm">
                      Arahkan kamera ke buah, sayur, atau bahan makanan
                    </div>
                  </div>

                  {/* Camera Controls Bar */}
                  <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10 px-4">
                    <button
                      type="button"
                      onClick={switchCamera}
                      className="p-3 rounded-full bg-black/60 text-white hover:bg-black/80 backdrop-blur-md transition border border-white/20"
                      title="Ganti Kamera"
                    >
                      <RefreshCw className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={capturePhoto}
                      className="px-6 py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/40 active:scale-95 transition"
                    >
                      <Camera className="h-5 w-5" /> Ambil Foto
                    </button>
                    <button
                      type="button"
                      onClick={stopCamera}
                      className="p-3 rounded-full bg-red-600/80 text-white hover:bg-red-600 backdrop-blur-md transition"
                      title="Tutup Kamera"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Card Upload & Camera Trigger */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Option 1: Buka Kamera Live */}
                  <div
                    onClick={startCamera}
                    className="group cursor-pointer rounded-2xl border-2 border-dashed border-emerald-500/30 hover:border-emerald-500 p-6 text-center bg-emerald-50/40 dark:bg-emerald-950/20 hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 transition flex flex-col items-center justify-center space-y-2.5"
                  >
                    <div className="h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                      <Camera className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Buka Kamera Langsung</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Ambil foto makanan secara live melalui kamera HP atau webcam laptop
                    </p>
                  </div>

                  {/* Option 2: Upload File Foto */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="group cursor-pointer rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-emerald-500 p-6 text-center bg-zinc-50 dark:bg-zinc-800/30 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition flex flex-col items-center justify-center space-y-2.5"
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <div className="h-12 w-12 rounded-full bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300 flex items-center justify-center shadow-sm group-hover:scale-110 transition">
                      <Upload className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">Pilih dari Galeri / File</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      Upload foto JPG, PNG, atau WebP yang sudah tersimpan di perangkat
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Sample Selector */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3.5 bg-zinc-50 dark:bg-zinc-900/60 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Coba Sampel Cepat (Tanpa Foto):
                  </span>
                  <span className="text-[10px] text-zinc-400">Simulasi respons Gemma 4</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => loadSampleFood("wortel")}
                    className="text-xs bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    🥕 Wortel Brastagi (4 Biji)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleFood("tomat")}
                    className="text-xs bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    🍅 Tomat Cherry (6 Biji)
                  </button>
                  <button
                    type="button"
                    onClick={() => loadSampleFood("alpukat")}
                    className="text-xs bg-white dark:bg-zinc-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 rounded-lg font-medium transition"
                  >
                    🥑 Alpukat Mentega (2 Buah)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading Indicator with Animated Telemetry */}
          {(compressing || loading) && (
            <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin" />
                <Sparkles className="h-6 w-6 text-emerald-500 absolute animate-pulse" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  {compressing ? "Mengompres foto masakan..." : "Gemma 4 Deep Thinking Vision..."}
                </p>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium animate-pulse">
                  {progressNotes[tickerIndex]}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300 border border-red-200 dark:border-red-900/50">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Pemindaian Gagal</p>
                <p className="text-xs mt-1">{errorMsg}</p>
              </div>
              <button onClick={handleReset} className="text-xs font-bold underline">
                Coba Lagi
              </button>
            </div>
          )}

          {/* Review Items List */}
          {items.length > 0 && (
            <div className="space-y-4">
              {/* Summary Bar with Total Price & Check All */}
              <div className="rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 dark:from-emerald-950/40 dark:to-teal-950/40 border border-emerald-200 dark:border-emerald-800/60 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={toggleSelectAll}
                      className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200 hover:text-emerald-600 transition"
                    >
                      {selectedIndices.length === items.length ? (
                        <CheckSquare className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Square className="h-4 w-4 text-zinc-400" />
                      )}
                      <span>Pilih Semua ({items.length} Bahan / {items.reduce((a, b) => a + (b.kuantitas || 1), 0)} Biji)</span>
                    </button>
                  </div>

                  {totalSelectedRupiah > 0 && (
                    <div className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-1 rounded-lg shadow-sm">
                      <Coins className="h-4 w-4" />
                      <span className="text-xs font-bold">Total: {formatRupiah(totalSelectedRupiah)}</span>
                    </div>
                  )}
                </div>

                {safetySummary && (
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed pt-2 border-t border-emerald-200/50 dark:border-emerald-800/40">
                    💡 <strong>Analisis Kesegaran Gemma:</strong> {safetySummary}
                  </p>
                )}
              </div>

              {/* Collapsible Deep Thinking Trace */}
              {thinkingTrace && (
                <details className="rounded-xl border border-zinc-200 dark:border-zinc-800 p-3 bg-zinc-50 dark:bg-zinc-900 text-xs">
                  <summary className="font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" /> Log Penalaran Deep Thinking Gemma (Chain of Thought)
                  </summary>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                    {thinkingTrace}
                  </p>
                </details>
              )}

              {/* Items Cards */}
              <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
                {items.map((item, idx) => {
                  const isChecked = selectedIndices.includes(idx);
                  const currentMode = selectedStorage[idx] || "kulkas_chiller";
                  const harga = item.estimasi_harga;

                  return (
                    <div
                      key={idx}
                      className={`rounded-xl border p-4 shadow-sm transition space-y-3.5 ${
                        isChecked
                          ? "border-emerald-300 dark:border-emerald-800/80 bg-white dark:bg-zinc-800/90 ring-1 ring-emerald-500/20"
                          : "border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/50 opacity-60"
                      }`}
                    >
                      {/* Item Header */}
                      <div className="flex items-start gap-3">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSelectIndex(idx)}
                          className="mt-1 h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Quantity Badge */}
                            <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                              🏷️ {item.kuantitas} {item.satuan.toUpperCase()}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300">
                              {item.kategori}
                            </span>
                          </div>
                          <input
                            type="text"
                            value={item.nama_produk}
                            onChange={(e) => updateItem(idx, "nama_produk", e.target.value)}
                            className="font-bold text-base text-zinc-900 dark:text-zinc-100 bg-transparent border-b border-dashed border-zinc-300 focus:border-emerald-500 focus:outline-none w-full"
                          />
                        </div>

                        <button
                          onClick={() => removeItem(idx)}
                          className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/50 transition"
                          title="Hapus"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Estimasi Harga Box */}
                      {harga && (
                        <div className="rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                              <Coins className="h-4 w-4 text-emerald-600" />
                              Estimasi Harga Pasar Indonesia:
                            </span>
                            <span className="text-sm font-black text-emerald-700 dark:text-emerald-400 bg-white dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg border border-emerald-300 dark:border-emerald-700 shadow-sm">
                              {formatRupiah(harga.harga_rata_rata)}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                            <div className="bg-white/70 dark:bg-zinc-800/60 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                              <span className="text-[10px] font-bold text-zinc-500 block uppercase">Rentang Harga</span>
                              <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{harga.rentang_harga}</span>
                            </div>
                            <div className="bg-white/70 dark:bg-zinc-800/60 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                              <span className="text-[10px] font-bold text-zinc-500 block uppercase">Faktor Kualitas</span>
                              <span className="text-[11px] text-zinc-700 dark:text-zinc-300 font-medium">{harga.faktor_penentu_harga}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* 3 Storage Zones */}
                      <div className="grid grid-cols-3 gap-2">
                        <div
                          onClick={() => toggleStorageMode(idx, "suhu_ruang")}
                          className={`cursor-pointer rounded-xl border p-2.5 transition flex flex-col justify-between ${
                            currentMode === "suhu_ruang"
                              ? "border-amber-500 bg-amber-50/80 dark:bg-amber-950/50 ring-1 ring-amber-500"
                              : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-700 dark:bg-zinc-900/60 opacity-75"
                          }`}
                        >
                          <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 dark:text-amber-300">
                            <ThermometerSun className="h-3.5 w-3.5" /> Crisper Sayur
                          </span>
                          <p className="text-xs font-black text-amber-950 dark:text-amber-100 mt-1">
                            {item.daya_tahan?.suhu_ruang || "3-5 hari"}
                          </p>
                        </div>

                        <div
                          onClick={() => toggleStorageMode(idx, "kulkas_chiller")}
                          className={`cursor-pointer rounded-xl border p-2.5 transition flex flex-col justify-between ${
                            currentMode === "kulkas_chiller"
                              ? "border-sky-500 bg-sky-50/80 dark:bg-sky-950/50 ring-1 ring-sky-500"
                              : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-700 dark:bg-zinc-900/60 opacity-75"
                          }`}
                        >
                          <span className="flex items-center gap-1 text-[11px] font-bold text-sky-800 dark:text-sky-300">
                            <Refrigerator className="h-3.5 w-3.5" /> Chiller Kulkas
                          </span>
                          <p className="text-xs font-black text-sky-950 dark:text-sky-100 mt-1">
                            {item.daya_tahan?.kulkas_chiller || "7-10 hari"}
                          </p>
                        </div>

                        <div
                          onClick={() => toggleStorageMode(idx, "freezer_beku")}
                          className={`cursor-pointer rounded-xl border p-2.5 transition flex flex-col justify-between ${
                            currentMode === "freezer_beku"
                              ? "border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/50 ring-1 ring-indigo-500"
                              : "border-zinc-200 bg-zinc-50/60 dark:border-zinc-700 dark:bg-zinc-900/60 opacity-75"
                          }`}
                        >
                          <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-800 dark:text-indigo-300">
                            <Snowflake className="h-3.5 w-3.5" /> Freezer Beku
                          </span>
                          <p className="text-xs font-black text-indigo-950 dark:text-indigo-100 mt-1">
                            {item.daya_tahan?.freezer_beku || "1 bulan"}
                          </p>
                        </div>
                      </div>

                      {/* Expiration Date Input */}
                      <div className="flex items-center justify-between text-xs bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                        <span className="font-semibold text-zinc-600 dark:text-zinc-400">Target Kadaluwarsa:</span>
                        <input
                          type="date"
                          value={item.tanggal_kadaluwarsa || ""}
                          onChange={(e) => updateItem(idx, "tanggal_kadaluwarsa", e.target.value)}
                          className="font-bold text-xs bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded px-2 py-1 text-zinc-800 dark:text-zinc-200"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {items.length > 0 && (
          <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-3.5 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 rounded-b-2xl">
            <button
              onClick={handleReset}
              className="rounded-xl border border-zinc-300 px-4 py-2 text-xs sm:text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 transition"
            >
              Foto Ulang
            </button>
            <button
              onClick={handleSaveToInventory}
              disabled={loading || selectedIndices.length === 0}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow hover:bg-emerald-700 active:scale-95 disabled:opacity-50 transition"
            >
              <CheckCircle2 className="h-4 w-4" />
              Masukan {selectedIndices.length} Bahan ({totalSelectedPieces} Biji/Buah)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
