import type { PortalItem, RawPortalItem, PortalChildItem } from '@/types/Linktree/PortalItem-interface';
import apiClient from '../api/api';

let cachedItems: PortalItem[] | null = null;

export const portalService = {
  async getPortalItems(forceRefresh = false): Promise<PortalItem[]> {
    try {
      if (cachedItems && !forceRefresh) return cachedItems;

      const { data } = await apiClient.get<RawPortalItem[]>(`custom-links`);

      const items = data.map((item: RawPortalItem): PortalItem => {
        // Usamos tu lógica de normalización
        const { path, isExternal } = normalizeUrl(item.url);

        return {
          ...item,
          icon: item.icon?.replace('lucide-', 'lucide:') || 'lucide:link',
          // Mapeo para PortalCard
          to: !isExternal ? path : undefined,
          href: isExternal ? path : undefined,
          type: isExternal, // Mantenemos el campo 'type' que usas en el componente
          is_external: isExternal,
          // Procesamos los hijos (si existen)
          children: item.children ? item.children.map((child): PortalChildItem => ({
            ...child,
            icon: child.icon.replace('lucide-', 'lucide:'),
            // Para los hijos, aplicamos la misma lógica de normalización si fuera necesario
            // o simplemente mapeamos su is_external original
          })) : []
        };
      });

      cachedItems = items.sort((a, b) => a.order - b.order);
      return cachedItems;
    } catch (error) {
      console.error("Error en portalService:", error);
      return [];
    }
  }
};

const normalizeUrl = (rawUrl: string) => {
  if (!rawUrl) return { path: '', isExternal: false };
  const currentOrigin = window.location.origin;
  const propDomain = "https://form-reserva.vercel.app";

  if (rawUrl.startsWith(currentOrigin) || rawUrl.startsWith(propDomain)) {
    const path = rawUrl.replace(currentOrigin, '').replace(propDomain, '');
    return {
      path: path.startsWith('/') ? path : `/${path}`,
      isExternal: false
    };
  }
  if (rawUrl.startsWith('/')) {
    return { path: rawUrl, isExternal: false };
  }
  return { path: rawUrl, isExternal: true };
}
