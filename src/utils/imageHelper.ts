import { ENV } from "@/config/env";
export const getProductImage = (path: string | null): string => {
  if (!path) return ''; // O una imagen por defecto

  // Si la ruta ya es una URL completa, no hacemos nada
  if (path.startsWith('https')) return path;
  // Usamos la variable de entorno. Si no existe, usa la de desarrollo por defecto
  const baseUrl = ENV.API_URL.replace(/\/api\/?$/, '/storage/') || 'https://casacuinademo.holadev.store/storage/products-main/';

  return `${baseUrl}${path}`;
}
