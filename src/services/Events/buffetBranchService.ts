import type { EventType } from "@/types/Events/events-type"
import apiClient from "../api/api"
import type { BrunchCreateRequest, BrunchResponse } from "@/types/Buffet/Brunch";
export const AcontecimientoService = {
  async getTypeAcontecimiento(): Promise<EventType[]> {
    try {
      const { data } = await apiClient.get<EventType[]>('buffet-services');
      return data
    } catch (error) {
      console.error("Error cargando el tipo de acontecimiento ", error);
      return []
    }
  },

  async storeBrunch(payload: BrunchCreateRequest): Promise<BrunchResponse> {
  try {
    const cleanPayload = Object.fromEntries(
      Object.entries(payload).filter((entry) =>
        entry[1] !== null && entry[1] !== undefined && entry[1] !== ""
      )
    );

    const response = await apiClient.post<BrunchResponse>('brunches', cleanPayload);
    return response.data;
  } catch (error) {
    console.error("Error al guardar el brunch", error);
    throw error;
  }
}

}
