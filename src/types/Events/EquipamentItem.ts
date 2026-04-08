export interface EventVariant {
  id: number;
  event_checklist_id: string;
  name: string;
  price: string | null;
  description: string | null;
  image_path: string[] | null;  // ahora es array
  dimensions?: string | null;
  is_active: string | boolean;
  capacity_screens?: string | null;
  stock_available?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EquipamentItem {
  id: number;
  name: string;
  cantidad: string;
  service_description: string | null;
  price: number | null;
  variants: EventVariant[]
}

/*export interface SelectedQty {
  id: number;
  quantity: number;
  name?: string; // Opcional para las pantallas
  price:number;
}*/

export interface SelectedQty {
  id: number;
  quantity: number;
  name?: string;
  price?: number | string | null;
  variant_id?: number | null;
}


export interface ILedScreens {
  id: number;
  name: string;
  measure: string;
  price: number;
  image: null;
  max_stock: null;
  led_capacity: string;
}


export interface ScreenSize {
  id: number
  name: string
  consumo: number
  cols: number
  rows: number
}
