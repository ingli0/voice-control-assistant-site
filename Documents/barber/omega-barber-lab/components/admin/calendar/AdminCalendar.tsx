'use client'
import { useState, useCallback, useMemo } from 'react'
import { Calendar, dateFnsLocalizer, type View } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, addDays, subDays, startOfDay } from 'date-fns'
import { el } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { Appointment } from '@/types'
import { formatPrice, formatTime, statusLabel } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ChevronLeft, ChevronRight, Phone, Mail, Clock,
  CalendarDays, LayoutList, Calendar as CalendarIcon,
  CheckCircle2, XCircle, Circle, Ban, Plus, TrendingUp,
} from 'lucide-react'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date) => startOfWeek(date, { weekStartsOn: 1 }),
  getDay,
  locales: { el },
})

const STATUS_STYLES: Record<string, { bg: string; border: string; text: string; dot: string }> = {
  pending:   { bg: '#2a1f00', border: '#7a5500', text: '#f59e0b', dot: '#f59e0b' },
  confirmed: { bg: '#002a15', border: '#007a40', text: '#34d399', dot: '#34d399' },
  completed: { bg: '#001a2e', border: '#005a9e', text: '#60a5fa', dot: '#60a5fa' },
  cancelled: { bg: '#1a0000', border: '#5a0000', text: '#f87171', dot: '#f87171' },
  no_show:   { bg: '#272727', border: '#404040',    text: '#888',    dot: '#888' },
}

const STATUS_ICONS: Record<string, React.ElementType> = {
  pending: Circle,
  confirmed: CheckCircle2,
  completed: CheckCircle2,
  cancelled: XCircle,
  no_show: Ban,
}

const ALL_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled', 'no_show']

interface Break {
  id: string; break_date: string; start_time: string; end_time: string; label: string
}
interface Props {
  appointments: Appointment[]
  breaks: Break[]
}

function EventBlock({ event }: { event: any }) {
  const appt = event.resource as Appointment | null
  if (!appt) {
    return (
      <div className="h-full px-2 py-1 flex items-center gap-1.5 overflow-hidden">
        <Ban size={9} className="shrink-0 opacity-40" />
        <span className="text-[10px] truncate opacity-50 leading-none">{event.title.replace('🚫 ', '')}</span>
      </div>
    )
  }
  const style = STATUS_STYLES[appt.status] ?? STATUS_STYLES.pending
  return (
    <div
      className="h-full flex flex-col justify-center overflow-hidden"
      style={{ padding: '3px 7px', borderLeft: `2px solid ${style.border}` }}
    >
      {/* Name always visible */}
      <div
        className="text-[11px] font-semibold truncate leading-[1.2]"
        style={{ color: style.text }}
      >
        {appt.customer_name}
      </div>
      {/* Service — only if slot is tall enough (≥45px rendered via CSS) */}
      <div className="rbc-event-service text-[10px] truncate leading-[1.2] mt-[1px]" style={{ color: style.text, opacity: 0.65 }}>
        {appt.service_name}
      </div>
    </div>
  )
}

function AppointmentCard({ appt, onSelect }: { appt: Appointment; onSelect: (a: Appointment) => void }) {
  const style = STATUS_STYLES[appt.status] ?? STATUS_STYLES.pending
  const Icon = STATUS_ICONS[appt.status] ?? Circle
  return (
    <button
      onClick={() => onSelect(appt)}
      className="w-full text-left rounded-xl border p-3 transition-all hover:brightness-125 active:scale-[0.99]"
      style={{ background: style.bg, borderColor: style.border }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-[#e5e5e5] truncate">{appt.customer_name}</div>
          <div className="text-xs text-[#888] truncate mt-0.5">{appt.service_name}</div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-sm font-bold" style={{ color: style.text }}>{formatTime(appt.appointment_time)}</div>
          <div className="text-[10px] text-[#555]">–{formatTime(appt.end_time)}</div>
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-1" style={{ color: style.text }}>
          <Icon size={11} />
          <span className="text-[10px]">{statusLabel(appt.status)}</span>
        </div>
        <span className="text-[11px] font-medium" style={{ color: style.text }}>{formatPrice(appt.final_price)}</span>
      </div>
    </button>
  )
}

function DayGroup({ dateStr, appts, onSelect, todayStr }: {
  dateStr: string; appts: Appointment[]
  onSelect: (a: Appointment) => void
  todayStr: string  // '' during SSR → no class mismatch
}) {
  const d = new Date(dateStr + 'T00:00:00')
  const isToday = !!todayStr && dateStr === todayStr
  return (
    <div>
      <div className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider sticky top-0 z-10 ${isToday ? 'text-[#c8a96e] bg-[#181818]' : 'text-[#444] bg-[#181818]'}`}>
        {format(d, 'EEEE d/M', { locale: el })}
        {isToday && <span className="ml-1.5 text-[9px] bg-[#c8a96e]/20 text-[#c8a96e] px-1.5 py-0.5 rounded-full">Σήμερα</span>}
      </div>
      <div className="space-y-1.5 px-3 pb-2">
        {appts.map((a) => <AppointmentCard key={a.id} appt={a} onSelect={onSelect} />)}
      </div>
    </div>
  )
}

export default function AdminCalendar({ appointments, breaks }: Props) {
  const router = useRouter()
  const [selected, setSelected] = useState<Appointment | null>(null)
  const [view, setView] = useState<View>('week')
  // Initialize to stable values; useEffect corrects to real "now" client-side
  const [date, setDate] = useState<Date>(() => new Date(2000, 0, 1))
  const [scrollTime, setScrollTime] = useState<Date>(() => new Date(0, 0, 0, 8, 0))
  const [todayStr, setTodayStr] = useState('')  // '' during SSR → no mismatch
  const [updating, setUpdating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    const now = new Date()
    setDate(now)
    setScrollTime(now)
    setTodayStr(format(now, 'yyyy-MM-dd'))
  }, [])

  // Build calendar events
  const events = useMemo(() => [
    ...appointments.map((appt) => ({
      id: appt.id,
      title: appt.customer_name,
      start: new Date(`${appt.appointment_date}T${appt.appointment_time}`),
      end: new Date(`${appt.appointment_date}T${appt.end_time}`),
      resource: appt,
    })),
    ...breaks.map((b) => ({
      id: b.id,
      title: `🚫 ${b.label}`,
      start: new Date(`${b.break_date}T${b.start_time}`),
      end: new Date(`${b.break_date}T${b.end_time}`),
      resource: null,
    })),
  ], [appointments, breaks])

  // Side panel: day or week appointments
  const focusedDay = startOfDay(date)
  const dayStr = format(focusedDay, 'yyyy-MM-dd')
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => format(addDays(weekStart, i), 'yyyy-MM-dd'))

  const panelAppts = useMemo(() => {
    const base = appointments.filter((a) => {
      const inRange = view === 'week'
        ? weekDays.includes(a.appointment_date)
        : a.appointment_date === dayStr
      const statusOk = !statusFilter || a.status === statusFilter
      return inRange && a.status !== 'cancelled' && statusOk
    })
    return base.sort((a, b) =>
      a.appointment_date.localeCompare(b.appointment_date) || a.appointment_time.localeCompare(b.appointment_time)
    )
  }, [appointments, view, dayStr, weekDays, statusFilter])

  const panelRevenue = panelAppts.filter(a => a.status === 'completed').reduce((s, a) => s + a.final_price, 0)
  const panelPending = panelAppts.filter(a => a.status === 'pending').length

  // Grouped by day for week view
  const groupedByDay = useMemo(() => {
    if (view !== 'week') return null
    return weekDays
      .map((d) => ({ dateStr: d, appts: panelAppts.filter((a) => a.appointment_date === d) }))
      .filter((g) => g.appts.length > 0)
  }, [view, weekDays, panelAppts])

  function navigate(direction: 'prev' | 'next' | 'today') {
    if (direction === 'today') return setDate(new Date())
    const delta = view === 'day' ? 1 : 7
    setDate((d) => direction === 'next' ? addDays(d, delta) : subDays(d, delta))
  }

  async function updateStatus(id: string, status: string) {
    setUpdating(true)
    await fetch(`/api/admin/appointments/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setUpdating(false)
    setSelected(null)
    router.refresh()
  }

  const eventStyleGetter = useCallback((event: any) => {
    const appt = event.resource as Appointment | null
    const status = appt?.status ?? 'break'
    const style = STATUS_STYLES[status]
    return {
      style: {
        background: style?.bg ?? '#272727',
        border: 'none',
        borderRadius: '4px',
        color: style?.text ?? '#888',
        fontSize: '11px',
        padding: 0,
        cursor: 'pointer',
        boxShadow: `inset 0 0 0 1px ${style?.border ?? '#404040'}22`,
      },
    }
  }, [])

  const headerLabel = view === 'day'
    ? format(date, 'EEEE, d MMMM yyyy', { locale: el })
    : (() => {
        const start = startOfWeek(date, { weekStartsOn: 1 })
        const end = addDays(start, 6)
        return `${format(start, 'd MMM', { locale: el })} – ${format(end, 'd MMM yyyy', { locale: el })}`
      })()

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Calendar area */}
      <div className="flex-1 flex flex-col min-w-0 p-4">
        {/* Custom toolbar */}
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('prev')}
              className="p-2 rounded-lg bg-[#292929] border border-[#363636] text-[#888] hover:text-[#e5e5e5] hover:border-[#444] transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => navigate('today')}
              className="px-3 py-1.5 rounded-lg bg-[#292929] border border-[#363636] text-sm text-[#888] hover:text-[#e5e5e5] hover:border-[#444] transition-all"
            >
              Σήμερα
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-2 rounded-lg bg-[#292929] border border-[#363636] text-[#888] hover:text-[#e5e5e5] hover:border-[#444] transition-all"
            >
              <ChevronRight size={16} />
            </button>
            <span className="text-sm font-semibold text-[#e5e5e5] capitalize ml-2">{headerLabel}</span>
          </div>

          <div className="flex items-center gap-1 bg-[#272727] rounded-lg p-1 border border-[#2e2e2e]">
            {([
              { v: 'day' as View, icon: CalendarIcon, label: 'Ημέρα' },
              { v: 'week' as View, icon: CalendarDays, label: 'Εβδομάδα' },
              { v: 'agenda' as View, icon: LayoutList, label: 'Λίστα' },
            ] as const).map(({ v, icon: Icon, label }) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  view === v ? 'bg-[#c8a96e] text-black' : 'text-[#666] hover:text-[#ccc]'
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Status legend */}
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          {Object.entries(STATUS_STYLES).map(([status, style]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: style.dot }} />
              <span className="text-[10px] text-[#555]">{statusLabel(status)}</span>
            </div>
          ))}
          <span className="text-[10px] text-[#3a3a3a] ml-2 hidden sm:block">· Κλικ σε κενή ώρα για νέο ραντεβού</span>
        </div>

        {/* Calendar */}
        <div className="flex-1 min-h-0 rounded-xl overflow-hidden border border-[#2b2b2b]" style={{ height: 'calc(100vh - 240px)' }}>
          <Calendar
            localizer={localizer}
            events={events}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            onSelectEvent={(event: any) => {
              if (event.resource) setSelected(event.resource)
            }}
            onSelectSlot={(slotInfo: any) => {
              // Click on empty slot → open new appointment with prefilled date+time
              if (view === 'day' || view === 'week') {
                const dateStr = format(slotInfo.start, 'yyyy-MM-dd')
                const timeStr = format(slotInfo.start, 'HH:mm')
                router.push(`/admin/appointments/new?date=${dateStr}&time=${timeStr}`)
              } else {
                setDate(slotInfo.start)
              }
            }}
            onDrillDown={(drillDate) => {
              setDate(drillDate)
              setView('day')
            }}
            getDrilldownView={() => 'day'}
            selectable
            eventPropGetter={eventStyleGetter}
            components={{ event: EventBlock as any, toolbar: () => null }}
            messages={{
              noEventsInRange: 'Δεν υπάρχουν ραντεβού.',
              agenda: 'Λίστα',
              allDay: 'Όλη μέρα',
              date: 'Ημερομηνία',
              time: 'Ώρα',
              event: 'Ραντεβού',
              showMore: (total) => `+${total} ακόμα`,
            }}
            culture="el"
            step={30}
            timeslots={1}
            min={new Date(0, 0, 0, 8, 0)}
            max={new Date(0, 0, 0, 22, 0)}
            scrollToTime={scrollTime}
            popup
            showMultiDayTimes
          />
        </div>
      </div>

      {/* Side panel */}
      <aside className="w-72 shrink-0 border-l border-[#272727] bg-[#181818] flex flex-col overflow-hidden">
        {/* Panel header */}
        <div className="px-4 py-4 border-b border-[#272727]">
          <div className="text-[10px] text-[#444] uppercase tracking-wider mb-1">
            {view === 'week' ? 'Εβδομάδα' : 'Ημέρα'}
          </div>
          <div className="text-sm font-semibold text-[#e5e5e5] capitalize">
            {view === 'week'
              ? `${format(weekStart, 'd MMM', { locale: el })} – ${format(addDays(weekStart, 6), 'd MMM', { locale: el })}`
              : format(date, 'EEEE', { locale: el })}
          </div>
          {view === 'day' && (
            <div className="text-xs text-[#555]">{format(date, 'd MMMM yyyy', { locale: el })}</div>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-px border-b border-[#272727] bg-[#272727]">
          <div className="bg-[#181818] px-3 py-3">
            <div className="text-base font-bold text-[#c8a96e]">{panelAppts.length}</div>
            <div className="text-[9px] text-[#444] uppercase tracking-wide">Σύνολο</div>
          </div>
          <div className="bg-[#181818] px-3 py-3">
            <div className="text-base font-bold text-amber-400">{panelPending}</div>
            <div className="text-[9px] text-[#444] uppercase tracking-wide">Αναμονή</div>
          </div>
          <div className="bg-[#181818] px-3 py-3">
            <div className="text-base font-bold text-[#c8a96e]">{formatPrice(panelRevenue)}</div>
            <div className="text-[9px] text-[#444] uppercase tracking-wide flex items-center gap-0.5"><TrendingUp size={8} />Έσοδα</div>
          </div>
        </div>

        {/* Status filter */}
        <div className="px-3 py-2 border-b border-[#272727] flex flex-wrap gap-1">
          <button
            onClick={() => setStatusFilter(null)}
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium transition-all ${!statusFilter ? 'bg-[#c8a96e] text-black' : 'bg-[#272727] text-[#555] hover:text-[#888]'}`}
          >
            Όλα
          </button>
          {ALL_STATUSES.filter(s => s !== 'cancelled').map((s) => {
            const style = STATUS_STYLES[s]
            const active = statusFilter === s
            return (
              <button
                key={s}
                onClick={() => setStatusFilter(active ? null : s)}
                className="px-2 py-0.5 rounded-full text-[10px] font-medium transition-all border"
                style={active
                  ? { background: style.bg, borderColor: style.border, color: style.text }
                  : { background: 'transparent', borderColor: '#2e2e2e', color: '#555' }
                }
              >
                {statusLabel(s)}
              </button>
            )
          })}
        </div>

        {/* Appointment list */}
        <div className="flex-1 overflow-y-auto py-2">
          {panelAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center px-4">
              <CalendarDays size={28} className="text-[#363636] mb-3" />
              <p className="text-xs text-[#333]">Δεν υπάρχουν ραντεβού</p>
              <p className="text-[10px] text-[#363636] mt-1">Κλικ σε ώρα για να προσθέσετε</p>
            </div>
          ) : view === 'week' && groupedByDay ? (
            <div className="space-y-1">
              {groupedByDay.map(({ dateStr, appts }) => (
                <DayGroup key={dateStr} dateStr={dateStr} appts={appts} onSelect={setSelected} todayStr={todayStr} />
              ))}
            </div>
          ) : (
            <div className="px-3 space-y-1.5">
              {panelAppts.map((appt) => (
                <AppointmentCard key={appt.id} appt={appt} onSelect={setSelected} />
              ))}
            </div>
          )}
        </div>

        {/* Quick add button */}
        <div className="p-3 border-t border-[#272727]">
          <Link
            href="/admin/appointments/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-[#c8a96e] text-black text-sm font-semibold rounded-lg hover:bg-[#dfc18a] transition-colors"
          >
            <Plus size={15} />Νέο Ραντεβού
          </Link>
        </div>
      </aside>

      {/* Appointment detail modal */}
      {selected && (
        <Modal isOpen onClose={() => setSelected(null)} title="Λεπτομέρειες Ραντεβού" size="md">
          {(() => {
            const style = STATUS_STYLES[selected.status] ?? STATUS_STYLES.pending
            return (
              <div className="space-y-4">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                  style={{ background: style.bg, borderColor: style.border, color: style.text }}
                >
                  {statusLabel(selected.status)}
                </div>

                <div className="bg-[#272727] rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#555]">Πελάτης</span>
                    <span className="text-sm font-semibold text-[#e5e5e5]">{selected.customer_name}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-[#555]">Τηλέφωνο</span>
                    <a href={`tel:${selected.customer_phone}`} className="text-sm text-[#c8a96e] font-medium flex items-center gap-1">
                      <Phone size={11} />{selected.customer_phone}
                    </a>
                  </div>
                  {selected.customer_email && (
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#555]">Email</span>
                      <a href={`mailto:${selected.customer_email}`} className="text-xs text-[#888] flex items-center gap-1">
                        <Mail size={10} />{selected.customer_email}
                      </a>
                    </div>
                  )}
                  <div className="border-t border-[#363636] pt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#555]">Υπηρεσία</span>
                      <span className="text-sm text-[#e5e5e5]">{selected.service_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#555]">Ώρα</span>
                      <span className="text-sm text-[#e5e5e5] flex items-center gap-1">
                        <Clock size={11} />
                        {formatTime(selected.appointment_time)} – {formatTime(selected.end_time)}
                        <span className="text-[#555]">({selected.service_duration}λ)</span>
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#555]">Τιμή</span>
                      <span className="text-base font-bold text-[#c8a96e]">{formatPrice(selected.final_price)}</span>
                    </div>
                  </div>
                  {selected.notes && (
                    <div className="border-t border-[#363636] pt-3">
                      <div className="text-xs text-[#555] mb-1">Σημειώσεις</div>
                      <p className="text-sm text-[#aaa]">{selected.notes}</p>
                    </div>
                  )}
                </div>

                {/* Quick status actions */}
                <div>
                  <div className="text-xs text-[#555] mb-2 uppercase tracking-wide">Αλλαγή κατάστασης</div>
                  <div className="grid grid-cols-2 gap-2">
                    {selected.status !== 'confirmed' && selected.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'confirmed')}
                        disabled={updating}
                        className="py-2 rounded-lg text-xs font-semibold text-green-400 bg-green-900/30 border border-green-800 hover:bg-green-900/50 transition-colors disabled:opacity-50"
                      >
                        ✓ Επιβεβαίωση
                      </button>
                    )}
                    {selected.status !== 'completed' && selected.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'completed')}
                        disabled={updating}
                        className="py-2 rounded-lg text-xs font-semibold text-blue-400 bg-blue-900/30 border border-blue-800 hover:bg-blue-900/50 transition-colors disabled:opacity-50"
                      >
                        ✓ Ολοκλήρωση
                      </button>
                    )}
                    {selected.status !== 'cancelled' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'cancelled')}
                        disabled={updating}
                        className="py-2 rounded-lg text-xs font-semibold text-red-400 bg-red-900/30 border border-red-800 hover:bg-red-900/50 transition-colors disabled:opacity-50"
                      >
                        ✗ Ακύρωση
                      </button>
                    )}
                    {selected.status !== 'no_show' && (
                      <button
                        onClick={() => updateStatus(selected.id, 'no_show')}
                        disabled={updating}
                        className="py-2 rounded-lg text-xs font-semibold text-[#666] bg-[#272727] border border-[#333] hover:bg-[#222] transition-colors disabled:opacity-50"
                      >
                        Δεν ήρθε
                      </button>
                    )}
                  </div>
                </div>

                <Link href={`/admin/appointments/${selected.id}`}>
                  <Button variant="ghost" size="sm" className="w-full">
                    Πλήρης επεξεργασία →
                  </Button>
                </Link>
              </div>
            )
          })()}
        </Modal>
      )}
    </div>
  )
}
