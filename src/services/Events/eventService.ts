import type { EventType } from "@/types/Events/events-type";
import type { EquipamentItem, ILedScreens } from "@/types/Events/EquipamentItem";
import apiClient from "../api/api";
import type { EventBookingResponse, EventCreateRequest } from "@/types/Events/Event-Create";

export const EventServices = {

  async getEventTypes(): Promise<EventType[]> {
    try {
      const { data } = await apiClient.get<EventType[]>('event-services');
      return data;
    } catch (error) {
      console.error("Error cargando tuipos de eventos ", error);
      return [];
    }
  },

  async getEquipmentCheck(): Promise<EquipamentItem[]> {
    try {
      const { data } = await apiClient.get<EquipamentItem[]>('event-checklists');
      return data;
    } catch (error) {
      console.error("Error cargando equipamiento:", error);
      return [];
    }
  },
  async getLed_Screens(): Promise<ILedScreens[]> {
    try {
      const { data } = await apiClient.get<ILedScreens[]>('equipment/led-screens');
      return data;
    } catch (error) {
      console.error("Error cargar de pantallas leds", error);
      return [];
    }
  },
  async storeEvent(eventData: EventCreateRequest): Promise<EventBookingResponse> {
    try {
      const { data } = await apiClient.post<EventBookingResponse>('events', eventData);
      return data;
    } catch (error) {
      console.error("Error guardando evento: ", error);
      throw error;
    }
  }


}
