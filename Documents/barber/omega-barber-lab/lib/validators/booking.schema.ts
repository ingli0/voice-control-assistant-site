import { z } from 'zod'

export const bookingSchema = z.object({
  serviceId: z.string().uuid('Επιλέξτε υπηρεσία'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Μη έγκυρη ημερομηνία'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Μη έγκυρη ώρα'),
  customerName: z.string().min(2, 'Το όνομα πρέπει να έχει τουλάχιστον 2 χαρακτήρες').max(120),
  customerPhone: z
    .string()
    .regex(/^(69\d{8}|2\d{9})$/, 'Εισάγετε έγκυρο ελληνικό τηλέφωνο (π.χ. 6912345678)'),
  customerEmail: z.string().email('Μη έγκυρο email').optional().or(z.literal('')),
  notes: z.string().max(500).optional(),
  couponCode: z.string().optional(),
})

export type BookingSchema = z.infer<typeof bookingSchema>
