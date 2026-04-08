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
  const today = new Date().toISOString().split('T')[0]
  const { data } = await supabase.from('breaks').select('*').gte('break_date', today).order('break_date, start_time')
  return NextResponse.json({ breaks: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!(await requireAdmin(supabase))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const body = await request.json()
  const { data, error } = await supabase.from('breaks').insert(body).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ break: data }, { status: 201 })
}
