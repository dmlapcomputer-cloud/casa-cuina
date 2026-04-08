// Estructura dinámica para el checklist: { "Nombre del Equipo": cantidad }
// DEPRECADO: se mantiene por compatibilidad con respuestas del backend
export interface EventCheckList {
  [key: string]: number;
}

// NUEVO: ítem del checklist con nombre, cantidad y precio
export interface CheckListItem {
  name: string;
  quantity: number;
  price: string | null;
  included?: boolean; // true = incluido sin costo (ej: sonido con pantallas)
}



// Lo que el servidor nos devuelve (Response)
export interface EventDataResponse extends EventCreateRequest {
  id: number;
  created_at?: string;
}

export interface EventCreateResponse {
  message: string;
  data: EventDataResponse;
}

// src/types/Events/Event-Create.ts

export interface EventCreateRequest {
  name: string;
  phone: string;
  amount: number;
  event: string;
  date: string;
  // CAMBIADO: de Record<string,number> a array de CheckListItem
  // para poder enviar name, quantity y price por separado
  check_list: CheckListItem[];
  amount_guests: number;
  start_time: string;
  end_time: string;
  note: string;
}

export interface EventBookingResponse {
  message: string;
  send_wp: boolean; // CRÍTICO para tu validación
  data: {
    id: number;
    name: string;
    phone: string;
    amount: number;
    event: string;
    date: string;
    check_list: Record<string, number>;
    amount_guests: number;
    start_time: string;
    end_time: string;
    updated_at: string;
    created_at: string;
  };
}
