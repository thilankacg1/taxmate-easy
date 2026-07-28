// Australian GST is 10% — but the maths depends on whether
// the price shown already includes GST or not

export const calculateGST = (total, gstShownOnReceipt, gstAmountOnReceipt, isGSTFree) => {
  // GST-free items: fresh food, medicine, education etc
  if (isGSTFree) {
    return {
      total_amount: parseFloat(total),
      gst_amount: 0,
      pre_gst_amount: parseFloat(total),
      gst_free: true
    }
  }

  // If the receipt explicitly shows the GST amount — use that directly
  if (gstShownOnReceipt && gstAmountOnReceipt > 0) {
    return {
      total_amount: parseFloat(total),
      gst_amount: parseFloat(gstAmountOnReceipt),
      pre_gst_amount: parseFloat(total) - parseFloat(gstAmountOnReceipt),
      gst_free: false
    }
  }

  // GST-inclusive price (most Australian retail receipts)
  // Formula: GST = Total ÷ 11
  const gst = parseFloat((parseFloat(total) / 11).toFixed(2))
  const preGST = parseFloat((parseFloat(total) - gst).toFixed(2))

  return {
    total_amount: parseFloat(total),
    gst_amount: gst,
    pre_gst_amount: preGST,
    gst_free: false
  }
}

// Australian financial year: 1 July to 30 June
// Jan 2026 → "2025-26", Aug 2026 → "2026-27"
export const getFinancialYear = (dateStr) => {
  const date = new Date(dateStr)
  const month = date.getMonth() + 1 // 1-12
  const year = date.getFullYear()

  if (month >= 7) {
    // July onwards — new financial year
    return `${year}-${(year + 1).toString().slice(-2)}`
  } else {
    // Jan to June — still in previous financial year
    return `${year - 1}-${year.toString().slice(-2)}`
  }
}