'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import {
  Activity,
  ArrowUpRight,
  BellRing,
  LayoutDashboard,
  Loader,
  Users,
  WalletCards,
  BarChart3,
} from 'lucide-react'
import {
  Bar as RechartsBar,
  BarChart as RechartsBarChart,
  CartesianGrid as RechartsCartesianGrid,
  Cell as RechartsCell,
  Line as RechartsLine,
  LineChart as RechartsLineChart,
  Pie as RechartsPie,
  PieChart as RechartsPieChart,
  ResponsiveContainer as RechartsResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
} from 'recharts'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.getAdminStats()
        setStats(response.data)
      } catch (error) {
        console.error('Error fetching admin stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const colors = ['#2563EB', '#0F766E', '#F97316', '#8B5CF6', '#DB2777', '#64748B']

  const dashboardData = useMemo(() => {
    const totalUsers = Number(stats?.total_users || 0)
    const totalExpenses = Number(stats?.total_expenses || 0)
    const totalTransactions = Number(stats?.total_transactions || 0)
    const usersWithExpenses = Number(stats?.users_with_expenses || 0)
    const totalNotifications = Number(stats?.total_notifications || 0)
    const dailyStats = stats?.daily_stats || []
    const categoryStats = stats?.category_stats || []
    const monthlyStats = stats?.monthly_stats || []

    return {
      totalUsers,
      totalExpenses,
      totalTransactions,
      usersWithExpenses,
      totalNotifications,
      averagePerUser: usersWithExpenses > 0 ? totalExpenses / usersWithExpenses : 0,
      dailyStats,
      categoryStats,
      monthlyStats,
      categoryTotal: categoryStats.reduce(
        (sum: number, item: any) => sum + Number(item.total_amount || 0),
        0
      ),
    }
  }, [stats])

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        Error loading admin dashboard
      </div>
    )
  }

  const quickCards = [
    {
      title: 'Dashboard',
      description: 'Ringkasan statistik sistem',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      active: true,
    },
    {
      title: 'Manajemen Pengguna',
      description: 'Kelola semua pengguna',
      icon: Users,
      href: '/admin/users',
      active: false,
    },
    {
      title: 'Laporan Mendalam',
      description: 'Laporan dan statistik',
      icon: BarChart3,
      href: '/admin/laporan',
      active: false,
    },
  ]

  const statCards = [
    {
      title: 'Total Pengguna',
      value: dashboardData.totalUsers.toLocaleString('id-ID'),
      description: 'Pengguna terdaftar',
      icon: Users,
    },
    {
      title: 'Total Pengeluaran Sistem',
      value: formatCurrency(dashboardData.totalExpenses),
      description: `${dashboardData.totalTransactions.toLocaleString('id-ID')} transaksi dari ${dashboardData.usersWithExpenses.toLocaleString('id-ID')} pengguna`,
      icon: WalletCards,
    },
    {
      title: 'Total Notifikasi',
      value: dashboardData.totalNotifications.toLocaleString('id-ID'),
      description: 'AI notifications',
      icon: BellRing,
    },
    {
      title: 'Rata-rata User Aktif',
      value: formatCurrency(dashboardData.averagePerUser),
      description: 'Dihitung dari pengguna yang punya transaksi',
      icon: Activity,
    },
  ]

  const dailyMetrics = [
    {
      label: 'Pengeluaran',
      value: dashboardData.dailyStats.reduce(
        (sum: number, day: any) => sum + Number(day.new_expenses || 0),
        0
      ),
      description: 'transaksi baru',
      color: '#2563EB',
    },
    {
      label: 'Pengguna',
      value: dashboardData.dailyStats.reduce(
        (sum: number, day: any) => sum + Number(day.new_users || 0),
        0
      ),
      description: 'pengguna baru',
      color: '#0F766E',
    },
    {
      label: 'Notifikasi',
      value: dashboardData.dailyStats.reduce(
        (sum: number, day: any) => sum + Number(day.notifications_sent || 0),
        0
      ),
      description: 'notifikasi AI',
      color: '#F97316',
    },
  ]

  const busiestDay = [...dashboardData.dailyStats].sort(
    (a: any, b: any) =>
      Number(b.new_expenses || 0) +
      Number(b.new_users || 0) +
      Number(b.notifications_sent || 0) -
      (Number(a.new_expenses || 0) +
        Number(a.new_users || 0) +
        Number(a.notifications_sent || 0))
  )[0]

  const monthlyTotalAmount = dashboardData.monthlyStats.reduce(
    (sum: number, item: any) => sum + Number(item.total_amount || 0),
    0
  )
  const monthlyTotalTransactions = dashboardData.monthlyStats.reduce(
    (sum: number, item: any) => sum + Number(item.count || 0),
    0
  )
  const peakMonth = [...dashboardData.monthlyStats].sort(
    (a: any, b: any) => Number(b.total_amount || 0) - Number(a.total_amount || 0)
  )[0]
  const visibleMonthlyStats = dashboardData.monthlyStats.filter(
    (item: any) => Number(item.total_amount || 0) > 0 || Number(item.count || 0) > 0
  )
  const monthlyLegendItems = (
    visibleMonthlyStats.length > 0 ? visibleMonthlyStats : dashboardData.monthlyStats.slice(-3)
  ).slice(-5)

  return (
    <div className="responsive-page">
      <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 dark:text-white sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Laporan sistem dan monitoring
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {quickCards.map((card) => {
          const Icon = card.icon
          const content = (
            <div
              className={`group flex min-h-[104px] items-center justify-between rounded-lg border p-5 transition ${
                card.active
                  ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-300'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-blue-200 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:border-blue-900 dark:hover:bg-slate-800'
              }`}
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{card.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  {card.description}
                </p>
              </div>
              <span className="ml-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white/75 text-current ring-1 ring-current/10 dark:bg-slate-950/40">
                <Icon size={23} />
              </span>
            </div>
          )

          return card.active ? (
            <div key={card.href}>{content}</div>
          ) : (
            <Link key={card.href} href={card.href}>
              {content}
            </Link>
          )
        })}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 2xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon

          return (
            <div
              key={card.title}
              className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.title}
                  </p>
                  <p className="mt-3 break-words text-2xl font-bold tracking-tight text-slate-950 dark:text-white xl:text-[1.7rem]">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {card.description}
                  </p>
                </div>
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  <Icon size={20} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 xl:col-span-3">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
                Aktivitas Harian
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                30 hari terakhir
              </p>
            </div>
            <ArrowUpRight className="text-slate-400" size={20} />
          </div>

          <div className="grid min-w-0 gap-4 2xl:grid-cols-[1fr_220px]">
            <div className="h-[260px] min-w-0 sm:h-[320px]">
              <RechartsResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={dashboardData.dailyStats}>
                  <RechartsCartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                  <RechartsXAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    tickFormatter={(value: string) => value.slice(5)}
                    minTickGap={22}
                  />
                  <RechartsYAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} width={36} />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: '0.5rem',
                      borderColor: '#E2E8F0',
                      boxShadow: '0 8px 24px rgba(15, 23, 42, 0.10)',
                    }}
                  />
                  <RechartsLine
                    type="monotone"
                    dataKey="new_expenses"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={false}
                    name="Pengeluaran"
                  />
                  <RechartsLine
                    type="monotone"
                    dataKey="new_users"
                    stroke="#0F766E"
                    strokeWidth={2.5}
                    dot={false}
                    name="Pengguna"
                  />
                  <RechartsLine
                    type="monotone"
                    dataKey="notifications_sent"
                    stroke="#F97316"
                    strokeWidth={2.5}
                    dot={false}
                    name="Notifikasi"
                  />
                </RechartsLineChart>
              </RechartsResponsiveContainer>
            </div>

            <div className="space-y-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              {dailyMetrics.map((metric) => (
                <div key={metric.label}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: metric.color }} />
                      <span className="font-medium text-slate-700 dark:text-slate-200">{metric.label}</span>
                    </div>
                    <span className="font-semibold text-slate-950 dark:text-white">{metric.value}</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{metric.description}</p>
                </div>
              ))}

              <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
                <p className="text-xs font-semibold uppercase text-slate-400">Hari tersibuk</p>
                <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                  {busiestDay?.date || '-'}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5 xl:col-span-2">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
              Pengeluaran per Kategori
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Distribusi total nominal
            </p>
          </div>

          <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,220px)_1fr] xl:grid-cols-1 2xl:grid-cols-[minmax(0,220px)_1fr]">
            <div className="h-[210px] min-w-0 sm:h-[220px]">
              <RechartsResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <RechartsPie
                    data={dashboardData.categoryStats}
                    dataKey="total_amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={82}
                    paddingAngle={2}
                    label={false}
                  >
                    {dashboardData.categoryStats.map((_: any, index: number) => (
                      <RechartsCell key={`cell-${index}`} fill={colors[index % colors.length]} />
                    ))}
                  </RechartsPie>
                  <RechartsTooltip formatter={(value: unknown) => formatCurrency(Number(value) || 0)} />
                </RechartsPieChart>
              </RechartsResponsiveContainer>
            </div>

            <div className="space-y-3">
              {dashboardData.categoryStats.slice(0, 5).map((item: any, index: number) => {
                const percent = dashboardData.categoryTotal
                  ? Math.round((Number(item.total_amount || 0) / dashboardData.categoryTotal) * 100)
                  : 0

                return (
                  <div key={item.category} className="min-w-0">
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: colors[index % colors.length] }}
                        />
                        <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                          {item.category}
                        </span>
                      </div>
                      <span className="shrink-0 text-slate-500">{percent}%</span>
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(Number(item.total_amount || 0))} dari {item.count} transaksi
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      </div>

      <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Tren Bulanan
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            12 bulan terakhir
          </p>
        </div>

        <div className="grid min-w-0 gap-5 xl:grid-cols-[1fr_280px]">
          <div className="h-[260px] min-w-0 sm:h-[300px]">
            <RechartsResponsiveContainer width="100%" height="100%">
              <RechartsBarChart data={dashboardData.monthlyStats}>
                <RechartsCartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <RechartsXAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <RechartsYAxis
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickFormatter={(value: number) => `${Math.round(value / 1000000)} jt`}
                  width={44}
                />
                <RechartsTooltip formatter={(value: unknown) => formatCurrency(Number(value) || 0)} />
                <RechartsBar dataKey="total_amount" fill="#2563EB" name="Total Pengeluaran" radius={[6, 6, 0, 0]} />
                <RechartsBar dataKey="count" fill="#0F766E" name="Jumlah Transaksi" radius={[6, 6, 0, 0]} />
              </RechartsBarChart>
            </RechartsResponsiveContainer>
          </div>

          <div className="space-y-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total</p>
                <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                  {formatCurrency(monthlyTotalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Transaksi</p>
                <p className="mt-1 text-sm font-bold text-slate-950 dark:text-white">
                  {monthlyTotalTransactions.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-3 dark:border-slate-700">
              <p className="text-xs font-semibold uppercase text-slate-400">Bulan tertinggi</p>
              <p className="mt-1 text-sm font-semibold text-slate-900 dark:text-white">
                {peakMonth?.month || '-'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {formatCurrency(Number(peakMonth?.total_amount || 0))}
              </p>
            </div>

            <div className="space-y-3">
              {monthlyLegendItems.map((item: any) => {
                const percent = monthlyTotalAmount
                  ? Math.round((Number(item.total_amount || 0) / monthlyTotalAmount) * 100)
                  : 0

                return (
                  <div key={item.month}>
                    <div className="mb-1 flex items-center justify-between gap-3 text-sm">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-blue-600" />
                        <span className="truncate font-medium text-slate-700 dark:text-slate-200">
                          {item.month}
                        </span>
                      </div>
                      <span className="shrink-0 text-slate-500">{percent}%</span>
                    </div>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(Number(item.total_amount || 0))} dari {item.count || 0} transaksi
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="text-lg font-semibold text-slate-950 dark:text-white">
            Analisis Kategori
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead className="bg-slate-50 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Kategori</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
                <th className="px-5 py-3 text-right font-semibold">Jumlah</th>
                <th className="px-5 py-3 text-right font-semibold">Rata-rata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {dashboardData.categoryStats.map((cat: any) => (
                <tr key={cat.category} className="text-sm">
                  <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{cat.category}</td>
                  <td className="px-5 py-3 text-right text-slate-700 dark:text-slate-200">
                    {formatCurrency(Number(cat.total_amount || 0))}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">{cat.count}</td>
                  <td className="px-5 py-3 text-right text-slate-500 dark:text-slate-400">
                    {formatCurrency(Number(cat.avg_amount || 0))}
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
