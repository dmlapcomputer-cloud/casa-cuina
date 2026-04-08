export interface IExperienceOption {
  id: number
  name: string
  description: null
  location_details: null
  booking_charge: string
  currency: string
  min_people: string
  max_people: string
  opening_hours_json: OpeningHoursJSON[]
  slot_interval_hours: string
  duration_minutes: string
  min_lead_hours: string
  main_image: string
  gallery_images: string[]
  is_active: boolean
  is_premium: boolean
  created_at: Date
  updated_at: Date
}
export interface OpeningHoursJSON {
  start: string
  end: string
}

export interface IApiResponse{
  data: IExperienceOption[];
}
