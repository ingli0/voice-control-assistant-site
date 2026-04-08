import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import CalendarWrapper from '@/components/admin/calendar/CalendarWrapper'
import type { Appointment } from '@/types'

export default async function CalendarPage() {
  const supabase = await createClient()
  const now = new Date()
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const end = new Date(now.getFullYear(), now.getMonth() + 2, 0).toISOString().split('T')[0]

  const [{ data: appointments }, { data: breaks }] = await Promise.all([
    supabase
      .from('appointments')
      .select('*')
      .gte('appointment_date', start)
      .lte('appointment_date', end)
      .not('status', 'eq', 'cancelled')
      .order('appointment_date, appointment_time'),
    supabase
      .from('breaks')
      .select('*')
      .gte('break_date', start)
      .lte('break_date', end)
      .order('break_date, start_time'),
  ])

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <AdminTopbar title="Ημερολόγιο" />
      <CalendarWrapper
        appointments={(appointments ?? []) as Appointment[]}
        breaks={breaks ?? []}
      />
    </div>
  )
}
