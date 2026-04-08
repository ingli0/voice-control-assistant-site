import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import AppointmentsTable from '@/components/admin/appointments/AppointmentsTable'
import type { Appointment } from '@/types'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Plus } from 'lucide-react'

interface Props {
  searchParams: Promise<{ date?: string; status?: string; q?: string }>
}

export default async function AppointmentsPage({ searchParams }: Props) {
  const params = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('appointments')
    .select('*')
    .order('appointment_date', { ascending: false })
    .order('appointment_time', { ascending: true })
    .limit(100)

  if (params.date) {
    query = query.eq('appointment_date', params.date)
  }
  if (params.status) {
    query = query.eq('status', params.status)
  }
  if (params.q) {
    query = query.or(`customer_name.ilike.%${params.q}%,customer_phone.ilike.%${params.q}%`)
  }

  const { data: appointments } = await query

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Ραντεβού" />
      <div className="p-6 max-w-7xl">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-[#666]">{appointments?.length ?? 0} αποτελέσματα</p>
          <Link href="/admin/appointments/new">
            <Button size="sm">
              <Plus size={14} />
              Νέο Ραντεβού
            </Button>
          </Link>
        </div>
        <AppointmentsTable
          appointments={(appointments ?? []) as Appointment[]}
          initialFilters={{ date: params.date, status: params.status, q: params.q }}
        />
      </div>
    </div>
  )
}
