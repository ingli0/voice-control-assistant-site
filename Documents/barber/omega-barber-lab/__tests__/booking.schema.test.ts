import { bookingSchema } from '@/lib/validators/booking.schema'

const VALID: Parameters<typeof bookingSchema.parse>[0] = {
  serviceId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  appointmentDate: '2025-06-15',
  appointmentTime: '10:00',
  customerName: 'Γιώργος Παπαδόπουλος',
  customerPhone: '6912345678',
  customerEmail: 'test@example.com',
  notes: 'Παρακαλώ να είμαι εγκαίρως',
  couponCode: 'SUMMER25',
}

function parse(data: unknown) {
  return bookingSchema.safeParse(data)
}

// ─── serviceId ────────────────────────────────────────────────────────────────

describe('bookingSchema – serviceId', () => {
  it('accepts a valid UUID', () => {
    expect(parse(VALID).success).toBe(true)
  })

  it('rejects a non-UUID string', () => {
    expect(parse({ ...VALID, serviceId: 'not-a-uuid' }).success).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(parse({ ...VALID, serviceId: '' }).success).toBe(false)
  })

  it('rejects missing serviceId', () => {
    const { serviceId: _, ...rest } = VALID
    expect(parse(rest).success).toBe(false)
  })
})

// ─── appointmentDate ─────────────────────────────────────────────────────────

describe('bookingSchema – appointmentDate', () => {
  it('accepts YYYY-MM-DD format', () => {
    expect(parse({ ...VALID, appointmentDate: '2025-01-01' }).success).toBe(true)
  })

  it('rejects DD/MM/YYYY format', () => {
    expect(parse({ ...VALID, appointmentDate: '15/06/2025' }).success).toBe(false)
  })

  it('rejects partial date', () => {
    expect(parse({ ...VALID, appointmentDate: '2025-06' }).success).toBe(false)
  })

  it('rejects empty string', () => {
    expect(parse({ ...VALID, appointmentDate: '' }).success).toBe(false)
  })
})

// ─── appointmentTime ─────────────────────────────────────────────────────────

describe('bookingSchema – appointmentTime', () => {
  it('accepts HH:MM format', () => {
    expect(parse({ ...VALID, appointmentTime: '09:30' }).success).toBe(true)
  })

  it('rejects HH:MM:SS format', () => {
    // schema expects exactly HH:MM (5 chars matching ^\d{2}:\d{2}$)
    expect(parse({ ...VALID, appointmentTime: '09:30:00' }).success).toBe(false)
  })

  it('rejects time without leading zero', () => {
    expect(parse({ ...VALID, appointmentTime: '9:30' }).success).toBe(false)
  })

  it('rejects empty string', () => {
    expect(parse({ ...VALID, appointmentTime: '' }).success).toBe(false)
  })
})

// ─── customerName ─────────────────────────────────────────────────────────────

describe('bookingSchema – customerName', () => {
  it('accepts a normal name', () => {
    expect(parse({ ...VALID, customerName: 'Γιώργος' }).success).toBe(true)
  })

  it('accepts exactly 2 characters (minimum)', () => {
    expect(parse({ ...VALID, customerName: 'AB' }).success).toBe(true)
  })

  it('rejects a single character name', () => {
    expect(parse({ ...VALID, customerName: 'A' }).success).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(parse({ ...VALID, customerName: '' }).success).toBe(false)
  })

  it('rejects a name longer than 120 characters', () => {
    expect(parse({ ...VALID, customerName: 'A'.repeat(121) }).success).toBe(false)
  })

  it('accepts exactly 120 characters', () => {
    expect(parse({ ...VALID, customerName: 'A'.repeat(120) }).success).toBe(true)
  })
})

// ─── customerPhone ────────────────────────────────────────────────────────────

describe('bookingSchema – customerPhone', () => {
  it('accepts a valid Greek mobile (69…)', () => {
    expect(parse({ ...VALID, customerPhone: '6912345678' }).success).toBe(true)
  })

  it('accepts a valid Greek landline (2…)', () => {
    expect(parse({ ...VALID, customerPhone: '2510123456' }).success).toBe(true)
  })

  it('rejects a number with +30 prefix', () => {
    expect(parse({ ...VALID, customerPhone: '+306912345678' }).success).toBe(false)
  })

  it('rejects a number starting with 7', () => {
    expect(parse({ ...VALID, customerPhone: '7012345678' }).success).toBe(false)
  })

  it('rejects a number that is too short', () => {
    expect(parse({ ...VALID, customerPhone: '691234567' }).success).toBe(false)
  })

  it('rejects a number that is too long', () => {
    expect(parse({ ...VALID, customerPhone: '69123456789' }).success).toBe(false)
  })

  it('rejects an empty string', () => {
    expect(parse({ ...VALID, customerPhone: '' }).success).toBe(false)
  })
})

// ─── customerEmail ────────────────────────────────────────────────────────────

describe('bookingSchema – customerEmail', () => {
  it('accepts a valid email', () => {
    expect(parse({ ...VALID, customerEmail: 'user@example.com' }).success).toBe(true)
  })

  it('accepts an empty string (optional field)', () => {
    expect(parse({ ...VALID, customerEmail: '' }).success).toBe(true)
  })

  it('accepts when omitted entirely', () => {
    const { customerEmail: _, ...rest } = VALID
    expect(parse(rest).success).toBe(true)
  })

  it('rejects a malformed email', () => {
    expect(parse({ ...VALID, customerEmail: 'not-an-email' }).success).toBe(false)
  })

  it('rejects email without domain', () => {
    expect(parse({ ...VALID, customerEmail: 'user@' }).success).toBe(false)
  })
})

// ─── notes ───────────────────────────────────────────────────────────────────

describe('bookingSchema – notes', () => {
  it('accepts notes within 500 characters', () => {
    expect(parse({ ...VALID, notes: 'A'.repeat(500) }).success).toBe(true)
  })

  it('rejects notes over 500 characters', () => {
    expect(parse({ ...VALID, notes: 'A'.repeat(501) }).success).toBe(false)
  })

  it('accepts empty notes', () => {
    expect(parse({ ...VALID, notes: '' }).success).toBe(true)
  })

  it('accepts when omitted', () => {
    const { notes: _, ...rest } = VALID
    expect(parse(rest).success).toBe(true)
  })
})

// ─── couponCode ───────────────────────────────────────────────────────────────

describe('bookingSchema – couponCode', () => {
  it('accepts a coupon code', () => {
    expect(parse({ ...VALID, couponCode: 'PROMO10' }).success).toBe(true)
  })

  it('accepts when omitted', () => {
    const { couponCode: _, ...rest } = VALID
    expect(parse(rest).success).toBe(true)
  })

  it('accepts empty string', () => {
    expect(parse({ ...VALID, couponCode: '' }).success).toBe(true)
  })
})

// ─── full valid payload ───────────────────────────────────────────────────────

describe('bookingSchema – complete payloads', () => {
  it('parses a complete valid booking', () => {
    const result = parse(VALID)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.customerName).toBe(VALID.customerName)
      expect(result.data.serviceId).toBe(VALID.serviceId)
      expect(result.data.appointmentDate).toBe(VALID.appointmentDate)
      expect(result.data.appointmentTime).toBe(VALID.appointmentTime)
    }
  })

  it('parses a minimal valid booking (no email, notes, or coupon)', () => {
    const minimal = {
      serviceId: VALID.serviceId,
      appointmentDate: VALID.appointmentDate,
      appointmentTime: VALID.appointmentTime,
      customerName: VALID.customerName,
      customerPhone: VALID.customerPhone,
    }
    expect(parse(minimal).success).toBe(true)
  })
})
