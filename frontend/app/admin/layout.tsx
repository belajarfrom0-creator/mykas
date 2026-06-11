'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { BrandLogo } from '@/components/BrandLogo'
import { BarChart3, Bell, LayoutDashboard, LogOut, Menu, Users, X } from 'lucide-react'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const menuItems = [
    {
      href: '/admin/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      href: '/admin/users',
      label: 'Users',
      icon: Users,
    },
    {
      href: '/admin/laporan',
      label: 'Laporan',
      icon: BarChart3,
    },
    {
      href: '/admin/notifications',
      label: 'Notifikasi',
      icon: Bell,
    },
  ]

  const renderMenuLink = (item: (typeof menuItems)[number], onClick?: () => void) => {
    const Icon = item.icon
    const active = pathname === item.href

    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={onClick}
        className={`flex min-w-0 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
          active
            ? 'bg-blue-50 text-primary ring-1 ring-blue-100 dark:bg-blue-950/50 dark:ring-blue-900'
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
        }`}
      >
        <Icon size={18} className="shrink-0" />
        <span className="truncate">{item.label}</span>
      </Link>
    )
  }

  return (
    <div className="flex h-[100dvh] min-h-[100dvh] overflow-hidden bg-slate-50 dark:bg-slate-950">
      <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 md:flex md:flex-col">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-3"
            >
              <BrandLogo size="md" />
            </Link>

            <Link
              href="/admin/notifications"
              className="relative rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Ringkasan notifikasi"
            >
              <Bell size={21} />
            </Link>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => renderMenuLink(item))}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {user?.name}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                {user?.email}
              </p>
            </div>
            <button
              onClick={() => logout()}
              className="rounded-lg p-2 text-red-600 transition hover:bg-red-50 dark:hover:bg-red-950/40"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:hidden">
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Buka menu"
            >
              <Menu size={22} />
            </button>

            <Link href="/admin/dashboard" className="flex min-w-0 items-center gap-2">
              <BrandLogo size="sm" />
            </Link>

            <Link
              href="/admin/notifications"
              className="relative flex h-11 w-11 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
              aria-label="Ringkasan notifikasi"
            >
              <Bell size={21} />
            </Link>
          </div>
        </header>

        {isMobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-slate-950/40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <aside className="fixed inset-y-0 left-0 z-50 flex w-[min(20rem,86vw)] flex-col border-r border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900 md:hidden">
              <div className="flex items-center justify-between border-b border-slate-200 p-4 dark:border-slate-800">
                <Link
                  href="/admin/dashboard"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex min-w-0 items-center gap-3"
                >
                  <BrandLogo size="md" />
                </Link>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800 dark:hover:text-white"
                  aria-label="Tutup menu"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 space-y-1 overflow-y-auto p-4">
                {menuItems.map((item) => renderMenuLink(item, () => setIsMobileMenuOpen(false)))}
              </nav>

              <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <div className="mb-3 flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {user?.name}
                    </p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false)
                    logout()
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-950/50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            </aside>
          </>
        )}

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1480px] p-4 sm:p-5 md:p-7">
          {children}
        </div>
        </main>
      </div>
    </div>
  )
}
