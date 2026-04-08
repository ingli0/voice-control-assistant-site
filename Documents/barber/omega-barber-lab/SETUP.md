# Omega Barber Lab — Setup Guide

## 1. Create a Supabase project

Go to [supabase.com](https://supabase.com), create a new project, and note your:
- Project URL
- Anon key
- Service Role key

## 2. Run the database schema

In the Supabase dashboard → SQL Editor, paste and run:
```
supabase/migrations/001_initial_schema.sql
```

## 3. Create your admin user

1. Go to **Authentication > Users** in Supabase dashboard
2. Click **"Add user"** → enter your email + password
3. Copy the user UUID
4. In SQL Editor, run:
   ```sql
   INSERT INTO admin_profiles (id, display_name) VALUES ('<YOUR-USER-UUID>', 'Admin');
   ```

## 4. Set up Resend for emails

1. Go to [resend.com](https://resend.com) and create an account
2. Add and verify your domain `omegabarberlab.gr`
3. Create an API key

## 5. Configure environment variables

Edit `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...

RESEND_API_KEY=re_your_key
RESEND_FROM_EMAIL=info@omegabarberlab.gr
RESEND_FROM_NAME=Omega Barber Lab

CRON_SECRET=generate_a_random_secret_here
NEXT_PUBLIC_APP_URL=https://omegabarberlab.gr
```

## 6. Run locally

```bash
npm run dev
```

- Public site: http://localhost:3000
- Admin panel: http://localhost:3000/admin/login
- Booking: http://localhost:3000/booking

## 7. Deploy to Vercel

```bash
npx vercel
```

Set all environment variables in Vercel project settings.

The `vercel.json` file configures automatic email reminders:
- 1-day reminder: runs at 09:00 every day
- 2-hour reminder: runs every 30 minutes

For cron jobs to work, Vercel Pro plan is required (or they can be set up via external cron service like cron-job.org calling the `/api/cron/*` endpoints with `Authorization: Bearer YOUR_CRON_SECRET`).

## Features summary

| Feature | Location |
|---------|----------|
| Dashboard | /admin/dashboard |
| Calendar (Fresha-like) | /admin/calendar |
| Appointments list | /admin/appointments |
| Customer search & history | /admin/customers |
| Services CRUD | /admin/services |
| Working hours + breaks | /admin/hours |
| Revenue analytics | /admin/revenue |
| Discounts & coupons | /admin/discounts |
| Public booking wizard | /booking |
| Email notifications | Auto via Resend |
