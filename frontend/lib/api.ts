import axios, { AxiosInstance, AxiosError } from 'axios'
import { ApiResponse, PaginatedResponse, ResetPasswordRequest } from '@/types'
import { useAuthStore } from '@/store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

class ApiClient {
  private instance: AxiosInstance

  constructor() {
    this.instance = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    })

    // Handle errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          useAuthStore.getState().logout()
          if (typeof window !== 'undefined') {
            const publicPaths = ['/', '/login', '/register', '/forgot-password']
            if (!publicPaths.includes(window.location.pathname)) {
              window.location.href = '/login'
            }
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.instance.post<ApiResponse<any>>('/auth/login', {
      email,
      password,
    })
    return response.data
  }

  async register(name: string, email: string, password: string, passwordConfirmation: string) {
    const response = await this.instance.post<ApiResponse<any>>('/auth/register', {
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
    })
    return response.data
  }

  async logout() {
    await this.instance.post('/auth/logout')
  }

  async forgotPassword(email: string) {
    const response = await this.instance.post<ApiResponse<{ email: string; expires_at: string }>>('/auth/forgot-password', {
      email,
    })
    return response.data
  }

  async resetPassword(data: ResetPasswordRequest) {
    const response = await this.instance.post<ApiResponse<any>>('/auth/reset-password', data)
    return response.data
  }

  async getMe() {
    const response = await this.instance.get<ApiResponse<any>>('/auth/me')
    return response.data
  }

  // Expenses
  async getExpenses(params?: any) {
    const response = await this.instance.get<ApiResponse<PaginatedResponse<any>>>('/expenses', { params })
    return response.data
  }

  async getExpense(id: number) {
    const response = await this.instance.get<ApiResponse<any>>(`/expenses/${id}`)
    return response.data
  }

  async createExpense(data: any) {
    const response = await this.instance.post<ApiResponse<any>>('/expenses', data)
    return response.data
  }

  async updateExpense(id: number, data: any) {
    const response = await this.instance.put<ApiResponse<any>>(`/expenses/${id}`, data)
    return response.data
  }

  async deleteExpense(id: number) {
    const response = await this.instance.delete<ApiResponse<any>>(`/expenses/${id}`)
    return response.data
  }

  // Categories
  async getCategories() {
    const response = await this.instance.get<ApiResponse<any[]>>('/categories')
    return response.data
  }

  async createCategory(data: any) {
    const response = await this.instance.post<ApiResponse<any>>('/categories', data)
    return response.data
  }

  // Dashboard
  async getDashboardStats() {
    const response = await this.instance.get<ApiResponse<any>>('/dashboard/stats')
    return response.data
  }

  async getDashboardExpenses(filters?: any) {
    const response = await this.instance.get<ApiResponse<any>>('/dashboard/expenses', { params: filters })
    return response.data
  }

  // AI Notifications
  async getNotifications(params?: any) {
    const response = await this.instance.get<ApiResponse<PaginatedResponse<any>>>('/notifications', { params })
    return response.data
  }

  async markNotificationAsRead(id: number) {
    const response = await this.instance.put<ApiResponse<any>>(`/notifications/${id}/read`)
    return response.data
  }

  async deleteNotification(id: number) {
    const response = await this.instance.delete<ApiResponse<any>>(`/notifications/${id}`)
    return response.data
  }

  async markAllNotificationsAsRead() {
    const response = await this.instance.put<ApiResponse<any>>('/notifications/read-all')
    return response.data
  }

  async getUnreadNotificationCount() {
    const response = await this.instance.get<ApiResponse<{ count: number }>>('/notifications/unread/count')
    return response.data
  }

  // User spending limits
  async getUserLimits() {
    const response = await this.instance.get<ApiResponse<any>>('/user/limits')
    return response.data
  }

  async updateUserLimits(data: any) {
    const response = await this.instance.put<ApiResponse<any>>('/user/limits', data)
    return response.data
  }

  // Admin
  async getAdminStats() {
    const response = await this.instance.get<ApiResponse<any>>('/admin/dashboard')
    return response.data
  }

  async getAdminUsers(params?: any) {
    const response = await this.instance.get<ApiResponse<PaginatedResponse<any>>>('/admin/users', { params })
    return response.data
  }

  async getAdminNotifications(params?: any) {
    const response = await this.instance.get<ApiResponse<any>>('/admin/notifications', { params })
    return response.data
  }

  async getAdminLaporan(filters?: any) {
    const response = await this.instance.get<ApiResponse<any>>('/admin/laporan', { params: filters })
    return response.data
  }

  // Upload
  async uploadReceipt(file: File, expenseId: number) {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('expense_id', expenseId.toString())

    const response = await this.instance.post<ApiResponse<any>>('/upload-receipt', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  }
}

export const apiClient = new ApiClient()
