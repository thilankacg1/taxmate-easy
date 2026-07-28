import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
  formatAUD,
  formatDate,
  confidenceColor,
  CATEGORY_LABELS
} from '../utils/format'

interface ReceiptResult {
  vendor: string
  purchase_date: string
  total_amount: number
  gst_amount: number
  pre_gst_amount: number
  gst_free: boolean
  suggested_category: string
  category_id: number
  category_name: string
  description: string
  ai_confidence: string
  reasoning: string
  financial_year: string
}

type UploadState = 'idle' | 'uploading' | 'review' | 'saving' | 'done'

export default function Upload() {
  const navigate = useNavigate()
  const [state, setState] = useState<UploadState>('idle')
  const [result, setResult] = useState<ReceiptResult | null>(null)
  const [editedResult, setEditedResult] = useState<ReceiptResult | null>(null)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(null)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    // Show image preview
    const reader = new FileReader()
    reader.onload = () => setPreview(reader.result as string)
    reader.readAsDataURL(file)

    setState('uploading')
    setError('')

    try {
      const formData = new FormData()
      formData.append('receipt', file)

      const res = await api.post('/receipts/process', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      setResult(res.data.receipt)
      setEditedResult(res.data.receipt)
      setState('review')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Failed to process receipt'
      setError(msg)
      setState('idle')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024
  })

  const handleFieldChange = (
    field: keyof ReceiptResult,
    value: string | number | boolean
  ) => {
    setEditedResult(prev => prev ? { ...prev, [field]: value } : null)
  }

  const handleSave = async () => {
    if (!editedResult) return
    setState('saving')

    try {
      await api.post('/receipts/save', editedResult)
      setState('done')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })
        ?.response?.data?.error ?? 'Failed to save receipt'
      setError(msg)
      setState('review')
    }
  }

  const handleReset = () => {
    setState('idle')
    setResult(null)
    setEditedResult(null)
    setPreview(null)
    setError('')
  }

  // ── Done state ──────────────────────────────────────────────────────────
  if (state === 'done') {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center
                        justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Receipt saved!</h2>
        <p className="text-gray-500 mb-8">
          Added to your {editedResult?.financial_year} financial year records
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white
                       rounded-lg text-sm font-medium transition-colors"
          >
            Upload Another
          </button>
          <button
            onClick={() => navigate('/receipts')}
            className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700
                       border border-gray-200 rounded-lg text-sm font-medium
                       transition-colors"
          >
            View All Receipts
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Upload Receipt</h1>
        <p className="text-gray-500 mt-1">
          AI will extract the details and suggest an ATO category
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">

        {/* Left — Upload area */}
        <div>
          {/* Dropzone */}
          {state === 'idle' && (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-xl p-8 text-center
                         cursor-pointer transition-colors ${
                           isDragActive
                             ? 'border-green-400 bg-green-50'
                             : 'border-gray-300 hover:border-green-400 hover:bg-gray-50'
                         }`}
            >
              <input {...getInputProps()} />
              <p className="text-4xl mb-3">📷</p>
              <p className="font-medium text-gray-700 mb-1">
                {isDragActive ? 'Drop it here!' : 'Drag & drop your receipt'}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-xs text-gray-300">
                JPG, PNG, WEBP up to 10MB
              </p>
            </div>
          )}

          {/* Uploading */}
          {state === 'uploading' && (
            <div className="border-2 border-green-300 bg-green-50 rounded-xl
                            p-8 text-center">
              <div className="w-10 h-10 border-4 border-green-500
                              border-t-transparent rounded-full animate-spin
                              mx-auto mb-4"></div>
              <p className="font-medium text-green-700">AI is reading your receipt...</p>
              <p className="text-sm text-green-600 mt-1">
                Extracting details and calculating GST
              </p>
            </div>
          )}

          {/* Image preview */}
          {preview && state !== 'idle' && (
            <div className="mt-4 rounded-xl overflow-hidden border border-gray-200">
              <img
                src={preview}
                alt="Receipt preview"
                className="w-full object-contain max-h-64"
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200
                            rounded-lg text-red-700 text-sm">
              {error}
              <button
                onClick={handleReset}
                className="block mt-2 text-red-600 underline text-xs"
              >
                Try again
              </button>
            </div>
          )}
        </div>

        {/* Right — AI result review */}
        {(state === 'review' || state === 'saving') && editedResult && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">

            {/* AI confidence badge */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">AI Result</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-medium
                               ${confidenceColor(editedResult.ai_confidence)}`}>
                {editedResult.ai_confidence} confidence
              </span>
            </div>

            {/* Reasoning */}
            <p className="text-xs text-gray-400 bg-gray-50 rounded-lg p-2 mb-4">
              💡 {editedResult.reasoning}
            </p>

            <div className="space-y-3">

              {/* Vendor */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Vendor
                </label>
                <input
                  type="text"
                  value={editedResult.vendor}
                  onChange={e => handleFieldChange('vendor', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-green-500"
                />
              </div>

              {/* Date */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Date
                </label>
                <input
                  type="date"
                  value={editedResult.purchase_date}
                  onChange={e =>
                    handleFieldChange('purchase_date', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-green-500"
                />
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Total Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editedResult.total_amount}
                    onChange={e =>
                      handleFieldChange('total_amount', parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    GST Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editedResult.gst_amount}
                    onChange={e =>
                      handleFieldChange('gst_amount', parseFloat(e.target.value))
                    }
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg
                               text-sm focus:outline-none focus:ring-2
                               focus:ring-green-500"
                  />
                </div>
              </div>

              {/* GST summary */}
              <div className={`p-3 rounded-lg text-sm ${
                editedResult.gst_free
                  ? 'bg-gray-50 text-gray-500'
                  : 'bg-green-50 text-green-700'
              }`}>
                {editedResult.gst_free ? (
                  <p>⚪ GST-free item — no GST claimable</p>
                ) : (
                  <p>
                    ✅ GST claimable:{' '}
                    <strong>{formatAUD(editedResult.gst_amount)}</strong>
                    {' '}(pre-GST: {formatAUD(editedResult.pre_gst_amount)})
                  </p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  ATO Category
                </label>
                <select
                  value={editedResult.suggested_category}
                  onChange={e =>
                    handleFieldChange('suggested_category', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg
                             text-sm focus:outline-none focus:ring-2
                             focus:ring-green-500 bg-white"
                >
                  {Object.entries(CATEGORY_LABELS).map(([code, label]) => (
                    <option key={code} value={code}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Financial year */}
              <div className="flex justify-between text-xs text-gray-400 pt-1">
                <span>Financial year: {editedResult.financial_year}</span>
                <span>Date: {formatDate(editedResult.purchase_date)}</span>
              </div>

            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={handleSave}
                disabled={state === 'saving'}
                className="flex-1 bg-green-500 hover:bg-green-600
                           disabled:bg-green-300 text-white font-medium
                           py-2.5 rounded-lg text-sm transition-colors"
              >
                {state === 'saving' ? 'Saving...' : 'Save Receipt'}
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50
                           text-gray-600 rounded-lg text-sm transition-colors"
              >
                Discard
              </button>
            </div>

          </div>
        )}

        {/* Right — empty state */}
        {state === 'idle' && (
          <div className="bg-gray-50 rounded-xl border border-dashed
                          border-gray-200 p-8 flex flex-col items-center
                          justify-center text-center">
            <p className="text-3xl mb-3">🤖</p>
            <p className="font-medium text-gray-500 mb-1">AI will extract</p>
            <ul className="text-sm text-gray-400 space-y-1 text-left mt-2">
              <li>✓ Vendor name</li>
              <li>✓ Purchase date</li>
              <li>✓ Total amount</li>
              <li>✓ GST calculation</li>
              <li>✓ ATO category</li>
              <li>✓ Financial year</li>
            </ul>
          </div>
        )}

      </div>
    </div>
  )
}