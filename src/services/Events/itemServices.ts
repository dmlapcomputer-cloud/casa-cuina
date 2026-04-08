import apiClient from "../api/api";
// Este es el formato simplificado que el backend acepta
export interface ItemRequestPayload {
  name: string;
  price: number;
  dedication: string;
}
export interface Items {
  id: number;
  name: string;
  price:number | string,
  category?: string;
  status?: boolean,
  options?: ItemOption[] | null; // Cambiado para soportar el JSON
  selectedOption?: string; // Campo extra para la selección del usuario
  has_dedication: boolean;
  dedication: string;
}
export interface ItemOption {
  variant: string;
  price_modifier: number;
  image?:string;
}
export const ItemService = {
  async getItemServicios(): Promise<Items[]>{
    try{
      const { data } = await apiClient.get<Items[]>('item-bookings');
      return data;
    }catch(error){
      console.error("Error cargando items reservas", error);
      return [];
    }
  }
}
