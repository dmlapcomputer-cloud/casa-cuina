export interface Reservation {
  id?: number
  name: string
  people: number
  date: string // YYYY-MM-DD
  starttime: string // HH:mm
  endtime: string // HH:mm
  eventType: number | null
  phone: string
  note?: string
  tableId: number
  createdAt?: string
}

export interface BookingPayload extends Reservation {
  // Campos exactos de tu tabla SQL (Imagen de PHPMyAdmin)
  restaurant_id: number
  customer_name: string
  customer_phone: string
  party_size: number
  start_time: string
  end_time: string
  reservation_type: number | null

  // Campos para la tabla intermedia
  table_ids: number[]
  arealocation?: string
  table_detail?: TableDetail[]
  codigo: string
  [key: string]: string | number | null | undefined | number[] | TableDetail[];
  status: 'confirmada' | 'finalizada' | 'cancelada';
}

interface TableDetail {
  name: string
  tables: number[]
}
