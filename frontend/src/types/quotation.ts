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
