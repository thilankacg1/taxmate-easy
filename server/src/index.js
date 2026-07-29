import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db/pool.js'
import authRoutes from './routes/auth.js'
import receiptRoutes from './routes/receipts.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

// ── CORS ──────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  process.env.CLIENT_URL
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (Postman, mobile, server-to-server)
    if (!origin) return callback(null, true)

    if (allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS blocked:', origin)
      callback(new Error(`CORS policy: origin ${origin} not allowed`))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

// Handle preflight requests for all routes
app.options('*', cors())

// ── MIDDLEWARE ────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ── HEALTH CHECK ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'TaxMate Easy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// ── ROUTES ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/receipts', receiptRoutes)

// ── 404 HANDLER ───────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` })
})

// ── GLOBAL ERROR HANDLER ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error:', err.message)

  if (err.message?.includes('CORS')) {
    return res.status(403).json({ error: err.message })
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large — maximum 10MB' })
  }

  if (err.name === 'MulterError') {
    return res.status(400).json({
      error: 'File upload error: ' + err.message,
      hint: 'Make sure field name is "receipt" and type is File'
    })
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ error: 'Invalid token' })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ error: 'Token expired — please sign in again' })
  }

  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  })
})

// ── START SERVER ──────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`TaxMate server running on http://localhost:${PORT}`)
  console.log(`Allowed origins: ${allowedOrigins.join(', ')}`)
})