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
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 12

  // ===== HEADER SECTION =====
  // Left: Company Info
  doc.setFontSize(14)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("PRINCESS JAIDEE ENTERPRISES", 15, yPosition)

  yPosition += 6
  doc.setFontSize(8)
  doc.setFont(undefined, "normal")
  doc.text("A.B. Fajardo Bldg., Calle Nueva St., Brgy. Polvorista, Sorsogon City", 15, yPosition)

  yPosition += 4
  doc.text("0930 821 8871 / 0915 175 9881 / (056) 311 8663", 15, yPosition)

  yPosition += 4
  doc.text("Email: piesorsogonsportswear@gmail.com", 15, yPosition)

  // Right: Client Logo
  const logoSize = 22
  const logoY = yPosition - 14
  
  if (quotation.logo_url) {
    try {
      // Extract filename from logo_url
      const logoFileName = quotation.logo_url.split('/').pop()
      const clientLogoUrl = `https://api.princessjaideeenterprises.com/api/storage/app/public/quotations/logos/${logoFileName}`
      
      console.log("[v0] Loading client logo from:", clientLogoUrl)
      const logoBase64 = await imageUrlToBase64(clientLogoUrl)
      
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", pageWidth - 15 - logoSize, logoY, logoSize, logoSize)
        console.log("[v0] Client logo loaded successfully")
      } else {
        console.log("[v0] Failed to convert logo to base64")
      }
    } catch (error) {
      console.log("[v0] Error loading client logo:", error)
    }
  }

  yPosition += 12

  // Horizontal line separator
  doc.setDrawColor(0, 0, 0)
  doc.setLineWidth(0.8)
  doc.line(10, yPosition, pageWidth - 10, yPosition)

  yPosition += 6

  // TITLE
  doc.setFontSize(13)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("STATEMENT OF ACCOUNT", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 12

  // ===== CLIENT DETAILS SECTION =====
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)

  const leftColX = 15
  const rightColX = 130

  doc.text("Team Name:", leftColX, yPosition)
  yPosition += 5

  doc.text("Client Name:", leftColX, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.customer?.name || "N/A", leftColX + 25, yPosition)
  
  doc.setFont(undefined, "bold")
  doc.text("Date:", rightColX, yPosition)
  doc.setFont(undefined, "normal")
  const currentDate = new Date(quotation.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
  doc.text(currentDate, rightColX + 15, yPosition)

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Address:", leftColX, yPosition)
  doc.setFont(undefined, "normal")
  const address = quotation.customer?.bill_to_city || quotation.customer?.city || "N/A"
  doc.text(address, leftColX + 25, yPosition)

  yPosition += 5
  doc.setFont(undefined, "bold")
  doc.text("Contact No. :", leftColX, yPosition)

  yPosition += 10

  // ===== PROJECT DETAILS TABLE =====
  const items = quotation.items || []
  const projectTableData: any[] = []

  items.forEach((item: any) => {
    const quantity = item.quantity || 0
    const unitPrice = parseFloat(item.unit_price || 0)
    const totalPrice = quantity * unitPrice

    projectTableData.push([
      item.service?.name || item.name || "Service",
      quantity.toString(),
      unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
      totalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 }),
    ])
  })

  // Add empty rows
  projectTableData.push(["", "", "", "0"])
  projectTableData.push(["", "", "", "0"])
  projectTableData.push(["", "", "", "0"])

  // Add subtotal row
  const subtotal = parseFloat(quotation.subtotal || 0)
  projectTableData.push(["", "", "Sub Total:", subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })])

  autoTable(doc, {
    head: [["PROJECT TYPE:", "QTY", "UNIT PRICE", "PRICE"]],
    body: projectTableData,
    startY: yPosition,
    theme: "grid",
    headerStyles: {
      fillColor: [139, 69, 19], // Burgundy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
      valign: "middle",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 70 },
      1: { halign: "center", cellWidth: 18 },
      2: { halign: "center", cellWidth: 30 },
      3: { halign: "right", cellWidth: 28 },
    },
    margin: { left: 10, right: 10 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 5

  // ===== DESCRIPTION / CHARGES TABLE =====
  const chargesTableData = [
    ["Service Fee", ""],
    ["Layout Fee", ""],
    ["Labor and Installation", ""],
    ["Mobilization Fee", ""],
    ["Project", ""],
  ]

  autoTable(doc, {
    head: [["DESCRIPTION", "AMOUNT"]],
    body: chargesTableData,
    startY: yPosition,
    theme: "grid",
    headerStyles: {
      fillColor: [139, 69, 19], // Burgundy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "center",
      valign: "middle",
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [0, 0, 0],
      cellPadding: 2,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 130 },
      1: { halign: "right", cellWidth: 28 },
    },
    margin: { left: 10, right: 10 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 8

  // ===== FINANCIAL SUMMARY =====
  const total = parseFloat(quotation.total || 0)
  const downPayment = parseFloat(quotation.down_payment || 0)
  const balance = total - downPayment

  // TOTAL PROJECT COST
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19) // Burgundy text
  doc.text("TOTAL PROJECT COST:", pageWidth / 2, yPosition, { align: "right" })
  doc.setTextColor(0, 0, 0)
  doc.text(total.toLocaleString("en-PH", { minimumFractionDigits: 0 }), pageWidth - 10, yPosition, { align: "right" })

  yPosition += 6

  // DOWN PAYMENT - Yellow highlight
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19) // Burgundy text
  
  // Yellow background for entire down payment row
  doc.setFillColor(255, 255, 0) // Yellow
  doc.rect(pageWidth / 2 - 5, yPosition - 4, pageWidth / 2 + 3, 6, "F")
  
  doc.text("DOWN PAYMENT:", pageWidth / 2, yPosition, { align: "right" })
  doc.text(downPayment.toLocaleString("en-PH", { minimumFractionDigits: 0 }), pageWidth - 10, yPosition, { align: "right" })

  yPosition += 6

  // BALANCE
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19) // Burgundy text
  doc.text("BALANCE:", pageWidth / 2, yPosition, { align: "right" })
  doc.setTextColor(0, 0, 0)
  doc.text(balance.toLocaleString("en-PH", { minimumFractionDigits: 0 }), pageWidth - 10, yPosition, { align: "right" })

  yPosition += 12

  // ===== DISCLAIMER TEXT =====
  doc.setFontSize(7)
  doc.setFont(undefined, "italic")
  doc.setTextColor(0, 0, 0)
  doc.text("If you have any questions concerning this quotation, just contact and email us.", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 10

  // ===== SIGNATURE SECTION =====
  // Signature line
  doc.setLineWidth(0.5)
  doc.line(pageWidth / 2 + 30, yPosition, pageWidth - 15, yPosition)

  yPosition += 8

  // Signature name and title
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("JHONIE DETERA", pageWidth / 2 + 50, yPosition, { align: "center" })

  yPosition += 5
  doc.setFont(undefined, "normal")
  doc.setFontSize(8)
  doc.text("Owner", pageWidth / 2 + 50, yPosition, { align: "center" })

  yPosition += 12

  // ===== SERVICES OFFERED SECTION =====
  doc.setFontSize(8)
  doc.setFont(undefined, "normal")
  doc.setTextColor(0, 0, 0)
  doc.text("Services offered:", 15, yPosition)

  yPosition += 4
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19) // Burgundy
  doc.text("FULL SUBLIMATION JERSEY", 15, yPosition)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, "normal")
  doc.text("*CUSTOMIZED POLO SHIRT", pageWidth / 2, yPosition)

  yPosition += 4
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19)
  doc.text("PVC ID AND LANYARDS", 15, yPosition)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, "normal")
  doc.text("LARGE FORMAT PRINTING", pageWidth / 2, yPosition)

  // Generate PDF
  const fileName = `Quotation_${quotation.quotation_number}_${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
