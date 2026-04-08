'use client'
import { useState, useRef, useEffect } from 'react'
import { Clock, ChevronDown } from 'lucide-react'

interface Props {
  value: string           // 'HH:MM'
  onChange: (time: string) => void
  label?: string
  min?: string            // 'HH:MM'
  max?: string            // 'HH:MM'
  step?: number           // minutes, default 15
  placeholder?: string
  required?: boolean
}

function buildTimes(min = '08:00', max = '21:00', step = 15): string[] {
  const [minH, minM] = min.split(':').map(Number)
  const [maxH, maxM] = max.split(':').map(Number)
  const minTotal = minH * 60 + minM
  const maxTotal = maxH * 60 + maxM
  const times: string[] = []
  for (let t = minTotal; t <= maxTotal; t += step) {
    const h = Math.floor(t / 60)
    const m = t % 60
    times.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
  }
  return times
}

export default function TimePicker({
  value, onChange, label, min, max, step = 15, placeholder = 'Επιλέξτε ώρα...', required,
}: Props) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const times = buildTimes(min ?? '08:00', max ?? '21:00', step)

  // Close on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  // Scroll selected item into view when opening
  useEffect(() => {
    if (open && value && listRef.current) {
      const el = listRef.current.querySelector('[data-selected="true"]') as HTMLElement | null
      if (el) el.scrollIntoView({ block: 'center' })
    }
  }, [open, value])

  return (
    <div ref={ref} className="relative">
      {label && (
        <label className="block text-sm font-medium text-[#ccc] mb-1.5">
          {label}{required && <span className="text-[#c8a96e] ml-1">*</span>}
        </label>
      )}

      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`
          w-full flex items-center justify-between px-3 py-2.5 rounded-lg
          bg-[#292929] border text-sm transition-all text-left
          ${open ? 'border-[#c8a96e]' : 'border-[#363636] hover:border-[#3a3a3a]'}
        `}
      >
        <span className="flex items-center gap-2">
          <Clock size={13} className={value ? 'text-[#c8a96e]' : 'text-[#333]'} />
          <span className={value ? 'text-[#e5e5e5] font-medium' : 'text-[#444]'}>
            {value || placeholder}
          </span>
        </span>
        <ChevronDown
          size={14}
          className={`text-[#444] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute z-50 mt-1.5 w-full bg-[#212121] border border-[#2e2e2e] rounded-xl shadow-2xl shadow-black/60 overflow-hidden"
          style={{ maxHeight: 220 }}
        >
          <div
            ref={listRef}
            className="overflow-y-auto"
            style={{ maxHeight: 220 }}
          >
            {times.map(t => {
              const isSelected = t === value
              const isHour = t.endsWith(':00')
              return (
                <button
                  key={t}
                  type="button"
                  data-selected={isSelected}
                  onClick={() => { onChange(t); setOpen(false) }}
                  className={`
                    w-full flex items-center justify-between px-4 py-2 text-sm
                    transition-colors text-left
                    ${isSelected
                      ? 'bg-[#c8a96e]/15 text-[#c8a96e] font-semibold'
                      : 'text-[#888] hover:bg-[#292929] hover:text-[#e5e5e5]'
                    }
                  `}
                >
                  <span className={isHour ? 'font-medium' : ''}>{t}</span>
                  {isSelected && <span className="text-[#c8a96e] text-xs">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
