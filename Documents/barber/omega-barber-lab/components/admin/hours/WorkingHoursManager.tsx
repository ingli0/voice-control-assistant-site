'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { WorkingHour, Break } from '@/types'
import { dayOfWeekName, formatDate, formatTime } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DatePicker from '@/components/ui/DatePicker'
import TimePicker from '@/components/ui/TimePicker'
import { Plus, Trash2, Save } from 'lucide-react'

interface Props { hours: WorkingHour[]; breaks: Break[] }

export default function WorkingHoursManager({ hours: initial, breaks: initialBreaks }: Props) {
  const router = useRouter()
  const [hours, setHours] = useState(initial)
  const [breaks, setBreaks] = useState(initialBreaks)
  const [savingHours, setSavingHours] = useState(false)
  const [newBreak, setNewBreak] = useState({ break_date: '', start_time: '', end_time: '', label: 'Διάλειμμα' })
  const [addingBreak, setAddingBreak] = useState(false)
  const [dateMin, setDateMin] = useState('')
  useEffect(() => setDateMin(new Date().toISOString().split('T')[0]), [])

  function toggleDay(idx: number) {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, is_open: !h.is_open } : h))
  }
  function setTime(idx: number, field: 'open_time' | 'close_time', val: string) {
    setHours((prev) => prev.map((h, i) => i === idx ? { ...h, [field]: val } : h))
  }

  async function saveHours() {
    setSavingHours(true)
    await fetch('/api/admin/hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours }),
    })
    setSavingHours(false)
    router.refresh()
  }

  async function addBreak() {
    if (!newBreak.break_date || !newBreak.start_time || !newBreak.end_time) return
    setAddingBreak(true)
    const res = await fetch('/api/admin/breaks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBreak),
    })
    if (res.ok) {
      const { break: b } = await res.json()
      setBreaks((prev) => [...prev, b])
      setNewBreak({ break_date: '', start_time: '', end_time: '', label: 'Διάλειμμα' })
    }
    setAddingBreak(false)
  }

  async function deleteBreak(id: string) {
    await fetch(`/api/admin/breaks/${id}`, { method: 'DELETE' })
    setBreaks((prev) => prev.filter((b) => b.id !== id))
  }

  const dayOrder = [1, 2, 3, 4, 5, 6, 0] // Mon first
  const sortedHours = dayOrder.map((d) => ({ h: hours.find((h) => h.day_of_week === d)!, idx: hours.findIndex((h) => h.day_of_week === d) })).filter(x => x.h)

  return (
    <div className="space-y-6">
      {/* Working Hours */}
      <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2e2e2e] flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Ωράριο Λειτουργίας</h3>
          <Button size="sm" onClick={saveHours} loading={savingHours}>
            <Save size={13} />Αποθήκευση
          </Button>
        </div>
        <div className="divide-y divide-[#272727]">
          {sortedHours.map(({ h, idx }) => (
            <div key={h.id} className="grid grid-cols-[7rem_3rem_1fr] items-center gap-4 px-6 py-3.5">
              {/* Day name */}
              <span className="text-sm text-[#e5e5e5] font-medium">{dayOfWeekName(h.day_of_week)}</span>

              {/* Toggle */}
              <button
                onClick={() => toggleDay(idx)}
                aria-checked={h.is_open}
                role="switch"
                className={`relative w-10 h-[22px] rounded-full transition-colors duration-200 flex-shrink-0 ${h.is_open ? 'bg-[#c8a96e]' : 'bg-[#363636]'}`}
              >
                <span className={`absolute top-[3px] left-[3px] w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${h.is_open ? 'translate-x-[18px]' : 'translate-x-0'}`} />
              </button>

              {/* Time pickers or closed label — always same height */}
              <div className="flex items-center gap-2 h-9">
                {h.is_open ? (
                  <>
                    <input
                      type="time"
                      value={h.open_time ?? '09:00'}
                      onChange={(e) => setTime(idx, 'open_time', e.target.value)}
                      className="w-[110px] h-9 bg-[#292929] border border-[#363636] rounded-lg px-3 text-sm text-[#e5e5e5] outline-none focus:border-[#c8a96e] transition-colors"
                      suppressHydrationWarning
                    />
                    <span className="text-[#444] text-base select-none">–</span>
                    <input
                      type="time"
                      value={h.close_time ?? '21:00'}
                      onChange={(e) => setTime(idx, 'close_time', e.target.value)}
                      className="w-[110px] h-9 bg-[#292929] border border-[#363636] rounded-lg px-3 text-sm text-[#e5e5e5] outline-none focus:border-[#c8a96e] transition-colors"
                      suppressHydrationWarning
                    />
                  </>
                ) : (
                  <span className="text-xs text-[#555] tracking-wide">Κλειστά</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Breaks */}
      <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#2e2e2e]">
          <h3 className="text-sm font-semibold text-[#888] uppercase tracking-wider">Διαλείμματα</h3>
        </div>

        {/* Add break form */}
        <div className="px-6 py-4 border-b border-[#272727] space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <DatePicker
              label="Ημερομηνία"
              value={newBreak.break_date}
              onChange={(d) => setNewBreak({ ...newBreak, break_date: d })}
              min={dateMin}
            />
            <Input
              label="Τίτλος"
              value={newBreak.label}
              onChange={(e) => setNewBreak({ ...newBreak, label: e.target.value })}
              placeholder="Διάλειμμα"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TimePicker
              label="Από"
              value={newBreak.start_time}
              onChange={(t) => setNewBreak({ ...newBreak, start_time: t })}
            />
            <TimePicker
              label="Έως"
              value={newBreak.end_time}
              onChange={(t) => setNewBreak({ ...newBreak, end_time: t })}
            />
          </div>
          <Button onClick={addBreak} loading={addingBreak} size="sm">
            <Plus size={13} />Προσθήκη
          </Button>
        </div>

        {breaks.length === 0 ? (
          <div className="px-6 py-8 text-center text-[#555] text-sm">Δεν υπάρχουν προγραμματισμένα διαλείμματα</div>
        ) : (
          <div className="divide-y divide-[#272727]">
            {breaks.map((b) => (
              <div key={b.id} className="px-6 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm text-[#e5e5e5]">{b.label}</div>
                  <div className="text-xs text-[#666]">
                    {formatDate(b.break_date)} · {formatTime(b.start_time)} – {formatTime(b.end_time)}
                  </div>
                </div>
                <button
                  onClick={() => deleteBreak(b.id)}
                  className="p-1.5 rounded-lg text-[#666] hover:text-red-400 hover:bg-red-900/10 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
