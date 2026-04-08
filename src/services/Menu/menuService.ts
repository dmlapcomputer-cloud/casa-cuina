import type { MenuApiResponse, Product } from "@/types/Menu/Menu-interface";
import apiClient from "../api/api";

export const MenuItemService = {
  async getItemMenu(): Promise<Product[]>{
    const response = await apiClient.get<MenuApiResponse>('products');
    return response.data.data;
  }
}
