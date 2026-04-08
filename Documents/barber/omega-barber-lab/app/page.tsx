import { createClient } from '@/lib/supabase/server'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { Clock, Star, Scissors, Shield, Calendar, Zap } from 'lucide-react'
import type { Service } from '@/types'
import { getLocale } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n/translations'

const WHY_ICONS = [Scissors, Star, Shield, Calendar, Zap]

const MARQUEE_ITEMS = [
  'OMEGA BARBER LAB', '✦', 'KAVALA', '✦', 'PREMIUM GROOMING', '✦',
  'ΚΟΥΡΕΜΑ', '✦', 'ΓΕΝΕΙΑΔΑ', '✦', 'SHAVING', '✦',
  'BEARD CARE', '✦', 'EST. 2012', '✦',
]

export async function generateMetadata() {
  const locale = await getLocale()
  return locale === 'en'
    ? { title: 'Omega Barber Lab | Premium Grooming Kavala', description: 'Book online at Omega Barber Lab. Premium grooming experience in Kavala, Greece.' }
    : { title: 'Omega Barber Lab | Premium Grooming Καβάλα', description: 'Κλείστε ραντεβού online στο Omega Barber Lab. Premium grooming experience στην Καβάλα.' }
}

export default async function HomePage() {
  const [locale, { data: services }] = await Promise.all([
    getLocale(),
    createClient().then(sb => sb.from('services').select('*').eq('is_active', true).order('sort_order')),
  ])
  const t = getT(locale)

  return (
    <>
      <Header nav={t.nav} />
      <div className="bg-[#141414]">

        {/* ── Hero ── */}
        <section className="relative min-h-screen flex items-center justify-center pt-16 px-6 overflow-hidden hero-grid grain-overlay">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(200,169,110,0.07),transparent)] pointer-events-none" />
          <div className="absolute top-24 left-8 w-16 h-16 border-t border-l border-[#c8a96e]/20 pointer-events-none" />
          <div className="absolute top-24 right-8 w-16 h-16 border-t border-r border-[#c8a96e]/20 pointer-events-none" />
          <div className="absolute bottom-16 left-8 w-16 h-16 border-b border-l border-[#c8a96e]/20 pointer-events-none" />
          <div className="absolute bottom-16 right-8 w-16 h-16 border-b border-r border-[#c8a96e]/20 pointer-events-none" />
          <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex flex-col items-center gap-3">
            <div className="w-px h-16 bg-gradient-to-b from-transparent to-[#c8a96e]/30" />
            <span className="text-[9px] font-semibold tracking-[0.35em] text-[#c8a96e]/40 uppercase rotate-90 whitespace-nowrap">{t.hero.side}</span>
            <div className="w-px h-16 bg-gradient-to-t from-transparent to-[#c8a96e]/30" />
          </div>

          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="inline-flex flex-col items-center mb-8 reveal">
              <span className="text-[11px] font-semibold tracking-[0.35em] text-[#c8a96e] uppercase">{t.hero.eyebrow}</span>
              <div className="mt-2 flex items-center gap-3">
                <div className="h-px w-12 bg-gradient-to-r from-transparent to-[#c8a96e]/60" />
                <span className="text-[#c8a96e]/40 text-xs">✦</span>
                <div className="h-px w-12 bg-gradient-to-l from-transparent to-[#c8a96e]/60" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-[72px] font-bold text-white leading-[1.08] mb-6 reveal reveal-delay-1 tracking-tight">
              {t.hero.h1a}{' '}
              <br className="hidden sm:block" />
              {t.hero.h1b}{' '}
              <span className="text-gold-gradient">{t.hero.h1accent}</span>
              {t.hero.h1c}
              <br className="hidden md:block" />
              {' '}<span className="text-[#333]">&</span>{' '}
              {locale === 'el' ? 'στιλ.' : 'style.'}
            </h1>

            <p className="text-base md:text-lg text-[#666] max-w-xl mx-auto mb-10 leading-relaxed reveal reveal-delay-2">
              {t.hero.sub}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center reveal reveal-delay-3">
              <Link href="/booking" className="btn-gold inline-flex items-center justify-center gap-2 px-9 py-4 bg-[#c8a96e] text-black font-bold rounded-xl text-sm tracking-wide hover:bg-[#dfc18a] transition-colors glow-gold">
                {t.hero.cta}
              </Link>
              <Link href="#services" className="inline-flex items-center justify-center gap-2 px-9 py-4 bg-transparent text-[#888] font-semibold rounded-xl border border-[#252525] hover:border-[#c8a96e]/40 hover:text-[#c8a96e] transition-all text-sm tracking-wide">
                {t.hero.ctaSec}
              </Link>
            </div>

            <div className="mt-20 flex flex-col items-center gap-2 reveal reveal-delay-4">
              <div className="w-px h-10 bg-gradient-to-b from-[#c8a96e]/30 to-transparent" />
              <span className="text-[10px] tracking-[0.25em] text-[#333] uppercase">{t.hero.scroll}</span>
            </div>
          </div>
        </section>

        {/* ── Marquee ── */}
        <div className="relative border-y border-[#272727] py-3.5 overflow-hidden bg-[#181818]">
          <div className="marquee-track">
            {[...Array(2)].map((_, copy) => (
              <div key={copy} className="flex items-center shrink-0" aria-hidden={copy > 0}>
                {MARQUEE_ITEMS.map((item, i) => (
                  <span key={i} className={`px-6 whitespace-nowrap text-[10px] font-semibold tracking-[0.3em] uppercase ${item === '✦' ? 'text-[#c8a96e]/50' : 'text-[#363636]'}`}>
                    {item}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* ── Stats ── */}
        <section className="py-16 bg-[#141414]">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-0 divide-x divide-[#272727]">
            {t.stats.map((s) => (
              <div key={s.label} className="text-center px-8 py-4">
                <div className="text-4xl font-bold text-gold-gradient stat-number mb-1">{s.value}</div>
                <div className="text-xs text-[#444] tracking-wide uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── About ── */}
        <section className="py-28 px-6 border-t border-[#111]">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#c8a96e] uppercase mb-3">{t.about.eyebrow}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white mt-2 mb-6 leading-tight">
                {t.about.h2}{' '}
                <span className="text-[#3a3a3a]">{t.about.h2muted}</span>
              </h2>
              <p className="text-[#666] mb-10 leading-relaxed text-sm">{t.about.p}</p>
              <ul className="space-y-4">
                {t.about.points.map((p, i) => (
                  <li key={i} className="flex items-start gap-4 text-sm text-[#888]">
                    <div className="flex items-center gap-2 shrink-0 mt-0.5">
                      <div className="w-5 h-px bg-[#c8a96e]/50" />
                      <div className="w-1 h-1 rounded-full bg-[#c8a96e]" />
                    </div>
                    {p}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-[#141414] to-[#181818] rounded-2xl border border-[#2b2b2b] flex items-center justify-center overflow-hidden grain-overlay">
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'repeating-linear-gradient(-45deg, #c8a96e 0, #c8a96e 1px, transparent 0, transparent 50%)', backgroundSize: '12px 12px' }} />
                <div className="relative text-center p-8 z-10">
                  <div className="text-[#c8a96e]/20 text-8xl leading-none mb-6 font-serif select-none">✂</div>
                  <div className="text-[#c8a96e] font-bold tracking-[0.35em] text-xs mb-1">OMEGA BARBER LAB</div>
                  <div className="text-[#333] text-[9px] tracking-[0.3em]">KAVALA · GREECE</div>
                  <div className="mt-6 flex items-center justify-center gap-2">
                    <div className="h-px w-10 bg-[#c8a96e]/20" />
                    <span className="text-[#c8a96e]/30 text-xs">✦</span>
                    <div className="h-px w-10 bg-[#c8a96e]/20" />
                  </div>
                  <div className="text-[9px] tracking-[0.25em] text-[#363636] mt-3 uppercase">Est. 2012</div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-20 h-20 border border-[#c8a96e]/15 rounded-xl -z-10" />
              <div className="absolute -top-4 -left-4 w-12 h-12 border border-[#2b2b2b] rounded-lg -z-10" />
            </div>
          </div>
        </section>

        {/* ── Services ── */}
        <section id="services" className="py-28 px-6 bg-[#1b1b1b] border-y border-[#111]">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.3em] text-[#c8a96e] uppercase mb-3">{t.services.eyebrow}</p>
                <h2 className="text-3xl md:text-4xl font-bold text-white">{t.services.h2}</h2>
              </div>
              <Link href="/booking" className="hidden sm:inline-flex items-center gap-2 text-sm text-[#555] hover:text-[#c8a96e] transition-colors">
                {t.services.bookAll} <span className="text-[#c8a96e]">→</span>
              </Link>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              {(services as Service[] ?? []).map((service, i) => (
                <div key={service.id} className="service-card bg-[#1b1b1b] border border-[#272727] rounded-xl p-7 hover:border-[#c8a96e]/25 transition-all group cursor-default">
                  <div className="text-[10px] font-bold tracking-[0.3em] text-[#363636] mb-4 uppercase">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className="flex items-start justify-between mb-3 gap-4">
                    <h3 className="text-lg font-bold text-white leading-tight">{service.name}</h3>
                    <span className="text-[#c8a96e] font-bold text-2xl shrink-0 tabular-nums">{service.price}€</span>
                  </div>
                  <p className="text-sm text-[#555] mb-6 leading-relaxed">{service.description}</p>
                  <div className="flex items-center justify-between pt-5 border-t border-[#272727]">
                    <span className="text-xs text-[#333] flex items-center gap-1.5">
                      <Clock size={11} className="text-[#444]" />{service.duration} {t.services.minutes}
                    </span>
                    <Link href="/booking" className="text-xs font-semibold text-[#555] hover:text-[#c8a96e] transition-colors group-hover:text-[#c8a96e] tracking-wide">
                      {t.services.book}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Why us ── */}
        <section className="py-28 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#c8a96e] uppercase mb-3">{t.why.eyebrow}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">{t.why.h2}</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
              {t.why.items.map((item, i) => {
                const Icon = WHY_ICONS[i]
                return (
                  <div key={item.title} className="group text-center lg:text-left">
                    <div className="w-11 h-11 rounded-lg bg-[#1b1b1b] border border-[#2b2b2b] flex items-center justify-center mx-auto lg:mx-0 mb-5 group-hover:border-[#c8a96e]/30 group-hover:bg-[#c8a96e]/5 transition-all duration-300">
                      <Icon size={18} className="text-[#444] group-hover:text-[#c8a96e] transition-colors duration-300" />
                    </div>
                    <div className="text-[9px] tracking-[0.25em] text-[#363636] mb-2 uppercase font-semibold">{String(i + 1).padStart(2, '0')}</div>
                    <h3 className="text-sm font-bold text-[#ccc] mb-2">{item.title}</h3>
                    <p className="text-xs text-[#444] leading-relaxed">{item.desc}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="py-28 px-6 bg-[#1b1b1b] border-y border-[#111]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <p className="text-[10px] font-semibold tracking-[0.3em] text-[#c8a96e] uppercase mb-3">{t.testimonials.eyebrow}</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">{t.testimonials.h2}</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {t.testimonials.items.map((item) => (
                <div key={item.name} className="testimonial-card bg-[#1b1b1b] border border-[#272727] rounded-xl p-7 hover:border-[#2b2b2b] transition-colors">
                  <div className="flex gap-0.5 mb-5">
                    {[...Array(5)].map((_, i) => <Star key={i} size={11} className="fill-[#c8a96e] text-[#c8a96e]" />)}
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed mb-6 relative z-10">&ldquo;{item.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-5 border-t border-[#272727]">
                    <div className="w-6 h-6 rounded-full bg-[#c8a96e]/10 border border-[#c8a96e]/20 flex items-center justify-center">
                      <span className="text-[9px] font-bold text-[#c8a96e]">{item.name[0]}</span>
                    </div>
                    <p className="text-xs font-semibold text-[#888]">{item.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA ── */}
        <section className="py-32 px-6 relative overflow-hidden grain-overlay">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_60%_at_50%_50%,rgba(200,169,110,0.05),transparent)] pointer-events-none" />
          <div className="max-w-2xl mx-auto text-center relative z-10">
            <p className="text-[10px] font-semibold tracking-[0.3em] text-[#c8a96e] uppercase mb-4">{t.cta.eyebrow}</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-5 leading-tight tracking-tight">
              {t.cta.h2a}<br /><span className="text-[#333]">{t.cta.h2b}</span>
            </h2>
            <p className="text-[#555] mb-10 text-sm leading-relaxed">{t.cta.p}</p>
            <Link href="/booking" className="btn-gold inline-flex items-center gap-3 px-12 py-5 bg-[#c8a96e] text-black font-bold rounded-xl text-sm tracking-wider hover:bg-[#dfc18a] transition-colors glow-gold">
              {t.cta.btn}
            </Link>
          </div>
        </section>

        {/* ── Contact strip ── */}
        <section className="border-t border-[#111] py-7 bg-[#1b1b1b]">
          <div className="max-w-5xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-10 text-sm text-[#444]">
            <a href="https://maps.google.com/?q=Δαμιανού+12,+Καβάλα" target="_blank" rel="noreferrer" className="hover:text-[#c8a96e] transition-colors">Δαμιανού 12, Καβάλα</a>
            <div className="hidden md:block w-px h-4 bg-[#272727]" />
            <a href="tel:6940502965" className="hover:text-[#c8a96e] transition-colors">6940502965</a>
            <div className="hidden md:block w-px h-4 bg-[#272727]" />
            <a href="mailto:info@omegabarberlab.gr" className="hover:text-[#c8a96e] transition-colors">info@omegabarberlab.gr</a>
            <div className="hidden md:block w-px h-4 bg-[#272727]" />
            <a href="https://instagram.com/omegabarberlab" target="_blank" rel="noreferrer" className="hover:text-[#c8a96e] transition-colors">@omegabarberlab</a>
          </div>
        </section>
      </div>
      <Footer t={t.footer} />
    </>
  )
}
