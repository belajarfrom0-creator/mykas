'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { BrandLogo } from '@/components/BrandLogo'
import Link from 'next/link'

export default function RootPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
        <div className="animate-spin">
          <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-blue-50 to-secondary dark:from-slate-900 dark:to-slate-800">
      {/* Navbar */}
      <nav className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" aria-label="MyKas beranda">
            <BrandLogo size="md" />
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/login" className="px-3 sm:px-6 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base">
              Login
            </Link>
            <Link href="/register" className="px-3 sm:px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto mobile-safe-padding py-12 sm:py-20">
        <div className="grid md:grid-cols-2 gap-8 sm:gap-12 items-center">
          <div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 animate-slideUp leading-tight">
              Kelola Keuangan Anda dengan <span className="text-primary">AI Modern</span>
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-black dark:text-gray-300 mb-6 sm:mb-8 animate-slideUp leading-relaxed" style={{ animationDelay: '0.1s' }}>
              Platform pencatatan pengeluaran cerdas dengan analisis AI real-time untuk membantu Anda membuat keputusan keuangan yang lebih baik.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 animate-slideUp" style={{ animationDelay: '0.2s' }}>
              <Link href="/register" className="px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-center text-sm sm:text-base">
                Mulai Gratis
              </Link>
            </div>
          </div>

          {/* Stats Card */}
          {/* <div className="responsive-grid-2">
            <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-6 text-center animate-slideUp" style={{ animationDelay: '0.3s' }}>
              <div className="text-2xl sm:text-4xl font-bold text-primary mb-2">10K+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Pengguna Aktif</div>
            </div>
            <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-6 text-center animate-slideUp" style={{ animationDelay: '0.4s' }}>
              <div className="text-2xl sm:text-4xl font-bold text-primary mb-2">5M+</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Total Tercatat</div>
            </div>
            <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-6 text-center animate-slideUp" style={{ animationDelay: '0.5s' }}>
              <div className="text-2xl sm:text-4xl font-bold text-primary mb-2">95%</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Kepuasan User</div>
            </div>
            <div className="glass rounded-lg sm:rounded-2xl p-4 sm:p-6 text-center animate-slideUp" style={{ animationDelay: '0.6s' }}>
              <div className="text-2xl sm:text-4xl font-bold text-primary mb-2">24</div>
              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">AI Support</div>
            </div>
          </div> */}
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto mobile-safe-padding py-12 sm:py-20">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-900 dark:text-white mb-12 sm:mb-16">
          Fitur Andalan
        </h2>
        <div className="responsive-grid">
          {[
            { icon: '', title: 'Dashboard Realtime', desc: 'Lihat statistik pengeluaran Anda secara real-time' },
            { icon: '', title: 'AI Assistant', desc: 'Dapatkan analisis dan rekomendasi dari AI' },
            { icon: '🔔', title: 'Smart Notifications', desc: 'Notifikasi cerdas tentang pengeluaran Anda' },
            { icon: '📱', title: 'Mobile Responsive', desc: 'Akses di mana saja, kapan saja' },
            { icon: '📈', title: 'Laporan Lengkap', desc: 'Laporan terperinci' },
            { icon: '🔒', title: 'Keamanan Tinggi', desc: 'Data Anda aman dan terlindungi' },
          ].map((feature, index) => (
            <div key={index} className="glass rounded-lg sm:rounded-2xl p-4 sm:p-8 hover:shadow-lg transition-all animate-slideUp" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-3xl sm:text-5xl mb-3 sm:mb-4">{feature.icon}</div>
              <h3 className="text-base sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto mobile-safe-padding py-12 sm:py-20">
        <div className="glass rounded-lg sm:rounded-2xl p-6 sm:p-12 text-center">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            Siap Mengelola Keuangan Anda?
          </h2>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-400 mb-6 sm:mb-8">
            Bergabunglah dengan ribuan pengguna yang telah mengubah cara mereka mengelola uang
          </p>
          <Link href="/register" className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-primary text-white rounded-lg hover:bg-blue-700 transition-all transform hover:scale-105 font-semibold text-sm sm:text-base">
            Daftar Sekarang Gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-black text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto mobile-safe-padding text-center">
          <p className="text-xs sm:text-sm">&copy; 2026 MyKas. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
