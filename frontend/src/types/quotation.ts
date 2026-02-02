export interface QuotationItem {
  id: string
  serviceId: number
  serviceName: string
  quantity: number
  unitPrice: number
  lineTotal: number
  designFileUrl?: string
  teamRoster?: Array<{
    name: string
    position: string
    size?: string
  }>
  sizeSpecifications?: {
    top?: string
    bottom?: string
  }
}

export interface TeamMember {
  name: string
  position: string
  size?: string
}

export interface SizeSpecs {
  top?: string
  bottom?: string
}
