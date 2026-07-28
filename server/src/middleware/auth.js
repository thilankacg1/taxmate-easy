import jwt from 'jsonwebtoken'

const auth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' })
    }

    const token = authHeader.split(' ')[1]

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.userId = decoded.userId

    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export default auth