'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { toDateInputValue } from '@/lib/utils'

export default function NewExpensePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    category_id: '',
    amount: '',
    description: '',
    date: toDateInputValue(),
  })
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await apiClient.getCategories()
        setCategories(response.data || [])
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError('Gagal memuat kategori')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      await apiClient.createExpense({
        category_id: parseInt(formData.category_id),
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: formData.date,
      })

      router.push('/expenses')
    } catch (err: any) {
      console.error('Error creating expense:', err)
      setError(err.response?.data?.message || 'Gagal menambahkan pengeluaran')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="responsive-page mx-auto max-w-3xl">
      <div className="flex items-start gap-3 sm:gap-4">
        <Link href="/expenses" className="mt-1 shrink-0 text-primary hover:text-blue-700">
          <ArrowLeft size={24} />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Tambah Pengeluaran
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Catat pengeluaran baru Anda
          </p>
        </div>
      </div>

      <div className="responsive-card">
        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? 'Menyimpan...' : 'Simpan Pengeluaran'}
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
    </div>
  )
}
