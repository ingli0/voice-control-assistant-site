import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminTopbar from '@/components/layout/AdminTopbar'
import { formatDate, formatPrice, formatTime } from '@/lib/utils'
import StatusBadge from '@/components/admin/appointments/StatusBadge'
import type { Appointment, Customer } from '@/types'
import Link from 'next/link'
import { ArrowLeft, Phone, Mail, Calendar } from 'lucide-react'

interface Props { params: Promise<{ id: string }> }

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: customer }, { data: appointments }] = await Promise.all([
    supabase.from('customers').select('*').eq('id', id).single(),
    supabase
      .from('appointments')
      .select('*')
      .eq('customer_id', id)
      .order('appointment_date', { ascending: false }),
  ])

  if (!customer) notFound()

  const totalSpent = (appointments ?? [])
    .filter((a) => a.status === 'completed')
    .reduce((s: number, a: any) => s + (a.final_price ?? 0), 0)

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Προφίλ Πελάτη" />
      <div className="p-6 max-w-3xl space-y-6">
        <Link href="/admin/customers" className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#c8a96e] transition-colors">
          <ArrowLeft size={14} />Πίσω στους πελάτες
        </Link>

        {/* Profile */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-6 flex items-start gap-6">
          <div className="w-16 h-16 rounded-full bg-[#292929] border-2 border-[#c8a96e]/30 flex items-center justify-center shrink-0">
            <span className="text-[#c8a96e] text-2xl font-bold">{(customer as Customer).name.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-[#e5e5e5]">{(customer as Customer).name}</h2>
            <div className="flex flex-wrap gap-4 mt-2">
              <a href={`tel:${(customer as Customer).phone}`} className="flex items-center gap-1.5 text-sm text-[#c8a96e]">
                <Phone size={13} />{(customer as Customer).phone}
              </a>
              {(customer as Customer).email && (
                <a href={`mailto:${(customer as Customer).email}`} className="flex items-center gap-1.5 text-sm text-[#888]">
                  <Mail size={13} />{(customer as Customer).email}
                </a>
              )}
            </div>
            <div className="flex gap-6 mt-4">
              <div>
                <div className="text-2xl font-bold text-[#c8a96e]">{appointments?.length ?? 0}</div>
                <div className="text-xs text-[#666]">Συνολικά ραντεβού</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#c8a96e]">{formatPrice(totalSpent)}</div>
                <div className="text-xs text-[#666]">Συνολικά έσοδα</div>
              </div>
              <div>
                <div className="text-xs text-[#666] mb-1">Πελάτης από</div>
                <div className="text-sm text-[#e5e5e5]">{formatDate((customer as Customer).created_at)}</div>
              </div>
            </div>
            {(customer as Customer).notes && (
              <div className="mt-4 bg-[#272727] rounded-lg p-3 text-sm text-[#aaa]">
                {(customer as Customer).notes}
              </div>
            )}
          </div>
        </div>

        {/* Appointment history */}
        <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#2e2e2e]">
            <h3 className="text-sm font-semibold text-[#888] uppercase tracking-wider">
              Ιστορικό Ραντεβού ({appointments?.length ?? 0})
            </h3>
          </div>
          {!appointments || appointments.length === 0 ? (
            <div className="px-6 py-12 text-center text-[#555] text-sm">Δεν υπάρχουν ραντεβού</div>
          ) : (
            <div className="divide-y divide-[#272727]">
              {(appointments as Appointment[]).map((a) => (
                <Link
                  key={a.id}
                  href={`/admin/appointments/${a.id}`}
                  className="flex items-center justify-between px-6 py-4 hover:bg-[#272727] transition-colors"
                >
                  <div>
                    <div className="text-sm font-medium text-[#e5e5e5]">{a.service_name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar size={11} className="text-[#555]" />
                      <span className="text-xs text-[#666]">{formatDate(a.appointment_date)} — {formatTime(a.appointment_time)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-[#c8a96e]">{formatPrice(a.final_price)}</span>
                    <StatusBadge status={a.status} />
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
