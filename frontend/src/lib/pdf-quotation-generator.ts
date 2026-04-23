import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Convert image URL to base64 for embedding in PDF
async function imageUrlToBase64(imageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.log("[v0] Error converting image to base64:", error)
    return null
  }
}

export async function generateQuotationPDF(quotation: any) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 15

  // ===== HEADER SECTION =====
  // Left: Client Logo
  if (quotation.client_logo) {
    try {
      const clientLogoBase64 = await imageUrlToBase64(quotation.client_logo)
      if (clientLogoBase64) {
        doc.addImage(clientLogoBase64, "PNG", 15, yPosition, 25, 25)
      }
    } catch (error) {
      console.log("[v0] Error loading client logo:", error)
    }
  }

  // Right: Company Info (Princess Jaidee)
  doc.setFontSize(8)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("PRINCESS JAIDEE ENTERPRISES", pageWidth - 15, yPosition, { align: "right" })

  doc.setFontSize(7)
  doc.setFont(undefined, "normal")
  doc.text("A.B. Fajardo Bldg., Calle Nueva St.,", pageWidth - 15, yPosition + 4, { align: "right" })
  doc.text("Brgy. Polvorista, Sorsogon City", pageWidth - 15, yPosition + 7, { align: "right" })
  doc.text("0930 821 8871 / 0915 175 9881", pageWidth - 15, yPosition + 10, { align: "right" })
  doc.text("(056) 311 8663", pageWidth - 15, yPosition + 13, { align: "right" })
  doc.text("piesorsogonsportswear@gmail.com", pageWidth - 15, yPosition + 16, { align: "right" })

  yPosition += 35

  // ===== TITLE =====
  doc.setFontSize(16)
  doc.setFont(undefined, "bold")
  doc.setTextColor(220, 20, 60) // Red
  doc.text("REQUEST FOR QUOTATION", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 12

  // ===== CLIENT INFO SECTION =====
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("CLIENT INFORMATION", 15, yPosition)

  yPosition += 6

  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.text("Business Name:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.customer?.business_name || quotation.customer?.company_name || "N/A", 50, yPosition)

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Contact Person:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.customer?.bill_to_name || quotation.customer?.name || "N/A", 50, yPosition)

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Address:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.customer?.bill_to_address || quotation.customer?.address || "N/A", 50, yPosition)

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Email:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.customer?.email || "N/A", 50, yPosition)

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Phone:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.customer?.bill_to_phone || quotation.customer?.phone || "N/A", 50, yPosition)

  yPosition += 8

  // ===== QUOTATION DETAILS =====
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.text("QUOTATION DETAILS", 15, yPosition)

  yPosition += 6

  const detailsLeftX = 15
  const detailsRightX = 120

  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.text("Quotation No.:", detailsLeftX, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.quotation_number || quotation.id?.toString() || "N/A", detailsRightX, yPosition)

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Date:", detailsLeftX, yPosition)
  doc.setFont(undefined, "normal")
  const quotationDate = new Date(quotation.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  doc.text(quotationDate, detailsRightX, yPosition)

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Valid Until:", detailsLeftX, yPosition)
  doc.setFont(undefined, "normal")
  const validUntil = new Date(quotation.created_at)
  validUntil.setDate(validUntil.getDate() + 30)
  doc.text(validUntil.toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" }), detailsRightX, yPosition)

  yPosition += 10

  // ===== QUOTATION ITEMS TABLE =====
  const items = Array.isArray(quotation.quotation_items) ? quotation.quotation_items : []
  const tableData: any[] = [["Item Description", "Qty", "Unit Price", "Amount"]]

  let subtotalAmount = 0

  if (items && Array.isArray(items)) {
    items.forEach((item: any) => {
    const quantity = item.quantity || 0
    const unitPrice = parseFloat(item.unit_price || 0)
    const amount = quantity * unitPrice
    subtotalAmount += amount

    const description = item.description || item.service?.name || "Item"
    tableData.push([
      description,
      quantity.toString(),
      `₱${unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`,
      `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}`,
    ])
  }
  }

  autoTable(doc, {
    head: [tableData[0]],
    body: tableData.slice(1),
    startY: yPosition,
    margin: { left: 15, right: 15 },
    headStyles: {
      fillColor: [220, 20, 60], // Red
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "center",
    },
    bodyStyles: {
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "left" },
      1: { halign: "center" },
      2: { halign: "right" },
      3: { halign: "right" },
    },
    didDrawPage: () => {},
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // ===== FINANCIAL SUMMARY =====
  const summaryRightX = pageWidth - 15
  const summaryLabelX = pageWidth - 60

  doc.setFontSize(9)
  doc.setFont(undefined, "normal")
  doc.setTextColor(0, 0, 0)

  doc.text("Sub Total:", summaryLabelX, yPosition, { align: "left" })
  doc.text(subtotalAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 }), summaryRightX, yPosition, { align: "right" })

  yPosition += 6

  // Add design consultation if exists
  let designConsultationTotal = 0
  if (Array.isArray(quotation.quotation_items)) {
    quotation.quotation_items.forEach((item: any) => {
    let consultation = item.design_consultation
    if (typeof consultation === 'string') {
      try {
        consultation = JSON.parse(consultation)
      } catch (e) {
        consultation = null
      }
    }
    if (consultation && typeof consultation === "object") {
      const consultationPrice = Number(consultation.price) || 0
      designConsultationTotal += consultationPrice
    }
  }
  }

  if (designConsultationTotal > 0) {
    doc.text("Design Consultation:", summaryLabelX, yPosition, { align: "left" })
    doc.text(designConsultationTotal.toLocaleString("en-PH", { minimumFractionDigits: 0 }), summaryRightX, yPosition, { align: "right" })
    yPosition += 6
  }

  // Total
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.setTextColor(220, 20, 60) // Red
  const total = subtotalAmount + designConsultationTotal
  doc.text("TOTAL QUOTATION:", summaryLabelX, yPosition, { align: "left" })
  doc.setTextColor(0, 0, 0)
  doc.text(total.toLocaleString("en-PH", { minimumFractionDigits: 0 }), summaryRightX, yPosition, { align: "right" })

  yPosition += 15

  // ===== NOTES SECTION =====
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("NOTES:", 15, yPosition)

  yPosition += 5
  doc.setFontSize(8)
  doc.setFont(undefined, "normal")
  doc.text("1. This quotation is valid for 30 days from the date above.", 15, yPosition)
  yPosition += 4
  doc.text("2. Payment terms: 50% down payment, 50% upon delivery.", 15, yPosition)
  yPosition += 4
  doc.text("3. Prices are subject to change without notice.", 15, yPosition)

  yPosition += 12

  // ===== SIGNATURE SECTION =====
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)

  // Signature line
  const signatureY = yPosition
  doc.line(15, signatureY + 8, 55, signatureY + 8)
  doc.text("Authorized Representative", 15, signatureY + 10)

  // Admin name
  doc.setFont(undefined, "normal")
  doc.setFontSize(8)
  doc.text(quotation.admin_name || "Princess Jaidee Enterprises", 15, signatureY + 15)

  // Date
  const signatureDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "2-digit", day: "2-digit" })
  doc.text(`Date: ${signatureDate}`, pageWidth - 55, signatureY + 10)

  // ===== FOOTER =====
  doc.setFontSize(7)
  doc.setTextColor(128, 128, 128)
  doc.text(
    "This is a quotation only and does not constitute a binding contract. Please contact us to confirm and place your order.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  )

  // Save PDF
  doc.save(`Quotation_${quotation.quotation_number || quotation.id}.pdf`)
}
