export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
export type DiscountType = 'percentage' | 'fixed'
export type EmailType = 'confirmation' | 'reminder_1day' | 'reminder_2hr' | 'custom'

export interface Service {
  id: string
  name: string
  duration: number // minutes
  price: number
  description: string | null
  is_active: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface WorkingHour {
  id: string
  day_of_week: number // 0=Sun, 1=Mon, ..., 6=Sat
  is_open: boolean
  open_time: string | null
  close_time: string | null
  updated_at: string
}

export interface Break {
  id: string
  break_date: string
  start_time: string
  end_time: string
  label: string
  created_at: string
}

export interface Appointment {
  id: string
  customer_id: string | null
  customer_name: string
  customer_phone: string
  customer_email: string | null
  service_id: string | null
  service_name: string
  service_price: number
  service_duration: number
  appointment_date: string
  appointment_time: string
  end_time: string
  notes: string | null
  status: AppointmentStatus
  discount_id: string | null
  discount_amount: number | null
  final_price: number
  created_by: 'customer' | 'admin'
  confirmation_sent_at: string | null
  reminder_1day_sent_at: string | null
  reminder_2hr_sent_at: string | null
  created_at: string
  updated_at: string
}

export interface Discount {
  id: string
  code: string
  description: string | null
  type: DiscountType
  value: number
  min_order: number | null
  max_uses: number | null
  uses_count: number
  valid_from: string | null
  valid_until: string | null
  per_customer_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BookingPayload {
  serviceId: string
  appointmentDate: string
  appointmentTime: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  notes?: string
  couponCode?: string
}

export interface DashboardSummary {
  today_count: number
  week_count: number
  month_revenue: number
  pending_count: number
}

export interface RevenueData {
  totalRevenue: number
  completedCount: number
  avgOrderValue: number
  byDay: { date: string; revenue: number; count: number }[]
  byService: { service_name: string; revenue: number; count: number }[]
  vsLastMonth: { current: number; previous: number; change: number }
}
