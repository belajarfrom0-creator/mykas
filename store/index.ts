import { User } from '@/types'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: User | null) => void
  setIsLoading: (loading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setIsLoading: (isLoading) => set({ isLoading }),
      logout: () => set({ user: null, isAuthenticated: false, isLoading: false }),
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
)

// Expense Store
interface ExpenseFilters {
  category_id?: number
  start_date?: string
  end_date?: string
  search?: string
}

interface ExpenseState {
  filters: ExpenseFilters
  setFilters: (filters: ExpenseFilters) => void
  resetFilters: () => void
}

export const useExpenseStore = create<ExpenseState>((set) => ({
  filters: {},
  setFilters: (filters) => set({ filters }),
  resetFilters: () => set({ filters: {} }),
}))

// Notification Store
interface NotificationState {
  unreadCount: number
  setUnreadCount: (count: number) => void
  increment: () => void
  decrement: () => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  increment: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  decrement: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),
}))
