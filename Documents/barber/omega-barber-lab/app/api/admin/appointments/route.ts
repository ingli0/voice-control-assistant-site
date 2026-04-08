import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addMinutesToTime } from '@/lib/utils'

async function requireAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase.from('admin_profiles').select('id').eq('id', user.id).single()
  return !!data
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  let query = supabase.from('appointments').select('*').order('appointment_date', { ascending: false }).order('appointment_time').limit(200)

  const date = searchParams.get('date')
  const status = searchParams.get('status')
  const q = searchParams.get('q')

  if (date) query = query.eq('appointment_date', date)
  if (status) query = query.eq('status', status)
  if (q) query = query.or(`customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appointments: data })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  if (!(await requireAdmin(supabase))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { serviceId, appointmentDate, appointmentTime, customerName, customerPhone, customerEmail, notes } = body

  const { data: service } = await supabase.from('services').select('*').eq('id', serviceId).single()
  if (!service) return NextResponse.json({ error: 'Υπηρεσία δεν βρέθηκε' }, { status: 404 })

  const endTime = addMinutesToTime(appointmentTime, service.duration)

  const { data: appointment, error } = await supabase
    .from('appointments')
    .insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail || null,
      service_id: serviceId,
      service_name: service.name,
      service_price: service.price,
      service_duration: service.duration,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      end_time: endTime,
      notes: notes || null,
      final_price: service.price,
      status: 'confirmed',
      created_by: 'admin',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ appointment }, { status: 201 })
}
