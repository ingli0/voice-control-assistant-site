import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { el } from 'date-fns/locale'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default async function AdminTopbar({ title }: { title: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const now = new Date()
  const dateStr = format(now, "EEEE, d MMMM", { locale: el })
  const initial = user?.email?.[0]?.toUpperCase() ?? 'A'

  return (
    <header className="h-14 border-b border-[#141414] bg-[#141414]/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0">
      {/* Left: title + breadcrumb */}
      <div className="pl-10 lg:pl-0">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#363636] tracking-[0.2em] uppercase font-medium hidden sm:block">Admin</span>
          <span className="text-[#2b2b2b] hidden sm:block">/</span>
          <h1 className="text-sm font-semibold text-[#e5e5e5] tracking-wide">{title}</h1>
        </div>
        <p className="text-[10px] text-[#363636] capitalize mt-0.5 tracking-wide hidden sm:block">{dateStr}</p>
      </div>

      {/* Right: actions + avatar */}
      <div className="flex items-center gap-3">
        {/* Live indicator */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-green-900/10 border border-green-900/20 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[9px] font-semibold text-green-600 tracking-wider uppercase">Live</span>
        </div>

        {/* View site */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] text-[#333] hover:text-[#888] border border-[#151515] hover:border-[#2e2e2e] transition-all"
        >
          <ExternalLink size={11} />
          Site
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-[#171717] hidden sm:block" />

        {/* User */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#c8a96e]/30 to-[#c8a96e]/10 border border-[#c8a96e]/25 flex items-center justify-center">
            <span className="text-[#c8a96e] text-xs font-bold">{initial}</span>
          </div>
          <div className="hidden md:block">
            <div className="text-[11px] text-[#555] leading-tight truncate max-w-[140px]">{user?.email}</div>
            <div className="text-[9px] text-[#363636] tracking-wider">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  )
}
