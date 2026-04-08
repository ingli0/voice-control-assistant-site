import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import WorkingHoursManager from '@/components/admin/hours/WorkingHoursManager'
import type { WorkingHour, Break } from '@/types'

export default async function HoursPage() {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const [{ data: hours }, { data: breaks }] = await Promise.all([
    supabase.from('working_hours').select('*').order('day_of_week'),
    supabase.from('breaks').select('*').gte('break_date', today).order('break_date, start_time'),
  ])

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Ωράριο & Διαλείμματα" />
      <div className="p-6 max-w-3xl">
        <WorkingHoursManager
          hours={(hours ?? []) as WorkingHour[]}
          breaks={(breaks ?? []) as Break[]}
        />
      </div>
    </div>
  )
}
