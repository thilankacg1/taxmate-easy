import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../db/pool.js'

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  )
}

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { email, password, full_name, abn, gst_registered } = req.body

    // Check if user already exists
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Hash password — never store plain text
    const password_hash = await bcrypt.hash(password, 12)

    // Insert new user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, abn, gst_registered)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, email, full_name, abn, gst_registered, created_at`,
      [email.toLowerCase(), password_hash, full_name, abn || null, gst_registered || false]
    )

    const user = result.rows[0]
    const token = generateToken(user.id)

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        abn: user.abn,
        gst_registered: user.gst_registered
      }
    })
  } catch (err) {
    console.error('Register error:', err)
    res.status(500).json({ error: 'Server error during registration' })
  }
}

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user by email
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    )

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = result.rows[0]

    // Compare password with stored hash
    const validPassword = await bcrypt.compare(password, user.password_hash)

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = generateToken(user.id)

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        abn: user.abn,
        gst_registered: user.gst_registered
      }
    })
  } catch (err) {
    console.error('Login error:', err)
    res.status(500).json({ error: 'Server error during login' })
  }
}

// GET /api/auth/me — get current logged in user
export const getMe = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, abn, gst_registered, created_at FROM users WHERE id = $1',
      [req.userId]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user: result.rows[0] })
  } catch (err) {
    console.error('Get me error:', err)
    res.status(500).json({ error: 'Server error' })
  }
}