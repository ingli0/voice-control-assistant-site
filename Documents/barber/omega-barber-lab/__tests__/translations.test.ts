import { getT } from '@/lib/i18n/translations'

const el = getT('el')
const en = getT('en')

// ─── getT returns the right locale ───────────────────────────────────────────

describe('getT', () => {
  it('returns Greek strings for "el"', () => {
    expect(el.nav.bookCta).toBe('Κλείσε Ραντεβού')
  })

  it('returns English strings for "en"', () => {
    expect(en.nav.bookCta).toBe('Book Appointment')
  })
})

// ─── Both locales have identical top-level keys ───────────────────────────────

describe('translations – key parity', () => {
  const topLevelKeys = ['nav', 'hero', 'stats', 'about', 'services', 'why', 'testimonials', 'cta', 'footer', 'booking'] as const

  it.each(topLevelKeys)('both locales have the "%s" section', (key) => {
    expect(el[key]).toBeDefined()
    expect(en[key]).toBeDefined()
  })
})

// ─── nav ─────────────────────────────────────────────────────────────────────

describe('translations – nav', () => {
  it('both locales have services, booking, bookCta', () => {
    (['services', 'booking', 'bookCta'] as const).forEach((k) => {
      expect(el.nav[k]).toBeTruthy()
      expect(en.nav[k]).toBeTruthy()
    })
  })
})

// ─── hero ────────────────────────────────────────────────────────────────────

describe('translations – hero', () => {
  const heroKeys = ['eyebrow', 'h1a', 'h1b', 'h1accent', 'h1c', 'h1end', 'sub', 'cta', 'ctaSec', 'scroll', 'side'] as const

  it.each(heroKeys)('both locales have hero.%s', (key) => {
    expect(el.hero[key]).toBeTruthy()
    expect(en.hero[key]).toBeTruthy()
  })
})

// ─── stats ───────────────────────────────────────────────────────────────────

describe('translations – stats', () => {
  it('both locales have 4 stat entries', () => {
    expect(el.stats).toHaveLength(4)
    expect(en.stats).toHaveLength(4)
  })

  it('every stat entry has a value and a label', () => {
    ;[...el.stats, ...en.stats].forEach((stat) => {
      expect(stat.value).toBeTruthy()
      expect(stat.label).toBeTruthy()
    })
  })
})

// ─── about ───────────────────────────────────────────────────────────────────

describe('translations – about', () => {
  it('both locales have exactly 3 bullet points', () => {
    expect(el.about.points).toHaveLength(3)
    expect(en.about.points).toHaveLength(3)
  })
})

// ─── why ─────────────────────────────────────────────────────────────────────

describe('translations – why', () => {
  it('both locales have 5 why-items', () => {
    expect(el.why.items).toHaveLength(5)
    expect(en.why.items).toHaveLength(5)
  })

  it('every why-item has title and desc', () => {
    ;[...el.why.items, ...en.why.items].forEach((item) => {
      expect(item.title).toBeTruthy()
      expect(item.desc).toBeTruthy()
    })
  })
})

// ─── testimonials ────────────────────────────────────────────────────────────

describe('translations – testimonials', () => {
  it('both locales have 6 testimonials', () => {
    expect(el.testimonials.items).toHaveLength(6)
    expect(en.testimonials.items).toHaveLength(6)
  })

  it('every testimonial has a name and text', () => {
    ;[...el.testimonials.items, ...en.testimonials.items].forEach((t) => {
      expect(t.name).toBeTruthy()
      expect(t.text).toBeTruthy()
    })
  })
})

// ─── footer ──────────────────────────────────────────────────────────────────

describe('translations – footer', () => {
  it('both locales have 3 nav links', () => {
    expect(el.footer.navLinks).toHaveLength(3)
    expect(en.footer.navLinks).toHaveLength(3)
  })

  it('both locales have 4 hours rows', () => {
    expect(el.footer.hoursRows).toHaveLength(4)
    expect(en.footer.hoursRows).toHaveLength(4)
  })

  it('nav links have href and label', () => {
    ;[...el.footer.navLinks, ...en.footer.navLinks].forEach((link) => {
      expect(link.href).toBeTruthy()
      expect(link.label).toBeTruthy()
    })
  })
})

// ─── booking ─────────────────────────────────────────────────────────────────

describe('translations – booking', () => {
  it('both locales have exactly 4 step labels', () => {
    expect(el.booking.steps).toHaveLength(4)
    expect(en.booking.steps).toHaveLength(4)
  })

  it('booking section has no function values (serializable for Server→Client props)', () => {
    function hasFunction(obj: unknown): boolean {
      if (typeof obj === 'function') return true
      if (Array.isArray(obj)) return obj.some(hasFunction)
      if (obj !== null && typeof obj === 'object') {
        return Object.values(obj as Record<string, unknown>).some(hasFunction)
      }
      return false
    }
    expect(hasFunction(el.booking)).toBe(false)
    expect(hasFunction(en.booking)).toBe(false)
  })

  const step3Keys = ['h2', 'name', 'namePh', 'phone', 'phonePh', 'phoneHint', 'email', 'emailPh',
    'emailHint', 'notes', 'notesPh', 'coupon', 'couponPh', 'couponBtn', 'next',
    'couponValidPrefix', 'couponValidMid', 'couponValidSuffix', 'couponInvalid'] as const

  it.each(step3Keys)('both locales have booking.step3.%s', (key) => {
    expect(el.booking.step3[key]).toBeDefined()
    expect(en.booking.step3[key]).toBeDefined()
  })

  const step4Keys = ['h2', 'service', 'date', 'time', 'customer', 'phone', 'email',
    'price', 'discount', 'total', 'submitPrefix', 'cancel'] as const

  it.each(step4Keys)('both locales have booking.step4.%s', (key) => {
    expect(el.booking.step4[key]).toBeDefined()
    expect(en.booking.step4[key]).toBeDefined()
  })

  const successKeys = ['h2', 'msgFor', 'msgAt', 'msgDone', 'emailSentPrefix', 'newBtn'] as const

  it.each(successKeys)('both locales have booking.success.%s', (key) => {
    expect(el.booking.success[key]).toBeDefined()
    expect(en.booking.success[key]).toBeDefined()
  })
})

// ─── no empty strings ─────────────────────────────────────────────────────────

describe('translations – no empty string values', () => {
  function collectStrings(obj: unknown, path = ''): Array<{ path: string; value: string }> {
    if (typeof obj === 'string') return [{ path, value: obj }]
    if (Array.isArray(obj)) return obj.flatMap((v, i) => collectStrings(v, `${path}[${i}]`))
    if (obj !== null && typeof obj === 'object') {
      return Object.entries(obj as Record<string, unknown>).flatMap(([k, v]) =>
        collectStrings(v, path ? `${path}.${k}` : k)
      )
    }
    return []
  }

  it('el has no empty string values', () => {
    const empties = collectStrings(el).filter((e) => e.value === '')
    expect(empties).toHaveLength(0)
  })

  it('en has no empty string values', () => {
    const empties = collectStrings(en).filter((e) => e.value === '')
    expect(empties).toHaveLength(0)
  })
})
