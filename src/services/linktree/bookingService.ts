// services/bookingService.ts
import type { BookingRequest, BookingResponse } from '@/types/Linktree/Booking-interfaceRequest'
import apiClient from "../api/api"
export const bookingService = {
  async createBooking(bookingData: BookingRequest):Promise<BookingResponse> {
    try {
     const { data } = await apiClient.post<BookingResponse>('bookings', bookingData);
      return data;
    } catch (error) {
      console.error("Error en createBooking:", error);
      throw error;
    }
  }
};
