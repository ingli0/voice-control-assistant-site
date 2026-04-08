import { createClient } from '@/lib/supabase/server'
import AdminTopbar from '@/components/layout/AdminTopbar'
import CustomerSearch from '@/components/admin/customers/CustomerSearch'
import type { Customer } from '@/types'

interface Props {
  searchParams: Promise<{ q?: string }>
}

export default async function CustomersPage({ searchParams }: Props) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('customers')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (q) {
    query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: customers } = await query

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminTopbar title="Πελάτες" />
      <div className="p-6 max-w-5xl">
        <CustomerSearch customers={(customers ?? []) as Customer[]} initialQ={q ?? ''} />
      </div>
    </div>
  )
}
