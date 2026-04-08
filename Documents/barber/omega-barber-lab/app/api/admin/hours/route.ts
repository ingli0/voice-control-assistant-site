import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('admin_profiles').select('id').eq('id', user.id).single()
  return !!data
}

export async function GET() {
  const supabase = await createClient()
  const { data } = await supabase.from('working_hours').select('*').order('day_of_week')
  return NextResponse.json({ hours: data })
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  if (!(await requireAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { hours } = await request.json()
  const updates = hours.map((h: any) =>
    supabase.from('working_hours').upsert({
      day_of_week: h.day_of_week,
      is_open: h.is_open,
      open_time: h.is_open ? h.open_time : null,
      close_time: h.is_open ? h.close_time : null,
    }, { onConflict: 'day_of_week' })
  )
  await Promise.all(updates)
  return NextResponse.json({ success: true })
}
