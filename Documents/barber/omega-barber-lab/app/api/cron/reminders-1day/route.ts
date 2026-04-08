import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderEmail } from '@/lib/email/resend'

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  const { data: appointments } = await supabase
    .from('appointments')
    .select('*')
    .eq('appointment_date', tomorrowStr)
    .in('status', ['pending', 'confirmed'])
    .is('reminder_1day_sent_at', null)
    .not('customer_email', 'is', null)

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
      }, 'reminder_1day')

      await supabase
        .from('appointments')
        .update({ reminder_1day_sent_at: new Date().toISOString() })
        .eq('id', appt.id)

      await supabase.from('email_logs').insert({
        appointment_id: appt.id,
        type: 'reminder_1day',
        recipient_email: appt.customer_email,
        recipient_name: appt.customer_name,
        subject: 'Υπενθύμιση ραντεβού αύριο - Omega Barber Lab',
        status: 'sent',
      })

      sent++
    } catch (err) {
      console.error(`Failed to send reminder to ${appt.customer_email}:`, err)
      failed++
    }
  }

  return NextResponse.json({ sent, failed, total: (appointments ?? []).length })
}
