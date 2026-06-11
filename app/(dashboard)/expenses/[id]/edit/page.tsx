'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createPortal } from 'react-dom'
import { apiClient } from '@/lib/api'
import { normalizeDateInputValue } from '@/lib/utils'
import { ArrowLeft, CheckCircle2, Loader } from 'lucide-react'
import Link from 'next/link'

export default function EditExpensePage() {
  const router = useRouter()
  const params = useParams()
  const expenseId = params.id as string

  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    date: '',
  })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [error, setError] = useState('')
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Fetch expense and categories
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!showSuccessDialog) {
      return
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = originalOverflow
    }
  }, [showSuccessDialog])

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)

        // Fetch categories
        const categoriesRes = await apiClient.getCategories()
        setCategories(categoriesRes.data || [])

        // Fetch expense details
        const expenseRes = await apiClient.getExpense(parseInt(expenseId))
        const expense = expenseRes.data

        setFormData({
          category_id: expense.category_id.toString(),
          amount: expense.amount.toString(),
          description: expense.description,
          date: normalizeDateInputValue(expense.date),
        })
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Gagal memuat data pengeluaran')
      } finally {
        setLoading(false)
      }
    }

    if (expenseId) {
      fetchData()
    }
  }, [expenseId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await apiClient.updateExpense(parseInt(expenseId), {
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
      })

      setShowSuccessDialog(true)
    } catch (err: any) {
      console.error('Error updating expense:', err)
      setError(err.response?.data?.message || 'Gagal memperbarui pengeluaran')
    } finally {
      setSubmitting(false)
    }
  }

  const successDialog = showSuccessDialog && mounted
    ? createPortal(
      <div className="fixed left-0 top-0 z-[9999] flex h-[100dvh] w-screen items-center justify-center overflow-y-auto bg-slate-950/55 px-4 py-6 backdrop-blur-sm">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300">
            <CheckCircle2 size={30} />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-950 dark:text-white">
            Pengeluaran berhasil diperbarui
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            Data pengeluaran dan peringatan batas akan mengikuti nominal terbaru.
          </p>
          <button
            type="button"
            onClick={() => router.push('/expenses')}
            className="mt-6 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Kembali ke Pengeluaran
          </button>
        </div>
      </div>,
      document.body
    )
    : null

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="responsive-page mx-auto max-w-3xl">
      {/* Header */}
      <div className="flex items-start gap-3 sm:gap-4">
        <Link href="/expenses" className="mt-1 shrink-0 text-primary hover:text-blue-700">
          <ArrowLeft size={24} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Edit Pengeluaran
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ubah data pengeluaran Anda
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="responsive-card">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Kategori *
            </label>
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:text-white"
              required
            >
              <option value="">Pilih kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nominal (Rp) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:text-white"
              placeholder="0"
              required
              min="0"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Deskripsi *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:text-white"
              placeholder="Deskripsi pengeluaran..."
              rows={4}
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tanggal *
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:text-white"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
            <Link
              href="/expenses"
              className="flex-1 rounded-lg bg-gray-300 py-2.5 text-center font-semibold text-gray-900 transition-colors hover:bg-gray-400 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>

      {successDialog}
    </div>
  )
}
