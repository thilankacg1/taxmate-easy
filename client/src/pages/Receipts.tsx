import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import {
  formatAUD,
  formatDate,
  getCurrentFinancialYear,
  confidenceColor,
  CATEGORY_LABELS,
  CATEGORY_COLORS
} from '../utils/format'

interface Receipt {
  id: number
  vendor: string
  purchase_date: string
  total_amount: string
  gst_amount: string
  pre_gst_amount: string
  gst_free: boolean
  suggested_category: string
  category_code: string
  category_name: string
  description: string
  ai_confidence: string
  financial_year: string
  notes: string | null
  created_at: string
}

export default function Receipts() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedFY, setSelectedFY] = useState(getCurrentFinancialYear())
  const [selectedCategory, setSelectedCategory] = useState('')
  const [deleteId, setDeleteId] = useState<number | null>(null)

  // Build query string
  const params = new URLSearchParams()
  if (selectedFY) params.append('financial_year', selectedFY)
  if (selectedCategory) params.append('category', selectedCategory)

  const { data, isLoading } = useQuery<{ receipts: Receipt[] }>({
    queryKey: ['receipts', selectedFY, selectedCategory],
    queryFn: async () => {
      const res = await api.get(`/receipts?${params.toString()}`)
      return res.data
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/receipts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['receipts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDeleteId(null)
    }
  })

  const receipts = data?.receipts ?? []

  // CSV export
  const handleExport = () => {
    if (receipts.length === 0) return

    const headers = [
      'Date', 'Vendor', 'Description', 'Category',
      'Total ($)', 'GST ($)', 'Pre-GST ($)',
      'GST Free', 'Financial Year', 'AI Confidence'
    ]

    const rows = receipts.map(r => [
      formatDate(r.purchase_date),
      r.vendor,
      r.description,
      CATEGORY_LABELS[r.category_code] ?? r.category_name,
      parseFloat(r.total_amount).toFixed(2),
      parseFloat(r.gst_amount).toFixed(2),
      parseFloat(r.pre_gst_amount).toFixed(2),
      r.gst_free ? 'Yes' : 'No',
      r.financial_year,
      r.ai_confidence
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `taxmate-receipts-${selectedFY}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Financial year options
  const fyOptions = ['2025-26', '2024-25', '2023-24', '2022-23']

  // Totals
  const totalSpend = receipts.reduce(
    (sum, r) => sum + parseFloat(r.total_amount), 0
  )
  const totalGST = receipts.reduce(
    (sum, r) => sum + parseFloat(r.gst_amount), 0
  )

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Receipts</h1>
          <p className="text-gray-500 mt-1">
            {receipts.length} receipt{receipts.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/upload')}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white
                       text-sm font-medium rounded-lg transition-colors"
          >
            + Upload Receipt
          </button>
          <button
            onClick={handleExport}
            disabled={receipts.length === 0}
            className="px-4 py-2 bg-white hover:bg-gray-50 disabled:opacity-40
                       text-gray-700 text-sm font-medium border border-gray-200
                       rounded-lg transition-colors"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select
          value={selectedFY}
          onChange={e => setSelectedFY(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm
                     bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          {fyOptions.map(fy => (
            <option key={fy} value={fy}>FY {fy}</option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm
                     bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([code, label]) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
      </div>

      {/* Summary bar */}
      {receipts.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Receipts shown</p>
            <p className="text-xl font-bold text-gray-900">{receipts.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-xs text-gray-500 mb-1">Total spend</p>
            <p className="text-xl font-bold text-gray-900">
              {formatAUD(totalSpend)}
            </p>
          </div>
          <div className="bg-green-50 rounded-xl border border-green-200 p-4">
            <p className="text-xs text-green-700 mb-1">GST claimable</p>
            <p className="text-xl font-bold text-green-700">
              {formatAUD(totalGST)}
            </p>
          </div>
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-green-500
                          border-t-transparent rounded-full animate-spin">
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && receipts.length === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300
                        p-12 text-center">
          <p className="text-4xl mb-4">🧾</p>
          <h3 className="font-semibold text-gray-700 mb-2">No receipts found</h3>
          <p className="text-gray-400 text-sm mb-4">
            {selectedCategory
              ? 'Try selecting a different category'
              : 'Upload your first receipt to get started'}
          </p>
          <button
            onClick={() => navigate('/upload')}
            className="bg-green-500 hover:bg-green-600 text-white text-sm
                       font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Upload Receipt
          </button>
        </div>
      )}

      {/* Receipts table */}
      {!isLoading && receipts.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold
                               text-gray-500 uppercase tracking-wide">
                  Date
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold
                               text-gray-500 uppercase tracking-wide">
                  Vendor
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold
                               text-gray-500 uppercase tracking-wide">
                  Category
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold
                               text-gray-500 uppercase tracking-wide">
                  Total
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold
                               text-gray-500 uppercase tracking-wide">
                  GST
                </th>
                <th className="text-center px-4 py-3 text-xs font-semibold
                               text-gray-500 uppercase tracking-wide">
                  Confidence
                </th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {receipts.map((receipt) => (
                <tr
                  key={receipt.id}
                  className="border-b border-gray-50 hover:bg-gray-50
                             transition-colors last:border-0"
                >
                  <td className="px-4 py-3 text-gray-500">
                    {formatDate(receipt.purchase_date)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{receipt.vendor}</p>
                    {receipt.description && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">
                        {receipt.description}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{
                          background:
                            CATEGORY_COLORS[receipt.category_code] ?? '#9ca3af'
                        }}
                      />
                      <span className="text-gray-700">
                        {CATEGORY_LABELS[receipt.category_code] ??
                          receipt.category_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-gray-900">
                    {formatAUD(parseFloat(receipt.total_amount))}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {receipt.gst_free ? (
                      <span className="text-gray-400 text-xs">GST free</span>
                    ) : (
                      <span className="text-green-600 font-medium">
                        {formatAUD(parseFloat(receipt.gst_amount))}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium
                                     ${confidenceColor(receipt.ai_confidence)}`}>
                      {receipt.ai_confidence}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setDeleteId(receipt.id)}
                      className="text-gray-300 hover:text-red-500
                                 transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete confirm modal */}
      {deleteId !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center
                        justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-bold text-gray-900 mb-2">Delete receipt?</h3>
            <p className="text-gray-500 text-sm mb-6">
              This cannot be undone. The receipt will be permanently removed
              from your records.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => deleteMutation.mutate(deleteId)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-500 hover:bg-red-600
                           disabled:bg-red-300 text-white font-medium
                           py-2.5 rounded-lg text-sm transition-colors"
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 bg-white hover:bg-gray-50 text-gray-700
                           border border-gray-200 font-medium py-2.5
                           rounded-lg text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}