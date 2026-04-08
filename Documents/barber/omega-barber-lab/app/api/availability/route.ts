import { NextRequest, NextResponse } from 'next/server'
import { getAvailableSlots } from '@/lib/availability'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const date = searchParams.get('date')
  const duration = parseInt(searchParams.get('duration') ?? '30')

  if (!date) {
    return NextResponse.json({ error: 'date required' }, { status: 400 })
  }

  try {
    const slots = await getAvailableSlots(date, duration)
    return NextResponse.json({ slots })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to get availability' }, { status: 500 })
  }
}
