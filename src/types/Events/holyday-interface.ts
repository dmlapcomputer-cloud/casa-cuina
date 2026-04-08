export interface Holidays {
  id: number;
  date: Date; // Ahora es un objeto Date
  name: string;
  type: string;
  category: string;
  special_day: boolean;
  start_time?: string;
  end_time?: string;
}
export interface HolidayDTO {
  id: number;
  date: string; // <--- El JSON siempre manda string
  name: string;
  type: string;
  category: string;
  special_day: boolean;
  start_time?: string;
  end_time?: string;
}
export interface ResponseHoliday{
  success: boolean,
  message: string,
  data:{
    holidays: HolidayDTO[]
  }
}

export interface DateSlot {
  day: number;
  month: number;
  year: number;
  selectable: boolean;
  today: boolean;
}



//para el menu de los platos que estan relacionado con las fechas festivas

// Representa un plato individual dentro del menú festivo
export interface HolidayMenuItem {
  id: number;
  name: string;
  quantity: number | null;
  photo: string | null;
  price: string; // La API lo envía como string "4.99"
  description: string;
  categories: string[];
  holiday_id: string; // Nota: Viene como string en el JSON "13"
  is_available: boolean;
  orden: number | null;
  created_at: string;
  updated_at: string;
}

// Representa la estructura de los datos del feriado que viene con el menú
export interface HolidayDetail extends HolidayDTO {
  start_time: string;
  end_time: string;
}

// Representa la respuesta completa de data.data en getSpecialMenu
export interface SpecialMenuData {
  holiday: HolidayDetail;
  menu_holiday: HolidayMenuItem[];
}

// Representa la respuesta completa de la API
export interface SpecialMenuResponse {
  success: boolean;
  message: string;
  data: SpecialMenuData;
}
