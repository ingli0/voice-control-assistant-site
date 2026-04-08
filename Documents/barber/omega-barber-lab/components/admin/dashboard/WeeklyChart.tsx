'use client'
import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

interface WeeklyData {
  week: string
  count: number
  revenue: number
}

export default function WeeklyChart({ data }: { data: WeeklyData[] }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="bg-[#181818] border border-[#141414] rounded-2xl p-6 h-[296px]" />
  return (
    <div className="bg-[#181818] border border-[#141414] rounded-2xl p-6">
      <div className="mb-6">
        <h3 className="text-xs font-bold text-[#e5e5e5] uppercase tracking-[0.15em]">Εβδομαδιαία Επισκόπηση</h3>
        <p className="text-[10px] text-[#363636] mt-0.5">Τελευταίες 8 εβδομάδες</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#111" vertical={false} />
          <XAxis dataKey="week" tick={{ fill: '#363636', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#363636', fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: '#1b1b1b', border: '1px solid #272727', borderRadius: '10px', color: '#e5e5e5', fontSize: '12px', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}
            cursor={{ fill: 'rgba(200,169,110,0.04)' }}
          />
          <Legend wrapperStyle={{ fontSize: '11px', color: '#404040' }} />
          <Bar dataKey="count" name="Ραντεβού" fill="#c8a96e" radius={[4, 4, 0, 0]} opacity={0.85} />
          <Bar dataKey="revenue" name="Έσοδα (€)" fill="#1e4a33" radius={[4, 4, 0, 0]} opacity={0.9} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
