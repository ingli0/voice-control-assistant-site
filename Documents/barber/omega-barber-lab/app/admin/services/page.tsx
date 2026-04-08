import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import ServicesManager from '@/components/admin/services/ServicesManager'
import type { Service } from '@/types'

export default async function ServicesPage() {
  const supabase = await createClient()
  const { data: services } = await supabase.from('services').select('*').order('sort_order')

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Υπηρεσίες" />
      <div className="p-6 max-w-4xl">
        <ServicesManager services={(services ?? []) as Service[]} />
      </div>
    </div>
  )
}
