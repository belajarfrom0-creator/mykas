export const EXPENSE_CATEGORIES = [
  { id: 1, name: 'Makanan', icon: '🍔', color: '#F59E0B' },
  { id: 2, name: 'Kosmetik', icon: '💄', color: '#EC4899' },
  { id: 3, name: 'Transportasi', icon: '🚗', color: '#3B82F6' },
  { id: 4, name: 'Hiburan', icon: '🎬', color: '#8B5CF6' },
  { id: 5, name: 'Belanja', icon: '🛍️', color: '#10B981' },
  { id: 6, name: 'Pendidikan', icon: '📚', color: '#F97316' },
  { id: 7, name: 'Tagihan', icon: '📄', color: '#6B7280' },
  { id: 8, name: 'Lainnya', icon: '📌', color: '#64748B' },
]

export const formatCurrency = (amount: number, locale = 'id-ID') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export const toDateInputValue = (date: Date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export const normalizeDateInputValue = (date: string | Date) => {
  if (date instanceof Date) {
    return toDateInputValue(date)
  }

  const dateOnly = date.match(/^\d{4}-\d{2}-\d{2}/)?.[0]
  if (dateOnly) {
    return dateOnly
  }

  return toDateInputValue(new Date(date))
}

export const parseLocalDate = (date: string | Date) => {
  if (date instanceof Date) {
    return date
  }

  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  }

  return new Date(date)
}

export const formatDate = (date: string | Date) => {
  return new Intl.DateTimeFormat('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parseLocalDate(date))
}

export const getDateRange = (type: 'week' | 'month' | 'year') => {
  const today = new Date()
  const start = new Date()

  switch (type) {
    case 'week':
      start.setDate(today.getDate() - 7)
      break
    case 'month':
      start.setMonth(today.getMonth() - 1)
      break
    case 'year':
      start.setFullYear(today.getFullYear() - 1)
      break
  }

  return {
    start: toDateInputValue(start),
    end: toDateInputValue(today),
  }
}

export const cn = (...classes: (string | undefined | false)[]) => {
  return classes.filter(Boolean).join(' ')
}
