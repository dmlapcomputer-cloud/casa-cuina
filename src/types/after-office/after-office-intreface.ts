import type { UnifiedItemPayload } from "../Item_reservation_buffet_after/UnifiedItemPayload";
import type { CakeOrder } from "../Linktree/Booking-interfaceRequest";

export interface IAfterOffice {
  codigo?: string,
  guest_count: string,
  after_date: string,
  after_time: string,
  customer_name: string,
  phone_number: string,
  notes: string,
  status: string,
  in_person: boolean,
  items: UnifiedItemPayload[];
  form_origin: string,
  location_place: string;
  cake_order?: CakeOrder | null;
}

