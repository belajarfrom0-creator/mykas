import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { apiClient } from '@/lib/api'
import { useAuthStore } from '@/store'

let authCheckPromise: Promise<void> | null = null

const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as {
      message?: string
      errors?: Record<string, string[]>
    } | undefined
    const validationMessage = data?.errors
      ? Object.values(data.errors).flat()[0]
      : undefined

    return validationMessage || data?.message || 'Permintaan gagal diproses'
  }

  return error instanceof Error ? error.message : 'Terjadi kesalahan'
}

const verifySession = () => {
  if (!authCheckPromise) {
    const store = useAuthStore.getState()
    store.setIsLoading(true)

    authCheckPromise = apiClient.getMe()
      .then((response) => store.setUser(response.data))
      .catch(() => store.logout())
      .finally(() => store.setIsLoading(false))
  }

  return authCheckPromise
}

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, setUser, setIsLoading, logout } = useAuthStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    void verifySession()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.login(email, password)
      setUser(response.data.user)
      return response.data
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading, setUser])

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    passwordConfirmation: string
  ) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.register(name, email, password, passwordConfirmation)
      return response.data
    } catch (err) {
      const message = getErrorMessage(err)
      setError(message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [setIsLoading])

  const handleLogout = useCallback(async () => {
    try {
      await apiClient.logout()
    } catch {
      // Local session is still cleared when the server token has expired.
    } finally {
      logout()
      authCheckPromise = null
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
    }
  }, [logout])

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout: handleLogout,
  }
}

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = useCallback(() => {
    setTheme((previousTheme) => {
      const newTheme = previousTheme === 'light' ? 'dark' : 'light'
      localStorage.setItem('theme', newTheme)
      document.documentElement.classList.toggle('dark', newTheme === 'dark')
      return newTheme
    })
  }, [])

  return { theme, toggleTheme }
}
