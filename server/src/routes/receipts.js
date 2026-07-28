import express from 'express'
import auth from '../middleware/auth.js'
import upload from '../middleware/upload.js'
import {
  processReceiptUpload,
  saveReceipt,
  getReceipts,
  getDashboardSummary,
  deleteReceipt
} from '../controllers/receiptsController.js'

const router = express.Router()

// All routes require authentication
router.use(auth)

router.post('/process', upload.single('receipt'), processReceiptUpload)
router.post('/save', saveReceipt)
router.get('/', getReceipts)
router.get('/summary', getDashboardSummary)
router.delete('/:id', deleteReceipt)

export default router