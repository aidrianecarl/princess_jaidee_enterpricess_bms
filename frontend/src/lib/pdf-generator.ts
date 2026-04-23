import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Helper: Calculate sublimation breakdown
function calculateSublimationBreakdown(teamRoster: any[], unitPrice: number) {
  const breakdown = {
    setsCount: 0,
    topOnlyCount: 0,
    bottomOnlyCount: 0,
    setsAmount: 0,
    topAmount: 0,
    bottomAmount: 0,
    subtotal: 0,
  }

  if (!Array.isArray(teamRoster) || !teamRoster.length) return breakdown

  const setPrice = unitPrice * 2 // Set = 2x unit price
  const topPrice = unitPrice
  const bottomPrice = unitPrice

  teamRoster.forEach((player: any) => {
    const hasTop = player.sizeTop && player.sizeTop !== "None"
    const hasBottom = player.sizeBottom && player.sizeBottom !== "None"

    if (hasTop && hasBottom) {
      breakdown.setsCount++
      breakdown.setsAmount += setPrice
      breakdown.subtotal += setPrice
    } else if (hasTop) {
      breakdown.topOnlyCount++
      breakdown.topAmount += topPrice
      breakdown.subtotal += topPrice
    } else if (hasBottom) {
      breakdown.bottomOnlyCount++
      breakdown.bottomAmount += bottomPrice
      breakdown.subtotal += bottomPrice
    }
  })

  return breakdown
}

// Helper: Calculate tarpaulin subtotal
function calculateTarpaulinSubtotal(sizeSpecs: any, quantity: number) {
  if (!sizeSpecs) return 0
  return (sizeSpecs.totalPrice || 0) * quantity
}

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
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [216, 330], // Long bond paper (8.5 x 13 inches)
  })
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 12

  // ===== HEADER SECTION =====
const logoSize = 28
const leftMargin = 15
const rightMargin = 15

let headerTopY = 12

// ===== RIGHT: Princess JD Logo (TOP-ALIGNED) =====
try {
  const princessJDBase64 = await imageUrlToBase64("/princessjd.png")
  if (princessJDBase64) {
    const logoX = pageWidth - rightMargin - logoSize
    const logoY = headerTopY
    doc.addImage(princessJDBase64, "PNG", logoX, logoY, logoSize, logoSize)
  }
} catch (error) {
  console.log("[v0] Error loading Princess JD logo:", error)
}

// ===== LEFT: COMPANY INFO (ALIGNED WITH LOGO TOP) =====
let textY = headerTopY + 5

doc.setFontSize(14)
doc.setFont(undefined, "bold")
doc.setTextColor(0, 0, 0)
doc.text("PRINCESS JAIDEE ENTERPRISES", leftMargin, textY)

textY += 6
doc.setFontSize(8)
doc.setFont(undefined, "normal")
doc.text("A.B. Fajardo Bldg., Calle Nueva St., Brgy. Polvorista, Sorsogon City", leftMargin, textY)

textY += 4
doc.text("0930 821 8871 / 0915 175 9881 / (056) 311 8663", leftMargin, textY)

textY += 4
doc.text("Email: pjesorsogonsportswear@gmail.com", leftMargin, textY)

// ===== SET NEXT Y POSITION PROPERLY =====
 yPosition = headerTopY + logoSize + 6


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
  doc.setFont(undefined, "normal")
  doc.text(quotation.business_name || "N/A", leftColX + 25, yPosition)

  yPosition += 5

  doc.setFont(undefined, "bold")
  doc.text("Client Name:", leftColX, yPosition)
  doc.setFont(undefined, "normal")
  const clientName = quotation.customer?.bill_to_name || quotation.customer?.name || quotation.client_name || "N/A"
  doc.text(clientName, leftColX + 25, yPosition)
  
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
  doc.setFont(undefined, "normal")
  const contactNumber = quotation.customer?.bill_to_phone || quotation.customer?.contact_number || quotation.customer?.phone || "N/A"
  doc.text(contactNumber, leftColX + 25, yPosition)

  yPosition += 10

  // ===== PROJECT DETAILS TABLE =====
  const items = quotation.items || []
  const projectTableData: any[] = []
  let calculatedSubtotal = 0

  items.forEach((item: any) => {
    const quantity = item.quantity || 0
    const unitPrice = parseFloat(item.unit_price || 0)
    let teamRoster = item.team_roster
    let sizeSpecs = item.size_specifications
    const serviceName = item.service?.name || item.name || "Service"

    // Parse teamRoster if it's a string
    if (typeof teamRoster === 'string') {
      try {
        teamRoster = JSON.parse(teamRoster)
      } catch (e) {
        teamRoster = null
      }
    }

    // Parse sizeSpecs if it's a string
    if (typeof sizeSpecs === 'string') {
      try {
        sizeSpecs = JSON.parse(sizeSpecs)
      } catch (e) {
        sizeSpecs = null
      }
    }

    let servicePrice = parseFloat(item.line_total || unitPrice)
    let subtotalForService = 0

    // For Sublimation with team roster: Show with SET/TOP/BOTTOM counts
    if (serviceName.includes('Sublimation') && teamRoster && Array.isArray(teamRoster)) {
      const breakdown = calculateSublimationBreakdown(teamRoster, unitPrice)
      subtotalForService = breakdown.subtotal

      const requirementsStr = `${breakdown.setsCount} SET${breakdown.setsCount !== 1 ? 'S' : ''} - ${breakdown.topOnlyCount} TOP - ${breakdown.bottomOnlyCount} BOTTOM`

      projectTableData.push([
        `${serviceName} (${requirementsStr})`,
        quantity.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])

      calculatedSubtotal += subtotalForService
    }
    // For Sublimation with size_specifications: Show sizes in name
    else if (serviceName.includes('Sublimation') && sizeSpecs && sizeSpecs.items && Array.isArray(sizeSpecs.items)) {
      // Build size description from items
      const sizeDescriptions = sizeSpecs.items.map((spec: any) => {
        const parts = []
        if (spec.qty) parts.push(spec.qty)
        if (spec.sizeTop && spec.sizeTop !== "-") parts.push(`${spec.sizeTop}${spec.lengthTopInches ? `-${spec.lengthTopInches}` : ''}`)
        if (spec.sizeBottom && spec.sizeBottom !== "-") parts.push(`${spec.sizeBottom}${spec.lengthBottomInches ? `-${spec.lengthBottomInches}` : ''}`)
        return parts.join(' ')
      }).join(', ')

      // Calculate total quantity and price
      const totalQty = sizeSpecs.items.reduce((sum: number, spec: any) => sum + (Number(spec.qty) || 0), 0)
      const basePrice = unitPrice
      subtotalForService = sizeSpecs.items.reduce((sum: number, spec: any) => {
        const qty = Number(spec.qty) || 0
        const hasTop = spec.sizeTop && spec.sizeTop !== "-"
        const hasBottom = spec.sizeBottom && spec.sizeBottom !== "-"
        const isSet = hasTop && hasBottom
        const itemPrice = isSet ? (basePrice * 2 * qty) : (basePrice * qty)
        return sum + itemPrice
      }, 0)

      projectTableData.push([
        `${serviceName} (${sizeDescriptions})`,
        totalQty.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])

      calculatedSubtotal += subtotalForService
    }
    // For Tarpaulin: Show size in name with uppercase FT
    else if (serviceName.includes('Tarpaulin') && sizeSpecs) {
      subtotalForService = calculateTarpaulinSubtotal(sizeSpecs, quantity)
      const width = sizeSpecs.width || "?"
      const height = sizeSpecs.height || "?"

      projectTableData.push([
        `${serviceName} (${width}FT × ${height}FT)`,
        quantity.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])

      calculatedSubtotal += subtotalForService
    }
    // For other services
    else {
      subtotalForService = servicePrice
      calculatedSubtotal += subtotalForService

      projectTableData.push([
        serviceName,
        quantity.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])
    }
  })

  // Add empty rows
  projectTableData.push(["", "", "", ""])
  projectTableData.push(["", "", "", ""])

  // Add subtotal row
  const subtotal = quotation.subtotal ? parseFloat(quotation.subtotal) : calculatedSubtotal
  projectTableData.push(["", "", "Sub Total:", subtotal.toLocaleString("en-PH", { minimumFractionDigits: 0 })])

  autoTable(doc, {
    head: [["PROJECT TYPE:", "QTY", "UNIT PRICE", "PRICE"]],
    body: projectTableData,
    startY: yPosition,
    theme: "grid",
    headerStyles: {
      fillColor: [220, 20, 60], // Crimson Red
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
      0: { halign: "left" },
      1: { halign: "center" },
      2: { halign: "center" },
      3: { halign: "right" },
    },
    tableWidth: "100%",
    margin: { left: 10, right: 10 },
  })

  // Safe Y position calculation with fallback
  yPosition = Math.max((doc as any).lastAutoTable?.finalY || yPosition + 30, yPosition + 30) + 8

  // ===== CHARGES/DESCRIPTION TABLE =====
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
      fillColor: [220, 20, 60], // Crimson Red
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
      0: { halign: "left" },
      1: { halign: "right" },
    },
    tableWidth: "100%",
    margin: { left: 10, right: 10 },
  })

  yPosition = Math.max((doc as any).lastAutoTable?.finalY || yPosition + 30, yPosition + 30) + 8

  // ===== FINANCIAL SUMMARY =====
  const total = parseFloat(quotation.total || quotation.subtotal || 0)
  const downPayment = parseFloat(quotation.down_payment || 0)
  const balance = total - downPayment

  const summaryRightX = pageWidth - 10
  const summaryLabelX = pageWidth - 80

  // TOTAL PROJECT COST
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.setTextColor(220, 20, 60) // Red
  doc.text("TOTAL PROJECT COST:", summaryLabelX, yPosition, { align: "left" })
  doc.setTextColor(0, 0, 0)
  doc.text(total.toLocaleString("en-PH", { minimumFractionDigits: 0 }), summaryRightX, yPosition, { align: "right" })

  yPosition += 6

  // DOWN PAYMENT - Yellow highlight
  doc.setFont(undefined, "bold")
  doc.setTextColor(220, 20, 60) // Red
  
  // Yellow background for entire down payment row
  doc.setFillColor(255, 255, 0) // Yellow
  doc.rect(summaryLabelX - 5, yPosition - 4, pageWidth - summaryLabelX + 3, 6, "F")
  
  doc.text("DOWN PAYMENT:", summaryLabelX, yPosition, { align: "left" })
  doc.setTextColor(0, 0, 0)
  doc.text(downPayment.toLocaleString("en-PH", { minimumFractionDigits: 0 }), summaryRightX, yPosition, { align: "right" })

  yPosition += 6

  // BALANCE
  doc.setFont(undefined, "bold")
  doc.setTextColor(220, 20, 60) // Red
  doc.text("BALANCE:", summaryLabelX, yPosition, { align: "left" })
  doc.setTextColor(0, 0, 0)
  doc.text(balance.toLocaleString("en-PH", { minimumFractionDigits: 0 }), summaryRightX, yPosition, { align: "right" })

  yPosition += 12

  // ===== DISCLAIMER TEXT =====
  doc.setFontSize(7)
  doc.setFont(undefined, "italic")
  doc.setTextColor(0, 0, 0)
  doc.text("If you have any questions concerning this quotation, just contact and email us.", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 10

  // ===== SIGNATURE SECTION =====
  const signatureX = pageWidth / 2 + 50
  const signatureWidth = 40
  const signatureHeight = 20

  // Load and place signature image
  try {
    const signatureBase64 = await imageUrlToBase64("/jhonie_signature.png")
    if (signatureBase64) {
      doc.addImage(signatureBase64, "PNG", signatureX - signatureWidth / 2, yPosition, signatureWidth, signatureHeight)
      console.log("[v0] Signature image loaded successfully")
    }
  } catch (error) {
    console.log("[v0] Error loading signature image:", error)
  }

  yPosition += signatureHeight + 3

  // Signature line
  doc.setLineWidth(0.5)
  doc.line(signatureX - signatureWidth / 2 - 5, yPosition, signatureX + signatureWidth / 2 + 5, yPosition)

  yPosition += 6

  // Signature name and title
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("JHONIE DETERA", signatureX, yPosition, { align: "center" })

  yPosition += 5
  doc.setFont(undefined, "normal")
  doc.setFontSize(8)
  doc.text("Owner", signatureX, yPosition, { align: "center" })

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
