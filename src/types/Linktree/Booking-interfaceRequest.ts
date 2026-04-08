import type { Items } from '@/services/Events/itemServices'
export interface BookingRequest {
  codigo?: string;
  guest_count: number;
  booking_date: string; // Formato YYYY-MM-DD
  booking_time: string; // Formato HH:mm:ss
  customer_name: string;
  phone_number: string;
  notes?: string;
  status: string;          // "pending"
  in_person: boolean;
  items?: ItemRequestPayload[]; // Campo para los extras seleccionados, separado por comas
  form_origin: string;
  location_place: string;
  menu_items?: MenuItemPayload[];
  exclusive_data?: IExclusive_salon;
  cake_order? : CakeOrder;
}
// Este es el formato simplificado que el backend acepta
export interface ItemRequestPayload {
  name: string;
  price: number;
  dedication: string;
}
export interface IExclusive_salon{
  booking_location_id: number,
  amount_paid: number

}
//menu torta
export interface CakeOrder{
  menu_type: string;
  items : Item[],
  note?: string;
}
export interface Item{
  product_id : number;
  quantity : number;
  price? : number;
  note?: string;
}
//intreface para reserva para agregar platos especiales por el disa del padre pero no solo para eso para las fechas festivas
export interface MenuItemPayload{
  menu_holiday_id: number;
  quantity: number;
  item_notes?: string;        // Opcional: "Término medio", etc.
  customizations?: Record<string, boolean>; // Opcional: {"sin_cebolla": true}
}
export interface LocalMenuItem extends MenuItemPayload {
  name: string; // Agregamos el nombre para poder buscarlo en el findIndex
}
export interface BookingResponse {
  message: string;
  send_wp: boolean;
  data:{
    id?: number;
    codigo: string;
    guest_count: number;
    booking_date: string; // Formato YYYY-MM-DD
    booking_time: string; // Formato HH:mm:ss
    customer_name: string;
    phone_number: string;
    notes?: string;
    items?: Items[] | string;
    created_at?: string;
  }
  // Agrega aquí cualquier otro campo que devuelva tu API
}

// Respuesta real que devuelve el backend para reservas estándar
export interface RawBookingResponse {
  success: boolean;
  message: string;
  whatsapp_sent: boolean;
  booking: {
    id?: number;
    codigo: string;
    guest_count: number;
    booking_date: string;
    booking_time: string;
    customer_name: string;
    phone_number: string;
    notes?: string;
    items?: Items[] | string;
    created_at?: string;
  }
}


// Interfaces temporales para el mapeador
export interface RawBuffetResponse {
  message: string;
  code?: string; // Lo hacemos opcional por si viene dentro de data
  send_wp: boolean;
  data: {
    id: number;
    name: string;
    phone: string;
    amount: number;
    date_branch?: string | null;
    start_time: string;
    code?: string; // También puede venir aquí
    note?: string;
    created_at?: string;
  }
}

export interface RawAfterResponse {
  message: string;
  send_wp: boolean;
  data: {
    id: number;
    codigo: string;
    guest_count: string | number; // "5" en tu JSON
    after_date: string;           // "2026-03-13T04:00..."
    after_time: string;           // "17:00:00"
    customer_name: string;
    phone_number: string;
    notes: string;
    items: string | Items[];      // Aquí está el truco del JSON string
    status: string;
    in_person: boolean;
    created_at?: string;
    updated_at?: string;
  }
}
