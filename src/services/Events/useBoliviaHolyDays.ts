import type { Holidays, ResponseHoliday, HolidayDTO, SpecialMenuData, SpecialMenuResponse } from "@/types/Events/holyday-interface";
import apiClient from "../api/api";

// la API puede devolver directamente un arreglo o un objeto con la clave
// `holydays`. adaptamos el tipo para poder hacer un "narrowing".


export const HolydayService = {
  async getBolivisHolydays(): Promise<Holidays[]> {
    try {
      const { data } = await apiClient.get<ResponseHoliday>('holidays');

      if (data && data.success && data.data?.holidays) {
        return data.data.holidays.map((h: HolidayDTO): Holidays => {

          const datePart = h.date.split('T')[0] || '';

          // Agregamos una coma al principio para ignorar el año ("2024")
          const [, monthStr, dayStr] = datePart.split('-');

          const month = monthStr ? parseInt(monthStr) : 0;
          const day = dayStr ? parseInt(dayStr) : 0;

          return {
            ...h,
            date: new Date(new Date().getFullYear(), month - 1, day)
          };
        });
      }

      return [];
    } catch (error) {
      console.error("Error cargando fechas bolivianas ", error);
      return [];
    }
  },
  async getSpecialMenu(holidayId: number): Promise<SpecialMenuData | null>{
    try {
    const { data } = await apiClient.get<SpecialMenuResponse>(`holidays/${holidayId}/menu`);
    if(data && data.success){
      return data.data; // Retorna { holiday: {...}, menu_holiday: [...] }
    }
    return null;
  } catch (error) {
    console.error("Error cargando menú especial:", error);
    return null;
  }
  }
};
