/**
 * Unit tests for the slot-generation and overlap-detection logic in lib/availability.ts.
 *
 * The DB-dependent `getAvailableSlots` function itself is not tested here because it
 * requires a live Supabase connection.  Instead we exercise the two pure algorithms
 * that drive it:
 *
 *   1. Slot generation — given open/close times and a service duration, produce the
 *      correct list of start-time strings.
 *   2. Overlap detection — the interval check that decides whether an incoming slot
 *      conflicts with an existing booking or break.
 *
 * Both algorithms are re-implemented inline as pure functions so we can test them
 * exhaustively without any mocking.
 */

import { timeToMinutes, minutesToTime } from '@/lib/utils'

// ─── Pure helpers (mirrors the logic in lib/availability.ts) ─────────────────

interface BookedSlot { appointment_time: string; end_time: string }
interface BreakSlot  { start_time: string; end_time: string }

function generateSlots(
  openTime: string,
  closeTime: string,
  serviceDuration: number,
  bookedSlots: BookedSlot[] = [],
  breaks: BreakSlot[] = [],
): string[] {
  const openMins  = timeToMinutes(openTime)
  const closeMins = timeToMinutes(closeTime)
  const slotInterval = 30

  const slots: string[] = []

  for (let t = openMins; t + serviceDuration <= closeMins; t += slotInterval) {
    const slotStart = t
    const slotEnd   = t + serviceDuration

    const isBooked = bookedSlots.some((b) => {
      const bStart = timeToMinutes(b.appointment_time)
      const bEnd   = timeToMinutes(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    })

    const isBreak = breaks.some((b) => {
      const bStart = timeToMinutes(b.start_time)
      const bEnd   = timeToMinutes(b.end_time)
      return slotStart < bEnd && slotEnd > bStart
    })

    if (!isBooked && !isBreak) {
      slots.push(minutesToTime(slotStart))
    }
  }

  return slots
}

// ─── Slot generation ─────────────────────────────────────────────────────────

describe('generateSlots – basic generation', () => {
  it('produces slots from open to close every 30 minutes', () => {
    const slots = generateSlots('09:00', '11:00', 30)
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30'])
  })

  it('does not produce a slot that would overrun close time', () => {
    // 30-min service, opens 09:00, closes 09:45 → only 09:00 and 09:30 fit (09:30+30=10:00 > 09:45)
    const slots = generateSlots('09:00', '09:45', 30)
    expect(slots).toEqual(['09:00'])
  })

  it('allows a slot that ends exactly at close time', () => {
    const slots = generateSlots('09:00', '09:30', 30)
    expect(slots).toEqual(['09:00'])
  })

  it('returns empty array when the shop does not have enough time for even one slot', () => {
    const slots = generateSlots('09:00', '09:29', 30)
    expect(slots).toEqual([])
  })

  it('generates correct slots for a 60-minute service', () => {
    const slots = generateSlots('09:00', '12:00', 60)
    expect(slots).toEqual(['09:00', '09:30', '10:00', '10:30', '11:00'])
  })

  it('generates correct slots for a 45-minute service', () => {
    const slots = generateSlots('09:00', '11:00', 45)
    // 09:00+45=09:45 ✓  09:30+45=10:15 ✓  10:00+45=10:45 ✓  10:30+45=11:15 ✗
    expect(slots).toEqual(['09:00', '09:30', '10:00'])
  })
})

// ─── Overlap detection – booked appointments ─────────────────────────────────

describe('generateSlots – booked appointment conflicts', () => {
  it('removes the exact slot that matches a booking', () => {
    const booked: BookedSlot[] = [{ appointment_time: '10:00', end_time: '10:30' }]
    const slots = generateSlots('09:00', '12:00', 30, booked)
    expect(slots).not.toContain('10:00')
  })

  it('keeps unaffected slots around the booking', () => {
    const booked: BookedSlot[] = [{ appointment_time: '10:00', end_time: '10:30' }]
    const slots = generateSlots('09:00', '12:00', 30, booked)
    expect(slots).toContain('09:30')
    expect(slots).toContain('10:30')
  })

  it('blocks a slot whose service would overlap the start of a booking', () => {
    // 30-min service at 09:30 ends 10:00; booking starts 09:45 ends 10:15 → overlap
    const booked: BookedSlot[] = [{ appointment_time: '09:45', end_time: '10:15' }]
    const slots = generateSlots('09:00', '12:00', 30, booked)
    expect(slots).not.toContain('09:30')
  })

  it('blocks a slot that starts inside an existing booking', () => {
    // 30-min service at 10:15 starts inside 10:00-10:30 booking → overlap
    // (10:15 is not a multiple of our 30-min interval, but 10:00 is)
    const booked: BookedSlot[] = [{ appointment_time: '10:00', end_time: '10:45' }]
    const slots = generateSlots('09:00', '12:00', 30, booked)
    // 10:00 overlaps (slotEnd 10:30 > bookedStart 10:00 AND slotStart 10:00 < bookedEnd 10:45) ✗
    expect(slots).not.toContain('10:00')
    // 10:30: slotStart 10:30 < bookedEnd 10:45 AND slotEnd 11:00 > bookedStart 10:00 → ✗
    expect(slots).not.toContain('10:30')
    // 11:00: slotStart 11:00 is NOT < 10:45 → ✓
    expect(slots).toContain('11:00')
  })

  it('allows a slot that ends exactly when a booking starts (no overlap)', () => {
    // slot 09:00-09:30, booking 09:30-10:00 → 09:00 < 10:00 AND 09:30 > 09:30? No → no overlap
    const booked: BookedSlot[] = [{ appointment_time: '09:30', end_time: '10:00' }]
    const slots = generateSlots('09:00', '12:00', 30, booked)
    expect(slots).toContain('09:00')
  })

  it('allows a slot that starts exactly when a booking ends (no overlap)', () => {
    const booked: BookedSlot[] = [{ appointment_time: '09:00', end_time: '09:30' }]
    const slots = generateSlots('09:00', '12:00', 30, booked)
    expect(slots).toContain('09:30')
  })

  it('handles multiple bookings', () => {
    const booked: BookedSlot[] = [
      { appointment_time: '09:00', end_time: '09:30' },
      { appointment_time: '10:30', end_time: '11:00' },
    ]
    const slots = generateSlots('09:00', '12:00', 30, booked)
    expect(slots).not.toContain('09:00')
    expect(slots).not.toContain('10:30')
    expect(slots).toContain('09:30')
    expect(slots).toContain('10:00')
    expect(slots).toContain('11:00')
  })
})

// ─── Overlap detection – breaks ───────────────────────────────────────────────

describe('generateSlots – break conflicts', () => {
  it('removes slots that overlap a break', () => {
    const breaks: BreakSlot[] = [{ start_time: '13:00', end_time: '14:00' }]
    const slots = generateSlots('09:00', '18:00', 30, [], breaks)
    expect(slots).not.toContain('13:00')
    expect(slots).not.toContain('13:30')
    expect(slots).toContain('12:30')
    expect(slots).toContain('14:00')
  })

  it('handles a 45-minute service being blocked by a 30-minute break', () => {
    // Break 12:30-13:00; a 45-min slot at 12:00 ends 12:45 → overlaps break
    const breaks: BreakSlot[] = [{ start_time: '12:30', end_time: '13:00' }]
    const slots = generateSlots('09:00', '18:00', 45, [], breaks)
    expect(slots).not.toContain('12:00') // 12:00+45=12:45 > 12:30
    expect(slots).toContain('13:00')     // 13:00+45=13:45, not < 13:00
  })
})

// ─── Combined bookings + breaks ───────────────────────────────────────────────

describe('generateSlots – combined constraints', () => {
  it('correctly removes both booked and break slots', () => {
    const booked: BookedSlot[] = [{ appointment_time: '09:00', end_time: '09:30' }]
    const breaks: BreakSlot[]  = [{ start_time: '11:00', end_time: '11:30' }]
    const slots = generateSlots('09:00', '12:00', 30, booked, breaks)
    expect(slots).not.toContain('09:00')
    expect(slots).not.toContain('11:00')
    expect(slots).toContain('09:30')
    expect(slots).toContain('10:30')
    expect(slots).toContain('11:30')
  })
})
