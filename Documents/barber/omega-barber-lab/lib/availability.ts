import { createClient } from '@/lib/supabase/server'
import { timeToMinutes, minutesToTime } from '@/lib/utils'

interface Slot {
  time: string
  available: boolean
}

export async function getAvailableSlots(
  date: string,
  serviceDuration: number
): Promise<string[]> {
  const supabase = await createClient()

  // Get day of week (0=Sun, 1=Mon ... 6=Sat)
  const dateObj = new Date(date + 'T12:00:00')
  const dayOfWeek = dateObj.getDay()

  // Get working hours for this day
  const { data: hours } = await supabase
    .from('working_hours')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!hours || !hours.is_open || !hours.open_time || !hours.close_time) {
    return []
  }

  // Get booked slots for this date
  const { data: bookedSlots } = await supabase
    .from('appointments')
    .select('appointment_time, end_time')
    .eq('appointment_date', date)
    .not('status', 'in', '("cancelled")')

  // Get breaks for this date
  const { data: breaks } = await supabase
    .from('breaks')
    .select('start_time, end_time')
    .eq('break_date', date)

  const openMins = timeToMinutes(hours.open_time)
  const closeMins = timeToMinutes(hours.close_time)
  const slotInterval = 30 // minutes between slots

  const slots: string[] = []
  const now = new Date()
  const isToday = date === now.toISOString().split('T')[0]

  for (let t = openMins; t + serviceDuration <= closeMins; t += slotInterval) {
    const slotStart = t
    const slotEnd = t + serviceDuration

    // Skip past slots (with 30-min buffer for today)
    if (isToday) {
      const currentMins = now.getHours() * 60 + now.getMinutes() + 30
      if (slotStart < currentMins) continue
    }

    // Check against booked appointments
    const isBooked = (bookedSlots ?? []).some((booked) => {
      const bookedStart = timeToMinutes(booked.appointment_time)
      const bookedEnd = timeToMinutes(booked.end_time)
      return slotStart < bookedEnd && slotEnd > bookedStart
    })

    // Check against breaks
    const isBreak = (breaks ?? []).some((b) => {
      const breakStart = timeToMinutes(b.start_time)
      const breakEnd = timeToMinutes(b.end_time)
      return slotStart < breakEnd && slotEnd > breakStart
    })

    if (!isBooked && !isBreak) {
      slots.push(minutesToTime(slotStart))
    }
  }

  return slots
}
