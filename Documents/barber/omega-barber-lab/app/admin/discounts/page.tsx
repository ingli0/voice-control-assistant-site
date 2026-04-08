import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import DiscountsManager from '@/components/admin/discounts/DiscountsManager'
import type { Discount } from '@/types'

export default async function DiscountsPage() {
  const supabase = await createClient()
  const { data: discounts } = await supabase
    .from('discounts')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Εκπτώσεις & Κουπόνια" />
      <div className="p-6 max-w-5xl">
        <DiscountsManager discounts={(discounts ?? []) as Discount[]} />
      </div>
    </div>
  )
}
