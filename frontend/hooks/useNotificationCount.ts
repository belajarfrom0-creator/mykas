import { useCallback, useEffect, useState } from 'react'
import { apiClient } from '@/lib/api'
import { useAuthStore, useNotificationStore } from '@/store'

export function useNotificationCount() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { unreadCount, setUnreadCount } = useNotificationStore()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) {
      setUnreadCount(0)
      setLoading(false)
      return
    }

    try {
      setError(null)
      const response = await apiClient.getUnreadNotificationCount()
      if (response.data) {
        setUnreadCount(response.data.count)
      }
    } catch (err) {
      console.error('Error fetching unread notification count:', err)
      setError('Failed to fetch notification count')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, setUnreadCount])

  useEffect(() => {
    void fetchUnreadCount()

    // Set up polling to refresh every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000)

    return () => clearInterval(interval)
  }, [fetchUnreadCount])

  return {
    unreadCount,
    loading,
    error,
    refetch: fetchUnreadCount,
  }
}
