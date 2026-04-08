import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { bookingSchema } from '@/lib/validators/booking.schema'
import { addMinutesToTime } from '@/lib/utils'
import { sendConfirmationEmail } from '@/lib/email/resend'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = bookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 })
    }

    const { serviceId, appointmentDate, appointmentTime, customerName, customerPhone, customerEmail, notes, couponCode } = parsed.data
    const supabase = await createClient()

    // Get service
    const { data: service } = await supabase.from('services').select('*').eq('id', serviceId).single()
    if (!service) return NextResponse.json({ error: 'Η υπηρεσία δεν βρέθηκε' }, { status: 404 })
    if (!service.is_active) return NextResponse.json({ error: 'Η υπηρεσία δεν είναι διαθέσιμη' }, { status: 400 })

    // Validate slot availability server-side
    const endTime = addMinutesToTime(appointmentTime, service.duration)

    // True overlap check: existing starts before new ends AND existing ends after new starts
    const { data: conflict } = await supabase
      .from('appointments')
      .select('id')
      .eq('appointment_date', appointmentDate)
      .not('status', 'in', '("cancelled")')
      .lt('appointment_time', endTime)    // existing starts before new slot ends
      .gt('end_time', appointmentTime)    // existing ends after new slot starts
      .limit(1)

    if (conflict && conflict.length > 0) {
      return NextResponse.json({ error: 'Η ώρα δεν είναι πλέον διαθέσιμη. Παρακαλούμε επιλέξτε άλλη.' }, { status: 409 })
    }

    // Validate coupon if provided
    let discountId: string | null = null
    let discountAmount: number | null = null
    let finalPrice = service.price

    if (couponCode) {
      const { data: coupon } = await supabase
        .from('discounts')
        .select('*')
        .ilike('code', couponCode)
        .eq('is_active', true)
        .single()

      if (coupon) {
        const today = new Date().toISOString().split('T')[0]
        const validFrom = coupon.valid_from ?? '2000-01-01'
        const validUntil = coupon.valid_until ?? '2099-12-31'
        const underMaxUses = !coupon.max_uses || coupon.uses_count < coupon.max_uses
        const minOk = !coupon.min_order || service.price >= coupon.min_order

        if (today >= validFrom && today <= validUntil && underMaxUses && minOk) {
          discountId = coupon.id
          if (coupon.type === 'percentage') {
            discountAmount = Math.round(service.price * coupon.value) / 100
          } else {
            discountAmount = Math.min(coupon.value, service.price)
          }
          finalPrice = service.price - discountAmount
        }
      }
    }

    // Insert appointment
    const { data: appointment, error: insertError } = await supabase
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
        status: 'pending',
        discount_id: discountId,
        discount_amount: discountAmount,
        final_price: finalPrice,
        created_by: 'customer',
      })
      .select()
      .single()

    if (insertError) {
      if (insertError.code === '23505') {
        return NextResponse.json({ error: 'Η ώρα δεν είναι πλέον διαθέσιμη.' }, { status: 409 })
      }
      throw insertError
    }

    // Increment coupon usage
    if (discountId) {
      await supabase.rpc('increment_discount_uses', { discount_id: discountId })
    }

    // Send confirmation email
    if (customerEmail) {
      try {
        await sendConfirmationEmail({
          to: customerEmail,
          customerName,
          serviceName: service.name,
          appointmentDate,
          appointmentTime,
          finalPrice,
          appointmentId: appointment.id,
        })
        await supabase
          .from('appointments')
          .update({ confirmation_sent_at: new Date().toISOString() })
          .eq('id', appointment.id)
      } catch (emailErr) {
        console.error('Email send failed:', emailErr)
      }
    }

    return NextResponse.json({ appointment, message: 'Το ραντεβού κλείστηκε επιτυχώς!' }, { status: 201 })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Σφάλμα κατά την κράτηση. Δοκιμάστε ξανά.' }, { status: 500 })
  }
}
