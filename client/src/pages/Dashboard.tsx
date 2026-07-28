import { useQuery } from '@tanstack/react-query'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { useAuth } from '../context/useAuth'
import api from '../services/api'
import {
  formatAUD,
  getCurrentFinancialYear,
  CATEGORY_LABELS,
  CATEGORY_COLORS
} from '../utils/format'

interface CategorySummary {
  category_code: string
  category_name: string
  receipt_count: string
  total_spend: string
  total_gst: string
}

interface DashboardSummary {
  total_receipts: string
  total_spend: string
  total_gst_claimable: string
}

interface DashboardData {
  financial_year: string
  summary: DashboardSummary
  by_category: CategorySummary[]
}

export default function Dashboard() {
  const { user } = useAuth()
  const fy = getCurrentFinancialYear()

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ['dashboard', fy],
    queryFn: async () => {
      const res = await api.get(`/receipts/summary?financial_year=${fy}`)
      return res.data
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-green-500 border-t-transparent
                          rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">Failed to load dashboard. Please refresh.</p>
      </div>
    )
  }

  const summary = data?.summary
  const byCategory = data?.by_category ?? []

  // Prepare chart data
  const chartData = byCategory
    .filter(c => c.category_code !== 'PERSONAL')
    .map(c => ({
      name: CATEGORY_LABELS[c.category_code] ?? c.category_name,
      code: c.category_code,
      spend: parseFloat(c.total_spend),
      gst: parseFloat(c.total_gst),
      count: parseInt(c.receipt_count)
    }))
    .sort((a, b) => b.spend - a.spend)

  const totalReceipts = parseInt(summary?.total_receipts ?? '0')
  const totalSpend = parseFloat(summary?.total_spend ?? '0')
  const totalGST = parseFloat(summary?.total_gst_claimable ?? '0')

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          G'day, {user?.full_name?.split(' ')[0]} 👋
        </h1>
        <p className="text-gray-500 mt-1">
          Financial year {fy} - here's your tax summary
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-5 mb-8">

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Receipts</p>
          <p className="text-3xl font-bold text-gray-900">{totalReceipts}</p>
          <p className="text-xs text-gray-400 mt-1">This financial year</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Business Spend</p>
          <p className="text-3xl font-bold text-gray-900">
            {formatAUD(totalSpend)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Before GST deductions</p>
        </div>

        <div className="bg-green-50 rounded-xl border border-green-200 p-5">
          <p className="text-sm text-green-700 mb-1">GST Claimable 🎉</p>
          <p className="text-3xl font-bold text-green-700">
            {formatAUD(totalGST)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            Potential refund from ATO
          </p>
        </div>

      </div>

      {/* Empty state */}
      {totalReceipts === 0 && (
        <div className="bg-white rounded-xl border border-dashed border-gray-300
                        p-12 text-center mb-8">
          <p className="text-4xl mb-4">🧾</p>
          <h3 className="font-semibold text-gray-700 mb-2">No receipts yet</h3>
          <p className="text-gray-400 text-sm mb-4">
            Upload your first receipt to start tracking expenses
          </p>
          
           <a href="/upload"
            className="inline-block bg-green-500 hover:bg-green-600 text-white
                       text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Upload Receipt
          </a>
        </div>
      )}

      {/* Chart + category breakdown */}
      {chartData.length > 0 && (
        <div className="grid grid-cols-2 gap-5">

          {/* Bar chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Spend by Category
            </h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart
                data={chartData}
                margin={{ top: 0, right: 0, bottom: 60, left: 0 }}
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  angle={-35}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  //formatter={(value: number) => [formatAUD(value), 'Spend']}
                  contentStyle={{
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry) => (
                    <Cell
                      key={entry.code}
                      fill={CATEGORY_COLORS[entry.code] ?? '#9ca3af'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Category table */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h2 className="font-semibold text-gray-900 mb-4">
              Category Breakdown
            </h2>
            <div className="space-y-2">
              {byCategory.map((cat) => (
                <div
                  key={cat.category_code}
                  className="flex items-center justify-between py-2
                             border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{
                        background:
                          CATEGORY_COLORS[cat.category_code] ?? '#9ca3af'
                      }}
                    />
                    <span className="text-sm text-gray-700">
                      {CATEGORY_LABELS[cat.category_code] ?? cat.category_name}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({cat.receipt_count})
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {formatAUD(parseFloat(cat.total_spend))}
                    </p>
                    <p className="text-xs text-green-600">
                      GST {formatAUD(parseFloat(cat.total_gst))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ATO disclaimer */}
      <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
        <p className="text-xs text-amber-700">
          ⚠️ <strong>Disclaimer:</strong> TaxMate is a guide only.
          Always consult a registered tax agent before lodging your tax return
          or BAS. GST calculations are estimates based on standard ATO rules.
        </p>
      </div>

    </div>
  )
}