import type { SystemSettings } from "@/types/setting-type";
import apiClient from "./api/api";

export const SettingService = {
  async getSettings(): Promise<SystemSettings | null> {
    try {
      // Especificamos que esperamos un array de SystemSettings
      const response = await apiClient.get('settings');
      const data = response.data;
      // Verificamos si data existe y tiene al menos un elemento
      if (Array.isArray(data)) {
      return data.length > 0 ? data[0] : null;
    }

      return data || null;
    } catch (error) {
      console.error("Error cargando configuraciones:", error);
      return null;
    }
  }
}
