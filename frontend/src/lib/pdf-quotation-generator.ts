import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Convert image URL to base64
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
    console.log("[v0] Error converting image:", error)
    return ""
  }
}

export const generateQuotationPDF = async (quotation: any) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [216, 330], // Long bond
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  let yPosition = 10

  // ================= HEADER =================
  const logoSize = 22

  // LEFT: Client Logo
  if (quotation.logo_url) {
    try {
      const clientLogo = await imageUrlToBase64(quotation.logo_url)
      if (clientLogo) {
        doc.addImage(clientLogo, "PNG", 15, yPosition, logoSize, logoSize)
      }
    } catch (e) {
      console.log("[v0] Client logo error", e)
    }
  }

  // RIGHT: Company Logo
  try {
    const companyLogo = await imageUrlToBase64("/princessjd.png")
    if (companyLogo) {
      doc.addImage(companyLogo, "PNG", pageWidth - 15 - logoSize, yPosition, logoSize, logoSize)
    }
  } catch (e) {
    console.log("[v0] Company logo error", e)
  }

  // CENTER TEXT


  doc.setFont(undefined, "bold")
  doc.setFontSize(10)
  doc.text(
    quotation.business_name || "PRINCESS JAIDEE ENTERPRISES",
    pageWidth / 2,
    yPosition + 17,
    { align: "center" }
  )

  doc.setFont(undefined, "normal")
  doc.setFontSize(8)
  doc.text(
    quotation.business_address || "A.B. Fajardo Bldg., Calle Nueva St., Brgy. Polvorista, Sorsogon City",
    pageWidth / 2,
    yPosition + 21,
    { align: "center" }
  )

  doc.text(
    quotation.business_city || "Sorsogon City",
    pageWidth / 2,
    yPosition + 25,
    { align: "center" }
  )

  yPosition += logoSize + 12

  // ================= TITLE =================
  doc.setFontSize(14)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 102, 153)
  
  // Blue banner rectangle
  doc.setDrawColor(0, 150, 200)
  doc.setFillColor(0, 150, 200)
  doc.rect(15, yPosition - 3, pageWidth - 30, 8, "F")
  
  doc.setTextColor(255, 255, 255)
  doc.text("REQUEST FOR QUOTATION", pageWidth / 2, yPosition + 2, { align: "center" })

  yPosition += 12

  // ================= META =================
  doc.setFontSize(9)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, "bold")

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })

  doc.text(`Date: ${today}`, pageWidth - 60, yPosition)
  doc.text(`Quotation No: ${quotation.quotation_number || quotation.id || "N/A"}`, pageWidth - 60, yPosition + 5)

  yPosition += 12

  // ================= SUPPLIER INFO =================
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.text("Supplier Name: Princess Jaidee Enterprises", 15, yPosition)
  doc.setFont(undefined, "normal")

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Address: A.B. Fajardo Bldg., Calle Nueva St., Brgy. Polvorista, Sorsogon City", 15, yPosition)
  doc.setFont(undefined, "normal")



  yPosition += 10

  // ================= INSTRUCTION =================
  doc.setFontSize(8)
  doc.setFont(undefined, "normal")
  const instruction = "Please quote your lowest price on the items/listed below, subject to the General Conditions on the last page."
  doc.text(instruction, 15, yPosition, { maxWidth: pageWidth - 30 })

  yPosition += 8

  // ================= TABLE =================
  const items = quotation.items || quotation.quotation_items || []

  const tableData = items.map((item: any, index: number) => [
    index + 1,
    "piece",
    item.service?.name || item.name || "Service",
    item.quantity || 1,
    Number(item.unit_price || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
    Number(item.line_total || (item.quantity || 1) * (item.unit_price || 0)).toLocaleString("en-PH", { minimumFractionDigits: 2 }),
  ])

  autoTable(doc, {
    head: [["ITEM NO.", "UNIT", "DESCRIPTION", "QUANTITY", "UNIT PRICE", "TOTAL AMOUNT"]],
    body: tableData,
    startY: yPosition,
    margin: { left: 15, right: 15 },
    
    styles: {
      fontSize: 8,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.3,
    },

    headStyles: {
      fillColor: [200, 200, 200],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
      lineWidth: 0.5,
    },

    bodyStyles: {
      textColor: [0, 0, 0],
    },

    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "left" },
      3: { halign: "center", cellWidth: 25 },
      4: { halign: "right", cellWidth: 30 },
      5: { halign: "right", cellWidth: 30 },
    },

    didDrawPage: function () {
      // This is called after the table is drawn
    },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // ================= TOTAL =================
  let totalAmount = 0
  items.forEach((item: any) => {
    totalAmount += Number(item.line_total || (item.quantity || 1) * (item.unit_price || 0))
  })

  // Add design consultation if exists
  let designConsultationTotal = 0
  if (Array.isArray(quotation.items)) {
    quotation.items.forEach((item: any) => {
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
    })
  }

  totalAmount += designConsultationTotal

  const totalLabelX = pageWidth - 65
  const totalValueX = pageWidth - 15

  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("TOTAL:", totalLabelX, yPosition, { align: "left" })
  doc.text(totalAmount.toLocaleString("en-PH", { minimumFractionDigits: 2 }), totalValueX, yPosition, { align: "right" })

  yPosition += 12

  // ================= TERMS & CONDITIONS =================
  doc.setFontSize(7)
  doc.setFont(undefined, "bold")
  doc.text("Note:", 15, yPosition)

  yPosition += 4
  doc.setFont(undefined, "normal")
  doc.text("1. All entries must be Type written", 20, yPosition)
  yPosition += 3
  doc.text("2. Delivery period within ten (10) calendar days", 20, yPosition)
  yPosition += 3
  doc.text("3. Warranty period shall be for a period of six (6) months for Supplies & Materials, One (1) year for", 20, yPosition)
  yPosition += 3
  doc.text("    equipment, from the date of acceptance by the procuring entity", 20, yPosition)
  yPosition += 3
  doc.text("4. Price validity shall be for a period of Thirty (30) calendar days", 20, yPosition)
  yPosition += 3
  doc.text("5. D-EPS Registration certificate shall be attached upon submission of the quotation", 20, yPosition)
  yPosition += 3
  doc.text("6. Bidders shall submit original brochures showing certification of the product being offered", 20, yPosition)

  yPosition += 10

  // ================= SIGNATURE SECTION =================
  doc.setFontSize(8)
  doc.setFont(undefined, "normal")
  
  doc.text("_________________________", 15, yPosition)
  doc.text("Printed Name over Signature", 15, yPosition + 4)

  doc.text("_________________________", pageWidth - 60, yPosition)
  doc.text("Tel. No. /Cellphone No./Email Address", pageWidth - 60, yPosition + 4)

  yPosition += 10
  doc.text("Date: _________________", pageWidth - 60, yPosition)

  // Save PDF
  const fileName = `RFQ_${quotation.quotation_number || quotation.id || "draft"}.pdf`
  doc.save(fileName)
}
