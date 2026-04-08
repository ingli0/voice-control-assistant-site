'use client'
import dynamic from 'next/dynamic'
import type { Appointment } from '@/types'

const AdminCalendar = dynamic(
  () => import('./AdminCalendar'),
  {
    ssr: false,
    loading: () => (
      <div className="flex-1 flex items-center justify-center text-[#555] text-sm p-12">
        Φόρτωση ημερολογίου...
      </div>
    ),
  }
)

interface Props {
  appointments: Appointment[]
  breaks: { id: string; break_date: string; start_time: string; end_time: string; label: string }[]
}

export default function CalendarWrapper({ appointments, breaks }: Props) {
  return <AdminCalendar appointments={appointments} breaks={breaks} />
}
