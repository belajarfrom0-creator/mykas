'use client'

import { useEffect, useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import Link from 'next/link'
import { ArrowLeft, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, error } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [formError, setFormError] = useState('')
  const [resetNotice, setResetNotice] = useState('')

  useEffect(() => {
    const isAfterReset = new URLSearchParams(window.location.search).get('reset') === 'success'

    if (!isAfterReset) {
      return
    }

    setResetNotice('Password berhasil diubah. Silakan login dengan password baru.')
    setShowPassword(false)
    setFormData({ email: '', password: '' })

    const clearAutofillTimer = window.setTimeout(() => {
      setFormData({ email: '', password: '' })
    }, 150)

    return () => window.clearTimeout(clearAutofillTimer)
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')

    try {
      await login(formData.email, formData.password)
      router.push('/dashboard')
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Login gagal')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-gradient-to-br from-primary to-secondary p-4">
      <div className="w-full max-w-md animate-slideUp rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 sm:p-8">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 rounded-lg px-1 py-1 text-sm font-medium text-gray-600 transition hover:text-primary dark:text-gray-300 dark:hover:text-blue-400"
          aria-label="Kembali ke halaman utama"
        >
          <ArrowLeft size={18} />
          <span>Kembali ke Beranda</span>
        </Link>

        <h1 className="mb-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
          Selamat Datang Kembali
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Masuk ke akun Anda untuk melanjutkan
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="on">
          {(formError || error) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
              {formError || error}
            </div>
          )}

          {resetNotice && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300">
              {resetNotice}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 pr-11 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <label className="flex items-center">
              <input type="checkbox" className="w-4 h-4 rounded" />
              <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Ingat saya</span>
            </label>
            <Link href="/forgot-password" className="text-sm text-primary hover:underline">
              Lupa password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? 'Loading...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 mt-6">
          Belum punya akun?{' '}
          <Link href="/register" className="text-primary font-semibold hover:underline">
            Daftar di sini
          </Link>
        </p>
      </div>
    </div>
  )
}
