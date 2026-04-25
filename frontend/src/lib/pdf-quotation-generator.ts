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
    console.log("[RFQ] Error converting image:", error)
    return ""
  }
}

export const generateRFQPDF = async (quotation: any) => {
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
      console.log("Client logo error", e)
    }
  }

  // RIGHT: Company Logo
  try {
    const companyLogo = await imageUrlToBase64("/princessjd.png")
    if (companyLogo) {
      doc.addImage(companyLogo, "PNG", pageWidth - 15 - logoSize, yPosition, logoSize, logoSize)
    }
  } catch (e) {
    console.log("Company logo error", e)
  }

  // CENTER TEXT
  doc.setFontSize(9)
  doc.setFont(undefined, "normal")
  doc.text("Republic of the Philippines", pageWidth / 2, yPosition + 4, { align: "center" })
  doc.text("Department of Education", pageWidth / 2, yPosition + 8, { align: "center" })
  doc.text("Region V", pageWidth / 2, yPosition + 12, { align: "center" })

  doc.setFont(undefined, "bold")
  doc.text(
    quotation.business_name || "PRINCESS JAIDEE ENTERPRISES",
    pageWidth / 2,
    yPosition + 17,
    { align: "center" }
  )

  doc.setFont(undefined, "normal")
  doc.text(
    quotation.business_city || "Sorsogon City",
    pageWidth / 2,
    yPosition + 21,
    { align: "center" }
  )

  yPosition += logoSize + 10

  // ================= TITLE =================
  doc.setFontSize(14)
  doc.setFont(undefined, "bold")
  doc.setTextColor(0, 102, 153)
  doc.text("REQUEST FOR QUOTATION", pageWidth / 2, yPosition, { align: "center" })

  yPosition += 10

  // ================= META =================
  doc.setFontSize(8)
  doc.setTextColor(0, 0, 0)

  const today = new Date().toLocaleDateString("en-US")

  doc.text(`Date: ${today}`, pageWidth - 60, yPosition)
  doc.text(`Quotation No: ${quotation.quotation_number || "N/A"}`, pageWidth - 60, yPosition + 5)

  yPosition += 12

  // ================= SUPPLIER =================
  doc.text(`Supplier Name: ${quotation.business_name || ""}`, 15, yPosition)
  yPosition += 5

  doc.text(`Address: ${quotation.business_address || ""}`, 15, yPosition)
  yPosition += 5

  doc.text(`Contact: ${quotation.business_phone || ""}`, 15, yPosition)

  yPosition += 10

  // ================= INSTRUCTION =================
  doc.setFontSize(7)
  doc.text(
    "Please quote your lowest price on the items listed below, subject to the conditions stated.",
    15,
    yPosition
  )

  yPosition += 8

  // ================= TABLE =================
  const items = quotation.items || []

  const tableData = items.map((item: any, index: number) => [
    index + 1,
    "piece",
    item.service?.name || item.name || "Service",
    item.quantity || 1,
    Number(item.unit_price || 0).toLocaleString("en-PH"),
    Number(item.line_total || 0).toLocaleString("en-PH"),
  ])

  autoTable(doc, {
    head: [["ITEM NO.", "UNIT", "DESCRIPTION", "QTY", "UNIT PRICE", "TOTAL"]],
    body: tableData,
    startY: yPosition,

    styles: {
      fontSize: 8,
      lineColor: [0, 0, 0],
      lineWidth: 0.1,
    },

    headStyles: {
      fillColor: [220, 220, 220],
      textColor: [0, 0, 0],
      fontStyle: "bold",
    },

    columnStyles: {
      0: { halign: "center" },
      1: { halign: "center" },
      3: { halign: "center" },
      4: { halign: "right" },
      5: { halign: "right" },
    },

    margin: { left: 10, right: 10 },
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // ================= SIGNATURE =================
  doc.setFontSize(8)

  doc.text("Printed Name over Signature", pageWidth - 80, yPosition)

  doc.line(pageWidth - 80, yPosition + 10, pageWidth - 20, yPosition + 10)

  doc.text("Date:", pageWidth - 80, yPosition + 18)

  // ================= SAVE =================
  const fileName = `RFQ_${quotation.quotation_number || "draft"}.pdf`
  doc.save(fileName)
}