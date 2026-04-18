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

  const setPrice = unitPrice * 2
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

export function generateQuotationHTML(quotation: any): string {
  const logoUrl = quotation.logo_url ? `${process.env.NEXT_PUBLIC_API_URL || 'https://api.princessjaideeenterprises.com/api'}/storage/${quotation.logo_url}` : ""

  // Build project table rows
  let projectTableHTML = ""
  let totalSubtotal = 0

  if (quotation.items && Array.isArray(quotation.items)) {
    quotation.items.forEach((item: any) => {
      const quantity = item.quantity || 0
      const unitPrice = parseFloat(item.unit_price || 0)
      const serviceName = item.service?.name || item.name || "Service"
      const teamRoster = item.team_roster
      const sizeSpecs = item.size_specifications

      // For Sublimation
      if (serviceName.includes('Sublimation') && teamRoster && Array.isArray(teamRoster)) {
        const breakdown = calculateSublimationBreakdown(teamRoster, unitPrice)
        const subtotal = breakdown.subtotal
        totalSubtotal += subtotal

        projectTableHTML += `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: left;">${serviceName} (${teamRoster.length} Players)</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${quantity}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: right;"></td>
          </tr>
        `

        if (breakdown.setsCount > 0) {
          projectTableHTML += `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: left; background: #f9f9f9;">  ↳ ${breakdown.setsCount} Sets</td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f9f9f9;"></td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f9f9f9;"></td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: right; background: #f9f9f9;">${breakdown.setsAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
            </tr>
          `
        }

        if (breakdown.topOnlyCount > 0) {
          projectTableHTML += `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: left; background: #f9f9f9;">  ↳ ${breakdown.topOnlyCount} Top Only</td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f9f9f9;"></td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f9f9f9;"></td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: right; background: #f9f9f9;">${breakdown.topAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
            </tr>
          `
        }

        if (breakdown.bottomOnlyCount > 0) {
          projectTableHTML += `
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: left; background: #f9f9f9;">  ↳ ${breakdown.bottomOnlyCount} Bottom Only</td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f9f9f9;"></td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f9f9f9;"></td>
              <td style="padding: 12px; border: 1px solid #ddd; text-align: right; background: #f9f9f9;">${breakdown.bottomAmount.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
            </tr>
          `
        }

        projectTableHTML += `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: left; background: #f0f0f0; font-weight: bold;">  ✓ Subtotal</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f0f0f0;"></td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f0f0f0;"></td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: right; background: #f0f0f0; font-weight: bold;">${subtotal.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
          </tr>
        `
      }
      // For Tarpaulin
      else if (serviceName.includes('Tarpaulin') && sizeSpecs) {
        const subtotal = calculateTarpaulinSubtotal(sizeSpecs, quantity)
        totalSubtotal += subtotal

        projectTableHTML += `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: left;">${serviceName} (${sizeSpecs.width}ft × ${sizeSpecs.height}ft)</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${quantity}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: right;"></td>
          </tr>
        `

        projectTableHTML += `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: left; background: #f9f9f9;">  ↳ ${sizeSpecs.totalSqft} sq ft × ${quantity} qty</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f9f9f9;"></td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f9f9f9;"></td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: right; background: #f9f9f9;">${subtotal.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
          </tr>
        `

        projectTableHTML += `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: left; background: #f0f0f0; font-weight: bold;">  ✓ Subtotal</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f0f0f0;"></td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center; background: #f0f0f0;"></td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: right; background: #f0f0f0; font-weight: bold;">${subtotal.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
          </tr>
        `
      }
      // For other services
      else {
        const subtotal = parseFloat(item.line_total || unitPrice)
        totalSubtotal += subtotal

        projectTableHTML += `
          <tr>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: left;">${serviceName}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${quantity}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: center;">${unitPrice.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
            <td style="padding: 12px; border: 1px solid #ddd; text-align: right;">${subtotal.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
          </tr>
        `
      }
    })
  }

  const subtotal = quotation.subtotal ? parseFloat(quotation.subtotal) : totalSubtotal

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Quotation #${quotation.quotation_number}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @media print {
      body { margin: 0; padding: 0; }
      @page { margin: 0.5in; }
      .no-print { display: none; }
    }

    body {
      font-family: Arial, sans-serif;
      color: #333;
      line-height: 1.6;
      background: #f5f5f5;
      padding: 20px;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
      background: white;
      padding: 40px;
      box-shadow: 0 0 10px rgba(0,0,0,0.1);
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 4px solid #f5a623;
    }

    .logo {
      max-width: 150px;
    }

    .logo img {
      max-width: 100%;
      height: auto;
    }

    .company-title {
      text-align: right;
      flex: 1;
    }

    .company-title h1 {
      font-size: 48px;
      color: #dc2626;
      margin-bottom: 10px;
    }

    .quote-info {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    .quote-info h3 {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
      margin-bottom: 10px;
      font-weight: bold;
    }

    .quote-info p {
      margin-bottom: 5px;
      font-size: 14px;
    }

    .quote-info .label {
      color: #999;
      font-size: 12px;
    }

    .quote-info .value {
      color: #333;
      font-weight: bold;
      font-size: 14px;
    }

    .bill-to {
      flex: 1;
    }

    .bill-to p {
      font-size: 14px;
      margin-bottom: 3px;
    }

    .bill-to .client-name {
      font-size: 16px;
      font-weight: bold;
      margin-bottom: 8px;
    }

    .from {
      text-align: right;
      flex: 1;
    }

    .from p {
      font-size: 14px;
      margin-bottom: 3px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 30px;
    }

    th {
      background-color: #dc2626;
      color: white;
      padding: 12px;
      text-align: left;
      font-weight: bold;
      border: 1px solid #ddd;
    }

    td {
      padding: 12px;
      border: 1px solid #ddd;
    }

    tr:nth-child(even) {
      background-color: #f9f9f9;
    }

    .text-right {
      text-align: right;
    }

    .text-center {
      text-align: center;
    }

    .subtotal-row {
      font-weight: bold;
      background-color: #f0f0f0;
    }

    .print-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #16a34a;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      cursor: pointer;
      margin-bottom: 20px;
      transition: background-color 0.3s;
    }

    .print-button:hover {
      background-color: #15803d;
    }

    .print-button:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.5);
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #ddd;
      text-align: center;
      font-size: 12px;
      color: #666;
    }

    @media print {
      .print-button,
      .no-print {
        display: none !important;
      }
      
      body {
        background: white;
        padding: 0;
      }

      .container {
        box-shadow: none;
        max-width: 100%;
        padding: 0;
      }

      table {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <button class="print-button no-print" onclick="window.print()">Print Quotation</button>

    <div class="header">
      <div class="logo">
        ${logoUrl ? `<img src="${logoUrl}" alt="Logo" onerror="this.style.display='none'">` : ""}
      </div>
      <div class="company-title">
        <h1>Quote</h1>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
      <div>
        <p><span class="label">QUOTE NO.</span></p>
        <p class="value">${quotation.quotation_number || "-"}</p>
      </div>
      <div style="text-align: right;">
        <p><span class="label">DATE</span></p>
        <p class="value">${new Date(quotation.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
      </div>
    </div>

    <div class="quote-info">
      <div class="bill-to">
        <h3>Bill To / Client</h3>
        <p class="client-name">${quotation.customer?.name || quotation.customer?.bill_to_name || "-"}</p>
        <p>${quotation.customer?.email || quotation.customer?.bill_to_email || "-"}</p>
        <p style="font-size: 12px; color: #666; margin-top: 5px;">${quotation.customer?.bill_to_street || quotation.customer?.street || ""}</p>
        <p style="font-size: 12px; color: #666;">${quotation.customer?.bill_to_city || quotation.customer?.city || ""} ${quotation.customer?.bill_to_state || quotation.customer?.state || ""}</p>
      </div>
      <div class="from">
        <h3>From</h3>
        <p><strong>${quotation.business_name}</strong></p>
        <p>${quotation.business_address}</p>
        <p>${quotation.business_city}, ${quotation.business_state} ${quotation.business_postal}</p>
        <p>${quotation.business_phone}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>PROJECT TYPE:</th>
          <th style="text-align: center;">QTY</th>
          <th style="text-align: center;">UNIT PRICE</th>
          <th style="text-align: right;">PRICE</th>
        </tr>
      </thead>
      <tbody>
        ${projectTableHTML}
        <tr>
          <td colspan="2"></td>
          <td style="font-weight: bold; text-align: right;">Sub Total:</td>
          <td style="font-weight: bold; text-align: right;">${subtotal.toLocaleString("en-PH", { minimumFractionDigits: 0 })}</td>
        </tr>
      </tbody>
    </table>

    <div class="footer">
      <p>If you have any questions concerning this quotation, just contact and email us.</p>
    </div>
  </div>

  <script>
    // Disable headers and footers in print
    window.onbeforeprint = function() {
      // This works for some browsers
      document.body.style.margin = "0";
      document.body.style.padding = "0";
    };

    // Auto-print on load (commented out - enable if needed)
    // window.addEventListener('load', function() {
    //   window.print();
    // });
  </script>
</body>
</html>
  `
}
