import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Convert image URL to base64 for embedding in PDF
async function imageUrlToBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.log("[v0] Error converting image to base64:", error)
    return ""
  }
}

export const generateQuotationPDF = async (quotation: any) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 12

  // ===== HEADER =====
  const logoSize = 22
  const companyInfoStartY = 20

  if (quotation.logo_url) {
    try {
      const logoFileName = quotation.logo_url.split("/").pop()
      const clientLogoUrl = `https://api.princessjaideeenterprises.com/api/storage/app/public/quotations/logos/${logoFileName}`

      const logoBase64 = await imageUrlToBase64(clientLogoUrl)
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, companyInfoStartY, logoSize, logoSize)
      }
    } catch (e) {}
  }

  try {
    const jdLogo = await imageUrlToBase64("/princessjd.png")
    if (jdLogo) {
      doc.addImage(jdLogo, "PNG", pageWidth - 15 - logoSize, companyInfoStartY, logoSize, logoSize)
    }
  } catch (e) {}

  yPosition = companyInfoStartY

  doc.setFontSize(14)
  doc.setFont(undefined, "bold")
  doc.text("PRINCESS JAIDEE ENTERPRISES", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 6
  doc.setFontSize(8)
  doc.setFont(undefined, "normal")
  doc.text("A.B. Fajardo Bldg., Calle Nueva St., Brgy. Polvorista, Sorsogon City", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 10

  doc.setLineWidth(0.8)
  doc.line(10, yPosition, pageWidth - 10, yPosition)

  yPosition += 8

  doc.setFontSize(13)
  doc.setFont(undefined, "bold")
  doc.text("STATEMENT OF ACCOUNT", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 12

  // ===== CLIENT DETAILS =====
  const leftColX = 15
  const rightColX = 130

  const clientName =
    quotation.customer?.bill_to_name ||
    quotation.customer?.name ||
    quotation.client_name ||
    "N/A"

  const contactNumber =
    quotation.customer?.bill_to_phone ||
    quotation.customer?.contact_number ||
    quotation.customer?.phone ||
    "N/A"

  doc.setFontSize(9)
  doc.setFont(undefined, "bold")

  doc.text("Team Name:", leftColX, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.business_name || "N/A", leftColX + 25, yPosition)

  yPosition += 5

  doc.setFont(undefined, "bold")
  doc.text("Client Name:", leftColX, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(clientName, leftColX + 25, yPosition)

  doc.setFont(undefined, "bold")
  doc.text("Date:", rightColX, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(
    new Date(quotation.created_at).toLocaleDateString(),
    rightColX + 15,
    yPosition
  )

  yPosition += 10

  // ===== PROJECT TABLE =====
  const items = quotation.items || []
  const tableData: any[] = []
  let subtotalCalc = 0

  items.forEach((item: any) => {
    const qty = Number(item.quantity || 0)
    const price = Number(item.unit_price || 0)
    const total = qty * price

    subtotalCalc += total

    tableData.push([
      item.service?.name || item.name || "Service",
      qty,
      price.toFixed(2),
      total.toFixed(2),
    ])
  })

  autoTable(doc, {
    head: [["PROJECT TYPE", "QTY", "UNIT PRICE", "PRICE"]],
    body: tableData,
    startY: yPosition,
    theme: "grid",
    headStyles: {
      fillColor: [139, 69, 19],
      textColor: 255,
      fontStyle: "bold",
    },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 4

  // ======================================================
  // ✅ FIXED SUMMARY (NOW RIGHT UNDER PROJECT TABLE)
  // ======================================================

  const total = Number(
    quotation.total ?? quotation.subtotal ?? subtotalCalc ?? 0
  )

  const downPayment = Number(quotation.down_payment ?? 0)
  const balance = total - downPayment

  const rightX = pageWidth - 10
  const labelX = pageWidth - 80

  const fmt = (v: number) =>
    v.toLocaleString("en-PH", { minimumFractionDigits: 2 })

  doc.setFontSize(10)

  // TOTAL
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19)
  doc.text("TOTAL PROJECT COST:", labelX, yPosition)
  doc.setTextColor(0, 0, 0)
  doc.text(fmt(total), rightX, yPosition, { align: "right" })

  yPosition += 6

  // DOWN PAYMENT
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19)

  doc.setFillColor(255, 255, 0)
  doc.rect(labelX - 5, yPosition - 3.5, 80, 6, "F")

  doc.text("DOWN PAYMENT:", labelX, yPosition)
  doc.setTextColor(0, 0, 0)
  doc.text(fmt(downPayment), rightX, yPosition, { align: "right" })

  yPosition += 6

  // BALANCE
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19)
  doc.text("BALANCE:", labelX, yPosition)

  doc.setTextColor(0, 0, 0)
  doc.text(fmt(balance), rightX, yPosition, { align: "right" })

  yPosition += 12

  // ===== DISCLAIMER =====
  doc.setFontSize(7)
  doc.text(
    "If you have any questions concerning this quotation, just contact and email us.",
    pageWidth / 2,
    yPosition,
    { align: "center" }
  )

  yPosition += 12

  // ===== SIGNATURE =====
  const signatureX = pageWidth / 2 + 50

  try {
    const sig = await imageUrlToBase64("/jhonie_signature.png")
    if (sig) {
      doc.addImage(sig, "PNG", signatureX - 20, yPosition, 40, 20)
    }
  } catch (e) {}

  yPosition += 25

  doc.setFontSize(9)
  doc.text("JHONIE DETERA", signatureX, yPosition, { align: "center" })
  yPosition += 5
  doc.setFontSize(8)
  doc.text("Owner", signatureX, yPosition, { align: "center" })

  // ===== SAVE =====
  const fileName = `Quotation_${
    quotation.quotation_number
  }_${new Date().toISOString().split("T")[0]}.pdf`

  doc.save(fileName)
}