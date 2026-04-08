import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  const { code, price } = await request.json()
  if (!code) return NextResponse.json({ valid: false, error: 'Εισάγετε κωδικό' }, { status: 400 })

  const supabase = await createClient()
  const { data: coupon } = await supabase
    .from('discounts')
    .select('*')
    .ilike('code', code.trim())
    .eq('is_active', true)
    .single()

  if (!coupon) return NextResponse.json({ valid: false, error: 'Μη έγκυρος κωδικός κουπονιού' })

  const today = new Date().toISOString().split('T')[0]
  if (coupon.valid_from && today < coupon.valid_from) {
    return NextResponse.json({ valid: false, error: 'Το κουπόνι δεν είναι ακόμα ενεργό' })
  }
  if (coupon.valid_until && today > coupon.valid_until) {
    return NextResponse.json({ valid: false, error: 'Το κουπόνι έχει λήξει' })
  }
  if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, error: 'Το κουπόνι έχει εξαντληθεί' })
  }
  if (coupon.min_order && price < coupon.min_order) {
    return NextResponse.json({ valid: false, error: `Απαιτείται ελάχιστη παραγγελία ${coupon.min_order}€` })
  }

  const discountAmount = coupon.type === 'percentage'
    ? Math.round(price * coupon.value * 100) / 10000
    : Math.min(coupon.value, price)
  const finalPrice = price - discountAmount

  return NextResponse.json({
    valid: true,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    description: coupon.description ?? coupon.code,
  })
}
