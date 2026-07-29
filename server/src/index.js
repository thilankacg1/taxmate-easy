app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      'http://localhost:5173',
      'http://localhost:5174',
      process.env.CLIENT_URL
    ]

    // Allow requests with no origin (Postman, mobile apps)
    if (!origin) return callback(null, true)

    if (allowed.includes(origin)) {
      callback(null, true)
    } else {
      console.log('CORS blocked origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
// Handle preflight requests
app.options('*', cors())