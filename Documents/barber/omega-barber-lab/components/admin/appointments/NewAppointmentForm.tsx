'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { Service } from '@/types'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import DatePicker from '@/components/ui/DatePicker'
import TimePicker from '@/components/ui/TimePicker'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { addMinutesToTime } from '@/lib/utils'

interface Props { services: Service[] }

export default function NewAppointmentForm({ services }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [form, setForm] = useState({
    serviceId: '',
    appointmentDate: searchParams.get('date') ?? '',
    appointmentTime: searchParams.get('time') ?? '',
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [dateMin, setDateMin] = useState('')
  useEffect(() => setDateMin(new Date().toISOString().split('T')[0]), [])

  const selectedService = services.find((s) => s.id === form.serviceId)

  function set(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Σφάλμα δημιουργίας')
      router.push(`/admin/appointments/${data.appointment.id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-xl">
      <Link href="/admin/appointments" className="inline-flex items-center gap-2 text-sm text-[#666] hover:text-[#c8a96e] mb-6 transition-colors">
        <ArrowLeft size={14} />Πίσω
      </Link>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#212121] border border-[#2e2e2e] rounded-xl p-6">
        <Select
          label="Υπηρεσία"
          required
          value={form.serviceId}
          onChange={(e) => set('serviceId', e.target.value)}
          options={services.map((s) => ({ value: s.id, label: `${s.name} — ${s.duration}λ — ${s.price}€` }))}
          placeholder="Επιλέξτε υπηρεσία..."
        />
        <DatePicker
          label="Ημερομηνία *"
          value={form.appointmentDate}
          onChange={(d) => set('appointmentDate', d)}
          min={dateMin}
        />
        <TimePicker
          label="Ώρα"
          required
          value={form.appointmentTime}
          onChange={(t) => set('appointmentTime', t)}
          step={15}
        />
        {selectedService && form.appointmentTime && (
          <p className="text-xs text-[#555]">
            Λήξη: {addMinutesToTime(form.appointmentTime, selectedService.duration)}
          </p>
        )}
        <Input
          label="Όνομα πελάτη"
          required
          value={form.customerName}
          onChange={(e) => set('customerName', e.target.value)}
          placeholder="Γιώργος Παπαδόπουλος"
        />
        <Input
          label="Τηλέφωνο"
          required
          type="tel"
          value={form.customerPhone}
          onChange={(e) => set('customerPhone', e.target.value)}
          placeholder="6912345678"
        />
        <Input
          label="Email (προαιρετικό)"
          type="email"
          value={form.customerEmail}
          onChange={(e) => set('customerEmail', e.target.value)}
          placeholder="email@example.com"
        />
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[#ccc]">Σημειώσεις</label>
          <textarea
            value={form.notes}
            onChange={(e) => set('notes', e.target.value)}
            rows={3}
            className="w-full bg-[#292929] border border-[#363636] rounded-lg px-3 py-2.5 text-sm text-[#e5e5e5] placeholder-[#555] outline-none focus:border-[#c8a96e]"
            placeholder="Προαιρετικές σημειώσεις..."
          />
        </div>

        {error && <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">{error}</div>}

        <Button type="submit" loading={loading} className="w-full">
          Δημιουργία Ραντεβού
        </Button>
      </form>
    </div>
  )
}
