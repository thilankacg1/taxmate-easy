import { calculateGST, getFinancialYear } from './gst.js'

// ── MOCK DATA for development ─────────────────────────────────────────────
const MOCK_RECEIPTS = [
  {
    vendor: "Bunnings Warehouse",
    purchase_date: "2026-06-20",
    total_amount: 109.89,
    gst_shown_on_receipt: false,
    gst_amount_on_receipt: null,
    is_gst_free: false,
    suggested_category: "TOOLS_EQUIPMENT",
    description: "Power drill and drill bits",
    confidence: "high",
    reasoning: "Hardware store purchase of tools used for trade work"
  },
  {
    vendor: "BP Service Station",
    purchase_date: "2026-06-18",
    total_amount: 85.50,
    gst_shown_on_receipt: true,
    gst_amount_on_receipt: 7.77,
    is_gst_free: false,
    suggested_category: "VEHICLE_TRAVEL",
    description: "Fuel for work vehicle",
    confidence: "high",
    reasoning: "Fuel purchase at service station for work-related travel"
  },
  {
    vendor: "Officeworks",
    purchase_date: "2026-06-15",
    total_amount: 45.00,
    gst_shown_on_receipt: false,
    gst_amount_on_receipt: null,
    is_gst_free: false,
    suggested_category: "OFFICE_SUPPLIES",
    description: "Printer paper and stationery",
    confidence: "high",
    reasoning: "Office supplies for business administration"
  },
  {
    vendor: "Woolworths",
    purchase_date: "2026-06-14",
    total_amount: 52.30,
    gst_shown_on_receipt: false,
    gst_amount_on_receipt: null,
    is_gst_free: true,
    suggested_category: "PERSONAL",
    description: "Groceries",
    confidence: "high",
    reasoning: "Grocery items are personal expenses and mostly GST-free"
  },
  {
    vendor: "Telstra",
    purchase_date: "2026-06-10",
    total_amount: 99.00,
    gst_shown_on_receipt: true,
    gst_amount_on_receipt: 9.00,
    is_gst_free: false,
    suggested_category: "PHONE_INTERNET",
    description: "Monthly mobile phone plan",
    confidence: "high",
    reasoning: "Telecommunications expense for business mobile"
  }
]

// ── MOCK AI service — returns realistic fake data ─────────────────────────
const mockProcessReceipt = async () => {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 800))

  // Randomly pick a mock receipt so you can test different scenarios
  const mock = MOCK_RECEIPTS[Math.floor(Math.random() * MOCK_RECEIPTS.length)]
  return mock
}

// ── REAL AI service — uncomment when you have API credits ─────────────────
// import { GoogleGenerativeAI } from '@google/generative-ai'
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const ATO_CATEGORIES = [
  'TOOLS_EQUIPMENT', 'VEHICLE_TRAVEL', 'HOME_OFFICE',
  'PHONE_INTERNET', 'CLOTHING_PPE', 'ADVERTISING',
  'PROFESSIONAL_FEES', 'INSURANCE', 'EDUCATION_TRAINING',
  'OFFICE_SUPPLIES', 'MEALS_ENTERTAIN', 'SUBCONTRACTORS', 'PERSONAL'
]

export const processReceipt = async (imageBuffer, mimeType) => {
  try {
    // ── Switch between mock and real AI ───────────────────────────────────
    // Change USE_MOCK to false when you have real API credits
    const USE_MOCK = process.env.USE_MOCK_AI === 'true'

    let aiData
    if (USE_MOCK) {
      console.log('Using MOCK AI — set USE_MOCK_AI=false in .env for real AI')
      aiData = await mockProcessReceipt()
    } else {
      // Real AI goes here — we'll plug in when credits are available
      throw new Error('Real AI not configured — set USE_MOCK_AI=true in .env')
    }

    // Apply Australian GST calculation
    const gstResult = calculateGST(
      aiData.total_amount,
      aiData.gst_shown_on_receipt,
      aiData.gst_amount_on_receipt,
      aiData.is_gst_free
    )

    // Calculate financial year
    const financialYear = aiData.purchase_date
      ? getFinancialYear(aiData.purchase_date)
      : getFinancialYear(new Date().toISOString())

    const category = ATO_CATEGORIES.includes(aiData.suggested_category)
      ? aiData.suggested_category
      : 'PERSONAL'

    return {
      vendor: aiData.vendor,
      purchase_date: aiData.purchase_date,
      total_amount: gstResult.total_amount,
      gst_amount: gstResult.gst_amount,
      pre_gst_amount: gstResult.pre_gst_amount,
      gst_free: gstResult.gst_free,
      suggested_category: category,
      description: aiData.description,
      ai_confidence: aiData.confidence,
      reasoning: aiData.reasoning,
      financial_year: financialYear
    }

  } catch (err) {
    console.error('AI processing error:', err.message)
    throw new Error('Failed to process receipt: ' + err.message)
  }
}