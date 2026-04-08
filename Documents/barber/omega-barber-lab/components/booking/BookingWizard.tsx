'use client'
import { useReducer, useState, useEffect } from 'react'
import type { Service } from '@/types'
import { formatDate, formatPrice, formatTime, addMinutesToTime } from '@/lib/utils'
import Spinner from '@/components/ui/Spinner'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import DatePicker from '@/components/ui/DatePicker'
import { getT } from '@/lib/i18n/translations'
import type { Locale } from '@/lib/i18n/server'
import { Check, Clock, ChevronLeft, Tag } from 'lucide-react'

interface State {
  step: 1 | 2 | 3 | 4
  service: Service | null
  date: string
  time: string
  slots: string[]
  slotsLoading: boolean
  name: string
  phone: string
  email: string
  notes: string
  couponCode: string
  couponResult: { valid: boolean; discountAmount?: number; finalPrice?: number; description?: string } | null
  couponLoading: boolean
}

type Action =
  | { type: 'SELECT_SERVICE'; service: Service }
  | { type: 'SET_DATE'; date: string }
  | { type: 'SET_SLOTS'; slots: string[]; loading: boolean }
  | { type: 'SELECT_TIME'; time: string }
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SET_COUPON_RESULT'; result: State['couponResult'] }
  | { type: 'SET_COUPON_LOADING'; loading: boolean }
  | { type: 'GO_BACK' }
  | { type: 'GO_TO'; step: 1 | 2 | 3 | 4 }

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SELECT_SERVICE':
      return { ...state, service: action.service, step: 2, date: '', time: '', slots: [], couponResult: null }
    case 'SET_DATE':
      return { ...state, date: action.date, time: '', slots: [], slotsLoading: true }
    case 'SET_SLOTS':
      return { ...state, slots: action.slots, slotsLoading: action.loading }
    case 'SELECT_TIME':
      return { ...state, time: action.time, step: 3 }
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value }
    case 'SET_COUPON_RESULT':
      return { ...state, couponResult: action.result }
    case 'SET_COUPON_LOADING':
      return { ...state, couponLoading: action.loading }
    case 'GO_BACK':
      return { ...state, step: Math.max(1, state.step - 1) as 1 | 2 | 3 | 4 }
    case 'GO_TO':
      return { ...state, step: action.step }
    default:
      return state
  }
}

const initial: State = {
  step: 1, service: null, date: '', time: '', slots: [], slotsLoading: false,
  name: '', phone: '', email: '', notes: '',
  couponCode: '', couponResult: null, couponLoading: false,
}

interface Props { services: Service[]; locale: Locale }

export default function BookingWizard({ services, locale }: Props) {
  const t = getT(locale).booking
  const [state, dispatch] = useReducer(reducer, initial)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  // Empty on server, filled after mount — avoids SSR/client timezone mismatch
  const [dateMin, setDateMin] = useState('')
  const [dateMax, setDateMax] = useState('')
  useEffect(() => {
    setDateMin(new Date().toISOString().split('T')[0])
    setDateMax(new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
  }, [])

  async function fetchSlots(date: string) {
    if (!state.service) return
    dispatch({ type: 'SET_DATE', date })
    const res = await fetch(`/api/availability?date=${date}&duration=${state.service.duration}`)
    const data = await res.json()
    dispatch({ type: 'SET_SLOTS', slots: data.slots ?? [], loading: false })
  }

  async function validateCoupon() {
    if (!state.couponCode || !state.service) return
    dispatch({ type: 'SET_COUPON_LOADING', loading: true })
    const res = await fetch('/api/discounts/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: state.couponCode, price: state.service.price }),
    })
    const result = await res.json()
    dispatch({ type: 'SET_COUPON_RESULT', result })
    dispatch({ type: 'SET_COUPON_LOADING', loading: false })
  }

  async function handleSubmit() {
    setError('')
    setSubmitting(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: state.service!.id,
          appointmentDate: state.date,
          appointmentTime: state.time,
          customerName: state.name,
          customerPhone: state.phone,
          customerEmail: state.email || undefined,
          notes: state.notes || undefined,
          couponCode: state.couponCode || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Σφάλμα')
      setSuccess(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const finalPrice = state.couponResult?.valid ? state.couponResult.finalPrice ?? state.service?.price : state.service?.price

  if (success) {
    return (
      <div className="bg-[#212121] border border-green-800 rounded-2xl p-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-900/40 border border-green-700 flex items-center justify-center mx-auto mb-6">
          <Check size={28} className="text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{t.success.h2}</h2>
        <p className="text-[#888] mb-6">
          {t.success.msgFor} <strong className="text-[#c8a96e]">{state.service?.name}</strong>{' '}
          {t.success.msgAt}{' '}
          <strong className="text-[#c8a96e]">{formatDate(state.date)} · {formatTime(state.time)}</strong>{' '}
          {t.success.msgDone}
        </p>
        {state.email && <p className="text-sm text-[#666]">{t.success.emailSentPrefix} {state.email}</p>}
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-6">
          {t.success.newBtn}
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-[#212121] border border-[#2e2e2e] rounded-2xl overflow-hidden shadow-2xl">
      {/* Step indicators */}
      <div className="flex border-b border-[#2e2e2e]">
        {t.steps.map((label, i) => {
          const step = (i + 1) as 1 | 2 | 3 | 4
          const active = state.step === step
          const done = state.step > step
          return (
            <button
              key={label}
              onClick={() => done && dispatch({ type: 'GO_TO', step })}
              disabled={!done}
              className={`flex-1 py-4 text-xs font-medium tracking-wider uppercase transition-all ${
                active ? 'text-[#c8a96e] border-b-2 border-[#c8a96e]' :
                done ? 'text-[#888] cursor-pointer hover:text-[#c8a96e]' : 'text-[#444]'
              }`}
            >
              {done ? <span className="text-green-400 mr-1">✓</span> : null}
              {label}
            </button>
          )
        })}
      </div>

      <div className="p-6 md:p-8">
        {/* Step 1: Service */}
        {state.step === 1 && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold text-white mb-6">{t.step1.h2}</h2>
            {services.map((s) => (
              <button
                key={s.id}
                onClick={() => dispatch({ type: 'SELECT_SERVICE', service: s })}
                className="w-full bg-[#292929] border border-[#363636] rounded-xl p-5 text-left hover:border-[#c8a96e]/50 hover:bg-[#2b2b2b] transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-base font-semibold text-white group-hover:text-[#c8a96e] transition-colors">{s.name}</span>
                  <span className="text-xl font-bold text-[#c8a96e]">{s.price}€</span>
                </div>
                <p className="text-sm text-[#666] mb-3">{s.description}</p>
                <span className="flex items-center gap-1 text-xs text-[#555]">
                  <Clock size={11} />{s.duration} {t.step1.minutes}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Date & Time */}
        {state.step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => dispatch({ type: 'GO_BACK' })} className="text-[#666] hover:text-[#e5e5e5]">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-white">{t.step2.h2}</h2>
            </div>

            <DatePicker
              label={t.step2.dateLabel}
              value={state.date}
              onChange={(d) => fetchSlots(d)}
              min={dateMin}
              max={dateMax}
            />

            {state.date && (
              <div>
                <label className="text-sm font-medium text-[#ccc] block mb-3">{t.step2.timesLabel}</label>
                {state.slotsLoading ? (
                  <div className="flex justify-center py-8"><Spinner /></div>
                ) : state.slots.length === 0 ? (
                  <div className="bg-[#272727] rounded-xl p-6 text-center text-[#555] text-sm">
                    {t.step2.noSlots}
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {state.slots.map((slot) => {
                      const isHour = slot.endsWith(':00')
                      return (
                        <button
                          key={slot}
                          onClick={() => dispatch({ type: 'SELECT_TIME', time: slot })}
                          className={`
                            py-3 rounded-xl border text-sm font-medium transition-all active:scale-95
                            ${isHour
                              ? 'bg-[#212121] border-[#2e2e2e] text-[#ccc] hover:border-[#c8a96e]/60 hover:text-[#c8a96e] hover:bg-[#c8a96e]/5'
                              : 'bg-[#1b1b1b] border-[#272727] text-[#666] hover:border-[#c8a96e]/40 hover:text-[#c8a96e] hover:bg-[#c8a96e]/4'
                            }
                          `}
                        >
                          {slot}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Customer details */}
        {state.step === 3 && (
          <div className="space-y-4 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => dispatch({ type: 'GO_BACK' })} className="text-[#666] hover:text-[#e5e5e5]">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-white">{t.step3.h2}</h2>
            </div>

            <Input
              label={t.step3.name}
              required
              placeholder={t.step3.namePh}
              value={state.name}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'name', value: e.target.value })}
            />
            <Input
              label={t.step3.phone}
              required
              type="tel"
              placeholder={t.step3.phonePh}
              value={state.phone}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'phone', value: e.target.value })}
              hint={t.step3.phoneHint}
            />
            <Input
              label={t.step3.email}
              type="email"
              placeholder={t.step3.emailPh}
              value={state.email}
              onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'email', value: e.target.value })}
              hint={t.step3.emailHint}
            />

            <div>
              <label className="text-sm font-medium text-[#ccc] block mb-1.5">{t.step3.notes}</label>
              <textarea
                rows={3}
                placeholder={t.step3.notesPh}
                value={state.notes}
                onChange={(e) => dispatch({ type: 'SET_FIELD', field: 'notes', value: e.target.value })}
                className="w-full bg-[#292929] border border-[#363636] rounded-xl px-4 py-3 text-sm text-[#e5e5e5] placeholder-[#555] outline-none focus:border-[#c8a96e] resize-none"
              />
            </div>

            {/* Coupon */}
            <div>
              <label className="text-sm font-medium text-[#ccc] block mb-1.5 flex items-center gap-1.5">
                <Tag size={12} />{t.step3.coupon}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t.step3.couponPh}
                  value={state.couponCode}
                  onChange={(e) => {
                    dispatch({ type: 'SET_FIELD', field: 'couponCode', value: e.target.value.toUpperCase() })
                    dispatch({ type: 'SET_COUPON_RESULT', result: null })
                  }}
                  className="flex-1 bg-[#292929] border border-[#363636] rounded-xl px-4 py-2.5 text-sm text-[#e5e5e5] placeholder-[#555] outline-none focus:border-[#c8a96e] font-mono"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={validateCoupon}
                  loading={state.couponLoading}
                  disabled={!state.couponCode}
                >
                  {t.step3.couponBtn}
                </Button>
              </div>
              {state.couponResult && (
                <div className={`mt-2 text-sm px-3 py-2 rounded-lg ${state.couponResult.valid ? 'bg-green-900/20 border border-green-800 text-green-400' : 'bg-red-900/20 border border-red-800 text-red-400'}`}>
                  {state.couponResult.valid
                    ? `${t.step3.couponValidPrefix} ${state.couponResult.description} ${t.step3.couponValidMid} ${formatPrice(state.couponResult.discountAmount!)} ${t.step3.couponValidSuffix} ${formatPrice(state.couponResult.finalPrice!)}`
                    : t.step3.couponInvalid}
                </div>
              )}
            </div>

            <Button
              className="w-full mt-2"
              onClick={() => {
                if (!state.name || !state.phone) return
                dispatch({ type: 'GO_TO', step: 4 })
              }}
              disabled={!state.name || !state.phone}
            >
              {t.step3.next}
            </Button>
          </div>
        )}

        {/* Step 4: Confirmation */}
        {state.step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center gap-3 mb-2">
              <button onClick={() => dispatch({ type: 'GO_BACK' })} className="text-[#666] hover:text-[#e5e5e5]">
                <ChevronLeft size={20} />
              </button>
              <h2 className="text-lg font-semibold text-white">{t.step4.h2}</h2>
            </div>

            <div className="bg-[#272727] border border-[#363636] rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">{t.step4.service}</span>
                <span className="text-sm font-semibold text-[#e5e5e5]">{state.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">{t.step4.date}</span>
                <span className="text-sm text-[#e5e5e5]">{formatDate(state.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-[#666]">{t.step4.time}</span>
                <span className="text-sm text-[#e5e5e5]">{formatTime(state.time)} – {state.service && addMinutesToTime(state.time, state.service.duration)}</span>
              </div>
              <div className="border-t border-[#363636] pt-4">
                <div className="flex justify-between">
                  <span className="text-sm text-[#666]">{t.step4.customer}</span>
                  <span className="text-sm text-[#e5e5e5]">{state.name}</span>
                </div>
                <div className="flex justify-between mt-2">
                  <span className="text-sm text-[#666]">{t.step4.phone}</span>
                  <span className="text-sm text-[#e5e5e5]">{state.phone}</span>
                </div>
                {state.email && (
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-[#666]">{t.step4.email}</span>
                    <span className="text-sm text-[#e5e5e5]">{state.email}</span>
                  </div>
                )}
              </div>
              {state.couponResult?.valid && (
                <div className="border-t border-[#363636] pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">{t.step4.price}</span>
                    <span className="text-[#888] line-through">{formatPrice(state.service?.price ?? 0)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#666]">{t.step4.discount}</span>
                    <span className="text-green-400">-{formatPrice(state.couponResult.discountAmount!)}</span>
                  </div>
                </div>
              )}
              <div className="border-t border-[#363636] pt-4 flex justify-between">
                <span className="text-sm font-semibold text-[#888]">{t.step4.total}</span>
                <span className="text-xl font-bold text-[#c8a96e]">{formatPrice(finalPrice ?? 0)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 text-red-400 text-sm">{error}</div>
            )}

            <Button className="w-full" size="lg" onClick={handleSubmit} loading={submitting}>
              {t.step4.submitPrefix} {formatPrice(finalPrice ?? 0)}
            </Button>
            <p className="text-xs text-[#555] text-center">{t.step4.cancel}</p>
          </div>
        )}
      </div>
    </div>
  )
}
