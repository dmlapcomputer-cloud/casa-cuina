// Lo que usa el componente PortalCard y tu App
export interface PortalChildItem {
  id: number;
  title: string;
  icon: string;
  url: string;
  is_external: boolean;
}

export interface PortalItem {
  id: number;
  title: string;
  subtitle?: string;
  icon: string;
  url: string;
  variant: 'black' | 'light';
  order: number;
  to?: string;      // Para Vue Router
  href?: string;    // Para Enlaces Externos
  type?: boolean;   // Lo que el componente usa como is-external
  is_active: boolean;
  is_external: boolean; // Nombre limpio
  use_form: boolean;
  use_list: boolean;
  children: PortalChildItem[];
}

// Lo que viene exactamente de la base de datos (JSON)
export interface RawPortalItem {
  id: number;
  title: string;
  subtitle?: string;
  icon: string | null;
  url: string;
  variant: 'black' | 'light';
  order: number;
  is_active: boolean;
  type: boolean | number; // Aquí está el campo que daba problemas
  use_form: boolean;
  use_list: boolean;
  children?: PortalChildItem[];
}
