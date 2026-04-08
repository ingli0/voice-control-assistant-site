import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import StatCard from '@/components/admin/dashboard/StatCard'
import WeeklyChart from '@/components/admin/dashboard/WeeklyChart'
import PeakHoursChart from '@/components/admin/dashboard/PeakHoursChart'
import StatusBadge from '@/components/admin/appointments/StatusBadge'
import { formatPrice, formatTime } from '@/lib/utils'
import { CalendarCheck, Users, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import type { Appointment } from '@/types'

const STATUS_DOT: Record<string, string> = {
  pending:   'bg-amber-400',
  confirmed: 'bg-green-400',
  completed: 'bg-blue-400',
  cancelled: 'bg-red-500',
  no_show:   'bg-zinc-500',
}

async function getDashboardData() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]
  const now = new Date()
  const weekAgo = new Date(now); weekAgo.setDate(weekAgo.getDate() - 7)
  const weekStart = weekAgo.toISOString().split('T')[0]
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]

  const [todayAppts, weekAppts, monthRevenue, lastMonthRevenue, peakHoursData] = await Promise.all([
    supabase.from('appointments').select('*').eq('appointment_date', today).not('status', 'eq', 'cancelled').order('appointment_time'),
    supabase.from('appointments').select('id').gte('appointment_date', weekStart).not('status', 'eq', 'cancelled'),
    supabase.from('appointments').select('final_price').gte('appointment_date', monthStart).eq('status', 'completed'),
    supabase.from('appointments').select('final_price').gte('appointment_date', lastMonthStart).lte('appointment_date', lastMonthEnd).eq('status', 'completed'),
    supabase.from('appointments').select('appointment_time').not('status', 'in', '("cancelled")'),
  ])

  const hourCounts: Record<number, number> = {}
  for (let h = 9; h <= 20; h++) hourCounts[h] = 0
  ;(peakHoursData.data ?? []).forEach((a) => {
    const hour = parseInt(a.appointment_time.split(':')[0])
    hourCounts[hour] = (hourCounts[hour] ?? 0) + 1
  })
  const peakHours = Object.entries(hourCounts).map(([hour, count]) => ({ hour: parseInt(hour), count }))

  const weeklyData = []
  for (let w = 7; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - w * 7 - 6)
    const end = new Date(); end.setDate(end.getDate() - w * 7)
    const { data } = await supabase
      .from('appointments').select('final_price, status')
      .gte('appointment_date', start.toISOString().split('T')[0])
      .lte('appointment_date', end.toISOString().split('T')[0])
      .not('status', 'eq', 'cancelled')
    weeklyData.push({
      week: `W${8 - w}`,
      count: data?.length ?? 0,
      revenue: Math.round((data?.filter(a => a.status === 'completed').reduce((s, a) => s + (a.final_price ?? 0), 0) ?? 0) * 100) / 100,
    })
  }

  const currentMonthRev = (monthRevenue.data ?? []).reduce((s, a) => s + (a.final_price ?? 0), 0)
  const lastMonthRev = (lastMonthRevenue.data ?? []).reduce((s, a) => s + (a.final_price ?? 0), 0)

  return {
    todayAppts: todayAppts.data as Appointment[] ?? [],
    weekCount: weekAppts.data?.length ?? 0,
    currentMonthRev,
    lastMonthRev,
    peakHours,
    weeklyData,
    pendingCount: (todayAppts.data ?? []).filter((a) => a.status === 'pending').length,
  }
}

export default async function DashboardPage() {
  const data = await getDashboardData()
  const revChange = data.lastMonthRev > 0
    ? Math.round(((data.currentMonthRev - data.lastMonthRev) / data.lastMonthRev) * 100)
    : 0

  return (
    <div className="flex-1 overflow-y-auto bg-[#1b1b1b]">
      <AdminTopbar title="Dashboard" />

      <div className="p-6 space-y-6 max-w-7xl">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Σήμερα"      value={data.todayAppts.length}         subtitle="ραντεβού"                    icon={CalendarCheck} color="gold" />
          <StatCard title="Εβδομάδα"    value={data.weekCount}                  subtitle="ραντεβού"                    icon={Clock}         color="blue" />
          <StatCard title="Έσοδα Μήνα"  value={formatPrice(data.currentMonthRev)} icon={TrendingUp} color="green"
            trend={data.lastMonthRev > 0 ? { value: revChange, label: 'vs. προηγ.' } : undefined} />
          <StatCard title="Εκκρεμή"     value={data.pendingCount}               subtitle="χρειάζονται επιβεβαίωση"    icon={Users}         color="purple" />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <WeeklyChart data={data.weeklyData} />
          <PeakHoursChart data={data.peakHours} />
        </div>

        {/* Today's appointments */}
        <div className="bg-[#181818] border border-[#141414] rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#141414] flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold text-[#e5e5e5] uppercase tracking-[0.15em]">
                Σημερινά Ραντεβού
              </h3>
              <p className="text-[10px] text-[#363636] mt-0.5">{data.todayAppts.length} προγραμματισμένα</p>
            </div>
            <Link
              href="/admin/appointments"
              className="flex items-center gap-1.5 text-xs text-[#333] hover:text-[#c8a96e] transition-colors"
            >
              Όλα <ArrowRight size={12} />
            </Link>
          </div>

          {data.todayAppts.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#1b1b1b] border border-[#272727] flex items-center justify-center mx-auto mb-4">
                <CalendarCheck size={20} className="text-[#363636]" />
              </div>
              <p className="text-sm text-[#363636] font-medium">Δεν υπάρχουν ραντεβού για σήμερα</p>
              <Link href="/admin/appointments/new" className="inline-flex items-center gap-1.5 mt-4 text-xs text-[#c8a96e] hover:underline">
                + Προσθήκη ραντεβού
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[#0f0f0f]">
              {data.todayAppts.map((appt, i) => (
                <Link
                  key={appt.id}
                  href={`/admin/appointments/${appt.id}`}
                  className="flex items-center gap-4 px-6 py-4 hover:bg-[#1b1b1b] transition-colors group"
                >
                  {/* Time column */}
                  <div className="w-14 shrink-0 text-right">
                    <div className="text-sm font-bold text-[#c8a96e] tabular-nums">{formatTime(appt.appointment_time)}</div>
                    <div className="text-[10px] text-[#252525]">{formatTime(appt.end_time)}</div>
                  </div>

                  {/* Connector */}
                  <div className="flex flex-col items-center gap-0.5 shrink-0">
                    <div className={`w-2 h-2 rounded-full ${STATUS_DOT[appt.status] ?? 'bg-zinc-500'}`} />
                    {i < data.todayAppts.length - 1 && <div className="w-px h-8 bg-[#151515]" />}
                  </div>

                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-xl bg-[#1b1b1b] border border-[#272727] flex items-center justify-center shrink-0 group-hover:border-[#c8a96e]/20 transition-colors">
                    <span className="text-[#c8a96e] text-sm font-bold">
                      {appt.customer_name.charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[#ccc] group-hover:text-[#e5e5e5] transition-colors truncate">
                      {appt.customer_name}
                    </div>
                    <div className="text-xs text-[#333] truncate">{appt.service_name}</div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right hidden sm:block">
                      <div className="text-sm font-bold text-[#555]">{formatPrice(appt.final_price)}</div>
                    </div>
                    <StatusBadge status={appt.status} />
                    <ArrowRight size={13} className="text-[#2b2b2b] group-hover:text-[#333] transition-colors" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
