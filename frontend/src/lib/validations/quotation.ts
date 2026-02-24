import { z } from "zod"

export const quotationLineItemSchema = z.object({
  type: z.enum(["product", "service"], {
    message: "Item type must be either 'product' or 'service'",
  }),
  name: z.string().min(1, "Item name is required").max(255, "Item name is too long"),
  description: z.string().optional(),
  quantity: z
    .number()
    .int("Quantity must be a whole number")
    .min(1, "Quantity must be at least 1")
    .max(10000, "Quantity is too large"),
  unitPrice: z.number().min(0, "Unit price cannot be negative").max(1000000, "Unit price is too large"),
})

export const quotationFormSchema = z
  .object({
    // Client Information
    clientName: z.string().min(1, "Client name is required").max(255, "Client name is too long"),
    clientEmail: z.string().email("Invalid email address").min(1, "Email is required"),
    clientPhone: z.string().min(1, "Phone number is required").max(20, "Phone number is too long"),
    clientAddress: z.string().min(1, "Address is required").max(500, "Address is too long"),
    clientCity: z.string().min(1, "City is required").max(100, "City is too long"),
    clientState: z.string().min(1, "State/Province is required").max(100, "State is too long"),
    clientPostal: z.string().min(1, "Postal code is required").max(20, "Postal code is too long"),

    // Business Information
    businessName: z.string().min(1, "Business name is required").max(255, "Business name is too long"),
    businessAddress: z.string().min(1, "Business address is required").max(500, "Business address is too long"),
    businessCity: z.string().min(1, "Business city is required").max(100, "Business city is too long"),
    businessState: z.string().min(1, "Business state is required").max(100, "Business state is too long"),
    businessPostal: z.string().min(1, "Business postal code is required").max(20, "Business postal code is too long"),
    businessPhone: z.string().min(1, "Business phone is required").max(20, "Business phone is too long"),
    businessEmail: z.string().email("Invalid business email").min(1, "Business email is required"),

    // Quotation Details
    quoteNumber: z.string().min(1, "Quote number is required"),
    quoteDate: z.string().min(1, "Quote date is required"),
    validUntil: z.string().min(1, "Valid until date is required"), // Updated from dueDate to validUntil

    // Line Items
    lineItems: z.array(quotationLineItemSchema).min(1, "At least one item is required").max(100, "Too many items"),
  })
  .refine(
    (data) => {
      const quoteDate = new Date(data.quoteDate)
      const validUntil = new Date(data.validUntil)
      return validUntil >= quoteDate
    },
    {
      message: "Valid until date must be on or after quote date",
      path: ["validUntil"],
    },
  )

export type QuotationFormData = z.infer<typeof quotationFormSchema>
export type LineItemData = z.infer<typeof quotationLineItemSchema>
