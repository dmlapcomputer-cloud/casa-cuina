export interface EventType {
  id: number;
  type: string;
  exception_status: boolean; // Cambia de boolean a esto
  start_time: string | null;
  end_time: string | null;
  starting_quantity: string;
  ending_quantity: string;
}
