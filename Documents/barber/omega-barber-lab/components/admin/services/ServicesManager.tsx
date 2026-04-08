'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Service } from '@/types'
import { formatPrice } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Plus, Pencil, Trash2, Clock, DollarSign } from 'lucide-react'

interface Props { services: Service[] }

function emptyForm() {
  return { name: '', duration: 30, price: '', description: '', is_active: true }
}

export default function ServicesManager({ services: initial }: Props) {
  const router = useRouter()
  const [services, setServices] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  function openNew() {
    setEditing(null)
    setForm(emptyForm())
    setModalOpen(true)
  }

  function openEdit(s: Service) {
    setEditing(s)
    setForm({ name: s.name, duration: s.duration, price: String(s.price), description: s.description ?? '', is_active: s.is_active })
    setModalOpen(true)
  }

  async function handleSave() {
    setLoading(true)
    const body = { ...form, duration: Number(form.duration), price: Number(form.price) }
    const url = editing ? `/api/admin/services/${editing.id}` : '/api/admin/services'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    })
    if (res.ok) {
      setModalOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Διαγραφή υπηρεσίας;')) return
    setDeleteId(id)
    await fetch(`/api/admin/services/${id}`, { method: 'DELETE' })
    setDeleteId(null)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus size={14} />Νέα Υπηρεσία
        </Button>
      </div>

      <div className="grid gap-3">
        {services.length === 0 ? (
          <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-12 text-center text-[#555]">
            Δεν υπάρχουν υπηρεσίες
          </div>
        ) : (
          services.map((s) => (
            <div key={s.id} className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-5 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-[#e5e5e5]">{s.name}</span>
                  {!s.is_active && (
                    <span className="text-xs text-[#555] bg-[#272727] border border-[#363636] px-2 py-0.5 rounded-full">Ανενεργή</span>
                  )}
                </div>
                {s.description && <p className="text-sm text-[#666] mt-1">{s.description}</p>}
                <div className="flex items-center gap-4 mt-2">
                  <span className="flex items-center gap-1 text-xs text-[#888]">
                    <Clock size={11} />{s.duration} λεπτά
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[#c8a96e] font-semibold">
                    <DollarSign size={11} />{formatPrice(s.price)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                  <Pencil size={13} />
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  loading={deleteId === s.id}
                  onClick={() => handleDelete(s.id)}
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Επεξεργασία Υπηρεσίας' : 'Νέα Υπηρεσία'}
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Όνομα"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="π.χ. Κούρεμα"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Διάρκεια (λεπτά)"
              type="number"
              min={5}
              step={5}
              required
              value={form.duration}
              onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
            />
            <Input
              label="Τιμή (€)"
              type="number"
              min={0}
              step={0.50}
              required
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#ccc]">Περιγραφή</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="w-full bg-[#292929] border border-[#363636] rounded-lg px-3 py-2.5 text-sm text-[#e5e5e5] placeholder-[#555] outline-none focus:border-[#c8a96e]"
              placeholder="Περιγραφή υπηρεσίας..."
            />
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              className="w-4 h-4 accent-[#c8a96e]"
            />
            <label htmlFor="is_active" className="text-sm text-[#ccc]">Ενεργή υπηρεσία</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSave} loading={loading}>
              {editing ? 'Αποθήκευση' : 'Δημιουργία'}
            </Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Ακύρωση</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
