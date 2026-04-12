import jsPDF from "jspdf"
import "jspdf-autotable"

export const generateQuotationPDF = (quotation: any) => {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPosition = 20

  // Header with logos
  const headerHeight = 30
  const logoSize = 25

  // Left logo placeholder
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("LOGO", 15, yPosition + 10)

  // Center title
  doc.setFontSize(14)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, "bold")
  const centerX = pageWidth / 2
  doc.text("REQUEST FOR QUOTATION", centerX, yPosition + 12, { align: "center" })

  // Right logo placeholder
  doc.setFontSize(10)
  doc.setTextColor(100, 100, 100)
  doc.text("LOGO", pageWidth - 15, yPosition + 10)

  yPosition += 40

  // Blue divider line
  doc.setDrawColor(0, 102, 204)
  doc.setLineWidth(2)
  doc.line(10, yPosition - 5, pageWidth - 10, yPosition - 5)

  // Date and Quotation No
  doc.setFontSize(11)
  doc.setTextColor(0, 0, 0)
  doc.setFont(undefined, "normal")

  const currentDate = new Date(quotation.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  doc.text(`Date: ${currentDate}`, 120, yPosition)
  doc.text(`Quotation No: ${quotation.quotation_number}`, 120, yPosition + 8)

  yPosition += 20

  // Supplier/Customer Information
  doc.setFontSize(10)
  doc.setFont(undefined, "bold")
  doc.text("Supplier Name:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text(quotation.business_name || "N/A", 50, yPosition)

  yPosition += 8
  doc.setFont(undefined, "bold")
  doc.text("Address:", 15, yPosition)
  doc.setFont(undefined, "normal")
  const address = `${quotation.business_address || ""}, ${quotation.business_city || ""} ${quotation.business_postal || ""}`
  doc.text(address, 50, yPosition)

  yPosition += 8
  doc.setFont(undefined, "bold")
  doc.text("TIN:", 15, yPosition)
  doc.setFont(undefined, "normal")
  doc.text("N/A", 50, yPosition)

  yPosition += 15

  // Terms and conditions section
  doc.setFontSize(9)
  doc.setFont(undefined, "bold")
  doc.text("TERMS:", 15, yPosition)
  yPosition += 5
  doc.setFont(undefined, "normal")
  doc.setFontSize(8)
  const termsText = quotation.terms_conditions || "General terms and conditions apply"
  const termsLines = doc.splitTextToSize(termsText, 170)
  doc.text(termsLines, 15, yPosition)

  yPosition += termsLines.length * 4 + 10

  // Items table
  const items = quotation.items || []
  const tableData: any[] = []

  items.forEach((item: any, index: number) => {
    const amount = parseFloat(item.amount || 0)
    tableData.push([
      (index + 1).toString(),
      item.unit || "piece",
      item.name || item.service?.name || "Service",
      item.quantity || 1,
      `₱${(item.unitPrice || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    ])
  })

  ;(doc as any).autoTable({
    head: [["ITEM NO.", "UNIT", "DESCRIPTION", "QUANTITY", "UNIT PRICE", "TOTAL AMOUNT"]],
    body: tableData,
    startY: yPosition,
    theme: "grid",
    headerStyles: {
      fillColor: [0, 102, 204],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 10,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [0, 0, 0],
    },
    columnStyles: {
      0: { halign: "center", cellWidth: 20 },
      1: { halign: "center", cellWidth: 20 },
      2: { halign: "left" },
      3: { halign: "center", cellWidth: 20 },
      4: { halign: "right", cellWidth: 30 },
      5: { halign: "right", cellWidth: 30 },
    },
    margin: 10,
  })

  yPosition = (doc as any).lastAutoTable.finalY + 15

  // Summary section
  const summaryStartX = pageWidth - 120
  const subtotal = parseFloat(quotation.subtotal || 0)
  const discount = parseFloat(quotation.discount || 0)
  const tax = parseFloat(quotation.tax || 0)
  const total = parseFloat(quotation.total || 0)

  doc.setFontSize(9)
  doc.setFont(undefined, "normal")

  doc.text("Subtotal:", summaryStartX, yPosition)
  doc.text(
    `₱${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    pageWidth - 15,
    yPosition,
    { align: "right" }
  )

  yPosition += 7

  if (discount > 0) {
    doc.text("Discount:", summaryStartX, yPosition)
    doc.text(
      `₱${discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      pageWidth - 15,
      yPosition,
      { align: "right" }
    )
    yPosition += 7
  }

  if (tax > 0) {
    doc.text("Tax:", summaryStartX, yPosition)
    doc.text(
      `₱${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      pageWidth - 15,
      yPosition,
      { align: "right" }
    )
    yPosition += 7
  }

  // Total box
  doc.setLineWidth(1)
  doc.setDrawColor(0, 102, 204)
  doc.rect(summaryStartX - 5, yPosition - 5, 115, 10)

  doc.setFont(undefined, "bold")
  doc.setFontSize(11)
  doc.text("TOTAL:", summaryStartX, yPosition + 3)
  doc.text(
    `₱${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    pageWidth - 15,
    yPosition + 3,
    { align: "right" }
  )

  yPosition += 20

  // Signature section
  doc.setFontSize(9)
  doc.setFont(undefined, "normal")
  doc.text("Printed Name over Signature", 15, yPosition)
  doc.text("Date", pageWidth - 40, yPosition)

  yPosition += 10
  doc.setLineWidth(0.5)
  doc.line(15, yPosition, 80, yPosition)
  doc.line(pageWidth - 60, yPosition, pageWidth - 15, yPosition)

  yPosition += 15

  doc.setFont(undefined, "bold")
  doc.text("Authorized Representative", 15, yPosition)

  // Generate PDF
  const fileName = `Quotation_${quotation.quotation_number}_${new Date().toISOString().split("T")[0]}.pdf`
  doc.save(fileName)
}
