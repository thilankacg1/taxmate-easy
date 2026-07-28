import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

console.log('DB URL found:', process.env.DATABASE_URL ? 'YES' : 'NO — check .env file')

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
})

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection FAILED:', err.message)
  } else {
    console.log('Database connected at:', res.rows[0].now)
  }
})

export default pool