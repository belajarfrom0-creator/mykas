'use client'

import { FormEvent, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader, Mail } from 'lucide-react'

type Step = 'email' | 'reset' | 'done'

const getErrorMessage = (error: any, fallback: string) => {
  const validationErrors = error?.response?.data?.errors

  if (validationErrors) {
    const firstError = Object.values(validationErrors)[0]
    if (Array.isArray(firstError) && firstError[0]) {
      return String(firstError[0])
    }
  }

  return error?.response?.data?.message || fallback
}

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [passwordConfirmation, setPasswordConfirmation] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const handleRequestCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setCode('')
    setPassword('')
    setPasswordConfirmation('')
    setShowPassword(false)
    setShowPasswordConfirmation(false)

    try {
      setLoading(true)
      const response = await apiClient.forgotPassword(email)
      setMessage(response.message || 'Kode reset sudah dikirim ke email Anda.')
      setStep('reset')
    } catch (error) {
      setError(getErrorMessage(error, 'Gagal mengirim kode reset. Silakan coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== passwordConfirmation) {
      setError('Konfirmasi password tidak sama.')
      return
    }

    try {
      setLoading(true)
      const response = await apiClient.resetPassword({
        email,
        code,
        password,
        password_confirmation: passwordConfirmation,
      })
      setMessage(response.message || 'Password berhasil diubah.')
      setCode('')
      setPassword('')
      setPasswordConfirmation('')
      setShowPassword(false)
      setShowPasswordConfirmation(false)
      setStep('done')
    } catch (error) {
      setError(getErrorMessage(error, 'Gagal mengubah password. Silakan coba lagi.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center overflow-y-auto bg-gradient-to-br from-primary to-secondary p-4">
      <div className="w-full max-w-md animate-slideUp rounded-2xl bg-white p-6 shadow-2xl dark:bg-slate-800 sm:p-8">
        <Link href="/login" className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
          <ArrowLeft size={16} />
          Kembali ke login
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-primary dark:bg-blue-900/30">
            {step === 'done' ? <CheckCircle2 size={24} /> : <KeyRound size={24} />}
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
            {step === 'email' && 'Lupa Password'}
            {step === 'reset' && 'Masukkan Kode Reset'}
            {step === 'done' && 'Password Berhasil Diubah'}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
            {step === 'email' && 'Masukkan email akun Anda. Kami akan mengirim kode reset password ke email tersebut.'}
            {step === 'reset' && `Kode reset sudah dikirim ke ${email}. Masukkan kode dan buat password baru.`}
            {step === 'done' && 'Silakan login kembali menggunakan password baru Anda.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        {message && step !== 'done' && (
          <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-200">
            {message}
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleRequestCode} className="space-y-4" autoComplete="off">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  name="reset_email"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pl-10 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="email@contoh.com"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading && <Loader className="animate-spin" size={18} />}
              {loading ? 'Mengirim kode...' : 'Kirim Kode Reset'}
            </button>
          </form>
        )}

        {step === 'reset' && (
          <form onSubmit={handleResetPassword} className="space-y-4" autoComplete="off">
            <input type="text" name="username" value={email} readOnly hidden autoComplete="username" />
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Kode reset
              </label>
              <input
                type="text"
                name="reset_code"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={code}
                onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-center text-xl font-bold tracking-[0.4em] focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                placeholder="000000"
                required
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password baru
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="new_password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Minimal 8 karakter"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Tampilkan password"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Konfirmasi password
              </label>
              <div className="relative">
                <input
                  type={showPasswordConfirmation ? 'text' : 'password'}
                  name="new_password_confirmation"
                  autoComplete="new-password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-11 focus:outline-none focus:ring-2 focus:ring-primary dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                  placeholder="Ulangi password baru"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Tampilkan konfirmasi password"
                >
                  {showPasswordConfirmation ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => {
                  setCode('')
                  setPassword('')
                  setPasswordConfirmation('')
                  setShowPassword(false)
                  setShowPasswordConfirmation(false)
                  setStep('email')
                }}
                disabled={loading}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50 dark:border-slate-600 dark:text-gray-200 dark:hover:bg-slate-700"
              >
                Ubah email
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading && <Loader className="animate-spin" size={18} />}
                {loading ? 'Menyimpan...' : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        {step === 'done' && (
          <div className="space-y-4">
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
              {message}
            </div>
            <button
              type="button"
              onClick={() => router.replace('/login?reset=success')}
              className="w-full rounded-lg bg-primary py-2.5 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Login Sekarang
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
