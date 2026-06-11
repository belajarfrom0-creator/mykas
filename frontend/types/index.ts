// User & Auth
export interface User {
  id: number
  name: string
  email: string
  phone?: string
  avatar?: string
  daily_limit?: number | null
  monthly_limit?: number | null
  role_id: number
  role: Role
  created_at: string
  updated_at: string
}

export interface Role {
  id: number
  name: 'super_admin' | 'user'
  description: string
}

export interface AuthResponse {
  user: User
  token: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  code: string
  password: string
  password_confirmation: string
}

// Expense & Category
export interface Category {
  id: number
  name: string
  icon?: string
  color?: string
  description?: string
}

export interface Expense {
  id: number
  user_id: number
  category_id: number
  amount: number
  description: string
  date: string
  receipt_path?: string
  category?: Category
  created_at: string
  updated_at: string
}

export interface ExpenseRequest {
  category_id: number
  amount: number
  description: string
  date: string
}

export interface ExpenseFilters {
  category_id?: number
  start_date?: string
  end_date?: string
  min_amount?: number
  max_amount?: number
  search?: string
  page?: number
  per_page?: number
}

export interface UserSpendingLimits {
  daily_limit: number | null
  monthly_limit: number | null
}

// AI Notifications
export interface AINotification {
  id: number
  user_id: number
  type: 'alert' | 'insight' | 'recommendation' | 'warning'
  message: string
  metadata?: Record<string, any>
  is_read: boolean
  created_at: string
  updated_at: string
}

// Dashboard Stats
export interface DashboardStats {
  total_expenses: number
  monthly_expenses: number
  category_breakdown: CategoryBreakdown[]
  daily_data: DailyData[]
  weekly_data: WeeklyData[]
  monthly_data: MonthlyData[]
}

export interface CategoryBreakdown {
  category: string
  amount: number
  percentage: number
  color?: string
}

export interface DailyData {
  date: string
  amount: number
}

export interface WeeklyData {
  week: string
  amount: number
  category: string
}

export interface MonthlyData {
  month: string
  amount: number
}

// Admin Analytics
export interface AdminStats {
  total_users: number
  total_expenses: number
  total_notifications: number
  category_stats: CategoryStats[]
  user_activity: UserActivity[]
  daily_stats: DailyStats[]
}

export interface CategoryStats {
  category: string
  total_amount: number
  count: number
  avg_amount: number
}

export interface UserActivity {
  user_id: number
  user_name: string
  total_expenses: number
  latest_activity: string
}

export interface DailyStats {
  date: string
  new_users: number
  new_expenses: number
  notifications_sent: number
}

// API Response
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  total: number
  per_page: number
  last_page: number
}

// Upload
export interface UploadedReceipt {
  id: number
  expense_id: number
  path: string
  original_name: string
  mime_type: string
}
