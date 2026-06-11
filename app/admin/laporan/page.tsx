'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Loader, ArrowLeft } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { formatCurrency } from '@/lib/utils'

export default function AdminLaporanPage() {
  const [laporan, setLaporan] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLaporan()
  }, [])

  const fetchLaporan = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getAdminLaporan()
      if (response.data) {
        setLaporan(response.data)
      }
    } catch (error) {
      console.error('Error fetching laporan:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  if (!laporan) {
    return <div>Error loading laporan</div>
  }

  const colors = ['#1E40AF', '#0F766E', '#F97316', '#8B5CF6', '#EC4899', '#F43F5E', '#14B8A6']

  return (
    <div className="responsive-page">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <Link href="/admin/dashboard" className="mt-1 shrink-0 text-primary hover:text-blue-700">
          <ArrowLeft size={24} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Laporan Sistem
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Laporan statistik dan tren sistem
          </p>
        </div>
      </div>

      {/* Daily Activity Chart */}
      <div className="responsive-card">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white sm:text-xl">
          Aktivitas Harian (30 Hari Terakhir)
        </h2>
        <div className="responsive-chart h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={laporan.daily_stats || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              stroke="#6B7280"
              style={{ fontSize: '0.875rem' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#6B7280" style={{ fontSize: '0.875rem' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#F3F4F6',
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="new_expenses"
              stroke="#1E40AF"
              name="Pengeluaran Baru"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="new_users"
              stroke="#0F766E"
              name="Pengguna Baru"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="notifications_sent"
              stroke="#F97316"
              name="Notifikasi"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Category Stats */}
      <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2 sm:gap-6">
        {/* Pie Chart */}
        <div className="responsive-card">
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white sm:text-xl">
            Distribusi Pengeluaran per Kategori
          </h2>
          <div className="responsive-chart h-[260px] sm:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={laporan.category_stats || []}
                dataKey="total_amount"
                nameKey="category"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {(laporan.category_stats || []).map((_: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          </div>
        </div>

        {/* Category Stats Table */}
        <div className="responsive-card">
          <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white sm:text-xl">
            Statistik per Kategori
          </h2>
          <div className="space-y-3 max-h-[300px] overflow-y-auto">
            {(laporan.category_stats || []).map((stat: any, idx: number) => (
              <div key={idx} className="flex min-w-0 flex-col gap-3 rounded-lg bg-gray-50 p-3 dark:bg-slate-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className="h-4 w-4 shrink-0 rounded-full"
                    style={{ backgroundColor: colors[idx % colors.length] }}
                  ></div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                      {stat.category}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {stat.count} transaksi
                    </p>
                  </div>
                </div>
                <div className="text-left sm:text-right">
                  <p className="break-words text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(stat.total_amount)}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    Rata: {formatCurrency(stat.avg_amount)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="responsive-card">
        <h2 className="mb-4 text-base font-semibold text-gray-900 dark:text-white sm:text-xl">
          Tren Bulanan (12 Bulan Terakhir)
        </h2>
        <div className="responsive-chart h-[280px] sm:h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={laporan.monthly_stats || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              stroke="#6B7280"
              style={{ fontSize: '0.875rem' }}
            />
            <YAxis stroke="#6B7280" style={{ fontSize: '0.875rem' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1F2937',
                border: 'none',
                borderRadius: '0.5rem',
                color: '#F3F4F6',
              }}
              formatter={(value: any) => formatCurrency(value)}
            />
            <Legend />
            <Bar
              dataKey="total_amount"
              fill="#1E40AF"
              name="Total Pengeluaran"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="count"
              fill="#0F766E"
              name="Jumlah Transaksi"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 sm:gap-6">
        {/* Total Amount */}
        <div className="responsive-card">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Pengeluaran</p>
          <p className="mt-2 break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {formatCurrency(
              (laporan.monthly_stats || []).reduce(
                (sum: number, m: any) => sum + (m.total_amount || 0),
                0
              )
            )}
          </p>
        </div>

        {/* Total Transactions */}
        <div className="responsive-card">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Transaksi</p>
          <p className="mt-2 break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {(laporan.monthly_stats || []).reduce(
              (sum: number, m: any) => sum + (m.count || 0),
              0
            )}
          </p>
        </div>

        {/* Average per Transaction */}
        <div className="responsive-card">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Rata-rata per Transaksi</p>
          <p className="mt-2 break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {formatCurrency(
              ((laporan.monthly_stats || []).reduce(
                (sum: number, m: any) => sum + (m.total_amount || 0),
                0
              ) || 0) /
                ((laporan.monthly_stats || []).reduce(
                  (sum: number, m: any) => sum + (m.count || 0),
                  0
                ) || 1)
            )}
          </p>
        </div>

        {/* Categories Count */}
        <div className="responsive-card">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Kategori</p>
          <p className="mt-2 break-words text-xl font-bold text-gray-900 dark:text-white sm:text-2xl">
            {(laporan.category_stats || []).length}
          </p>
        </div>
      </div>
    </div>
  )
}
