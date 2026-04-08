export interface Plato {
  id: number;
  name: string;
  description: string;
  price: number;
}

export interface ProductChangeEvent {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  total: number;
}

// Para la sincronización con el composable
export interface ExtraSelection {
  id: number;
  cantidad: number;
  nombre: string;
}
