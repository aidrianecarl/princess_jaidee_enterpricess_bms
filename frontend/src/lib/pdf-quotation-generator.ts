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

  // Company Info
  doc.setFontSize(8)
  doc.setFont(undefined, "bold")
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
  doc.setTextColor(220, 20, 60)
  doc.text("REQUEST FOR QUOTATION", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 12

  // ===== CLIENT INFO =====
  doc.setFontSize(10)
  doc.text("CLIENT INFORMATION", 15, yPosition)

  yPosition += 6

  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.text("Business Name:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(
    quotation.customer?.business_name ||
      quotation.customer?.company_name ||
      "N/A",
    50,
    yPosition
  )

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Contact Person:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(
    quotation.customer?.bill_to_name ||
      quotation.customer?.name ||
      "N/A",
    50,
    yPosition
  )

  yPosition += 5
  doc.text("Address:", 15, yPosition)
  doc.text(
    quotation.customer?.bill_to_address ||
      quotation.customer?.address ||
      "N/A",
    50,
    yPosition
  )

  yPosition += 5
  doc.text("Email:", 15, yPosition)
  doc.text(quotation.customer?.email || "N/A", 50, yPosition)

  yPosition += 5
  doc.text("Phone:", 15, yPosition)
  doc.text(
    quotation.customer?.bill_to_phone ||
      quotation.customer?.phone ||
      "N/A",
    50,
    yPosition
  )

  yPosition += 10

  // ===== QUOTATION DETAILS =====
  doc.setFont(undefined, "bold")
  doc.text("QUOTATION DETAILS", 15, yPosition)

  yPosition += 6

  const rightX = 120

  doc.setFont(undefined, "bold")
  doc.text("Quotation No.:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(
    quotation.quotation_number || quotation.id?.toString() || "N/A",
    rightX,
    yPosition
  )

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Date:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(
    new Date(quotation.created_at).toLocaleDateString("en-US"),
    rightX,
    yPosition
  )

  yPosition += 5
  doc.text("Valid Until:", 15, yPosition)
  const validUntil = new Date(quotation.created_at)
  validUntil.setDate(validUntil.getDate() + 30)
  doc.text(validUntil.toLocaleDateString("en-US"), rightX, yPosition)

  yPosition += 10

  // ===== ITEMS TABLE =====
  const items = Array.isArray(quotation.quotation_items)
    ? quotation.quotation_items
    : []

  const tableData: any[] = [["Item Description", "Qty", "Unit Price", "Amount"]]

  let subtotalAmount = 0

  if (items.length > 0) {
    items.forEach((item: any) => {
      const quantity = item.quantity || 0
      const unitPrice = parseFloat(item.unit_price || 0)
      const amount = quantity * unitPrice

      subtotalAmount += amount

      const description = item.description || item.service?.name || "Item"

      tableData.push([
        description,
        quantity.toString(),
        `₱${unitPrice.toLocaleString("en-PH")}`,
        `₱${amount.toLocaleString("en-PH")}`,
      ])
    })
  }

  autoTable(doc, {
    head: [tableData[0]],
    body: tableData.slice(1),
    startY: yPosition,
    margin: { left: 15, right: 15 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // ===== SUMMARY =====
  const rightX = pageWidth - 15
  const labelX = pageWidth - 60

  let designConsultationTotal = 0

  if (Array.isArray(quotation.quotation_items)) {
    quotation.quotation_items.forEach((item: any) => {
      let consultation = item.design_consultation

      if (typeof consultation === "string") {
        try {
          consultation = JSON.parse(consultation)
        } catch {
          consultation = null
        }
      }

      if (consultation?.price) {
        designConsultationTotal += Number(consultation.price) || 0
      }
    })
  }

  doc.text("Sub Total:", labelX, yPosition)
  doc.text(
    subtotalAmount.toLocaleString("en-PH"),
    rightX,
    yPosition,
    { align: "right" }
  )

  yPosition += 6

  if (designConsultationTotal > 0) {
    doc.text("Design Consultation:", labelX, yPosition)
    doc.text(
      designConsultationTotal.toLocaleString("en-PH"),
      rightX,
      yPosition,
      { align: "right" }
    )
    yPosition += 6
  }

  const total = subtotalAmount + designConsultationTotal

  doc.setFont(undefined, "bold")
  doc.text("TOTAL:", labelX, yPosition)
  doc.text(total.toLocaleString("en-PH"), rightX, yPosition, {
    align: "right",
  })

  yPosition += 15

  // ===== FOOTER =====
  doc.setFontSize(7)
  doc.setTextColor(128)

  doc.text(
    "This is a quotation only and not a binding contract.",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  )

  doc.save(`Quotation_${quotation.quotation_number || quotation.id}.pdf`)
}