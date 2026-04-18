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
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 12

  // ===== HEADER SECTION =====
  // Load logos first
  const logoSize = 22
  const logoStartY = 12
  const companyInfoStartY = logoStartY + 8

  // Left: Client Logo (aligned with company info)
  if (quotation.logo_url) {
    try {
      const logoFileName = quotation.logo_url.split('/').pop()
      const clientLogoUrl = `https://api.princessjaideeenterprises.com/api/storage/app/public/quotations/logos/${logoFileName}`
      
      console.log("[v0] Loading client logo from:", clientLogoUrl)
      const logoBase64 = await imageUrlToBase64(clientLogoUrl)
      
      if (logoBase64) {
        doc.addImage(logoBase64, "PNG", 15, companyInfoStartY, logoSize, logoSize)
        console.log("[v0] Client logo loaded successfully")
      }
    } catch (error) {
      console.log("[v0] Error loading client logo:", error)
    }
  }

  // Right: Princess JD Logo (aligned with company info)
  try {
    const princessJDBase64 = await imageUrlToBase64("/princessjd.png")
    if (princessJDBase64) {
      doc.addImage(princessJDBase64, "PNG", pageWidth - 15 - logoSize, companyInfoStartY, logoSize, logoSize)
      console.log("[v0] Princess JD logo loaded successfully")
    }
  } catch (error) {
    console.log("[v0] Error loading Princess JD logo:", error)
  }

  yPosition = companyInfoStartY

  // Center: Company Info (Centered)
  doc.setFontSize(14)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("PRINCESS JAIDEE ENTERPRISES", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 6
  doc.setFontSize(8)
  doc.setFont(undefined, "normal")
  doc.text("A.B. Fajardo Bldg., Calle Nueva St., Brgy. Polvorista, Sorsogon City", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 4
  doc.text("0930 821 8871 / 0915 175 9881 / (056) 311 8663", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 4
  doc.text("Email: piesorsogonsportswear@gmail.com", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 8

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
    const teamRoster = item.team_roster
    const sizeSpecs = item.size_specifications
    const serviceName = item.service?.name || item.name || "Service"

    let servicePrice = parseFloat(item.line_total || unitPrice)
    let subtotalForService = 0

    // For Sublimation: Show breakdown with Sets, Top Only, Bottom Only
    if (serviceName.includes('Sublimation') && teamRoster && Array.isArray(teamRoster)) {
      const breakdown = calculateSublimationBreakdown(teamRoster, unitPrice)
      subtotalForService = breakdown.subtotal

      // Main service row with player count
      projectTableData.push([
        `${serviceName} (${teamRoster.length} Players)`,
        quantity.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        "",
      ])

      // Breakdown rows
      if (breakdown.setsCount > 0) {
        projectTableData.push([
          `  ↳ ${breakdown.setsCount} Sets`,
          "",
          "",
          breakdown.setsAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        ])
      }
      if (breakdown.topOnlyCount > 0) {
        projectTableData.push([
          `  ↳ ${breakdown.topOnlyCount} Top Only`,
          "",
          "",
          breakdown.topAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        ])
      }
      if (breakdown.bottomOnlyCount > 0) {
        projectTableData.push([
          `  ↳ ${breakdown.bottomOnlyCount} Bottom Only`,
          "",
          "",
          breakdown.bottomAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        ])
      }

      // Subtotal for this service
      projectTableData.push([
        "  ✓ Subtotal",
        "",
        "",
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])

      calculatedSubtotal += subtotalForService
    }
    // For Tarpaulin: Show size specifications
    else if (serviceName.includes('Tarpaulin') && sizeSpecs) {
      subtotalForService = calculateTarpaulinSubtotal(sizeSpecs, quantity)

      // Main service row with size info
      projectTableData.push([
        `${serviceName} (${sizeSpecs.width}ft × ${sizeSpecs.height}ft)`,
        quantity.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        "",
      ])

      // Size details
      projectTableData.push([
        `  ↳ ${sizeSpecs.totalSqft} sq ft × ${quantity} qty`,
        "",
        "",
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])

      // Subtotal
      projectTableData.push([
        "  ✓ Subtotal",
        "",
        "",
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
