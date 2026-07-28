export const formatAUD = (amount: number | string | null | undefined): string => {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD'
  }).format(Number(amount) || 0)
}

export const formatDate = (dateStr: string | null | undefined): string => {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-AU', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

export const getCurrentFinancialYear = (): string => {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  return month >= 7
    ? `${year}-${(year + 1).toString().slice(-2)}`
    : `${year - 1}-${year.toString().slice(-2)}`
}

export const confidenceColor = (confidence: string): string => {
  const map: Record<string, string> = {
    high:   'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    low:    'bg-red-100 text-red-800'
  }
  return map[confidence] ?? map['medium']
}

export const CATEGORY_LABELS: Record<string, string> = {
  TOOLS_EQUIPMENT:    'Tools & Equipment',
  VEHICLE_TRAVEL:     'Vehicle & Travel',
  HOME_OFFICE:        'Home Office',
  PHONE_INTERNET:     'Phone & Internet',
  CLOTHING_PPE:       'Clothing & PPE',
  ADVERTISING:        'Advertising',
  PROFESSIONAL_FEES:  'Professional Fees',
  INSURANCE:          'Insurance',
  EDUCATION_TRAINING: 'Education & Training',
  OFFICE_SUPPLIES:    'Office Supplies',
  MEALS_ENTERTAIN:    'Meals & Entertainment',
  SUBCONTRACTORS:     'Subcontractors',
  PERSONAL:           'Personal (Not Deductible)'
}

export const CATEGORY_COLORS: Record<string, string> = {
  TOOLS_EQUIPMENT:    '#3b82f6',
  VEHICLE_TRAVEL:     '#f59e0b',
  HOME_OFFICE:        '#8b5cf6',
  PHONE_INTERNET:     '#06b6d4',
  CLOTHING_PPE:       '#f97316',
  ADVERTISING:        '#ec4899',
  PROFESSIONAL_FEES:  '#6366f1',
  INSURANCE:          '#14b8a6',
  EDUCATION_TRAINING: '#84cc16',
  OFFICE_SUPPLIES:    '#64748b',
  MEALS_ENTERTAIN:    '#ef4444',
  SUBCONTRACTORS:     '#a855f7',
  PERSONAL:           '#9ca3af'
}