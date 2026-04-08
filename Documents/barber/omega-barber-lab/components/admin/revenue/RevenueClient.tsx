'use client'
import { useState, useMemo, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { formatPrice } from '@/lib/utils'
import { TrendingUp, TrendingDown, DollarSign, CalendarCheck, BarChart2 } from 'lucide-react'

interface ApptData {
  appointment_date: string
  service_name: string
  final_price: number
  status: string
}

interface Props {
  appointments: ApptData[]
  lastMonthRevenue: number
  monthStart: string  // 'YYYY-MM-DD' — computed server-side to avoid timezone mismatch
  today: string       // 'YYYY-MM-DD'
}

// Build every calendar day in the range so the chart has no gaps
function buildDailyRange(from: string, to: string): string[] {
  const days: string[] = []
  const cursor = new Date(from + 'T00:00:00')
  const end = new Date(to + 'T00:00:00')
  while (cursor <= end) {
    days.push(cursor.toISOString().split('T')[0])
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

export default function RevenueClient({ appointments, lastMonthRevenue, monthStart, today }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const completed = useMemo(
    () => appointments.filter((a) => a.status === 'completed'),
    [appointments]
  )
  const totalRevenue = completed.reduce((s, a) => s + (a.final_price ?? 0), 0)
  const avgOrder = completed.length > 0 ? totalRevenue / completed.length : 0
  const revChange = lastMonthRevenue > 0
    ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : 0

  // Daily revenue — fill every day in current month, missing days → 0
  const byDay = useMemo(() => {
    const revenueByDate: Record<string, number> = {}
    completed.forEach((a) => {
      revenueByDate[a.appointment_date] = (revenueByDate[a.appointment_date] ?? 0) + a.final_price
    })
    return buildDailyRange(monthStart, today).map((date) => ({
      date: date.slice(5).replace('-', '/'), // "MM/DD"
      revenue: Math.round((revenueByDate[date] ?? 0) * 100) / 100,
    }))
  }, [completed])

  // By service — sorted by revenue desc
  const byService = useMemo(() => {
    const map: Record<string, { revenue: number; count: number }> = {}
    completed.forEach((a) => {
      if (!map[a.service_name]) map[a.service_name] = { revenue: 0, count: 0 }
      map[a.service_name].revenue += a.final_price
      map[a.service_name].count += 1
    })
    return Object.entries(map)
      .map(([name, d]) => ({ name, revenue: Math.round(d.revenue * 100) / 100, count: d.count }))
      .sort((a, b) => b.revenue - a.revenue)
  }, [completed])

  const maxServiceRevenue = byService[0]?.revenue ?? 1

  const tooltipStyle = {
    background: '#232323',
    border: '1px solid #363636',
    borderRadius: '8px',
    color: '#e5e5e5',
    fontSize: '12px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
  }

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#212121] border border-[#c8a96e]/20 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={15} className="text-[#c8a96e]" />
            <span className="text-[10px] text-[#606060] uppercase tracking-wider">Μηνιαία Έσοδα</span>
          </div>
          <div className="text-2xl font-bold text-[#e5e5e5]">{formatPrice(totalRevenue)}</div>
          {lastMonthRevenue > 0 && (
            <div className={`flex items-center gap-1 mt-1 text-xs ${revChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {revChange >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
              {revChange >= 0 ? '+' : ''}{revChange}% vs. προηγ. μήνα
            </div>
          )}
        </div>
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign size={15} className="text-[#505050]" />
            <span className="text-[10px] text-[#606060] uppercase tracking-wider">Προηγ. Μήνας</span>
          </div>
          <div className="text-2xl font-bold text-[#e5e5e5]">{formatPrice(lastMonthRevenue)}</div>
        </div>
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck size={15} className="text-blue-400" />
            <span className="text-[10px] text-[#606060] uppercase tracking-wider">Ολοκληρωμένα</span>
          </div>
          <div className="text-2xl font-bold text-[#e5e5e5]">{completed.length}</div>
          <div className="text-[11px] text-[#555] mt-1">ραντεβού αυτό τον μήνα</div>
        </div>
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={15} className="text-green-400" />
            <span className="text-[10px] text-[#606060] uppercase tracking-wider">Μέση Τιμή</span>
          </div>
          <div className="text-2xl font-bold text-[#e5e5e5]">{formatPrice(avgOrder)}</div>
          <div className="text-[11px] text-[#555] mt-1">ανά ραντεβού</div>
        </div>
      </div>

      {/* Daily revenue area chart */}
      <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-6">
        <h3 className="text-[10px] font-bold text-[#606060] uppercase tracking-[0.15em] mb-6">
          Ημερήσια Έσοδα — Τρέχων Μήνας
        </h3>
        {!mounted ? (
          <div className="h-[220px] animate-pulse bg-[#272727] rounded-lg" />
        ) : byDay.every((d) => d.revenue === 0) ? (
          <div className="h-[220px] flex items-center justify-center text-sm text-[#555]">
            Δεν υπάρχουν ολοκληρωμένα ραντεβού αυτό τον μήνα
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={byDay} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                {/* SVG gradient — lowercase is correct here, not a recharts component */}
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#c8a96e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#c8a96e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fill: '#505050', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#505050', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}€`}
                width={40}
              />
              <Tooltip
                formatter={(value: number) => [formatPrice(value), 'Έσοδα']}
                labelFormatter={(label) => `Ημέρα: ${label}`}
                contentStyle={tooltipStyle}
                cursor={{ stroke: 'rgba(200,169,110,0.15)', strokeWidth: 1 }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#c8a96e"
                strokeWidth={1.5}
                fill="url(#revenueGradient)"
                dot={false}
                activeDot={{ r: 4, fill: '#c8a96e', stroke: '#0d0d0d', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Revenue by service — bar + table */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-6">
          <h3 className="text-[10px] font-bold text-[#606060] uppercase tracking-[0.15em] mb-6">
            Έσοδα ανά Υπηρεσία
          </h3>
          {!mounted ? (
            <div className="h-[200px] animate-pulse bg-[#272727] rounded-lg" />
          ) : byService.length === 0 ? (
            <div className="h-[200px] flex items-center justify-center text-sm text-[#555]">
              Δεν υπάρχουν δεδομένα
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={Math.max(160, byService.length * 48)}>
              <BarChart
                layout="vertical"
                data={byService}
                margin={{ top: 0, right: 8, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="2 4" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis
                  type="number"
                  tick={{ fill: '#505050', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}€`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fill: '#909090', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  formatter={(value: number) => [formatPrice(value), 'Έσοδα']}
                  contentStyle={tooltipStyle}
                  cursor={{ fill: 'rgba(200,169,110,0.04)' }}
                />
                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} maxBarSize={28}>
                  {byService.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={i === 0 ? '#c8a96e' : `rgba(200,169,110,${0.15 + (entry.revenue / maxServiceRevenue) * 0.5})`}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Table breakdown */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2e2e2e]">
            <h3 className="text-[10px] font-bold text-[#606060] uppercase tracking-[0.15em]">Αναλυτικά</h3>
          </div>
          {byService.length === 0 ? (
            <div className="px-6 py-8 text-center text-sm text-[#555]">Δεν υπάρχουν δεδομένα</div>
          ) : (
            <div className="divide-y divide-[#272727]">
              {byService.map((s, i) => {
                const pct = Math.round((s.revenue / totalRevenue) * 100) || 0
                return (
                  <div key={s.name} className="px-6 py-3.5">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-[#505050] tabular-nums w-4">{i + 1}</span>
                        <span className="text-sm text-[#e5e5e5]">{s.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-semibold text-[#c8a96e]">{formatPrice(s.revenue)}</span>
                        <span className="text-[10px] text-[#555] ml-2">×{s.count}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    <div className="h-[2px] bg-[#272727] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: i === 0 ? '#c8a96e' : 'rgba(200,169,110,0.4)',
                        }}
                      />
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
}
