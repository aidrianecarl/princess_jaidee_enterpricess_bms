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
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.text(
    quotation.business_name || "PRINCESS JAIDEE ENTERPRISES",
    pageWidth / 2,
    yPosition + 10,
    { align: "center" }
  )

  doc.setFont(undefined, "normal")
  doc.setFontSize(8)
  doc.text(
    `${quotation.business_address || "A.B. Fajardo Bldg., Calle Nueva St., Brgy. Polvorista"}, ${quotation.business_city || "Sorsogon City"}`,
    pageWidth / 2,
    yPosition + 14,
    { align: "center" }
  )

  doc.setFontSize(8)
  doc.text(
    `${quotation.business_state || "Sorsogon"} ${quotation.business_postal || "4700"}`,
    pageWidth / 2,
    yPosition + 17,
    { align: "center" }
  )

  doc.setFontSize(8)
  doc.text(
    `Tel: ${quotation.business_phone || "0930 821 8871"} | Email: ${quotation.business_email || "pjesorsogonsportswear@gmail.com"}`,
    pageWidth / 2,
    yPosition + 20,
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

  const tableData: any[] = []
  let calculatedSubtotal = 0

  items.forEach((item: any, index: number) => {
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
        console.log("[v0] Error parsing sizeSpecs:", e, "Raw value:", sizeSpecs)
        sizeSpecs = null
      }
    }

    let subtotalForService = 0

    // For Sublimation with size_specifications: Show sizes in name
    if (serviceName.includes('Sublimation') && sizeSpecs && sizeSpecs.items && Array.isArray(sizeSpecs.items)) {
      console.log("[v0] Processing Sublimation item:", {
        serviceName,
        isJersey: serviceName.includes('Jersey'),
        sizeSpecs
      })
      
      // Check if this is a Jersey item (has SET format)
      const isJersey = serviceName.includes('Jersey') || sizeSpecs.items.some((spec: any) => spec.setType || spec.set_type)
      
      let sizeDescriptions = ""
      let totalQty = 0
      
      if (isJersey) {
        // For Jersey: Format as "X SET - X TOP - X BOTTOM"
        let setSets = 0
        let topCount = 0
        let bottomCount = 0
        
        sizeSpecs.items.forEach((spec: any) => {
          const qty = Number(spec.qty) || 0
          const hasTop = spec.sizeTop && spec.sizeTop !== "-"
          const hasBottom = spec.sizeBottom && spec.sizeBottom !== "-"
          
          if (hasTop && hasBottom) {
            setSets += qty
            topCount += qty
            bottomCount += qty
          } else if (hasTop) {
            topCount += qty
          } else if (hasBottom) {
            bottomCount += qty
          }
        })
        
        totalQty = setSets > 0 ? setSets : (topCount + bottomCount)
        const parts = []
        if (setSets > 0) parts.push(`${setSets} SET`)
        if (topCount > 0) parts.push(`${topCount} TOP`)
        if (bottomCount > 0) parts.push(`${bottomCount} BOTTOM`)
        sizeDescriptions = parts.join(' - ')
        
        console.log("[v0] Jersey formatting:", {
          setSets,
          topCount,
          bottomCount,
          sizeDescriptions,
          totalQty
        })
      } else {
        // For regular Sublimation: Build size description from items
        sizeDescriptions = sizeSpecs.items.map((spec: any) => {
          const parts = []
          if (spec.qty) parts.push(spec.qty)
          if (spec.sizeTop && spec.sizeTop !== "-") parts.push(`${spec.sizeTop}${spec.lengthTopInches ? `-${spec.lengthTopInches}` : ''}`)
          if (spec.sizeBottom && spec.sizeBottom !== "-") parts.push(`${spec.sizeBottom}${spec.lengthBottomInches ? `-${spec.lengthBottomInches}` : ''}`)
          return parts.join(' ')
        }).join(', ')
        
        totalQty = sizeSpecs.items.reduce((sum: number, spec: any) => sum + (Number(spec.qty) || 0), 0)
      }

      // Calculate total price
      const basePrice = unitPrice
      subtotalForService = sizeSpecs.items.reduce((sum: number, spec: any) => {
        const qty = Number(spec.qty) || 0
        const hasTop = spec.sizeTop && spec.sizeTop !== "-"
        const hasBottom = spec.sizeBottom && spec.sizeBottom !== "-"
        const isSet = hasTop && hasBottom
        const itemPrice = isSet ? (basePrice * 2 * qty) : (basePrice * qty)
        return sum + itemPrice
      }, 0)

      tableData.push([
        `${serviceName} (${sizeDescriptions})`,
        totalQty.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])

      calculatedSubtotal += subtotalForService
    }
    // For Tarpaulin: Show size in name with uppercase FT
    else if (serviceName.includes('Tarpaulin') && sizeSpecs) {
      subtotalForService = quantity * unitPrice
      const width = sizeSpecs.width || "?"
      const height = sizeSpecs.height || "?"

      tableData.push([
        `${serviceName} (${width}FT × ${height}FT)`,
        quantity.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])

      calculatedSubtotal += subtotalForService
    }
    // For other services
    else {
      subtotalForService = Number(item.line_total || (quantity * unitPrice))
      calculatedSubtotal += subtotalForService

      tableData.push([
        serviceName,
        quantity.toString(),
        unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
        subtotalForService.toLocaleString("en-PH", { minimumFractionDigits: 0 }),
      ])
    }
  })

  // Add empty rows
  tableData.push(["", "", "", ""])
  tableData.push(["", "", "", ""])

  // Add subtotal row
  const subtotal = quotation.subtotal ? parseFloat(quotation.subtotal) : calculatedSubtotal
  tableData.push(["", "", "Sub Total:", subtotal.toLocaleString("en-PH", { minimumFractionDigits: 0 })])

  autoTable(doc, {
    head: [["DESCRIPTION", "QUANTITY", "UNIT PRICE", "TOTAL AMOUNT"]],
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
      0: { halign: "left" },
      1: { halign: "center", cellWidth: 25 },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "right", cellWidth: 30 },
    },

    didDrawPage: function () {
      // This is called after the table is drawn
    },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 5

  // ================= TOTAL =================
  const totalLabelX = pageWidth - 65
  const totalValueX = pageWidth - 15

  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 0, 0)
  doc.text("TOTAL:", totalLabelX, yPosition, { align: "left" })
  doc.text(subtotal.toLocaleString("en-PH", { minimumFractionDigits: 0 }), totalValueX, yPosition, { align: "right" })

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
  doc.setTextColor(0, 0, 0)

  const signatureY = yPosition
  const clientName = quotation.customer?.bill_to_name || quotation.customer?.name || quotation.client_name || "Client Name"

  // LEFT: Authorized Canvaser with client name
  doc.setFont(undefined, "bold")
  doc.setFontSize(8)
  // Name ABOVE the line
  doc.text(clientName, 15, signatureY - 2)

  // Signature line
  doc.text("_________________________", 15, signatureY + 2)

  // Label BELOW the line
  doc.setFontSize(7)
  doc.text("Authorized Canvaser", 15, signatureY + 6)


  // RIGHT: Jhonie's Signature Section
  doc.setFont(undefined, "normal")

  // Add signature image
  try {
    const signatureBase64 = await imageUrlToBase64("/jhonie_signature.png")
    if (signatureBase64) {
      doc.addImage(signatureBase64, "PNG", pageWidth - 65, signatureY - 10, 50, 12)
    }
  } catch (error) {
    console.log("[v0] Error loading signature image:", error)
  }
  doc.setFont(undefined, "bold")
  doc.setFontSize(8)
  // Name ABOVE the line
  doc.text("JHONIE E. DETERA", pageWidth - 70, signatureY - 2)

  // Signature line
  doc.text("_________________________", pageWidth - 70, signatureY + 2)

  // Label BELOW the line
  doc.setFontSize(7)
  doc.text("Printed Name over Signature", pageWidth - 70, signatureY + 6)



  // Tel and Date lines
  doc.setFont(undefined, "normal")
  doc.setFontSize(8)
  doc.text("Tel. No. /Cellphone No./Email Address", pageWidth - 70, signatureY + 12)
  doc.text("_________________________", pageWidth - 70, signatureY + 16)

  doc.text("Date: _________________", pageWidth - 70, signatureY + 22)

  // Save PDF
  const fileName = `RFQ_${quotation.quotation_number || quotation.id || "draft"}.pdf`
  doc.save(fileName)
}
