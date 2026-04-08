'use client'
import { useEffect, useState } from 'react'

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<'el' | 'en'>('el')

  useEffect(() => {
    const match = document.cookie.match(/(?:^|;\s*)lang=([^;]+)/)
    setLang(match?.[1] === 'en' ? 'en' : 'el')
  }, [])

  function switchTo(l: 'el' | 'en') {
    if (l === lang) return
    document.cookie = `lang=${l}; path=/; max-age=31536000; SameSite=Lax`
    window.location.reload()
  }

  return (
    <div className="flex items-center gap-0.5 bg-[#1b1b1b] border border-[#2b2b2b] rounded-lg p-0.5">
      {(['el', 'en'] as const).map((l) => (
        <button
          key={l}
          onClick={() => switchTo(l)}
          className={`
            px-2.5 py-1 rounded-md text-[10px] font-bold tracking-widest uppercase transition-all
            ${lang === l
              ? 'bg-[#c8a96e] text-black'
              : 'text-[#3a3a3a] hover:text-[#777]'
            }
          `}
        >
          {l === 'el' ? 'ΕΛ' : 'EN'}
        </button>
      ))}
    </div>
  )
}
