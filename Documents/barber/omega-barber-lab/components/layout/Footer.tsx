import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Phone, Mail } from 'lucide-react'
import type { getT } from '@/lib/i18n/translations'

interface Props {
  t: ReturnType<typeof getT>['footer']
}

export default function Footer({ t }: Props) {
  return (
    <footer className="bg-[#070707] border-t border-[#111] pt-20 pb-8">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-14 mb-16">
          {/* Brand */}
          <div>
            <div className="mb-6">
              <Image
                src="/logo.png"
                alt="Omega Barber Lab"
                width={120}
                height={80}
                className="opacity-70 mb-3"
              />
              <div className="text-[#222] text-[8px] tracking-[0.35em]">KAVALA · EST. 2012</div>
            </div>
            <p className="text-[#444] text-sm leading-relaxed mb-6">{t.tagline}</p>
            <div className="flex gap-2">
              <a href="https://instagram.com/omegabarberlab" target="_blank" rel="noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1b1b1b] border border-[#272727] text-[#444] hover:text-[#c8a96e] hover:border-[#c8a96e]/30 transition-all text-[10px] font-bold tracking-wider">
                IG
              </a>
              <a href="https://facebook.com/omegabarberlab" target="_blank" rel="noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#1b1b1b] border border-[#272727] text-[#444] hover:text-[#c8a96e] hover:border-[#c8a96e]/30 transition-all text-[10px] font-bold tracking-wider">
                FB
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-[9px] font-bold text-[#333] tracking-[0.3em] uppercase mb-5">{t.nav}</h4>
            <ul className="space-y-2.5">
              {t.navLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#444] hover:text-[#c8a96e] transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + hours */}
          <div>
            <h4 className="text-[9px] font-bold text-[#333] tracking-[0.3em] uppercase mb-5">{t.contact}</h4>
            <div className="space-y-3 mb-8">
              <a href="https://maps.google.com/?q=Δαμιανού+12,+Καβάλα" target="_blank" rel="noreferrer"
                className="flex items-start gap-3 text-sm text-[#444] hover:text-[#c8a96e] transition-colors group">
                <MapPin size={13} className="shrink-0 mt-0.5 group-hover:text-[#c8a96e]" />Δαμιανού 12, Καβάλα
              </a>
              <a href="tel:6940502965" className="flex items-center gap-3 text-sm text-[#444] hover:text-[#c8a96e] transition-colors group">
                <Phone size={13} className="group-hover:text-[#c8a96e]" />6940502965
              </a>
              <a href="mailto:info@omegabarberlab.gr" className="flex items-center gap-3 text-sm text-[#444] hover:text-[#c8a96e] transition-colors group">
                <Mail size={13} className="group-hover:text-[#c8a96e]" />info@omegabarberlab.gr
              </a>
            </div>

            <h4 className="text-[9px] font-bold text-[#333] tracking-[0.3em] uppercase mb-3">{t.hours}</h4>
            <div className="space-y-1.5 text-xs text-[#333]">
              {t.hoursRows.map((row) => (
                <div key={row.day} className="flex justify-between gap-4">
                  <span>{row.day}</span>
                  <span className={row.time === 'Κλειστά' || row.time === 'Closed' ? 'text-red-900/80' : 'text-[#444]'}>
                    {row.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-[#111] pt-6 flex flex-col items-center gap-3 text-center">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4">
            <p className="text-xs text-[#444] tracking-wide">© 2025 Omega Barber Lab · Καβάλα</p>
            <span className="hidden sm:block text-[#2a2a2a]">·</span>
            <p className="text-xs text-[#333] tracking-wide">{t.rights}</p>
          </div>
          <a
            href="https://ingkli.com"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm text-[#555] hover:text-[#c8a96e] transition-colors group"
          >
            Created by
            <span className="font-semibold text-[#aaa] group-hover:text-[#c8a96e] transition-colors">
              ingkli
            </span>
          </a>
        </div>
      </div>
    </footer>
  )
}
