import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import NewAppointmentForm from '@/components/admin/appointments/NewAppointmentForm'
import type { Service } from '@/types'

export default async function NewAppointmentPage() {
  const supabase = await createClient()
  const { data: services } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order')

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Νέο Ραντεβού" />
      <NewAppointmentForm services={(services ?? []) as Service[]} />
    </div>
  )
}
