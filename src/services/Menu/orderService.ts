// Servicio de pedidos del menú
// TODO: reemplazar mockCreateOrder por la llamada real al backend cuando esté disponible

import apiClient from "../api/api"

export interface OrderItem {
  product_id: number
  price?: number
  quantity: number
}

export interface OrderPayload {
  customer_name: string
  customer_phone: string
  menu_type: string
  required_date: string
  required_time?: string
  items: OrderItem[]
}

export interface OrderResponse {
  success: boolean
  order_id: string
  message: string
}

// Mock: simula un POST al backend con 800ms de delay
export const OrderService = {
  async createOrder(payload: OrderPayload): Promise<OrderResponse> {
    try{
      const { data } = await apiClient.post<OrderResponse>('orders', payload)
      return data;
    }catch(error){
      console.error("Error en Pedido torta")
      throw error;
    }
  }
}
