'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/lib/api'
import { CategoryBreakdown, DashboardStats, DailyData, MonthlyData } from '@/types'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'
import { CalendarDays, Layers, Loader, Receipt, TrendingUp, WalletCards } from 'lucide-react'

type ChartCardProps = {
  title: string
  description: string
  children: React.ReactNode
}

type StatCardProps = {
  label: string
  value: string
  hint: string
  icon: React.ReactNode
  tone: 'blue' | 'emerald' | 'amber' | 'violet'
}

const toneClasses = {
  blue: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-100',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-100',
  amber: 'border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-100',
  violet: 'border-violet-200 bg-violet-50 text-violet-900 dark:border-violet-800 dark:bg-violet-900/20 dark:text-violet-100',
}

const ChartCard = ({ title, description, children }: ChartCardProps) => (
  <section className="responsive-card">
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">{title}</h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
    </div>
    {children}
  </section>
)

const StatCard = ({ label, value, hint, icon, tone }: StatCardProps) => (
  <div className={`mobile-card border ${toneClasses[tone]}`}>
    <div className="mb-4 flex items-center justify-between gap-3">
      <p className="min-w-0 truncate text-sm font-medium opacity-80">{label}</p>
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-white/70 shadow-sm dark:bg-slate-950/30">
        {icon}
      </div>
    </div>
    <p className="truncate text-xl font-bold leading-tight sm:text-2xl">{value}</p>
    <p className="mt-2 text-xs opacity-75 sm:text-sm">{hint}</p>
  </div>
)

const EmptyChart = () => (
  <div className="flex h-full min-h-[220px] items-center justify-center rounded-lg border border-dashed border-gray-200 text-sm text-gray-500 dark:border-slate-700 dark:text-gray-400">
    Belum ada data pengeluaran untuk ditampilkan.
  </div>
)

const toNumber = (value: unknown) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}

const formatShortDate = (date: string) =>
  new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
  }).format(new Date(`${date}T00:00:00`))

const formatCompactCurrency = (amount: number) => {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
  }

  if (amount >= 1_000) {
    return `Rp ${Math.round(amount / 1_000).toLocaleString('id-ID')} rb`
  }

  return formatCurrency(amount)
}

const currencyTooltipFormatter = (value: number | string) =>
  [formatCurrency(Number(value)), 'Pengeluaran'] as [string, string]

export default function LaporanPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getDashboardStats()
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching laporan data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const dailyChartData = useMemo(() => {
    const data = stats?.daily_data ?? []

    return data.map((item: DailyData) => ({
      date: item.date,
      label: formatShortDate(item.date),
      amount: toNumber(item.amount),
    }))
  }, [stats])

  const recentDailyData = useMemo(() => dailyChartData.slice(-14), [dailyChartData])

  const monthlyChartData = useMemo(() => {
    const data = stats?.monthly_data ?? []

    return data.map((item: MonthlyData) => ({
      month: item.month,
      amount: toNumber(item.amount),
    }))
  }, [stats])

  const categoryData = useMemo(() => {
    const data = stats?.category_breakdown ?? []

    return [...data]
      .map((item: CategoryBreakdown) => ({
        category: item.category,
        amount: toNumber(item.amount),
        percentage: toNumber(item.percentage),
      }))
      .sort((first, second) => second.amount - first.amount)
  }, [stats])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  if (!stats) {
    return <div>Error loading laporan data</div>
  }

  const activeDailyData = dailyChartData.filter(item => item.amount > 0)
  const highestDay = activeDailyData.reduce(
    (highest, item) => (item.amount > highest.amount ? item : highest),
    { date: '-', label: '-', amount: 0 }
  )
  const maxCategoryAmount = Math.max(...categoryData.map(item => item.amount), 1)
  const topCategory = categoryData[0]
  const averageDailyExpense = stats.monthly_expenses / 30

  return (
    <div className="responsive-page">
      <div className="min-w-0">
        <h1 className="mobile-header text-gray-900 dark:text-white">Laporan</h1>
        <p className="mobile-text mt-1 text-gray-600 dark:text-gray-400">
          Ringkasan pengeluaran yang dibuat lebih sederhana agar chart mudah dibaca.
        </p>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Pengeluaran"
          value={formatCurrency(stats.total_expenses)}
          hint="Semua transaksi tercatat"
          icon={<WalletCards size={20} />}
          tone="blue"
        />
        <StatCard
          label="Bulan Ini"
          value={formatCurrency(stats.monthly_expenses)}
          hint="Total pengeluaran bulan berjalan"
          icon={<CalendarDays size={20} />}
          tone="emerald"
        />
        <StatCard
          label="Rata-rata Harian"
          value={formatCurrency(averageDailyExpense)}
          hint="Dihitung dari 30 hari"
          icon={<TrendingUp size={20} />}
          tone="violet"
        />
        <StatCard
          label="Kategori Terbesar"
          value={topCategory?.category ?? '-'}
          hint={topCategory ? formatCurrency(topCategory.amount) : 'Belum ada kategori'}
          icon={<Layers size={20} />}
          tone="amber"
        />
      </div>

      <ChartCard
        title="Pengeluaran 14 Hari Terakhir"
        description="Setiap batang menunjukkan total pengeluaran pada tanggal tersebut."
      >
        <div className="responsive-chart h-[280px] sm:h-[340px]">
          {recentDailyData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recentDailyData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  interval="preserveStartEnd"
                  minTickGap={18}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis
                  width={72}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(value) => formatCompactCurrency(Number(value))}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip
                  formatter={currencyTooltipFormatter}
                  labelFormatter={(label) => `Tanggal ${label}`}
                  cursor={{ fill: 'rgba(37, 99, 235, 0.08)' }}
                />
                <Bar dataKey="amount" name="Pengeluaran" fill="#2563EB" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart />
          )}
        </div>
        <div className="mt-4 flex flex-col gap-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-700 dark:bg-slate-700/60 dark:text-gray-200 sm:flex-row sm:items-center sm:justify-between">
          <span>Hari tertinggi: {highestDay.label}</span>
          <span className="font-semibold">{formatCurrency(highestDay.amount)}</span>
        </div>
      </ChartCard>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        <ChartCard
          title="Tren Bulanan"
          description="Perbandingan total pengeluaran dalam 12 bulan terakhir."
        >
          <div className="responsive-chart h-[280px] sm:h-[320px]">
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyChartData} margin={{ top: 10, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    interval="preserveStartEnd"
                    minTickGap={18}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <YAxis
                    width={72}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(value) => formatCompactCurrency(Number(value))}
                    tick={{ fontSize: 12, fill: '#6B7280' }}
                  />
                  <Tooltip
                    formatter={currencyTooltipFormatter}
                    labelFormatter={(label) => `Bulan ${label}`}
                    cursor={{ fill: 'rgba(16, 185, 129, 0.08)' }}
                  />
                  <Bar dataKey="amount" name="Pengeluaran" fill="#10B981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart />
            )}
          </div>
        </ChartCard>

        <ChartCard
          title="Kategori Pengeluaran"
          description="Urutan kategori dari nominal terbesar."
        >
          <div className="space-y-4">
            {categoryData.length > 0 ? (
              categoryData.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex items-start justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-gray-900 dark:text-white">{item.category}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.percentage.toFixed(0)}% dari total bulan ini
                      </p>
                    </div>
                    <p className="flex-shrink-0 font-bold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </p>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-slate-700">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{ width: `${Math.max((item.amount / maxCategoryAmount) * 100, 4)}%` }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <EmptyChart />
            )}
          </div>
        </ChartCard>
      </div>

      <section className="responsive-card">
        <div className="mb-4 flex items-center gap-2">
          <Receipt className="text-primary" size={20} />
          <h2 className="text-base font-semibold text-gray-900 dark:text-white sm:text-lg">
            Data Harian Terbaru
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-left text-sm">
            <thead className="border-b border-gray-200 text-xs uppercase text-gray-500 dark:border-slate-700 dark:text-gray-400">
              <tr>
                <th className="py-3 pr-4 font-semibold">Tanggal</th>
                <th className="py-3 pr-4 font-semibold">Nominal</th>
                <th className="py-3 text-right font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {recentDailyData
                .slice()
                .reverse()
                .map((item) => (
                  <tr key={item.date}>
                    <td className="py-3 pr-4 text-gray-700 dark:text-gray-200">{item.label}</td>
                    <td className="py-3 pr-4 font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </td>
                    <td className="py-3 text-right text-gray-500 dark:text-gray-400">
                      {item.amount > 0 ? 'Ada transaksi' : 'Tidak ada transaksi'}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
