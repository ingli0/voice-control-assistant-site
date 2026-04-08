import { createClient } from '@/lib/supabase/server'
import BookingWizard from '@/components/booking/BookingWizard'
import type { Service } from '@/types'
import { getLocale } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n/translations'

export async function generateMetadata() {
  const locale = await getLocale()
  return locale === 'en'
    ? { title: 'Book Appointment | Omega Barber Lab', description: 'Book online at Omega Barber Lab, Kavala.' }
    : { title: 'Κλείσε Ραντεβού | Omega Barber Lab', description: 'Κλείστε ραντεβού online στο Omega Barber Lab, Καβάλα.' }
}

export default async function BookingPage() {
  const [locale, supabase] = await Promise.all([getLocale(), createClient()])
  const { data: services } = await supabase.from('services').select('*').eq('is_active', true).order('sort_order')
  const t = getT(locale)
  const tb = t.booking

  return (
    <div className="min-h-screen bg-[#141414] pt-24 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold tracking-[0.2em] text-[#c8a96e] uppercase">{tb.eyebrow}</span>
          <h1 className="text-3xl font-bold text-white mt-2">{tb.h1}</h1>
          <p className="text-[#888] text-sm mt-2">{tb.sub}</p>
        </div>
        <BookingWizard services={(services ?? []) as Service[]} locale={locale} />
      </div>
    </div>
  )
}
