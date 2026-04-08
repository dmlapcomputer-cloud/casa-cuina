import type { IExperienceOption, IApiResponse } from "@/types/TypeExperienceSelector-intreface";
import apiClient from "./api/api";

export const TypeExperienceSelectorService = {
  /**
   * Obtiene la lista completa de ubicaciones/experiencias
   * Retorna un Array de ExperienceOption
   */
  async getItemsList(): Promise<IExperienceOption[]> {
    try {
      // apiClient.get debería retornar directamente el array de la data
      const response = await apiClient.get<IApiResponse>('locations');

      // Ajustamos según la estructura que mostraste: { data: [...] }
      return response.data.data || [];
    } catch (error) {
      console.error("Error al cargar lista de lugares:", error);
      return []; // Retornamos array vacío para evitar errores de .map() en el componente
    }
  }
}
