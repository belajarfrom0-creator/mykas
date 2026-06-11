'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/lib/api'
import { DashboardStats, Expense, UserSpendingLimits } from '@/types'
import { formatCurrency } from '@/lib/utils'
import { Loader, BarChart3, Bell, CalendarDays, ChevronLeft, ChevronRight, Receipt } from 'lucide-react'
import Link from 'next/link'

const weekdayLabels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min']

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const parseLocalDate = (date: string) => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(year, month - 1, day)
}

const formatLongDate = (date: string) =>
  new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parseLocalDate(date))

const formatMonthTitle = (date: Date) =>
  new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(date)

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [limits, setLimits] = useState<UserSpendingLimits | null>(null)
  const [selectedDate, setSelectedDate] = useState(() => toLocalDateString(new Date()))
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1)
  })
  const [selectedExpenses, setSelectedExpenses] = useState<Expense[]>([])
  const [expensesLoading, setExpensesLoading] = useState(false)
  const [expensesError, setExpensesError] = useState('')
  const [loading, setLoading] = useState(true)
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsResponse, limitsResponse] = await Promise.all([
          apiClient.getDashboardStats(),
          apiClient.getUserLimits(),
        ])
        setStats(statsResponse.data)
        setLimits(limitsResponse.data)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    const fetchSelectedExpenses = async () => {
      try {
        setExpensesLoading(true)
        setExpensesError('')
        const response = await apiClient.getDashboardExpenses({
          start_date: selectedDate,
          end_date: selectedDate,
          per_page: 100,
        })
        setSelectedExpenses(response.data.data || [])
      } catch (error) {
        console.error('Error fetching selected day expenses:', error)
        setExpensesError('Gagal memuat daftar pengeluaran pada tanggal ini')
      } finally {
        setExpensesLoading(false)
      }
    }

    fetchSelectedExpenses()
  }, [selectedDate])

  const selectedDayTotal = useMemo(
    () => selectedExpenses.reduce((total, expense) => total + Number(expense.amount || 0), 0),
    [selectedExpenses]
  )

  const dailyAmountByDate = useMemo(() => {
    const amounts = new Map<string, number>()

    stats?.daily_data?.forEach(day => {
      amounts.set(day.date, Number(day.amount || 0))
    })

    amounts.set(selectedDate, selectedDayTotal)
    return amounts
  }, [selectedDate, selectedDayTotal, stats])

  const calendarDays = useMemo(() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const leadingEmptyDays = (firstDay.getDay() + 6) % 7
    const cells: Array<{ date: string; day: number; amount: number } | null> = []

    for (let index = 0; index < leadingEmptyDays; index++) {
      cells.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = toLocalDateString(new Date(year, month, day))
      cells.push({
        date,
        day,
        amount: dailyAmountByDate.get(date) || 0,
      })
    }

    return cells
  }, [calendarMonth, dailyAmountByDate])

  const moveCalendarMonth = (direction: -1 | 1) => {
    setCalendarMonth(previous => new Date(previous.getFullYear(), previous.getMonth() + direction, 1))
  }

  const handleSelectDate = (date: string) => {
    if (!date) {
      return
    }

    const parsedDate = parseLocalDate(date)
    setSelectedDate(date)
    setCalendarMonth(new Date(parsedDate.getFullYear(), parsedDate.getMonth(), 1))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  if (!stats) {
    return <div>Error loading dashboard data</div>
  }

  const monthlyLimit = limits?.monthly_limit ?? null
  // const monthlyUsage = monthlyLimit
  //   ? Math.min(Math.round((stats.monthly_expenses / monthlyLimit) * 100), 100)
  //   : null

  return (
    <div className="responsive-page">
      {/* Header */}
      <div className="flex min-w-0 flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mobile-header text-2xl sm:text-3xl text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mobile-text text-gray-600 dark:text-gray-400 mt-1">Selamat datang kembali! Berikut ringkasan pengeluaran Anda</p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:gap-3">
          <Link href="/laporan" className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-100 dark:bg-blue-900/20 text-primary dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-colors text-sm sm:text-base touch-target">
            <BarChart3 size={18} />
            Laporan
          </Link>
          <Link href="/expenses/new" className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base touch-target">
            + Tambah
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* Total Pengeluaran */}
        <div className="mobile-card bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/10 border border-blue-200 dark:border-blue-800">
          <p className="text-blue-900 dark:text-blue-300 text-xs sm:text-sm font-medium">Total Pengeluaran</p>
          <p className="mt-2 break-words text-2xl font-bold text-blue-900 dark:text-blue-100 sm:text-3xl">
            {formatCurrency(stats.total_expenses)}
          </p>
          <p className="text-green-600 dark:text-green-400 text-xs sm:text-sm mt-2 flex items-center">
          </p>
        </div>

        {/* Pengeluaran Bulan Ini */}
        <div className="mobile-card bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 border border-emerald-200 dark:border-emerald-800">
          <p className="text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm font-medium">Pengeluaran Bulan Ini</p>
          <p className="mt-2 break-words text-2xl font-bold text-emerald-900 dark:text-emerald-100 sm:text-3xl">
            {formatCurrency(stats.monthly_expenses)}
          </p>
          <p className="text-emerald-700 dark:text-emerald-300 text-xs sm:text-sm mt-2">
            {monthlyLimit ? `Batas: ${formatCurrency(monthlyLimit)}` : 'Batas bulanan belum diatur'}
          </p>
        </div>

        {/* Rata-rata Harian */}
        <div className="mobile-card bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 border border-purple-200 dark:border-purple-800">
          <p className="text-purple-900 dark:text-purple-300 text-xs sm:text-sm font-medium">Rata-rata per Hari</p>
          <p className="mt-2 break-words text-2xl font-bold text-purple-900 dark:text-purple-100 sm:text-3xl">
            {formatCurrency((stats.monthly_expenses / 30))}
          </p>
          <p className="text-purple-700 dark:text-purple-300 text-xs sm:text-sm mt-2">
            {limits?.daily_limit ? `Batas harian: ${formatCurrency(limits.daily_limit)}` : 'Rata-rata harian'}
          </p>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="mobile-card bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">Pengeluaran per Kategori</h2>
        <div className="space-y-2 sm:space-y-3">
          {stats.category_breakdown.map((category, index) => (
            <div key={index} className="flex min-w-0 items-center justify-between gap-3 p-2 sm:p-3 bg-gray-50 dark:bg-slate-700 rounded-lg hover:shadow-sm transition">
              <span className="min-w-0 truncate text-sm font-medium text-gray-900 dark:text-white sm:text-base">{category.category}</span>
              <span className="flex-shrink-0 text-right text-sm font-bold text-gray-900 dark:text-white sm:text-base">{formatCurrency(category.amount)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Daily Breakdown */}
      <div className="mobile-card bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Pengeluaran Harian</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Pilih tanggal di kalender untuk melihat daftar transaksi harian.
            </p>
          </div>
          <label className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-slate-700 dark:text-gray-200 sm:w-auto">
            <CalendarDays size={16} className="text-primary" />
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => handleSelectDate(event.target.value)}
              className="w-full bg-transparent outline-none dark:[color-scheme:dark] sm:w-auto"
            />
          </label>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(260px,360px)_1fr]">
          <div className="min-w-0">
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => moveCalendarMonth(-1)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-700 dark:hover:text-white"
                aria-label="Bulan sebelumnya"
              >
                <ChevronLeft size={18} />
              </button>
              <p className="font-semibold text-gray-900 dark:text-white">{formatMonthTitle(calendarMonth)}</p>
              <button
                type="button"
                onClick={() => moveCalendarMonth(1)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-700 dark:hover:text-white"
                aria-label="Bulan berikutnya"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-gray-500 dark:text-gray-400">
              {weekdayLabels.map(day => (
                <div key={day} className="py-2">{day}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => {
                if (!day) {
                  return <div key={`empty-${index}`} className="aspect-square"></div>
                }

                const isSelected = day.date === selectedDate
                const isToday = day.date === toLocalDateString(new Date())
                const hasExpense = day.amount > 0

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => handleSelectDate(day.date)}
                    className={`aspect-square min-w-0 rounded-lg border p-1 text-left transition ${
                      isSelected
                        ? 'border-primary bg-primary text-white shadow-sm'
                        : 'border-transparent bg-gray-50 text-gray-700 hover:border-blue-200 hover:bg-blue-50 dark:bg-slate-700 dark:text-gray-200 dark:hover:border-blue-800 dark:hover:bg-slate-700/70'
                    }`}
                  >
                    <span className={`block text-sm font-semibold ${isToday && !isSelected ? 'text-primary' : ''}`}>
                      {day.day}
                    </span>
                    {hasExpense && (
                      <span className={`mt-1 block h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-emerald-500'}`}></span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="min-w-0 border-t border-gray-100 pt-5 dark:border-slate-700 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Tanggal dipilih</p>
                <h3 className="mt-1 break-words text-lg font-bold text-gray-900 dark:text-white">{formatLongDate(selectedDate)}</h3>
              </div>
              <div className="w-full rounded-lg bg-blue-50 px-4 py-3 text-left dark:bg-blue-900/20 sm:w-auto sm:text-right">
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-300">Total hari ini</p>
                <p className="break-words text-xl font-bold text-blue-950 dark:text-blue-100">{formatCurrency(selectedDayTotal)}</p>
                <Link
                  href={`/notifications?date=${selectedDate}`}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-blue-100 dark:bg-slate-900/50 dark:text-blue-300 dark:hover:bg-slate-900 sm:w-auto"
                >
                  <Bell size={16} />
                  Notifikasi AI
                </Link>
              </div>
            </div>

            {expensesLoading ? (
              <div className="flex items-center gap-2 py-8 text-sm text-gray-500 dark:text-gray-400">
                <Loader className="animate-spin" size={18} />
                Memuat pengeluaran...
              </div>
            ) : expensesError ? (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-200">
                {expensesError}
              </div>
            ) : selectedExpenses.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center dark:border-slate-700">
                <Receipt className="mx-auto text-gray-400" size={32} />
                <p className="mt-2 font-medium text-gray-700 dark:text-gray-200">Tidak ada pengeluaran</p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Belum ada transaksi pada tanggal ini.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {selectedExpenses.map((expense) => (
                  <div
                    key={expense.id}
                    className="flex items-start justify-between gap-3 rounded-lg border border-gray-100 px-3 py-3 transition hover:bg-gray-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">
                        {expense.description || expense.category?.name || 'Pengeluaran'}
                      </p>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {expense.category?.name || 'Lainnya'}
                      </p>
                    </div>
                    <p className="flex-shrink-0 text-right font-bold text-gray-950 dark:text-white">
                      {formatCurrency(Number(expense.amount || 0))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Link to Laporan */}
      <div className="mobile-card bg-gradient-to-r from-primary to-blue-600 dark:from-blue-900 dark:to-blue-800 rounded-lg text-white border-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base sm:text-xl font-semibold mb-1">Ingin melihat analisis lebih mendalam?</h3>
            <p className="text-sm sm:text-base text-blue-100">Kunjungi halaman Laporan untuk melihat candlestick charts dan insights lengkap</p>
          </div>
          <Link href="/reports" className="flex-shrink-0 px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-primary rounded-lg hover:bg-blue-50 transition-colors font-semibold text-sm sm:text-base touch-target w-full sm:w-auto text-center">
            Lihat Laporan
          </Link>
        </div>
      </div>
    </div>
  )
}
