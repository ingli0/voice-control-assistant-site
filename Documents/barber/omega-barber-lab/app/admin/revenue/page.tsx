import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import RevenueClient from '@/components/admin/revenue/RevenueClient'

export default async function RevenuePage() {
  const supabase = await createClient()
  const now = new Date()
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const today = now.toISOString().split('T')[0]

  const { data: appointments } = await supabase
    .from('appointments')
    .select('appointment_date, service_name, final_price, status')
    .gte('appointment_date', monthStart)
    .lte('appointment_date', today)
    .not('status', 'eq', 'cancelled')
    .order('appointment_date')

  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

  const { data: lastMonthAppts } = await supabase
    .from('appointments')
    .select('final_price')
    .gte('appointment_date', lastMonthStart)
    .lte('appointment_date', lastMonthEnd)
    .eq('status', 'completed')

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Έσοδα" />
      <div className="p-6 max-w-6xl">
        <RevenueClient
          appointments={appointments ?? []}
          lastMonthRevenue={(lastMonthAppts ?? []).reduce((s: number, a: any) => s + (a.final_price ?? 0), 0)}
          monthStart={monthStart}
          today={today}
        />
      </div>
    </div>
  )
}
