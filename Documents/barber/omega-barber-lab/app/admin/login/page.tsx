'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password })
      if (authError) throw authError
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      setError('Λάθος email ή κωδικός.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Omega Barber Lab"
              width={100}
              height={67}
              className="opacity-80"
            />
          </div>
          <div className="text-[#555] text-xs tracking-[0.3em] mb-2">ADMIN PANEL</div>
          <p className="text-[#555] text-sm">Σύνδεση στον πίνακα διαχείρισης</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#212121] border border-[#2e2e2e] rounded-xl p-6 space-y-4">
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@omegabarberlab.gr"
          />
          <Input
            label="Κωδικός"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full">
            Σύνδεση
          </Button>
        </form>
      </div>
    </div>
  )
}
