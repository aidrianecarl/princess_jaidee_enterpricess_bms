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
  let yPosition = 15

  // Header with logos
  const logoSize = 20
  const logoY = yPosition + 5

  // Left logo - Client Logo
  if (quotation.logo_url) {
    try {
      const logoBase64 = await imageUrlToBase64(`/api/proxy?url=${encodeURIComponent(quotation.logo_url)}`)
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, logoY, logoSize, logoSize)
      }
    } catch (error) {
      console.log("[v0] Error loading client logo:", error)
    }
  }

  // Center title
  doc.setFontSize(16)
  doc.setTextColor(139, 69, 19) // Burgundy color
  doc.setFont(undefined, "bold")
  const centerX = pageWidth / 2
  doc.text("REQUEST FOR QUOTATION", centerX, logoY + 8, { align: "center" })

  // Right logo - Princess JD Logo
  try {
    const princessJDBase64 = await imageUrlToBase64("/princessjd.png")
    if (princessJDBase64) {
      doc.addImage(princessJDBase64, "PNG", pageWidth - 15 - logoSize, logoY, logoSize, logoSize)
    }
  } catch (error) {
    console.log("[v0] Error loading Princess JD logo:", error)
  }

  yPosition += 35

  // Date and Quotation No
  doc.setFontSize(10)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, "normal")

  const currentDate = new Date(quotation.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  doc.text(`Date: ${currentDate}`, 120, yPosition)
  doc.text(`Quotation No: ${quotation.quotation_number}`, 120, yPosition + 7)

  yPosition += 20

  // Supplier/Customer Information
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.text("Supplier Name:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.business_name || "N/A", 50, yPosition)

  yPosition += 6
  doc.setFont(undefined, "bold")
  doc.text("Customer:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.customer?.name || "N/A", 50, yPosition)

  yPosition += 6
  doc.setFont(undefined, "bold")
  doc.text("Address:", 15, yPosition)
  doc.setFont(undefined, "normal")
  const address = `${quotation.business_address || ""}, ${quotation.business_city || ""} ${quotation.business_postal || ""}`
  doc.text(address, 50, yPosition)

  yPosition += 12

  // PROJECT DETAILS TABLE
  const items = quotation.items || []
  const projectTableData: any[] = []

  items.forEach((item: any) => {
    const quantity = item.quantity || 0
    const unitPrice = parseFloat(item.unit_price || 0)
    const totalPrice = quantity * unitPrice

    projectTableData.push([
      item.service?.name || item.name || "Service",
      quantity.toString(),
      `₱${unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
      `₱${totalPrice.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
    ])
  })

  // Add empty rows
  projectTableData.push(["", "", "", "₱0.00"])
  projectTableData.push(["", "", "", "₱0.00"])
  projectTableData.push(["", "", "", "₱0.00"])

  // Add subtotal row
  const subtotal = parseFloat(quotation.subtotal || 0)
  projectTableData.push(["", "", "Sub Total:", `₱${subtotal.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`])

  autoTable(doc, {
    head: [["PROJECT TYPE:", "QTY", "UNIT PRICE", "PRICE"]],
    body: projectTableData,
    startY: yPosition,
    theme: "grid",
    headerStyles: {
      fillColor: [139, 69, 19], // Burgundy
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 80 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "right", cellWidth: 35 },
      3: { halign: "right", cellWidth: 35 },
    },
    margin: { left: 10, right: 10 },
    didDrawPage: (data: any) => {
      // This runs after the table is drawn
    },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // DESCRIPTION / CHARGES TABLE
  const chargesTableData = [
    ["Service Fee", ""],
    ["Layout Fee", ""],
    ["Labor and Installation", ""],
    ["Mobilization Fee", ""],
    ["Project", ""],
    ["", ""],
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
      fontSize: 10,
      halign: "center",
      valign: "middle",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: "left", cellWidth: 130 },
      1: { halign: "right", cellWidth: 40 },
    },
    margin: { left: 10, right: 10 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 10

  // TOTAL PROJECT COST
  doc.setFontSize(11)
  doc.setFont(undefined, "bold")
  doc.setTextColor(139, 69, 19) // Burgundy text
  doc.text("TOTAL PROJECT COST:", 15, yPosition)
  doc.setTextColor(0, 0, 0)
  const total = parseFloat(quotation.total || 0)
  doc.text(
    `₱${total.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
    pageWidth - 15,
    yPosition,
    { align: "right" }
  )

  yPosition += 8

  // DOWN PAYMENT - Yellow highlight
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, "bold")
  doc.text("DOWN PAYMENT:", 15, yPosition)
  
  // Yellow background for down payment value
  const downPayment = parseFloat(quotation.down_payment || 0)
  const downPaymentText = `₱${downPayment.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`
  
  // Draw yellow rectangle for down payment
  doc.setFillColor(255, 255, 0) // Yellow
  doc.rect(pageWidth - 95, yPosition - 5, 80, 7, "F")
  
  doc.setTextColor(0, 0, 0)
  doc.text(downPaymentText, pageWidth - 15, yPosition, { align: "right" })

  yPosition += 8

  // BALANCE
  doc.setTextColor(139, 69, 19) // Burgundy text
  doc.setFont(undefined, "bold")
  doc.text("BALANCE:", 15, yPosition)
  doc.setTextColor(0, 0, 0)
  const balance = total - downPayment
  doc.text(
    `₱${balance.toLocaleString("en-PH", { minimumFractionDigits: 2 })}`,
    pageWidth - 15,
    yPosition,
    { align: "right" }
  )

  yPosition += 15

  // Terms and conditions section
  doc.setFontSize(8)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("TERMS & CONDITIONS:", 15, yPosition)
  yPosition += 5
  doc.setFont(undefined, "normal")
  doc.setFontSize(7)
  const termsText = quotation.terms_conditions || "General terms and conditions apply. Payment due upon receipt unless otherwise agreed. All work is warranted for 30 days from installation."
  const termsLines = doc.splitTextToSize(termsText, 170)
  doc.text(termsLines, 15, yPosition)

  // Generate PDF
  const fileName = `Quotation_${quotation.quotation_number}_${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
