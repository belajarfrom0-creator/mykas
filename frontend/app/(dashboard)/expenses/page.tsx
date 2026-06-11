'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { apiClient } from '@/lib/api'
import { Expense, Category } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader, Plus, Edit2, Trash2, } from 'lucide-react'
import Link from 'next/link'

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showDeleteModal) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [showDeleteModal])
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [expenseRes, categoryRes] = await Promise.all([
          apiClient.getExpenses({
            category_id: selectedCategory,
            search: searchTerm,
          }),
          apiClient.getCategories(),
        ])

        if (expenseRes.data.data) {
          setExpenses(expenseRes.data.data)
        }
        if (categoryRes.data) {
          setCategories(categoryRes.data)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(fetchData, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, selectedCategory])

  const openDeleteModal = (id: number) => {
  setDeleteId(id)
  setShowDeleteModal(true)
}

const confirmDelete = async () => {
  if (!deleteId) return

  try {
    await apiClient.deleteExpense(deleteId)
    setExpenses(expenses.filter(e => e.id !== deleteId))
    setShowDeleteModal(false)
    setDeleteId(null)
  } catch (error) {
    console.error('Error deleting expense:', error)
  }
}

  const deleteModal = showDeleteModal && mounted
    ? createPortal(
      <div className="fixed left-0 top-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800 sm:p-6">
          <h2 className="mb-2 text-xl font-bold text-gray-900 dark:text-white">
            Hapus Pengeluaran?
          </h2>

          <p className="mb-6 text-gray-600 dark:text-gray-300">
            Apakah Anda yakin ingin menghapus pengeluaran ini?
          </p>

          <div className="flex flex-col justify-end gap-3 sm:flex-row">
            <button
              onClick={() => {
                setShowDeleteModal(false)
                setDeleteId(null)
              }}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 dark:bg-slate-700 dark:text-white"
            >
              Tidak
            </button>

            <button
              onClick={confirmDelete}
              className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
            >
              Ya, Hapus
            </button>
          </div>
        </div>
      </div>,
      document.body
    )
    : null

  return (
    <div className="responsive-page">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">Pengeluaran</h1>
          <p className="text-gray-600 dark:text-gray-400">Kelola semua pengeluaran Anda</p>
        </div>
        <Link href="/expenses/new" className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 sm:w-auto sm:px-6 sm:text-base">
          <Plus size={20} /> Tambah Pengeluaran
        </Link>
      </div>

      {/* Filters */}
      <div className="responsive-card space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Cari pengeluaran..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:text-white"
            />
          </div>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white md:w-auto"
          >
            <option value="">Semua Kategori</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="animate-spin" size={32} />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center p-12 text-gray-600 dark:text-gray-400">
            Belum ada pengeluaran. <Link href="/expenses/new" className="text-primary font-semibold">Tambah sekarang</Link>
          </div>
        ) : (
          <>
          <div className="divide-y divide-gray-200 dark:divide-slate-700 md:hidden">
            {expenses.map((expense) => (
              <div key={expense.id} className="space-y-3 p-4">
                <div className="flex min-w-0 items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-gray-900 dark:text-white">
                      {expense.description || 'Pengeluaran'}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(expense.date)}
                    </p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-bold text-gray-950 dark:text-white">
                    {formatCurrency(expense.amount)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex max-w-full items-center rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-900 dark:bg-slate-700 dark:text-white">
                    <span className="truncate">{expense.category?.name || '-'}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <Link href={`/expenses/${expense.id}/edit`} className="rounded-lg p-2 text-blue-600 transition hover:bg-gray-100 dark:hover:bg-slate-700" aria-label="Edit pengeluaran">
                      <Edit2 size={18} />
                    </Link>
                    <button
                      onClick={() => openDeleteModal(expense.id)}
                      className="rounded-lg p-2 text-red-600 transition hover:bg-gray-100 dark:hover:bg-slate-700"
                      aria-label="Hapus pengeluaran"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[760px]">
              <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Tanggal</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Kategori</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">Deskripsi</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">Nominal</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-900 dark:text-white">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="px-6 py-3 text-sm text-gray-900 dark:text-white">{formatDate(expense.date)}</td>
                    <td className="px-6 py-3 text-sm">
                      <span className="inline-block px-3 py-1 bg-gray-100 dark:bg-slate-700 rounded-full text-gray-900 dark:text-white">
                        {expense.category?.name || '-'}
                      </span>
                    </td>
                    <td className="max-w-[280px] px-6 py-3 text-sm text-gray-900 dark:text-white truncate">{expense.description}</td>
                    <td className="px-6 py-3 text-sm text-right font-semibold text-gray-900 dark:text-white">{formatCurrency(expense.amount)}</td>
                    <td className="px-6 py-3 text-sm text-center flex gap-2 justify-center">
                      <Link href={`/expenses/${expense.id}/edit`} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-blue-600">
                        <Edit2 size={18} />
                      </Link>
                      <button
                       onClick={() => openDeleteModal(expense.id)}
                       className="p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-red-600"
                      >
                      <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}
      </div>
      {deleteModal}
    </div>
  )
}
