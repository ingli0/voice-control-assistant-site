'use client'
import { useState, useCallback } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import type { Appointment } from '@/types'
import StatusBadge from './StatusBadge'
import { formatDate, formatPrice, formatTime } from '@/lib/utils'
import { Search, Calendar, Filter } from 'lucide-react'
import Button from '@/components/ui/Button'

const STATUS_OPTIONS = [
  { value: '', label: 'Όλες' },
  { value: 'pending', label: 'Εκκρεμεί' },
  { value: 'confirmed', label: 'Επιβεβαιωμένο' },
  { value: 'completed', label: 'Ολοκληρωμένο' },
  { value: 'cancelled', label: 'Ακυρωμένο' },
  { value: 'no_show', label: 'Δεν εμφανίστηκε' },
]

interface Props {
  appointments: Appointment[]
  initialFilters?: { date?: string; status?: string; q?: string }
}

export default function AppointmentsTable({ appointments, initialFilters = {} }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [q, setQ] = useState(initialFilters.q ?? '')
  const [date, setDate] = useState(initialFilters.date ?? '')
  const [status, setStatus] = useState(initialFilters.status ?? '')

  function applyFilters() {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (date) params.set('date', date)
    if (status) params.set('status', status)
    router.push(`${pathname}?${params.toString()}`)
  }

  function clearFilters() {
    setQ(''); setDate(''); setStatus('')
    router.push(pathname)
  }

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-4 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 bg-[#292929] border border-[#363636] rounded-lg px-3 py-2 flex-1 min-w-48">
          <Search size={14} className="text-[#555] shrink-0" />
          <input
            type="text"
            placeholder="Αναζήτηση πελάτη / τηλεφώνου..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
            className="bg-transparent text-sm text-[#e5e5e5] placeholder-[#555] outline-none flex-1"
          />
        </div>
        <div className="flex items-center gap-2 bg-[#292929] border border-[#363636] rounded-lg px-3 py-2">
          <Calendar size={14} className="text-[#555]" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent text-sm text-[#e5e5e5] outline-none"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="bg-[#292929] border border-[#363636] rounded-lg px-3 py-2 text-sm text-[#e5e5e5] outline-none cursor-pointer"
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <Button onClick={applyFilters} size="sm">
          <Filter size={14} />
          Φίλτρα
        </Button>
        <Button onClick={clearFilters} size="sm" variant="ghost">
          Καθαρισμός
        </Button>
      </div>

      {/* Table */}
      <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2e2e2e]">
                {['Πελάτης', 'Υπηρεσία', 'Ημερομηνία', 'Ώρα', 'Τιμή', 'Κατάσταση', 'Ενέργειες'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#272727]">
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-[#555] text-sm">
                    Δεν βρέθηκαν ραντεβού
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-[#272727] transition-colors">
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-[#e5e5e5]">{a.customer_name}</div>
                      <div className="text-xs text-[#666]">{a.customer_phone}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#aaa]">{a.service_name}</td>
                    <td className="px-4 py-3 text-sm text-[#aaa]">{formatDate(a.appointment_date)}</td>
                    <td className="px-4 py-3 text-sm text-[#aaa]">{formatTime(a.appointment_time)}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-[#c8a96e]">{formatPrice(a.final_price)}</td>
                    <td className="px-4 py-3"><StatusBadge status={a.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/appointments/${a.id}`}>
                          <Button variant="ghost" size="sm">Επεξ.</Button>
                        </Link>
                        {a.status === 'pending' && (
                          <Button variant="secondary" size="sm" onClick={() => updateStatus(a.id, 'confirmed')}>
                            ✓
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
