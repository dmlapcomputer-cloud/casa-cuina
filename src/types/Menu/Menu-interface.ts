export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Product {
  id: number;
  category_id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  price_ofert: number | null;
  image_url: string; // El servidor usa image_url
  images_json: string[] | null;
  category: Category; // El servidor envía un objeto, no un string
  created_at: string;
  updated_at: string;
  min_prep_hours: number;
}
export interface MenuApiResponse {
  data: Product[]; // Aquí es donde viven los 297 productos
}
