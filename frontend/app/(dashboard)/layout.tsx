'use client'

import React, { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import { BrandLogo } from '@/components/BrandLogo'
import Link from 'next/link'
import { BarChart3, Bell, LayoutDashboard, LogOut, Menu, Receipt, SlidersHorizontal, Users, X } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isAuthenticated, user, logout } = useAuth()
  const { unreadCount } = useNotificationCount()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const adminLinks = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/laporan', label: 'Laporan', icon: BarChart3 },
    { href: '/admin/notifications', label: 'Notifikasi', icon: Bell },
  ]

  const userLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/expenses', label: 'Pengeluaran', icon: Receipt },
    { href: '/laporan', label: 'Laporan', icon: BarChart3 },
    { href: '/notifications', label: 'Notifikasi AI', icon: Bell },
    { href: '/settings', label: 'Batas Pengeluaran', icon: SlidersHorizontal },
  ]

  const isAdmin = user?.role?.name === 'super_admin'
  const links = isAdmin ? adminLinks : userLinks
  const notificationHref = isAdmin ? '/admin/notifications' : '/notifications'

  return (
    <>
      {isAuthenticated ? (
        <div className="flex h-[100dvh] min-h-[100dvh] overflow-hidden bg-gray-50 dark:bg-slate-900">
          <aside className="hidden w-64 bg-white dark:bg-slate-800 shadow-sm md:flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <Link href="/dashboard" className="flex items-center gap-2 flex-1 min-w-0">
                  <BrandLogo size="md" />
                </Link>

                <Link
                  href={notificationHref}
                  className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition flex-shrink-0"
                  aria-label="Notifikasi"
                >
                  <Bell size={20} />
                  {!isAdmin && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <nav className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
              {links.map((item) => {
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base"
                  >
                    <Icon size={18} className="flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm sm:text-base flex-shrink-0">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => logout()}
                  className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-lg text-red-600 transition flex-shrink-0"
                  aria-label="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </aside>

          <div className="min-w-0 flex-1 overflow-hidden flex flex-col">
            <header className="sticky top-0 z-30 bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700 md:hidden">
              <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg touch-target"
                    aria-label="Menu"
                  >
                    <Menu size={20} />
                  </button>
                  <div className="md:hidden">
                    <BrandLogo size="sm" />
                  </div>
                </div>

                <Link
                  href={notificationHref}
                  className="md:hidden relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition"
                  aria-label="Notifikasi"
                >
                  <Bell size={20} />
                  {!isAdmin && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </div>
            </header>

            {isMobileMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/50 md:hidden"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <nav className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,86vw)] flex-col bg-white dark:bg-slate-800 shadow-2xl md:hidden animate-slideInLeft">
                  <div className="flex items-center justify-between border-b border-gray-200 p-4 dark:border-slate-700">
                    <Link
                      href="/dashboard"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="min-w-0"
                    >
                      <BrandLogo size="md" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:hover:bg-slate-700 dark:hover:text-white"
                      aria-label="Tutup menu"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-1">
                  {links.map((item) => {
                    const Icon = item.icon

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors text-sm sm:text-base touch-target"
                      >
                        <Icon size={18} className="flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    )
                  })}
                  </div>

                  <div className="border-t border-gray-200 dark:border-slate-700 p-3 sm:p-4">
                    <div className="mb-3 flex min-w-0 items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                        {user?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="truncate text-xs text-gray-500">{user?.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        setIsMobileMenuOpen(false)
                      }}
                      className="w-full flex items-center gap-3 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 transition-colors text-sm sm:text-base touch-target"
                    >
                      <LogOut size={18} className="flex-shrink-0" />
                      <span>Logout</span>
                    </button>
                  </div>
                </nav>
              </>
            )}

            <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 safe-padding-bottom">
              {children}
            </main>
          </div>
        </div>
      ) : (
        children
      )}
    </>
  )
}
