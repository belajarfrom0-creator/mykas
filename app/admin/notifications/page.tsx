'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { ArrowLeft, Bell, Loader, Search, Users } from 'lucide-react'

const emptySummary = {
  total_notifications: 0,
  users_with_notifications: 0,
  total_users: 0,
}

export default function AdminNotificationsPage() {
  const [users, setUsers] = useState<any[]>([])
  const [summary, setSummary] = useState(emptySummary)
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [appliedSearch, setAppliedSearch] = useState('')

  useEffect(() => {
    const fetchNotificationSummary = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getAdminNotifications({
          page: currentPage,
          per_page: 10,
          search: appliedSearch || undefined,
        })

        if (response.data) {
          setSummary(response.data.summary || emptySummary)
          setUsers(response.data.users?.data || [])
          setTotalPages(response.data.users?.last_page || 1)
        }
      } catch (error) {
        console.error('Error fetching admin notification summary:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNotificationSummary()
  }, [currentPage, appliedSearch])

  const totalOnPage = useMemo(
    () => users.reduce((sum, user) => sum + Number(user.total_notifications || 0), 0),
    [users]
  )

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCurrentPage(1)
    setAppliedSearch(searchTerm.trim())
  }

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader className="animate-spin text-primary" size={32} />
      </div>
    )
  }

  const cards = [
    {
      label: 'Total Notifikasi',
      value: summary.total_notifications.toLocaleString('id-ID'),
      hint: 'Semua notifikasi AI di sistem',
      icon: Bell,
    },
    {
      label: 'User Dengan Notifikasi',
      value: summary.users_with_notifications.toLocaleString('id-ID'),
      hint: `Dari ${summary.total_users.toLocaleString('id-ID')} pengguna`,
      icon: Users,
    },
    {
      label: 'Notifikasi di Halaman Ini',
      value: totalOnPage.toLocaleString('id-ID'),
      hint: 'Akumulasi dari daftar yang tampil',
      icon: Bell,
    },
  ]

  return (
    <div className="responsive-page">
      <div className="flex items-start gap-3 sm:gap-4">
        <Link href="/admin/dashboard" className="mt-1 shrink-0 text-primary hover:text-blue-700">
          <ArrowLeft size={24} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Ringkasan Notifikasi
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jumlah notifikasi AI per user tanpa menampilkan isi peringatan.
          </p>
        </div>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon

          return (
            <div key={card.label} className="responsive-card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                    {card.value}
                  </p>
                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.hint}</p>
                </div>
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary dark:bg-blue-950/50">
                  <Icon size={22} />
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <form onSubmit={handleSearch} className="responsive-card">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Cari nama atau email user..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-lg border border-gray-300 px-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Cari
          </button>
        </div>
      </form>

      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="divide-y divide-gray-200 dark:divide-slate-700 md:hidden">
          {users.length > 0 ? (
            users.map((user) => (
              <div key={user.id} className="space-y-3 p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                      {user.name}
                    </p>
                    <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-primary dark:bg-blue-950/50">
                    {Number(user.total_notifications || 0).toLocaleString('id-ID')} notif
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Tidak ada user ditemukan.
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[720px]">
            <thead className="border-b border-gray-200 bg-gray-50 dark:border-slate-600 dark:bg-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Nama
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Total Notifikasi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
              {users.length > 0 ? (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="transition-colors hover:bg-gray-50 dark:hover:bg-slate-700"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.role?.name === 'super_admin' ? 'Admin' : 'User'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 dark:text-white">
                      {Number(user.total_notifications || 0).toLocaleString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada user ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex flex-col items-stretch justify-between gap-3 border-t border-gray-200 px-4 py-4 dark:border-slate-600 sm:flex-row sm:items-center sm:px-6">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              Sebelumnya
            </button>
            <span className="text-center text-sm text-gray-600 dark:text-gray-400">
              Halaman {currentPage} dari {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="rounded-lg bg-gray-100 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              Berikutnya
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
