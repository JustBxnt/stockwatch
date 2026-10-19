import imageCompression from "browser-image-compression";

/**
 * Kompresi gambar di sisi klien (browser) sebelum dikirim ke API Route.
 * Menekan ukuran foto dari 4MB-10MB menjadi di bawah 800KB.
 * Menghemat bandwidth pengguna dan token API Gemini.
 */
export async function compressScanImage(file: File): Promise<File> {
  const options = {
    maxSizeMB: 0.8,
    maxWidthOrHeight: 1200, // Cukup tajam untuk OCR struk/label kemasan
    useWebWorker: true,
    fileType: "image/jpeg",
  };

  try {
    return await imageCompression(file, options);
  } catch (error) {
    console.warn("Kompresi gagal, menggunakan file original:", error);
    return file;
  }
}
