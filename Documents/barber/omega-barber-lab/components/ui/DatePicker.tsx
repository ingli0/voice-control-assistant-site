'use client'
import { useState, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  addDays, addMonths, subMonths, isSameDay, isSameMonth,
  isToday, isBefore, isAfter, parseISO,
} from 'date-fns'
import { el } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  value: string         // 'YYYY-MM-DD' or ''
  onChange: (date: string) => void
  min?: string          // 'YYYY-MM-DD'
  max?: string          // 'YYYY-MM-DD'
  label?: string
}

const DAY_LABELS = ['Δε', 'Τρ', 'Τε', 'Πε', 'Πα', 'Σά', 'Κυ']

export default function DatePicker({ value, onChange, min, max, label }: Props) {
  const selected   = value ? parseISO(value) : null
  const minDate    = min   ? parseISO(min)   : null
  const maxDate    = max   ? parseISO(max)   : null

  // viewMonth and clientToday are set client-side only to avoid SSR/client
  // timezone mismatch. The calendar renders a skeleton until mounted.
  const [viewMonth, setViewMonth] = useState<Date | null>(
    selected ? startOfMonth(selected) : minDate ? startOfMonth(minDate) : null
  )
  const [clientToday, setClientToday] = useState<Date | null>(null)
  useEffect(() => {
    const now = new Date()
    if (!viewMonth) setViewMonth(startOfMonth(now))
    setClientToday(now)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function buildDays(): Date[] {
    const first = startOfMonth(viewMonth)
    const last  = endOfMonth(viewMonth)
    const start = startOfWeek(first, { weekStartsOn: 1 })
    const end   = endOfWeek(last,   { weekStartsOn: 1 })
    const days: Date[] = []
    let cur = start
    while (!isAfter(cur, end)) { days.push(new Date(cur)); cur = addDays(cur, 1) }
    return days
  }

  function disabled(day: Date) {
    if (minDate && isBefore(day, minDate)) return true
    if (maxDate && isAfter(day, maxDate))  return true
    return false
  }

  function prevMonth() {
    setViewMonth(m => {
      const prev = subMonths(m, 1)
      if (minDate && isBefore(endOfMonth(prev), minDate)) return m
      return prev
    })
  }

  function nextMonth() {
    setViewMonth(m => {
      const next = addMonths(m, 1)
      if (maxDate && isAfter(startOfMonth(next), maxDate)) return m
      return next
    })
  }

  if (!viewMonth) {
    // Pre-mount skeleton — same structure, no date-dependent content
    return (
      <div>
        {label && <label className="block text-sm font-medium text-[#ccc] mb-2">{label}</label>}
        <div className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-xl overflow-hidden h-[268px] animate-pulse" />
      </div>
    )
  }

  const days = buildDays()

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-[#ccc] mb-2">{label}</label>
      )}
      <div className="bg-[#1b1b1b] border border-[#2b2b2b] rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#272727]">
          <button
            type="button"
            onClick={prevMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-[#e5e5e5] hover:bg-[#272727] transition-all"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="text-sm font-semibold text-[#ccc] capitalize select-none">
            {format(viewMonth, 'MMMM yyyy', { locale: el })}
          </span>

          <button
            type="button"
            onClick={nextMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#444] hover:text-[#e5e5e5] hover:bg-[#272727] transition-all"
          >
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 px-3 pt-3 pb-1">
          {DAY_LABELS.map(d => (
            <div key={d} className="text-center text-[9px] font-bold text-[#2e2e2e] uppercase tracking-wider py-1 select-none">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5 px-3 pb-3">
          {days.map((day, i) => {
            const isSelected = selected ? isSameDay(day, selected) : false
            const inMonth    = isSameMonth(day, viewMonth)
            const isDisabled = disabled(day) || !inMonth
            // clientToday is null during SSR — no "today" class mismatch
            const todayMark  = !!clientToday && isSameDay(day, clientToday) && inMonth && !isDisabled

            return (
              <button
                key={i}
                type="button"
                onClick={() => !isDisabled && onChange(format(day, 'yyyy-MM-dd'))}
                disabled={isDisabled}
                className={`
                  relative aspect-square flex items-center justify-center rounded-lg
                  text-[13px] font-medium transition-all select-none
                  ${isSelected
                    ? 'bg-[#c8a96e] text-black font-bold shadow-lg shadow-[#c8a96e]/20'
                    : todayMark
                      ? 'text-[#c8a96e] bg-[#c8a96e]/8 ring-1 ring-[#c8a96e]/30'
                      : isDisabled
                        ? 'text-[#2b2b2b] cursor-default'
                        : 'text-[#888] hover:bg-[#292929] hover:text-[#e5e5e5] cursor-pointer active:scale-95'
                  }
                `}
              >
                {format(day, 'd')}
                {todayMark && !isSelected && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#c8a96e]" />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
