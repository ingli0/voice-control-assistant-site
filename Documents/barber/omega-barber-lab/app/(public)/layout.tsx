import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { getLocale } from '@/lib/i18n/server'
import { getT } from '@/lib/i18n/translations'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale()
  const t = getT(locale)

  return (
    <>
      <Header nav={t.nav} />
      <main className="flex-1">{children}</main>
      <Footer t={t.footer} />
    </>
  )
}
