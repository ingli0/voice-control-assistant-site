'use client'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

interface HourData {
  hour: number
  count: number
}

export default function PeakHoursChart({ data }: { data: HourData[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="bg-[#181818] border border-[#141414] rounded-2xl p-6 h-[296px]" />
  const max = Math.max(...data.map((d) => d.count), 1)

  return (
    <div className="bg-[#181818] border border-[#141414] rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-xs font-bold text-[#e5e5e5] uppercase tracking-[0.15em]">Ώρες Αιχμής</h3>
        <p className="text-[10px] text-[#363636] mt-0.5">Ανά ώρα της ημέρας</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
          <XAxis
            dataKey="hour"
            tickFormatter={(v) => `${v}h`}
            tick={{ fill: '#363636', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fill: '#363636', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(value: number) => [value, 'Ραντεβού']}
            labelFormatter={(label) => `${label}:00 – ${label + 1}:00`}
            contentStyle={{ background: '#1b1b1b', border: '1px solid #272727', borderRadius: '10px', color: '#e5e5e5', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            cursor={{ fill: 'rgba(200,169,110,0.04)' }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell
                key={index}
                fill={entry.count === max ? '#c8a96e' : `rgba(200,169,110,${0.08 + (entry.count / max) * 0.35})`}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {max > 0 && (
        <p className="text-[10px] text-[#363636] text-center mt-3">
          Ώρα αιχμής: <span className="text-[#c8a96e] font-semibold">{data.find((d) => d.count === max)?.hour}:00</span>
        </p>
      )}
    </div>
  )
}
