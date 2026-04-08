import type { GoogleSheetReservation } from '@/types/GoogleSheetReservation'
import type { BookingPayload } from '@/types/Reservation-interface'

const GOOGLE_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbzDX6-aNnKFgW-A0TwWk2ExiSRZMmXC3xKRxCQuWWVEiNmoMvvTG-vuvryIMVX2BjGu2w/exec'

// Interfaz flexible pero segura para TypeScript

export const googleSheetsService = {
  /**
   * Obtiene todas las reservas con un bypass de cache
   */
  async getExistingReservations(): Promise<GoogleSheetReservation[]> {
    try {
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?t=${Date.now()}`)
      if (!response.ok) return []
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error de lectura en Google Sheets:', error)
      return []
    }
  },

  /**
   * Verifica qué mesas están ocupadas en una fecha y hora específica
   */
async isTableOccupied(date: string, startTime: string, endTime: string): Promise<number[]> {
  const reservations = await this.getExistingReservations();
  if (reservations.length === 0) return [];

  const occupied: number[] = [];
  const searchDate = date.split('T')[0];

  // 1. Convertir horas a minutos para comparar rangos
  const toMinutes = (timeVal: string | null | undefined): number => {
    let s = String(timeVal || "").trim();
    if (!s) return -1;
    if (s.includes('T')) s = s.split('T')[1] || "";

    const parts = s.split(':');
    if (parts.length < 1) return -1;

    const hours = parseInt(parts[0] || "0", 10);
    const minutes = parts[1] ? parseInt(parts[1], 10) : 0; // Maneja "9:00" o "9"
    return hours * 60 + minutes;
  };

  const nInicioBuscado = toMinutes(startTime);
  const nFinBuscado = toMinutes(endTime);

  reservations.forEach((res) => {
    // A. Filtro de Estado
    const resStatus = String(res.status || '').toLowerCase().trim();
    if (resStatus === 'finalizada' || resStatus === 'cancelada') return;

    // B. Filtro de Fecha
    const resDate = String(res.date || "").split('T')[0]?.trim();
    if (resDate !== searchDate) return;

    // C. Lógica de Rango (Minutos)
    const exInicio = toMinutes(res.start_time);
    const exFin = toMinutes(res.end_time);

    // REGLA DE ORO: Se cruzan si el nuevo inicio es antes del fin existente
    // Y el nuevo fin es después del inicio existente
    const seCruzan = nInicioBuscado < exFin && nFinBuscado > exInicio;

    if (seCruzan) {
      const rawIds = res.table_ids || "";
      const ids = String(rawIds).split(',')
        .map(id => parseInt(id.trim(), 10))
        .filter(id => !isNaN(id));
      occupied.push(...ids);
    }
  });

  const finalIds = [...new Set(occupied)];
  return finalIds;
},

  /**
   * Envía la reserva a Google Sheets
   */
  async sendReservation(reservationData: BookingPayload): Promise<boolean> {
    try {
      const response =await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(reservationData),
      })
      if (!response.ok) return false;

    const result = await response.json();

    // Si el Apps Script devuelve {result: "error"}, retornamos false
    if (result.result === 'error') {
      console.error('Error reportado por Sheets:', result.error);
      return false;
    }
      // Con no-cors no podemos leer la respuesta, si no hay error asumimos éxito
      return result.result === 'success';
    } catch (error) {
      console.error('Error al enviar reserva:', error)
      return false
    }
  },
}
