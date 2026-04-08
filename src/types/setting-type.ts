// src/types/Settings/Settings.ts
export interface SystemSettings {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  start_time: string;
  end_time: string;
  days_open: string;

  // WhatsApp config
  whatsapp_notify: string;
  whatsapp_enabled: boolean;
  whatsapp_message: string;

  // Branding
  logo: string;
  favicon: string;
  background_form: string;

  // Social Media
  facebook_url: string | null;
  instagram_url: string | null;
  twitter_url: string | null;

  // App Config
  tax_percentage: string;
  precio_adulto: string;
  precio_nino: string;
  qr_code: string | null;
  qr_expiration_date: string | null;

  latitude: string;  // Viene en el JSON como "-16.50970000"
  longitude: string; // Viene en el JSON como "-68.12220000"
  
  // Custom Messages
  message_reserva_cliente: string;
  message_evento_cliente: string;
  message_brunch_cliente: string;
  min_booking_advance: number;
  private_events_rules: PrivateEventRule[];
  max_capacity: number;

  days_open_week: string[];
  brunch_schedule?: { day: string; start: string; end: string };
  after_schedule?: { day: string; start: string; end: string };
  special_closures?: { date: string; reason: string }[];

  //en mantenimiento
  maintenance_mode: boolean;
  maintenance_message: string;
}
export interface PrivateEventRule {
  days: string[];
  start: string;
  end: string;
  min_people: number;
}

export type ScheduleCategory = 'BRUNCH' | 'AFTER' | 'REGULAR';
