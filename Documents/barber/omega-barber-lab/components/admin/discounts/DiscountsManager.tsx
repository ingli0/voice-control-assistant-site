'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Discount } from '@/types'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Plus, Pencil, Trash2, Tag, ToggleLeft, ToggleRight } from 'lucide-react'
import { formatPrice } from '@/lib/utils'

function emptyForm() {
  return {
    code: '',
    description: '',
    type: 'percentage' as const,
    value: '',
    min_order: '',
    max_uses: '',
    valid_from: '',
    valid_until: '',
    is_active: true,
  }
}

function generateCode() {
  return 'OBL-' + Math.random().toString(36).toUpperCase().slice(2, 8)
}

export default function DiscountsManager({ discounts: initial }: { discounts: Discount[] }) {
  const router = useRouter()
  const [discounts, setDiscounts] = useState(initial)
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Discount | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [loading, setLoading] = useState(false)

  function openNew() {
    setEditing(null)
    setForm({ ...emptyForm(), code: generateCode() })
    setModalOpen(true)
  }

  function openEdit(d: Discount) {
    setEditing(d)
    setForm({
      code: d.code,
      description: d.description ?? '',
      type: d.type,
      value: String(d.value),
      min_order: d.min_order != null ? String(d.min_order) : '',
      max_uses: d.max_uses != null ? String(d.max_uses) : '',
      valid_from: d.valid_from ?? '',
      valid_until: d.valid_until ?? '',
      is_active: d.is_active,
    })
    setModalOpen(true)
  }

  async function handleSave() {
    setLoading(true)
    const body = {
      ...form,
      value: Number(form.value),
      min_order: form.min_order ? Number(form.min_order) : null,
      max_uses: form.max_uses ? Number(form.max_uses) : null,
      valid_from: form.valid_from || null,
      valid_until: form.valid_until || null,
    }
    const url = editing ? `/api/admin/discounts/${editing.id}` : '/api/admin/discounts'
    const method = editing ? 'PATCH' : 'POST'
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    if (res.ok) {
      setModalOpen(false)
      router.refresh()
    }
    setLoading(false)
  }

  async function toggleActive(d: Discount) {
    await fetch(`/api/admin/discounts/${d.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !d.is_active }),
    })
    router.refresh()
  }

  async function handleDelete(id: string) {
    if (!confirm('Διαγραφή κουπονιού;')) return
    await fetch(`/api/admin/discounts/${id}`, { method: 'DELETE' })
    router.refresh()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}><Plus size={14} />Νέο Κουπόνι</Button>
      </div>

      <div className="bg-[#212121] border border-[#2e2e2e] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2e2e2e]">
              {['Κωδικός', 'Τύπος', 'Αξία', 'Χρήσεις', 'Ισχύει έως', 'Κατάσταση', ''].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#666] uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272727]">
            {discounts.length === 0 ? (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-[#555] text-sm">Δεν υπάρχουν κουπόνια</td></tr>
            ) : (
              discounts.map((d) => (
                <tr key={d.id} className="hover:bg-[#272727]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-[#c8a96e]" />
                      <span className="text-sm font-mono font-medium text-[#e5e5e5]">{d.code}</span>
                    </div>
                    {d.description && <div className="text-xs text-[#666] mt-0.5">{d.description}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#888]">{d.type === 'percentage' ? 'Ποσοστό' : 'Ποσό'}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-[#c8a96e]">
                    {d.type === 'percentage' ? `${d.value}%` : formatPrice(d.value)}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#888]">
                    {d.uses_count}{d.max_uses ? `/${d.max_uses}` : ''}
                  </td>
                  <td className="px-4 py-3 text-sm text-[#888]">
                    {d.valid_until ?? '∞'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={d.is_active ? 'green' : 'gray'}>
                      {d.is_active ? 'Ενεργό' : 'Ανενεργό'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => toggleActive(d)} className="p-1.5 text-[#666] hover:text-[#c8a96e] transition-colors">
                        {d.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      </button>
                      <button onClick={() => openEdit(d)} className="p-1.5 text-[#666] hover:text-[#e5e5e5] transition-colors">
                        <Pencil size={13} />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 text-[#666] hover:text-red-400 transition-colors">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Επεξεργασία Κουπονιού' : 'Νέο Κουπόνι'} size="lg">
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <Input label="Κωδικός" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="OBL-XYZABC" />
            </div>
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, code: generateCode() })}>🎲</Button>
            </div>
          </div>
          <Input label="Περιγραφή" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="π.χ. Έκπτωση καλοκαιριού" />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Τύπος Έκπτωσης"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as 'percentage' | 'fixed' })}
              options={[{ value: 'percentage', label: 'Ποσοστό (%)' }, { value: 'fixed', label: 'Ποσό (€)' }]}
            />
            <Input
              label={form.type === 'percentage' ? 'Ποσοστό (%)' : 'Ποσό (€)'}
              type="number" min={0} step={form.type === 'percentage' ? 1 : 0.5}
              required value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ελάχ. Τιμή (€)" type="number" min={0} value={form.min_order} onChange={(e) => setForm({ ...form, min_order: e.target.value })} placeholder="Χωρίς όριο" />
            <Input label="Μέγ. Χρήσεις" type="number" min={1} value={form.max_uses} onChange={(e) => setForm({ ...form, max_uses: e.target.value })} placeholder="Απεριόριστο" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Ισχύει από" type="date" value={form.valid_from} onChange={(e) => setForm({ ...form, valid_from: e.target.value })} />
            <Input label="Ισχύει έως" type="date" value={form.valid_until} onChange={(e) => setForm({ ...form, valid_until: e.target.value })} />
          </div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="is_active_d" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} className="w-4 h-4 accent-[#c8a96e]" />
            <label htmlFor="is_active_d" className="text-sm text-[#ccc]">Ενεργό κουπόνι</label>
          </div>
          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSave} loading={loading}>{editing ? 'Αποθήκευση' : 'Δημιουργία'}</Button>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Ακύρωση</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
