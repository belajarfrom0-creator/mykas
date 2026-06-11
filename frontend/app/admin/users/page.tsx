'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { apiClient } from '@/lib/api'
import { Loader, ArrowLeft } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const fetchUsers = async (page: number) => {
    try {
      setLoading(true)
      const response = await apiClient.getAdminUsers({ page, per_page: 10 })
      if (response.data) {
        setUsers(response.data.data || [])
        setTotalPages(response.data.last_page || 1)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="responsive-page">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <Link href="/admin/dashboard" className="mt-1 shrink-0 text-primary hover:text-blue-700">
          <ArrowLeft size={24} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Manajemen Pengguna
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Kelola semua pengguna sistem
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="responsive-card">
        <input
          type="text"
          placeholder="Cari pengguna berdasarkan nama atau email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:text-white"
        />
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="divide-y divide-gray-200 dark:divide-slate-700 md:hidden">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
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
                  <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                    user.role?.name === 'super_admin'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {user.role?.name === 'super_admin' ? 'Admin' : 'User'}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 rounded-lg bg-gray-50 p-3 text-sm dark:bg-slate-700 sm:grid-cols-2">
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Pengeluaran</p>
                    <p className="mt-1 break-words font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(Number(user.total_expenses || 0))}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {Number(user.expenses_count || 0).toLocaleString('id-ID')} transaksi
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Dibuat</p>
                    <p className="mt-1 font-semibold text-gray-900 dark:text-white">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Tidak ada pengguna ditemukan
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[760px]">
            <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
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
                  Total Pengeluaran
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Dibuat
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-600">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">
                      {user.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role?.name === 'super_admin'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {user.role?.name === 'super_admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                      <p className="font-semibold">
                        {formatCurrency(Number(user.total_expenses || 0))}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {Number(user.expenses_count || 0).toLocaleString('id-ID')} transaksi
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('id-ID')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    Tidak ada pengguna ditemukan
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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

      {/* Stats Summary */}
      <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3 sm:gap-6">
        <div className="responsive-card">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Total Pengguna</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {users.length}
          </p>
        </div>
        <div className="responsive-card">
          <p className="text-gray-600 dark:text-gray-400 text-sm">Admin</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {users.filter(u => u.role?.name === 'super_admin').length}
          </p>
        </div>
        <div className="responsive-card">
          <p className="text-gray-600 dark:text-gray-400 text-sm">User Biasa</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
            {users.filter(u => u.role?.name !== 'super_admin').length}
          </p>
        </div>
      </div>
    </div>
  )
}
