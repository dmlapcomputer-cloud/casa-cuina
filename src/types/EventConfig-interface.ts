// src/types/EventConfig-interface.ts

export type SelectionType = 'unique' | 'quantity' | 'toggle';

export interface CatalogItem {
  id: string | number;
  name: string;
  type: SelectionType;
  max_allowed: number;
  subtitle?: string;
  icon?: string;
}

export interface Category {
  id: string;
  title: string;
  items: CatalogItem[];
}

// Interfaz para la cotización final que se guarda en la BD
export interface EventQuoteRequest {
  customer_name: string;
  customer_phone: string;
  event_type: string;
  event_date: Date | string;
  start_time: string;
  end_time: string;
  guests_count: number;
  items: QuoteItemSelection[];
}

export interface QuoteItemSelection {
  catalog_item_id: string | number;
  quantity: number;
}
