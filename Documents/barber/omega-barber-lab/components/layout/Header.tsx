'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import LanguageSwitcher from '@/components/ui/LanguageSwitcher'

interface Props {
  nav: { services: string; booking: string; bookCta: string }
}

export default function Header({ nav }: Props) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
      scrolled
        ? 'bg-[#1b1b1b]/95 backdrop-blur-xl border-b border-[#151515]'
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <Image
            src="/mini.png"
            alt="Omega Barber Lab"
            width={32}
            height={32}
            className="opacity-80 group-hover:opacity-100 transition-opacity"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[#c8a96e] font-bold tracking-[0.22em] text-xs group-hover:text-[#dfc18a] transition-colors">
              OMEGA BARBER
            </span>
            <span className="text-[#2e2e2e] text-[8px] tracking-[0.35em] group-hover:text-[#3a3a3a] transition-colors">
              LAB · KAVALA
            </span>
          </div>
        </Link>

        {/* Center nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#services" className="text-xs font-medium tracking-[0.12em] uppercase text-[#555] hover:text-[#e5e5e5] transition-colors">
            {nav.services}
          </Link>
          <Link href="/booking" className="text-xs font-medium tracking-[0.12em] uppercase text-[#555] hover:text-[#e5e5e5] transition-colors">
            {nav.booking}
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/booking"
            className="btn-gold hidden sm:inline-flex items-center gap-2 px-5 py-2 bg-[#c8a96e] text-black text-xs font-bold rounded-lg hover:bg-[#dfc18a] transition-colors tracking-wide"
          >
            {nav.bookCta}
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden p-1.5 text-[#555] hover:text-[#e5e5e5] transition-colors"
            aria-label="Menu"
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-[#151515] bg-[#1b1b1b]/98 backdrop-blur-xl px-6 py-6 space-y-1">
          <Link href="/#services" onClick={() => setOpen(false)} className="block text-sm text-[#666] hover:text-[#e5e5e5] py-2.5 transition-colors tracking-wide">
            {nav.services}
          </Link>
          <Link href="/booking" onClick={() => setOpen(false)} className="block text-sm text-[#666] hover:text-[#e5e5e5] py-2.5 transition-colors tracking-wide">
            {nav.booking}
          </Link>
          <div className="pt-4 flex items-center gap-3">
            <Link href="/booking" onClick={() => setOpen(false)} className="btn-gold flex-1 block px-5 py-3 bg-[#c8a96e] text-black text-sm font-bold rounded-lg text-center tracking-wide">
              {nav.bookCta}
            </Link>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  )
}
