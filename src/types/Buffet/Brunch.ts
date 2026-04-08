import type { UnifiedItemPayload } from "../Item_reservation_buffet_after/UnifiedItemPayload";
import type { CheckListItem } from "../Events/Event-Create";

// src/types/Buffet/Brunch.ts
export interface BrunchCreateRequest {
  name: string;
  phone: string;
  amount: number;         // Cantidad de personas (en tu JSON es "amount")
  service_type?: string;           // Tipo de acontecimiento
  date_branch: string | null | undefined;
  start_time: string | null | undefined;
  end_time?: string | null | undefined;
  price: number;
  note: string | null | undefined;
  code?: string;
  items?: UnifiedItemPayload[];
  form_origin?: string;
  location_place?: string;
  check_list?: CheckListItem[];
}

/**
 * Representa el objeto "data" que devuelve la API
 */
export interface BrunchData extends BrunchCreateRequest {
  id: number;
  created_at: string;
  updated_at: string;
}

/**
 * Representa la respuesta completa del servidor
 */
export interface BrunchResponse {
  message: string;
  code?: string;
  send_wp: boolean; // Crucial para mostrar o no el botón de WhatsApp
  data: BrunchData;
}
