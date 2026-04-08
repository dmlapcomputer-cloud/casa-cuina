import type { Items } from '@/services/Events/itemServices'
import type { MenuItemPayload } from './Linktree/Booking-interfaceRequest';
export interface FormValues {
  guests: number;
  date: string | null;
  time: string | null;
  customer: {
    name: string;
    phone: string;
    note?: string;
  };
  items: Items[];
  menu_items?: MenuItemPayload[]
}
