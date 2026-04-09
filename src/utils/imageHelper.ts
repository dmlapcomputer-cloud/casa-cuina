import { ENV } from "@/config/env";

/**
 * URL base para el almacenamiento de archivos, calculada dinámicamente
 * a partir de la URL de la API (v1, v2, etc.).
 */
export const STORAGE_BASE = ENV.API_URL.replace(/\/api(\/.*)?$/, '/storage/');

/**
 * Normaliza una ruta eliminando barras duplicadas y convirtiendo contra-barras en barras normales.
 * @param path Ruta a normalizar
 * @returns Ruta limpia sin slash inicial
 */
const normalizePath = (path: string): string => {
  const normalized = path.replace(/\\/g, '/').replace(/\/+/g, '/');
  return normalized.startsWith('/') ? normalized.substring(1) : normalized;
};

/**
 * Construye una URL completa apuntando al storage del servidor.
 * @param path Ruta del archivo o imagen
 * @returns URL completa o string vacío si no hay ruta
 */
export const getFullUrl = (path: string | null | undefined): string => {
  if (!path) return '';
  if (path.startsWith('http')) return path;

  return `${STORAGE_BASE}${normalizePath(path)}`;
};

/**
 * Alias para getFullUrl orientado específicamente a productos,
 * manteniendo compatibilidad con código existente.
 */
export const getProductImage = (path: string | null | undefined): string => {
  return getFullUrl(path);
};
