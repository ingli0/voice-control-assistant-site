import { cookies } from 'next/headers'

export type Locale = 'el' | 'en'

export async function getLocale(): Promise<Locale> {
  const store = await cookies()
  return store.get('lang')?.value === 'en' ? 'en' : 'el'
}
