import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderEmail } from '@/lib/email/resend'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // Find appointments starting in 1h45m - 2h15m from now
  const from = new Date(now.getTime() + 105 * 60 * 1000)
  const to = new Date(now.getTime() + 135 * 60 * 1000)

  const fromTime = `${String(from.getHours()).padStart(2, '0')}:${String(from.getMinutes()).padStart(2, '0')}`
  const toTime = `${String(to.getHours()).padStart(2, '0')}:${String(to.getMinutes()).padStart(2, '0')}`

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_date', today)
    .in('status', ['pending', 'confirmed'])
    .is('reminder_2hr_sent_at', null)
    .not('customer_email', 'is', null)
    .gte('appointment_time', fromTime)
    .lte('appointment_time', toTime)

  let sent = 0
  let failed = 0

  for (const appt of appointments ?? []) {
    try {
      await sendReminderEmail({
        to: appt.customer_email,
        customerName: appt.customer_name,
        serviceName: appt.service_name,
        appointmentDate: appt.appointment_date,
        appointmentTime: appt.appointment_time,
        finalPrice: appt.final_price,
        appointmentId: appt.id,
      }, 'reminder_2hr')

      await supabase
        .from('appointments')
        .update({ reminder_2hr_sent_at: new Date().toISOString() })
        .eq('id', appt.id)

      sent++
    } catch (err) {
      console.error(`Failed to send 2hr reminder to ${appt.customer_email}:`, err)
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: (appointments ?? []).length })
}
