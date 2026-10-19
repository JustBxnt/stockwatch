import { ScannedItem } from "./validations/scan";

export function estimateExpirationDate(kategori: ScannedItem["kategori"]): string {
  const now = new Date();
  let daysToAdd = 3;

  switch (kategori) {
    case "Kuliner Tradisional & Olahan Matang":
      daysToAdd = 2; // Makanan kuah/lauk matang 1-2 hari di kulkas
      break;
    case "Daging, Unggas & Seafood Mentah":
      daysToAdd = 2;
      break;
    case "Buah & Sayur Segar":
      daysToAdd = 4;
      break;
    case "Produk Susu, Telur & Olahan":
      daysToAdd = 7;
      break;
    case "Makanan Beku (Frozen Food)":
      daysToAdd = 60;
      break;
    case "Roti, Kue & Camilan":
      daysToAdd = 4;
      break;
    case "Bumbu, Saus & Sambal":
      daysToAdd = 30;
      break;
    case "Makanan Kering & Pokok":
      daysToAdd = 90;
      break;
    case "Makanan Kemasan / Pabrikan":
      daysToAdd = 14;
      break;
    case "Minuman":
      daysToAdd = 10;
      break;
    default:
      daysToAdd = 3;
  }

  const targetDate = new Date(now.getTime() + daysToAdd * 24 * 60 * 60 * 1000);
  return targetDate.toISOString().split("T")[0];
}
