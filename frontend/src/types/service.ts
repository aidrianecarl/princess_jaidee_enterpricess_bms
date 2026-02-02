export interface Service {
  id: number
  name: string
  description?: string
  category?: string
  base_price: number
  specifications?: Record<string, string> | null
  image_url?: string
  status: "active" | "inactive"
  requires_design: boolean
  requires_team: boolean
  requires_size: boolean
  created_at: string
  created_by?: number
}

export interface ServiceRequirements {
  requires_design: boolean
  requires_team: boolean
  requires_size: boolean
}
