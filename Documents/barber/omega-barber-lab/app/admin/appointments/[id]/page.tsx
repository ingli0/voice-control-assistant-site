import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import AdminTopbar from '@/components/layout/AdminTopbar'
import AppointmentDetail from '@/components/admin/appointments/AppointmentDetail'
import type { Appointment } from '@/types'

interface Props { params: Promise<{ id: string }> }

export default async function AppointmentDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: appointment } = await supabase
    .from('appointments')
    .select('*')
    .eq('id', id)
    .single()

  if (!appointment) notFound()

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Λεπτομέρειες Ραντεβού" />
      <AppointmentDetail appointment={appointment as Appointment} />
    </div>
  )
}
