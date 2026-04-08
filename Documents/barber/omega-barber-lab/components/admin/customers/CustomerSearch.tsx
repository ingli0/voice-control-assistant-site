'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Customer } from '@/types'
import { formatDate } from '@/lib/utils'
import { Search, Phone, Mail, User } from 'lucide-react'
import Link from 'next/link'

interface Props {
  customers: Customer[]
  initialQ: string
}

export default function CustomerSearch({ customers, initialQ }: Props) {
  const router = useRouter()
  const [q, setQ] = useState(initialQ)

  function search() {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    router.push(`/admin/customers${q ? `?${params}` : ''}`)
  }

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 bg-[#212121] border border-[#2e2e2e] rounded-xl px-4 py-3 flex-1">
          <Search size={16} className="text-[#555]" />
          <input
            type="text"
            placeholder="Αναζήτηση με όνομα, τηλέφωνο ή email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && search()}
            className="bg-transparent text-sm text-[#e5e5e5] placeholder-[#555] outline-none flex-1"
          />
        </div>
        <button
          onClick={search}
          className="px-4 py-2 bg-[#c8a96e] text-black text-sm font-medium rounded-xl hover:bg-[#dfc18a] transition-colors"
        >
          Αναζήτηση
        </button>
      </div>

      <p className="text-xs text-[#666]">{customers.length} πελάτες</p>

      {/* Customer list */}
      <div className="grid gap-3">
        {customers.length === 0 ? (
          <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-12 text-center text-[#555] text-sm">
            Δεν βρέθηκαν πελάτες
          </div>
        ) : (
          customers.map((c) => (
            <Link
              key={c.id}
              href={`/admin/customers/${c.id}`}
              className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-4 flex items-center gap-4 hover:border-[#c8a96e]/30 hover:bg-[#272727] transition-all"
            >
              <div className="w-10 h-10 rounded-full bg-[#292929] border border-[#363636] flex items-center justify-center shrink-0">
                <User size={16} className="text-[#c8a96e]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-[#e5e5e5]">{c.name}</div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1 text-xs text-[#666]">
                    <Phone size={10} />{c.phone}
                  </span>
                  {c.email && (
                    <span className="flex items-center gap-1 text-xs text-[#666]">
                      <Mail size={10} />{c.email}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-[#555]">Από {formatDate(c.created_at)}</div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
