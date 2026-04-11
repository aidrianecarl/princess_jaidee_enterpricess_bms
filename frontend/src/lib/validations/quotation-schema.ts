import { z } from 'zod'

export const quotationItemSchema = z.object({
  serviceId: z.number().min(1, 'Service is required'),
  serviceName: z.string().min(1, 'Service name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().min(0, 'Unit price must be 0 or greater'),
  lineTotal: z.number().min(0, 'Line total must be 0 or greater'),
  designFileUrl: z.string().optional().nullable(),
  teamRoster: z.array(z.object({
    name: z.string(),
    number: z.union([z.string(), z.number()]),
    size: z.string().optional(),
    pricePerPlayer: z.number().min(0, 'Price per player must be 0 or greater').optional(),
  })).optional().nullable(),
  sizeSpecifications: z.object({
    top: z.string().optional(),
    bottom: z.string().optional(),
  }).optional().nullable(),
  notes: z.string().optional().nullable(),
})

export const pricingSchema = z.object({
  itemPrice: z.number().min(0, 'Price must be 0 or greater'),
  pricePerPlayer: z.number().min(0, 'Price per player must be 0 or greater').optional(),
})

export const quotationFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required').optional().or(z.literal('')),
  clientEmail: z.string().email('Invalid email address').optional().or(z.literal('')),
  clientPhone: z.string().min(1, 'Phone number is required').optional().or(z.literal('')),
  clientAddress: z.string().min(1, 'Address is required').optional().or(z.literal('')),
  clientCity: z.string().min(1, 'City is required').optional().or(z.literal('')),
  clientState: z.string().optional(),
  clientPostal: z.string().optional(),
  businessName: z.string().min(1, 'Business name is required').optional().or(z.literal('')),
  businessAddress: z.string().min(1, 'Business address is required').optional().or(z.literal('')),
  businessCity: z.string().min(1, 'Business city is required').optional().or(z.literal('')),
  businessState: z.string().optional(),
  businessPostal: z.string().optional(),
  businessPhone: z.string().optional(),
  businessEmail: z.string().email('Invalid business email').optional(),
  items: z.array(quotationItemSchema).min(1, 'At least one item is required'),
  discount: z.number().min(0, 'Discount must be 0 or greater').optional().default(0),
  notes: z.string().optional(),
  validUntil: z.string().optional(),
  status: z.enum(['draft', 'pending']).default('draft'),
})

export type QuotationFormData = z.infer<typeof quotationFormSchema>
export type QuotationItemData = z.infer<typeof quotationItemSchema>
