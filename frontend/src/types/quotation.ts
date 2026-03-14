export interface QuotationItemNotes {
  designNotes?: string
  teamRosterNotes?: string
  sizeNotes?: string
  jerseyCustomizationNotes?: string
  additionalNotes?: string
  customNotes?: Record<string, string>
}

export interface QuotationItem {
  id: string
  serviceId: number
  serviceDescription?: string
  serviceName: string
  quantity: number
  unitPrice: number
  lineTotal: number
  designFileUrl?: string
  teamRoster?: Array<{
    name: string
    number: string | number
    size?: string
  }>
  sizeSpecifications?: {
    top?: string
    bottom?: string
  }
  notes?: string | QuotationItemNotes
  serviceRequirements?: {
    designImageUrl?: string
    designPreview?: string
    teamRoster?: Array<{
      name: string
      number: string | number
      sizeTop?: string
      sizeBottom?: string
    }>
    sizeSpecifications?: {
      top?: string
      bottom?: string
      width?: number
      height?: number
      totalSqft?: number
      totalPrice?: number
    }
  }
}

export interface TeamMember {
  name: string
  number: string | number
  size?: string
}

export interface SizeSpecs {
  top?: string
  bottom?: string
}
