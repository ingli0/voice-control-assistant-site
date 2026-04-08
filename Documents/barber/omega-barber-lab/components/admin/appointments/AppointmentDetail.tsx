'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Appointment, AppointmentStatus } from '@/types'
import { formatDate, formatPrice, formatTime, statusLabel } from '@/lib/utils'
import StatusBadge from './StatusBadge'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Calendar } from 'lucide-react'

const STATUSES: AppointmentStatus[] = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']

export default function AppointmentDetail({ appointment: initial }: { appointment: Appointment }) {
  const router = useRouter()
  const [appt, setAppt] = useState(initial)
  const [updating, setUpdating] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function changeStatus(status: AppointmentStatus) {
    setUpdating(true)
    const res = await fetch(`/api/admin/appointments/${appt.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      const { appointment } = await res.json()
      setAppt(appointment)
    }
    setUpdating(false)
  }

  async function handleDelete() {
    if (!confirm('Διαγραφή ραντεβού; Αυτή η ενέργεια δεν αναιρείται.')) return
    setDeleting(true)
    await fetch(`/api/admin/appointments/${appt.id}`, { method: 'DELETE' })
    router.push('/admin/appointments')
  }

  return (
    <div className="p-6 max-w-2xl">
      <Link href="/admin/appointments" className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#c8a96e] mb-6 transition-colors">
        <ArrowLeft size={14} />
        Πίσω στα ραντεβού
      </Link>

      <div className="space-y-4">
        {/* Status */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-[#e5e5e5]">Κατάσταση</h2>
            <StatusBadge status={appt.status} />
          </div>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => changeStatus(s)}
                disabled={updating || appt.status === s}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                  appt.status === s
                    ? 'bg-[#c8a96e] text-black border-[#c8a96e]'
                    : 'bg-[#292929] text-[#888] border-[#363636] hover:border-[#c8a96e] hover:text-[#c8a96e]'
                } disabled:opacity-50`}
              >
                {statusLabel(s)}
              </button>
            ))}
          </div>
        </div>

        {/* Appointment Info */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Ραντεβού</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-[#666] mb-1">Υπηρεσία</div>
              <div className="text-sm text-[#e5e5e5]">{appt.service_name}</div>
            </div>
            <div>
              <div className="text-xs text-[#666] mb-1">Διάρκεια</div>
              <div className="text-sm text-[#e5e5e5]">{appt.service_duration} λεπτά</div>
            </div>
            <div>
              <div className="text-xs text-[#666] mb-1 flex items-center gap-1"><Calendar size={10} />Ημερομηνία</div>
              <div className="text-sm text-[#e5e5e5]">{formatDate(appt.appointment_date)}</div>
            </div>
            <div>
              <div className="text-xs text-[#666] mb-1">Ώρα</div>
              <div className="text-sm text-[#e5e5e5]">{formatTime(appt.appointment_time)} – {formatTime(appt.end_time)}</div>
            </div>
            <div>
              <div className="text-xs text-[#666] mb-1">Αρχική Τιμή</div>
              <div className="text-sm text-[#e5e5e5]">{formatPrice(appt.service_price)}</div>
            </div>
            <div>
              <div className="text-xs text-[#666] mb-1">Τελική Τιμή</div>
              <div className="text-sm font-bold text-[#c8a96e]">{formatPrice(appt.final_price)}</div>
            </div>
            {appt.discount_amount && (
              <div className="col-span-2">
                <div className="text-xs text-[#666] mb-1">Έκπτωση</div>
                <div className="text-sm text-green-400">-{formatPrice(appt.discount_amount)}</div>
              </div>
            )}
          </div>
          {appt.notes && (
            <div>
              <div className="text-xs text-[#666] mb-1">Σημειώσεις</div>
              <div className="text-sm text-[#aaa] bg-[#272727] rounded-lg p-3">{appt.notes}</div>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-6 space-y-3">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Πελάτης</h2>
          <div className="text-base font-semibold text-[#e5e5e5]">{appt.customer_name}</div>
          <a href={`tel:${appt.customer_phone}`} className="flex items-center gap-2 text-sm text-[#c8a96e] hover:underline">
            <Phone size={13} />{appt.customer_phone}
          </a>
          {appt.customer_email && (
            <a href={`mailto:${appt.customer_email}`} className="flex items-center gap-2 text-sm text-[#888] hover:text-[#c8a96e]">
              <Mail size={13} />{appt.customer_email}
            </a>
          )}
          {appt.customer_id && (
            <Link href={`/admin/customers/${appt.customer_id}`} className="text-xs text-[#c8a96e] hover:underline">
              Δες ιστορικό πελάτη →
            </Link>
          )}
        </div>

        {/* Email status */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-6 space-y-2">
          <h2 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Email</h2>
          <div className="flex justify-between text-sm">
            <span className="text-[#666]">Επιβεβαίωση</span>
            <span className={appt.confirmation_sent_at ? 'text-green-400' : 'text-[#555]'}>
              {appt.confirmation_sent_at ? '✓ Εστάλη' : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#666]">Υπενθύμιση 1 ημέρα</span>
            <span className={appt.reminder_1day_sent_at ? 'text-green-400' : 'text-[#555]'}>
              {appt.reminder_1day_sent_at ? '✓ Εστάλη' : '—'}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#666]">Υπενθύμιση 2 ώρες</span>
            <span className={appt.reminder_2hr_sent_at ? 'text-green-400' : 'text-[#555]'}>
              {appt.reminder_2hr_sent_at ? '✓ Εστάλη' : '—'}
            </span>
          </div>
        </div>

        <Button variant="danger" onClick={handleDelete} loading={deleting} className="w-full">
          Διαγραφή Ραντεβού
        </Button>
      </div>
    </div>
  )
}
