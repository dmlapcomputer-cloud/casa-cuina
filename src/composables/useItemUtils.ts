import { ENV } from "@/config/env";

// Construimos la base de almacenamiento igual que en useSystemSettings
const STORAGE_BASE = ENV.API_URL.replace(/\/api\/?$/, '/storage/');

export function useItemUtils() {

  const getFullUrl = (path: string | null | undefined) => {
    if (!path) return null;
    // Quitamos la barra inicial si existe para evitar dobles barras
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${STORAGE_BASE}${cleanPath}`;
  };

  return {
    getFullUrl
  };
}
