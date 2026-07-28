import pool from '../db/pool.js'
import { processReceipt } from '../services/aiService.js'

// POST /api/receipts/process — upload and analyse receipt
export const processReceiptUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No receipt image uploaded' })
    }

    console.log(`Processing receipt for user ${req.userId}...`)

    // Send to AI for analysis
    const result = await processReceipt(req.file.buffer, req.file.mimetype)

    // Get category details from database
    const categoryResult = await pool.query(
      'SELECT id, name FROM ato_categories WHERE code = $1',
      [result.suggested_category]
    )

    const category = categoryResult.rows[0]

    // Return result for user to review before saving
    res.json({
      message: 'Receipt processed successfully',
      receipt: {
        ...result,
        category_id: category?.id,
        category_name: category?.name
      }
    })
  } catch (err) {
    console.error('Receipt processing error:', err)
    res.status(500).json({ error: err.message || 'Failed to process receipt' })
  }
}

// POST /api/receipts/save — save confirmed receipt to database
export const saveReceipt = async (req, res) => {
  try {
    const {
      vendor, purchase_date, total_amount, gst_amount,
      pre_gst_amount, gst_free, category_id, description,
      ai_confidence, financial_year, notes
    } = req.body

    const result = await pool.query(
      `INSERT INTO receipts
        (user_id, vendor, purchase_date, total_amount, gst_amount,
         pre_gst_amount, gst_free, category_id, description,
         ai_confidence, financial_year, notes)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       RETURNING *`,
      [req.userId, vendor, purchase_date, total_amount, gst_amount,
       pre_gst_amount, gst_free, category_id, description,
       ai_confidence, financial_year, notes || null]
    )

    res.status(201).json({
      message: 'Receipt saved successfully',
      receipt: result.rows[0]
    })
  } catch (err) {
    console.error('Save receipt error:', err)
    res.status(500).json({ error: 'Failed to save receipt' })
  }
}

// GET /api/receipts — get all receipts for logged in user
export const getReceipts = async (req, res) => {
  try {
    const { financial_year, category } = req.query

    let query = `
      SELECT r.*, c.name as category_name, c.code as category_code
      FROM receipts r
      LEFT JOIN ato_categories c ON r.category_id = c.id
      WHERE r.user_id = $1
    `
    const params = [req.userId]

    if (financial_year) {
      params.push(financial_year)
      query += ` AND r.financial_year = $${params.length}`
    }

    if (category) {
      params.push(category)
      query += ` AND c.code = $${params.length}`
    }

    query += ' ORDER BY r.purchase_date DESC'

    const result = await pool.query(query, params)

    res.json({ receipts: result.rows })
  } catch (err) {
    console.error('Get receipts error:', err)
    res.status(500).json({ error: 'Failed to fetch receipts' })
  }
}

// GET /api/receipts/summary — dashboard totals
export const getDashboardSummary = async (req, res) => {
  try {
    const { financial_year } = req.query
    const fy = financial_year || getCurrentFinancialYear()

    const result = await pool.query(`
      SELECT
        c.name as category_name,
        c.code as category_code,
        COUNT(r.id) as receipt_count,
        SUM(r.total_amount) as total_spend,
        SUM(r.gst_amount) as total_gst
      FROM receipts r
      LEFT JOIN ato_categories c ON r.category_id = c.id
      WHERE r.user_id = $1 AND r.financial_year = $2
      GROUP BY c.name, c.code
      ORDER BY total_spend DESC
    `, [req.userId, fy])

    const totals = await pool.query(`
      SELECT
        COUNT(id) as total_receipts,
        SUM(total_amount) as total_spend,
        SUM(gst_amount) as total_gst_claimable
      FROM receipts
      WHERE user_id = $1 AND financial_year = $2
    `, [req.userId, fy])

    res.json({
      financial_year: fy,
      summary: totals.rows[0],
      by_category: result.rows
    })
  } catch (err) {
    console.error('Dashboard summary error:', err)
    res.status(500).json({ error: 'Failed to fetch summary' })
  }
}

// DELETE /api/receipts/:id
export const deleteReceipt = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM receipts WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Receipt not found' })
    }

    res.json({ message: 'Receipt deleted successfully' })
  } catch (err) {
    console.error('Delete receipt error:', err)
    res.status(500).json({ error: 'Failed to delete receipt' })
  }
}

const getCurrentFinancialYear = () => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  return month >= 7 ? `${year}-${(year + 1).toString().slice(-2)}`
                    : `${year - 1}-${year.toString().slice(-2)}`
}