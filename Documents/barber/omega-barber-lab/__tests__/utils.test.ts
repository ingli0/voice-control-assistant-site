import {
  formatPrice,
  formatTime,
  formatDate,
  formatDateTime,
  addMinutesToTime,
  timeToMinutes,
  minutesToTime,
  dayOfWeekName,
  statusLabel,
  statusColor,
  cn,
} from '@/lib/utils'

// ─── formatPrice ──────────────────────────────────────────────────────────────

describe('formatPrice', () => {
  it('formats a whole euro amount', () => {
    expect(formatPrice(15)).toBe('15,00 €')
  })

  it('formats a decimal amount', () => {
    expect(formatPrice(12.5)).toBe('12,50 €')
  })

  it('formats zero', () => {
    expect(formatPrice(0)).toBe('0,00 €')
  })

  it('formats thousands with dot separator', () => {
    expect(formatPrice(1500)).toBe('1.500,00 €')
  })

  it('formats negative amounts', () => {
    expect(formatPrice(-5)).toBe('-5,00 €')
  })

  it('is deterministic — same output on every call', () => {
    expect(formatPrice(25)).toBe(formatPrice(25))
  })
})

// ─── formatTime ───────────────────────────────────────────────────────────────

describe('formatTime', () => {
  it('returns HH:MM from HH:MM:SS', () => {
    expect(formatTime('09:30:00')).toBe('09:30')
  })

  it('returns HH:MM unchanged when already 5 chars', () => {
    expect(formatTime('14:00')).toBe('14:00')
  })

  it('handles midnight', () => {
    expect(formatTime('00:00:00')).toBe('00:00')
  })

  it('handles end-of-day', () => {
    expect(formatTime('21:59:59')).toBe('21:59')
  })
})

// ─── formatDate ───────────────────────────────────────────────────────────────

describe('formatDate', () => {
  it('formats a known date in Greek long format', () => {
    // 2024-06-01 → "1 Ιουνίου 2024"
    const result = formatDate('2024-06-01')
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/1/)
  })

  it('includes the year', () => {
    expect(formatDate('2025-12-25')).toMatch(/2025/)
  })
})

// ─── formatDateTime ──────────────────────────────────────────────────────────

describe('formatDateTime', () => {
  it('contains both the date and time parts', () => {
    const result = formatDateTime('2024-06-01', '10:30:00')
    expect(result).toMatch(/2024/)
    expect(result).toMatch(/10:30/)
  })

  it('joins with "στις"', () => {
    const result = formatDateTime('2024-06-01', '09:00:00')
    expect(result).toContain('στις')
  })
})

// ─── addMinutesToTime ─────────────────────────────────────────────────────────

describe('addMinutesToTime', () => {
  it('adds 30 minutes to a time', () => {
    expect(addMinutesToTime('10:00', 30)).toBe('10:30')
  })

  it('carries over to the next hour', () => {
    expect(addMinutesToTime('10:45', 30)).toBe('11:15')
  })

  it('handles zero minutes added', () => {
    expect(addMinutesToTime('14:30', 0)).toBe('14:30')
  })

  it('adds service durations correctly (45 min)', () => {
    expect(addMinutesToTime('09:00', 45)).toBe('09:45')
  })

  it('adds service durations crossing the hour (60 min)', () => {
    expect(addMinutesToTime('09:30', 60)).toBe('10:30')
  })

  it('adds service durations crossing the hour (90 min)', () => {
    expect(addMinutesToTime('10:30', 90)).toBe('12:00')
  })

  it('handles end of business day', () => {
    expect(addMinutesToTime('20:30', 30)).toBe('21:00')
  })
})

// ─── timeToMinutes ────────────────────────────────────────────────────────────

describe('timeToMinutes', () => {
  it('converts 00:00 to 0', () => {
    expect(timeToMinutes('00:00')).toBe(0)
  })

  it('converts 01:00 to 60', () => {
    expect(timeToMinutes('01:00')).toBe(60)
  })

  it('converts 09:30 correctly', () => {
    expect(timeToMinutes('09:30')).toBe(9 * 60 + 30)
  })

  it('converts 21:00 correctly', () => {
    expect(timeToMinutes('21:00')).toBe(21 * 60)
  })

  it('converts 10:15 correctly', () => {
    expect(timeToMinutes('10:15')).toBe(615)
  })
})

// ─── minutesToTime ────────────────────────────────────────────────────────────

describe('minutesToTime', () => {
  it('converts 0 to 00:00', () => {
    expect(minutesToTime(0)).toBe('00:00')
  })

  it('converts 60 to 01:00', () => {
    expect(minutesToTime(60)).toBe('01:00')
  })

  it('converts 570 to 09:30', () => {
    expect(minutesToTime(570)).toBe('09:30')
  })

  it('converts 1260 to 21:00', () => {
    expect(minutesToTime(1260)).toBe('21:00')
  })

  it('is inverse of timeToMinutes', () => {
    const times = ['08:00', '09:30', '12:00', '14:45', '18:00', '21:00']
    times.forEach((t) => {
      expect(minutesToTime(timeToMinutes(t))).toBe(t)
    })
  })
})

// ─── dayOfWeekName ────────────────────────────────────────────────────────────

describe('dayOfWeekName', () => {
  it('returns Κυριακή for 0', () => {
    expect(dayOfWeekName(0)).toBe('Κυριακή')
  })

  it('returns Δευτέρα for 1', () => {
    expect(dayOfWeekName(1)).toBe('Δευτέρα')
  })

  it('returns Σάββατο for 6', () => {
    expect(dayOfWeekName(6)).toBe('Σάββατο')
  })

  it('returns all 7 distinct values', () => {
    const names = Array.from({ length: 7 }, (_, i) => dayOfWeekName(i))
    expect(new Set(names).size).toBe(7)
  })
})

// ─── statusLabel ─────────────────────────────────────────────────────────────

describe('statusLabel', () => {
  it('returns Greek label for pending', () => {
    expect(statusLabel('pending')).toBe('Εκκρεμεί')
  })

  it('returns Greek label for confirmed', () => {
    expect(statusLabel('confirmed')).toBe('Επιβεβαιωμένο')
  })

  it('returns Greek label for cancelled', () => {
    expect(statusLabel('cancelled')).toBe('Ακυρωμένο')
  })

  it('returns Greek label for completed', () => {
    expect(statusLabel('completed')).toBe('Ολοκληρωμένο')
  })

  it('returns Greek label for no_show', () => {
    expect(statusLabel('no_show')).toBe('Δεν εμφανίστηκε')
  })

  it('falls back to the raw value for unknown statuses', () => {
    expect(statusLabel('unknown_status')).toBe('unknown_status')
  })
})

// ─── statusColor ─────────────────────────────────────────────────────────────

describe('statusColor', () => {
  it('returns amber for pending', () => {
    expect(statusColor('pending')).toBe('amber')
  })

  it('returns green for confirmed', () => {
    expect(statusColor('confirmed')).toBe('green')
  })

  it('returns red for cancelled', () => {
    expect(statusColor('cancelled')).toBe('red')
  })

  it('returns blue for completed', () => {
    expect(statusColor('completed')).toBe('blue')
  })

  it('returns gray for no_show', () => {
    expect(statusColor('no_show')).toBe('gray')
  })

  it('defaults to gray for unknown', () => {
    expect(statusColor('whatever')).toBe('gray')
  })
})

// ─── cn (classname merger) ────────────────────────────────────────────────────

describe('cn', () => {
  it('merges class strings', () => {
    expect(cn('a', 'b')).toBe('a b')
  })

  it('deduplicates conflicting tailwind classes (last wins)', () => {
    // tailwind-merge keeps the last conflicting utility
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('ignores falsy values', () => {
    expect(cn('a', false && 'b', undefined, 'c')).toBe('a c')
  })

  it('handles conditional objects', () => {
    expect(cn({ 'font-bold': true, 'hidden': false })).toBe('font-bold')
  })
})
