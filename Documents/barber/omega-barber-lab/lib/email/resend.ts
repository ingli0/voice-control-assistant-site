import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

const FROM = `${process.env.RESEND_FROM_NAME ?? 'Omega Barber Lab'} <${process.env.RESEND_FROM_EMAIL ?? 'info@omegabarberlab.gr'}>`

export interface AppointmentEmailData {
  to: string
  customerName: string
  serviceName: string
  appointmentDate: string
  appointmentTime: string
  finalPrice: number
  appointmentId: string
}

export async function sendConfirmationEmail(data: AppointmentEmailData) {
  const { formatDate, formatTime, formatPrice } = await import('@/lib/utils')
  const dateStr = formatDate(data.appointmentDate)
  const timeStr = formatTime(data.appointmentTime)
  const priceStr = formatPrice(data.finalPrice)

  return resend.emails.send({
    from: FROM,
    to: data.to,
    subject: `✅ Επιβεβαίωση ραντεβού - Omega Barber Lab`,
    html: `
<!DOCTYPE html>
<html lang="el">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#141414;color:#e5e5e5;margin:0;padding:0">
  <div style="max-width:560px;margin:40px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#272727,#111);padding:40px 32px;text-align:center;border-bottom:1px solid #222">
      <h1 style="color:#c8a96e;font-size:28px;margin:0;letter-spacing:2px">OMEGA BARBER LAB</h1>
      <p style="color:#888;margin:8px 0 0;font-size:13px;letter-spacing:1px">PREMIUM GROOMING EXPERIENCE</p>
    </div>
    <div style="padding:40px 32px">
      <h2 style="color:#e5e5e5;font-size:20px;margin:0 0 8px">Το ραντεβού σας επιβεβαιώθηκε!</h2>
      <p style="color:#888;margin:0 0 32px;font-size:15px">Γεια σας, ${data.customerName}. Σας περιμένουμε!</p>

      <div style="background:#272727;border:1px solid #363636;border-radius:8px;padding:24px;margin-bottom:32px">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #363636">
          <span style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px">Υπηρεσία</span>
          <span style="color:#e5e5e5;font-weight:600">${data.serviceName}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #363636">
          <span style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px">Ημερομηνία</span>
          <span style="color:#e5e5e5;font-weight:600">${dateStr}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;padding-bottom:16px;border-bottom:1px solid #363636">
          <span style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px">Ώρα</span>
          <span style="color:#e5e5e5;font-weight:600">${timeStr}</span>
        </div>
        <div style="display:flex;justify-content:space-between">
          <span style="color:#888;font-size:13px;text-transform:uppercase;letter-spacing:1px">Τιμή</span>
          <span style="color:#c8a96e;font-weight:700;font-size:18px">${priceStr}</span>
        </div>
      </div>

      <div style="background:#272727;border:1px solid #363636;border-radius:8px;padding:20px;margin-bottom:32px">
        <p style="color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px">Διεύθυνση</p>
        <p style="color:#e5e5e5;margin:0;font-size:15px">Δαμιανού 12, Καβάλα</p>
        <p style="color:#888;margin:4px 0 0;font-size:13px">Τηλ: 6940502965</p>
      </div>

      <p style="color:#666;font-size:13px;text-align:center;margin:0">Για ακύρωση ή αλλαγή, παρακαλούμε επικοινωνήστε μαζί μας τηλεφωνικά.</p>
    </div>
    <div style="background:#181818;padding:20px 32px;text-align:center;border-top:1px solid #272727">
      <p style="color:#555;font-size:12px;margin:0">© 2025 Omega Barber Lab · Καβάλα</p>
    </div>
  </div>
</body>
</html>`,
  })
}

export async function sendReminderEmail(
  data: AppointmentEmailData,
  type: 'reminder_1day' | 'reminder_2hr'
) {
  const { formatDate, formatTime, formatPrice } = await import('@/lib/utils')
  const dateStr = formatDate(data.appointmentDate)
  const timeStr = formatTime(data.appointmentTime)
  const priceStr = formatPrice(data.finalPrice)
  const subject =
    type === 'reminder_1day'
      ? `⏰ Υπενθύμιση: Ραντεβού αύριο - Omega Barber Lab`
      : `⏰ Υπενθύμιση: Ραντεβού σε 2 ώρες - Omega Barber Lab`
  const heading =
    type === 'reminder_1day'
      ? 'Υπενθύμιση ραντεβού αύριο'
      : 'Ραντεβού σε 2 ώρες!'

  return resend.emails.send({
    from: FROM,
    to: data.to,
    subject,
    html: `
<!DOCTYPE html>
<html lang="el">
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#141414;color:#e5e5e5;margin:0;padding:0">
  <div style="max-width:560px;margin:40px auto;background:#111;border:1px solid #222;border-radius:12px;overflow:hidden">
    <div style="background:linear-gradient(135deg,#272727,#111);padding:40px 32px;text-align:center;border-bottom:1px solid #222">
      <h1 style="color:#c8a96e;font-size:28px;margin:0;letter-spacing:2px">OMEGA BARBER LAB</h1>
    </div>
    <div style="padding:40px 32px">
      <h2 style="color:#e5e5e5;font-size:20px;margin:0 0 8px">${heading}</h2>
      <p style="color:#888;margin:0 0 32px">Γεια σας, ${data.customerName}. Σας υπενθυμίζουμε το επερχόμενο ραντεβού σας.</p>
      <div style="background:#272727;border:1px solid #363636;border-radius:8px;padding:24px">
        <div style="margin-bottom:12px"><span style="color:#888;font-size:13px">Υπηρεσία: </span><strong style="color:#e5e5e5">${data.serviceName}</strong></div>
        <div style="margin-bottom:12px"><span style="color:#888;font-size:13px">Ημερομηνία: </span><strong style="color:#e5e5e5">${dateStr}</strong></div>
        <div style="margin-bottom:12px"><span style="color:#888;font-size:13px">Ώρα: </span><strong style="color:#e5e5e5">${timeStr}</strong></div>
        <div><span style="color:#888;font-size:13px">Τιμή: </span><strong style="color:#c8a96e">${priceStr}</strong></div>
      </div>
      <p style="color:#666;font-size:13px;text-align:center;margin-top:24px">Δαμιανού 12, Καβάλα · 6940502965</p>
    </div>
  </div>
</body>
</html>`,
  })
}
