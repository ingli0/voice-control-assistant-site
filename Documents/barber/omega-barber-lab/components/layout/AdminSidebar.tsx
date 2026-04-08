'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard, Calendar, Users, Scissors, Clock,
  TrendingUp, Tag, LogOut, Menu, X, CalendarCheck, ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/admin/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/admin/calendar',     label: 'Ημερολόγιο',   icon: Calendar },
  { href: '/admin/appointments', label: 'Ραντεβού',     icon: CalendarCheck },
  { href: '/admin/customers',    label: 'Πελάτες',      icon: Users },
  { href: '/admin/services',     label: 'Υπηρεσίες',    icon: Scissors },
  { href: '/admin/hours',        label: 'Ωράριο',       icon: Clock },
  { href: '/admin/revenue',      label: 'Έσοδα',        icon: TrendingUp },
  { href: '/admin/discounts',    label: 'Εκπτώσεις',    icon: Tag },
]

function NavContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-[#151515]">
        <div className="flex items-center gap-3">
          <Image
            src="/mini.png"
            alt="Omega Barber Lab"
            width={34}
            height={34}
            className="opacity-75 shrink-0"
          />
          <div>
            <div className="text-[#c8a96e] font-bold tracking-[0.18em] text-[11px] leading-tight">OMEGA BARBER</div>
            <div className="text-[#2e2e2e] text-[8px] tracking-[0.3em] leading-tight mt-0.5">ADMIN PANEL</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <div className="text-[8px] font-bold text-[#252525] tracking-[0.3em] uppercase px-3 mb-3">Γενικά</div>
        {navItems.slice(0, 3).map((item) => <NavItem key={item.href} item={item} pathname={pathname} onClose={onClose} />)}

        <div className="text-[8px] font-bold text-[#252525] tracking-[0.3em] uppercase px-3 mt-5 mb-3">Διαχείριση</div>
        {navItems.slice(3).map((item) => <NavItem key={item.href} item={item} pathname={pathname} onClose={onClose} />)}
      </nav>

      {/* Footer */}
      <div className="px-3 py-3 border-t border-[#151515] space-y-0.5">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#333] hover:text-[#666] transition-colors"
        >
          <ExternalLink size={13} />
          <span>Προβολή Site</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#333] hover:text-red-500/80 hover:bg-red-900/8 transition-all w-full"
        >
          <LogOut size={13} />
          <span>Αποσύνδεση</span>
        </button>
      </div>
    </div>
  )
}

function NavItem({ item, pathname, onClose }: { item: typeof navItems[0]; pathname: string; onClose?: () => void }) {
  const Icon = item.icon
  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

  return (
    <Link
      href={item.href}
      onClick={onClose}
      className={cn(
        'relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all group',
        isActive
          ? 'bg-[#c8a96e]/8 text-[#c8a96e]'
          : 'text-[#444] hover:text-[#ccc] hover:bg-[#212121]'
      )}
    >
      {/* Active left accent */}
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[#c8a96e] rounded-r-full" />
      )}
      <Icon
        size={15}
        className={cn(
          'shrink-0 transition-all',
          isActive ? 'text-[#c8a96e]' : 'text-[#333] group-hover:text-[#888]'
        )}
      />
      <span className="font-medium">{item.label}</span>
      {isActive && (
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#c8a96e]/60" />
      )}
    </Link>
  )
}

export default function AdminSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3.5 left-4 z-50 p-2 bg-[#181818] border border-[#272727] rounded-lg text-[#555] hover:text-[#888] transition-colors"
      >
        <Menu size={17} />
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative w-60 bg-[#141414] border-r border-[#151515] h-full shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-3 p-1.5 rounded-lg text-[#444] hover:text-[#888] hover:bg-[#272727] transition-all"
            >
              <X size={15} />
            </button>
            <NavContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-52 bg-[#141414] border-r border-[#141414] flex-col h-screen sticky top-0 shrink-0">
        <NavContent />
      </aside>
    </>
  )
}
