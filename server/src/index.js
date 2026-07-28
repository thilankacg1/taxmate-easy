import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db/pool.js'
import authRoutes from './routes/auth.js'
import receiptRoutes from './routes/receipts.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    process.env.CLIENT_URL
  ],
  credentials: true
}))
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TaxMate Easy',
    timestamp: new Date().toISOString()
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/receipts', receiptRoutes)

// Global error handler — catches Multer and other middleware errors
app.use((err, req, res, next) => {
  console.error('Error:', err.message)

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large — maximum 10MB' })
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error: ' + err.message,
      hint: 'Make sure field name is "receipt" and type is File'
    })
  }

  res.status(500).json({ error: err.message || 'Server error' })
})

app.listen(PORT, () => {
  console.log(`TaxMate server running on http://localhost:${PORT}`)
})