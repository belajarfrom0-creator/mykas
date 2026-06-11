'use client'

import { useEffect, useState } from 'react'
import { Loader, Save, SlidersHorizontal } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'

type LimitForm = {
  daily_limit: string
  monthly_limit: string
}

export default function SettingsPage() {
  const [formData, setFormData] = useState<LimitForm>({
    daily_limit: '',
    monthly_limit: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setLoading(true)
        const response = await apiClient.getUserLimits()
        const limits = response.data

        setFormData({
          daily_limit: limits.daily_limit?.toString() || '',
          monthly_limit: limits.monthly_limit?.toString() || '',
        })
      } catch (err) {
        console.error('Error fetching user limits:', err)
        setError('Gagal memuat batas pengeluaran')
      } finally {
        setLoading(false)
      }
    }

    fetchLimits()
  }, [])

  const toLimitValue = (value: string) => {
    if (!value.trim()) {
      return null
    }

    const parsed = parseInt(value, 10)
    return Number.isNaN(parsed) || parsed <= 0 ? null : parsed
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')

    try {
      const response = await apiClient.updateUserLimits({
        daily_limit: toLimitValue(formData.daily_limit),
        weekly_limit: null,
        monthly_limit: toLimitValue(formData.monthly_limit),
      })

      const limits = response.data
      setFormData({
        daily_limit: limits.daily_limit?.toString() || '',
        monthly_limit: limits.monthly_limit?.toString() || '',
      })
      setMessage(response.message || 'Batas pengeluaran berhasil disimpan')
    } catch (err: any) {
      console.error('Error saving user limits:', err)
      setError(err.response?.data?.message || 'Gagal menyimpan batas pengeluaran')
    } finally {
      setSaving(false)
    }
  }

  const limits = [
    {
      key: 'daily_limit' as const,
      title: 'Batas Harian',
      description: 'Notifikasi muncul jika total pengeluaran dalam satu hari melewati angka ini.',
      placeholder: 'Contoh: 150000',
    },
    {
      key: 'monthly_limit' as const,
      title: 'Batas Bulanan',
      description: 'Notifikasi muncul jika total pengeluaran dalam satu bulan melewati angka ini.',
      placeholder: 'Contoh: 5000000',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin" size={32} />
      </div>
    )
  }

  return (
    <div className="responsive-page max-w-5xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-primary">
          <SlidersHorizontal size={24} />
        </div>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            Batas Pengeluaran
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Atur maksimal pengeluaran harian dan bulanan untuk notifikasi AI.
          </p>
        </div>
      </div>

      {message && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-2">
          {limits.map((item) => {
            const value = formData[item.key]
            const parsedValue = toLimitValue(value)

            return (
              <div
                key={item.key}
                className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-5"
              >
                <label className="block">
                  <span className="block text-base font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </span>
                  <span className="block mt-1 text-sm text-gray-600 dark:text-gray-400 min-h-[60px]">
                    {item.description}
                  </span>
                  <input
                    type="number"
                    min="0"
                    inputMode="numeric"
                    value={value}
                    onChange={(e) =>
                      setFormData({ ...formData, [item.key]: e.target.value })
                    }
                    placeholder={item.placeholder}
                    className="mt-4 w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-slate-700 dark:text-white"
                  />
                </label>

                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  {parsedValue ? formatCurrency(parsedValue) : 'Tidak aktif'}
                </p>
              </div>
            )
          })}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg p-4 text-sm text-blue-800 dark:text-blue-200">
          Isi 0 atau kosongkan field jika Anda tidak ingin memakai batas pada periode tersebut.
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
          {saving ? 'Menyimpan...' : 'Simpan Batas Pengeluaran'}
        </button>
      </form>
    </div>
  )
}
