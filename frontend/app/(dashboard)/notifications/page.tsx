'use client'

import { useEffect, useMemo, useState } from 'react'
import { apiClient } from '@/lib/api'
import { AINotification } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useNotificationCount } from '@/hooks/useNotificationCount'
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock,
  Filter,
  Lightbulb,
  Loader,
  Megaphone,
  Target,
  TrendingUp,
  Trash2,
  WalletCards,
  type LucideIcon,
} from 'lucide-react'

type NotificationDetail = {
  label: string
  value: string
  icon: LucideIcon
}

const asNumber = (value: unknown) => {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : null
}

const asText = (value: unknown) => {
  if (value === null || value === undefined || value === '') {
    return null
  }

  return String(value)
}

const toLocalDateString = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

const getNotificationDate = (notification: AINotification) => {
  const metadataDate = asText(notification.metadata?.date)

  if (metadataDate) {
    return metadataDate.slice(0, 10)
  }

  return toLocalDateString(new Date(notification.created_at))
}

const formatSelectedDate = (date: string) =>
  date
    ? new Intl.DateTimeFormat('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`))
    : '-'

const getPeriodLabel = (period: string) => {
  switch (period.toLowerCase()) {
    case 'harian':
    case 'daily':
      return 'Harian'
    case 'mingguan':
    case 'weekly':
      return 'Mingguan'
    case 'bulanan':
    case 'monthly':
      return 'Bulanan'
    default:
      return period
  }
}

const getTypeInfo = (type: AINotification['type']) => {
  switch (type) {
    case 'alert':
      return {
        color: 'from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/10',
        border: 'border-amber-200 dark:border-amber-800',
        badge: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200',
        iconColor: 'text-amber-600 dark:text-amber-300',
        progress: 'bg-amber-500',
        label: 'Peringatan',
        icon: AlertCircle,
      }
    case 'insight':
      return {
        color: 'from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/10',
        border: 'border-blue-200 dark:border-blue-800',
        badge: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        iconColor: 'text-blue-600 dark:text-blue-300',
        progress: 'bg-blue-500',
        label: 'Insight',
        icon: Lightbulb,
      }
    case 'recommendation':
      return {
        color: 'from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10',
        border: 'border-emerald-200 dark:border-emerald-800',
        badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
        iconColor: 'text-emerald-600 dark:text-emerald-300',
        progress: 'bg-emerald-500',
        label: 'Rekomendasi',
        icon: TrendingUp,
      }
    case 'warning':
      return {
        color: 'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/10',
        border: 'border-red-200 dark:border-red-800',
        badge: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        iconColor: 'text-red-600 dark:text-red-300',
        progress: 'bg-red-500',
        label: 'Peringatan',
        icon: AlertCircle,
      }
    default:
      return {
        color: 'from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/10',
        border: 'border-gray-200 dark:border-gray-800',
        badge: 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200',
        iconColor: 'text-gray-600 dark:text-gray-300',
        progress: 'bg-gray-500',
        label: 'Notifikasi',
        icon: Megaphone,
      }
  }
}

const getNotificationDetails = (notification: AINotification): NotificationDetail[] => {
  const metadata = notification.metadata ?? {}
  const details: NotificationDetail[] = []
  const period = asText(metadata.period)
  const total = asNumber(metadata.total)
  const limit = asNumber(metadata.limit)
  const amount = asNumber(metadata.amount)
  const threshold = asNumber(metadata.threshold)
  const category = asText(metadata.category)
  const date = asText(metadata.date)

  if (period) {
    details.push({ label: 'Periode', value: getPeriodLabel(period), icon: Clock })
  }

  if (total !== null) {
    details.push({ label: 'Total pengeluaran', value: formatCurrency(total), icon: WalletCards })
  }

  if (limit !== null) {
    details.push({ label: 'Batas', value: formatCurrency(limit), icon: Target })
  }

  if (amount !== null && total === null) {
    details.push({ label: 'Nominal transaksi', value: formatCurrency(amount), icon: WalletCards })
  }

  if (threshold !== null && limit === null) {
    details.push({ label: 'Ambang peringatan', value: formatCurrency(threshold), icon: Target })
  }

  if (category) {
    details.push({ label: 'Kategori', value: category, icon: Filter })
  }

  if (date) {
    details.push({ label: 'Tanggal transaksi', value: formatDate(date), icon: Calendar })
  }

  return details
}

const getDisplayMessage = (notification: AINotification) => {
  const metadata = notification.metadata ?? {}
  const period = asText(metadata.period)
  const category = asText(metadata.category)
  const total = asNumber(metadata.total)
  const limit = asNumber(metadata.limit)
  const amount = asNumber(metadata.amount)

  if (period && total !== null && limit !== null) {
    return `Batas pengeluaran ${getPeriodLabel(period).toLowerCase()} terlampaui`
  }

  if (amount !== null && category) {
    return `Pengeluaran besar di kategori ${category}`
  }

  return notification.message
}

const getBudgetProgress = (metadata?: Record<string, unknown>) => {
  const total = asNumber(metadata?.total)
  const limit = asNumber(metadata?.limit)

  if (total === null || limit === null || limit <= 0) {
    return null
  }

  const percentage = Math.round((total / limit) * 100)
  return {
    percentage,
    cappedPercentage: Math.min(percentage, 100),
    overAmount: Math.max(total - limit, 0),
  }
}

const isBudgetLimitExceeded = (notification: AINotification) => {
  if (notification.type !== 'alert') {
    return true
  }

  const total = asNumber(notification.metadata?.total)
  const limit = asNumber(notification.metadata?.limit)

  return total !== null && limit !== null && limit > 0 && total > limit
}

const getNotificationPriority = (notification: AINotification) => {
  if (notification.type === 'alert') {
    return 0
  }

  if (notification.type === 'warning') {
    return 1
  }

  return 2
}

export default function NotificationsPage() {
  const todayDate = useMemo(() => toLocalDateString(new Date()), [])
  const [notifications, setNotifications] = useState<AINotification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState(todayDate)
  const [deleteTarget, setDeleteTarget] = useState<AINotification | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const { unreadCount: totalUnreadCount, refetch: refetchCount } = useNotificationCount()

  useEffect(() => {
    const dateFromUrl = new URLSearchParams(window.location.search).get('date')

    if (dateFromUrl && /^\d{4}-\d{2}-\d{2}$/.test(dateFromUrl)) {
      setSelectedDate(dateFromUrl)
      setActiveFilter('date')
    }
  }, [])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setError(null)
        const response = await apiClient.getNotifications({ per_page: 100 })
        if (response.data.data) {
          setNotifications(response.data.data)
        }
      } catch (error) {
        console.error('Error fetching notifications:', error)
        setError('Gagal memuat notifikasi. Silakan coba lagi.')
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await apiClient.markNotificationAsRead(notificationId)
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId ? { ...notification, is_read: true } : notification
        )
      )
      await refetchCount()
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await apiClient.markAllNotificationsAsRead()
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      )
      await refetchCount()
    } catch (error) {
      console.error('Error marking all notifications as read:', error)
    }
  }

  const handleDeleteNotification = async () => {
    if (!deleteTarget) {
      return
    }

    try {
      setDeletingId(deleteTarget.id)
      await apiClient.deleteNotification(deleteTarget.id)
      setNotifications(prev => prev.filter(notification => notification.id !== deleteTarget.id))
      setDeleteTarget(null)
      await refetchCount()
    } catch (error) {
      console.error('Error deleting notification:', error)
      setError('Gagal menghapus notifikasi. Silakan coba lagi.')
    } finally {
      setDeletingId(null)
    }
  }

  const getNotificationsByDate = (date: string) =>
    notifications.filter(notification => getNotificationDate(notification) === date)

  const getNotificationsInPeriod = (days: number) => {
    const now = new Date()
    const periodStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)

    return notifications.filter(notification => {
      const notificationDate = new Date(`${getNotificationDate(notification)}T00:00:00`)
      return notificationDate >= periodStart
    })
  }

  const getDailySummary = () => getNotificationsByDate(todayDate)
  const getMonthlySummary = () => getNotificationsInPeriod(30)
  const getSelectedDateSummary = () => getNotificationsByDate(selectedDate)

  const summarizeByType = (items: AINotification[]) => ({
    warning: items.filter(notification => notification.type === 'warning').length,
    alert: items.filter(notification => notification.type === 'alert').length,
    insight: items.filter(notification => notification.type === 'insight').length,
    recommendation: items.filter(notification => notification.type === 'recommendation').length,
  })

  const visibleNotifications = notifications.filter(isBudgetLimitExceeded)
  const dailySummary = getDailySummary().filter(isBudgetLimitExceeded)
  const monthlySummaryItems = getMonthlySummary().filter(isBudgetLimitExceeded)
  const selectedDateSummary = getSelectedDateSummary().filter(isBudgetLimitExceeded)

  const filteredNotifications = (() => {
    switch (activeFilter) {
      case 'today':
        return dailySummary
      case 'date':
        return selectedDateSummary
      case 'month':
        return monthlySummaryItems
      default:
        return visibleNotifications
    }
  })()

  const filters = [
    { value: 'all', label: 'Semua', count: visibleNotifications.length },
    { value: 'month', label: 'Bulan Ini', count: monthlySummaryItems.length },
  ]

  const selectedDateAlerts = selectedDateSummary
    .filter(notification => notification.type === 'alert')
    .sort((first, second) => new Date(second.created_at).getTime() - new Date(first.created_at).getTime())
  const pinnedAlertNotification = selectedDateAlerts[0] ?? null
  const selectedDateAlertIds = new Set(selectedDateAlerts.map(notification => notification.id))

  const orderedNotifications = [...filteredNotifications]
    .filter(notification => !selectedDateAlertIds.has(notification.id))
    .sort((first, second) => {
      const priorityDifference = getNotificationPriority(first) - getNotificationPriority(second)

      if (priorityDifference !== 0) {
        return priorityDifference
      }

      return new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
    })

  const loadedUnreadCount = notifications.filter(notification => !notification.is_read).length
  const unreadCount = Math.max(totalUnreadCount, loadedUnreadCount)
  const monthlySummary = summarizeByType(monthlySummaryItems)
  const showEmptyNotifications = orderedNotifications.length === 0 && !pinnedAlertNotification

  const renderPinnedAlertCard = () => {
    if (!pinnedAlertNotification) {
      return null
    }

    const typeInfo = getTypeInfo(pinnedAlertNotification.type)
    const Icon = typeInfo.icon
    const progress = getBudgetProgress(pinnedAlertNotification.metadata)
    const metadata = pinnedAlertNotification.metadata ?? {}
    const total = asNumber(metadata.total)
    const limit = asNumber(metadata.limit)
    const alertDate = asText(metadata.date) ?? selectedDate

    return (
      <div
        key={pinnedAlertNotification.id}
        className={`mobile-card border bg-gradient-to-br ${typeInfo.color} ${typeInfo.border} transition-all hover:shadow-md ${
          pinnedAlertNotification.is_read ? 'opacity-90' : ''
        }`}
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm ring-1 ring-black/5 dark:bg-slate-950/30 ${typeInfo.iconColor}`}>
            <Icon size={26} />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${typeInfo.badge}`}>
                    {typeInfo.label}
                  </span>
                  {!pinnedAlertNotification.is_read && (
                    <span className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-semibold text-primary dark:bg-slate-900/50 dark:text-blue-300">
                      Baru
                    </span>
                  )}
                </div>
                <h3 className="mt-2 text-base font-bold leading-snug text-gray-950 dark:text-white sm:text-lg">
                  {getDisplayMessage(pinnedAlertNotification)}
                </h3>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                  Data untuk {formatDate(alertDate)}
                </p>
              </div>

            </div>

            {progress && (
              <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
                <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">Pemakaian batas</span>
                  <span className="font-bold text-gray-950 dark:text-white">{progress.percentage}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-white/70 dark:bg-slate-900/60">
                  <div
                    className={`h-full rounded-full ${typeInfo.progress}`}
                    style={{ width: `${progress.cappedPercentage}%` }}
                  ></div>
                </div>
                {total !== null && limit !== null && (
                  <p className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Total pemakaian {formatCurrency(total)} dari batas {formatCurrency(limit)}.
                  </p>
                )}
                {progress.overAmount > 0 && (
                  <p className="mt-1 text-sm font-medium text-red-700 dark:text-red-300">
                    Kelebihan {formatCurrency(progress.overAmount)} dari batas yang Anda atur.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mobile-header text-2xl text-gray-900 dark:text-white sm:text-3xl">Notifikasi AI</h1>
          <p className="mobile-text mt-1 text-gray-600 dark:text-gray-400">
            Insights dan analisis pengeluaran Anda
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="flex w-fit items-center gap-2 rounded-full bg-red-100 px-3 py-2 text-sm font-semibold text-red-800 dark:bg-red-900/30 dark:text-red-200 sm:px-4 sm:py-2.5 sm:text-base">
              <span className="h-2 w-2 rounded-full bg-red-500"></span>
              {unreadCount} baru
            </div>
            <button
              onClick={handleMarkAllAsRead}
              className="w-fit rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-primary shadow-sm transition hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-800 dark:text-blue-300 dark:hover:bg-slate-700"
            >
              Tandai semua dibaca
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mobile-card border border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
          <div className="flex items-center gap-3">
            <AlertCircle className="flex-shrink-0 text-red-600 dark:text-red-400" size={20} />
            <p className="text-sm text-red-700 dark:text-red-200 sm:text-base">{error}</p>
          </div>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="responsive-grid">
          <div className="mobile-card border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:border-blue-800 dark:from-blue-900/20 dark:to-cyan-900/10">
            <p className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300 sm:text-sm">
              <Clock size={16} /> Hari Ini
            </p>
            <p className="mt-2 text-2xl font-bold text-blue-950 dark:text-blue-100 sm:text-3xl">
              {dailySummary.length}
            </p>
            <p className="mt-1 text-xs text-blue-700 dark:text-blue-300">Notifikasi baru hari ini</p>
          </div>

          <div className="mobile-card border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:border-emerald-800 dark:from-emerald-900/20 dark:to-teal-900/10">
            <p className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 sm:text-sm">
              <Calendar size={16} /> Bulan Ini
            </p>
            <p className="mt-2 text-2xl font-bold text-emerald-950 dark:text-emerald-100 sm:text-3xl">
              {monthlySummaryItems.length}
            </p>
            <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-300">
              {monthlySummary.warning + monthlySummary.alert} peringatan perlu perhatian
            </p>
          </div>

          <div className="mobile-card border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
            <p className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 sm:text-sm">
              <Megaphone size={16} /> Semua Waktu
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-slate-100 sm:text-3xl">
              {visibleNotifications.length}
            </p>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Riwayat notifikasi AI</p>
          </div>

          <div className="mobile-card border border-violet-200 bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:border-violet-800 dark:from-violet-900/20 dark:to-fuchsia-900/10">
            <p className="flex items-center gap-2 text-xs font-semibold text-violet-700 dark:text-violet-300 sm:text-sm">
              <CalendarDays size={16} /> Tanggal Dipilih
            </p>
            <p className="mt-2 text-2xl font-bold text-violet-950 dark:text-violet-100 sm:text-3xl">
              {selectedDateSummary.length}
            </p>
            <p className="mt-1 text-xs text-violet-700 dark:text-violet-300">
              {formatSelectedDate(selectedDate)}
            </p>
          </div>
        </div>
      )}

      {!loading && notifications.length > 0 && (
        <div className="mobile-card border border-gray-200 bg-white dark:border-slate-700 dark:bg-slate-800">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                <CalendarDays size={18} className="text-primary" />
                Kalender Notifikasi
              </div>
              <label className="flex w-full items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-700 dark:border-slate-700 dark:text-gray-200 sm:w-auto">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    if (!event.target.value) {
                      return
                    }

                    setSelectedDate(event.target.value)
                    setActiveFilter('date')
                  }}
                  className="w-full bg-transparent outline-none dark:[color-scheme:dark] sm:w-auto"
                />
              </label>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              <Filter size={18} className="hidden flex-shrink-0 text-gray-600 dark:text-gray-400 sm:block" />
              {filters.map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-xs font-medium transition-all sm:px-4 sm:text-sm ${
                    activeFilter === filter.value
                      ? 'bg-primary text-white shadow-sm'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-700 dark:text-gray-300 dark:hover:bg-slate-600'
                  }`}
                >
                  {filter.label} {filter.count > 0 && <span className="ml-1 font-bold">({filter.count})</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {!loading && notifications.length > 0 && pinnedAlertNotification && (
        <div className="space-y-3 sm:space-y-4">
          {renderPinnedAlertCard()}
        </div>
      )}

      <div className="space-y-3 sm:space-y-4">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader className="animate-spin text-primary" size={32} />
          </div>
        ) : showEmptyNotifications ? (
          <div className="mobile-card border border-gray-200 bg-white text-center dark:border-slate-700 dark:bg-slate-800">
            <Megaphone className="mx-auto mb-4 text-gray-400" size={44} />
            <p className="text-base font-medium text-gray-600 dark:text-gray-400 sm:text-lg">
              {activeFilter === 'all'
                ? 'Belum ada notifikasi'
                : activeFilter === 'date'
                  ? 'Tidak ada notifikasi pada tanggal ini'
                  : 'Tidak ada notifikasi di periode ini'}
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500 sm:text-sm">
              {activeFilter === 'date'
                ? `Tanggal yang dipilih: ${formatSelectedDate(selectedDate)}.`
                : 'Peringatan dari AI akan muncul saat pengeluaran melewati batas yang Anda atur.'}
            </p>
          </div>
        ) : (
          orderedNotifications.map(notification => {
            const typeInfo = getTypeInfo(notification.type)
            const Icon = typeInfo.icon
            const details = getNotificationDetails(notification)
            const progress = getBudgetProgress(notification.metadata)

            return (
              <div
                key={notification.id}
                className={`mobile-card border bg-gradient-to-br ${typeInfo.color} ${typeInfo.border} transition-all hover:shadow-md ${
                  notification.is_read ? 'opacity-75' : ''
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                  <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/70 shadow-sm ring-1 ring-black/5 dark:bg-slate-950/30 ${typeInfo.iconColor}`}>
                    <Icon size={26} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ${typeInfo.badge}`}>
                            {typeInfo.label}
                          </span>
                          {!notification.is_read && (
                            <span className="rounded-md bg-white/70 px-2.5 py-1 text-xs font-semibold text-primary dark:bg-slate-900/50 dark:text-blue-300">
                              Baru
                            </span>
                          )}
                        </div>
                        <h3 className="mt-2 text-base font-bold leading-snug text-gray-950 dark:text-white sm:text-lg">
                          {getDisplayMessage(notification)}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          Dibuat pada {formatDate(notification.created_at)}
                        </p>
                      </div>

                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                      {!notification.is_read && notification.type !== 'alert' && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/70 bg-white/80 px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-white dark:border-slate-700 dark:bg-slate-900/60 dark:text-gray-200 dark:hover:bg-slate-900 sm:w-auto"
                          title="Tandai sudah dibaca"
                        >
                          <CheckCircle2 size={16} />
                          Tandai dibaca
                        </button>
                      )}
                        {notification.type !== 'alert' && (
                          <button
                            onClick={() => setDeleteTarget(notification)}
                            className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 bg-white/80 px-3 py-2 text-sm font-semibold text-red-600 shadow-sm transition hover:bg-red-50 dark:border-red-900/60 dark:bg-slate-900/60 dark:text-red-300 dark:hover:bg-red-950/30 sm:w-auto"
                            title="Hapus notifikasi"
                          >
                            <Trash2 size={16} />
                            Hapus
                          </button>
                        )}
                      </div>
                    </div>

                    {progress && (
                      <div className="mt-4 border-t border-black/10 pt-4 dark:border-white/10">
                        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                          <span className="font-medium text-gray-700 dark:text-gray-300">Pemakaian batas</span>
                          <span className="font-bold text-gray-950 dark:text-white">{progress.percentage}%</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-white/70 dark:bg-slate-900/60">
                          <div
                            className={`h-full rounded-full ${typeInfo.progress}`}
                            style={{ width: `${progress.cappedPercentage}%` }}
                          ></div>
                        </div>
                        {progress.overAmount > 0 && (
                          <p className="mt-2 text-sm font-medium text-red-700 dark:text-red-300">
                            Kelebihan {formatCurrency(progress.overAmount)} dari batas yang Anda atur.
                          </p>
                        )}
                      </div>
                    )}

                    {notification.type !== 'alert' && details.length > 0 && (
                      <div className="mt-4 grid gap-3 border-t border-black/10 pt-4 dark:border-white/10 sm:grid-cols-2 xl:grid-cols-3">
                        {details.map(detail => {
                          const DetailIcon = detail.icon

                          return (
                            <div key={`${notification.id}-${detail.label}`} className="flex items-start gap-2">
                              <DetailIcon className="mt-0.5 flex-shrink-0 text-gray-500 dark:text-gray-400" size={16} />
                              <div className="min-w-0">
                                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{detail.label}</p>
                                <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">
                                  {detail.value}
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {!loading && filteredNotifications.length > 0 && (
        <div className="mobile-card border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 flex-shrink-0 text-blue-600 dark:text-blue-400" size={20} />
            <p className="text-sm text-blue-900 dark:text-blue-100 sm:text-base">
              Atur batas harian dan bulanan di halaman Batas Pengeluaran agar peringatan AI lebih sesuai dengan kebiasaan Anda.
            </p>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-800 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-300">
                <Trash2 size={22} />
              </div>
              <div className="min-w-0">
                <h2 className="text-lg font-bold text-gray-950 dark:text-white">
                  Hapus notifikasi?
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Notifikasi ini akan dihapus dari riwayat Anda.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deletingId !== null}
                className="rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-800 transition hover:bg-gray-200 disabled:opacity-60 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleDeleteNotification}
                disabled={deletingId !== null}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
              >
                {deletingId !== null ? <Loader className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {deletingId !== null ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
