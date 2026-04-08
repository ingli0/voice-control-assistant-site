-- ============================================================
-- OMEGA BARBER LAB - Supabase PostgreSQL Schema
-- Run this in: Supabase Dashboard > SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- SERVICES
-- ============================================================
CREATE TABLE services (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  duration    INTEGER NOT NULL,
  price       NUMERIC(8,2) NOT NULL,
  description TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO services (name, duration, price, description, sort_order) VALUES
  ('Κούρεμα', 30, 12.00, 'Σύγχρονο ανδρικό κούρεμα με σωστές αναλογίες, καθαρές γραμμές και premium φινίρισμα που κρατάει.', 1),
  ('Beard Trim', 15, 7.00, 'Περιποίηση γενειάδας με ακρίβεια, συμμετρία και φυσικό αποτέλεσμα που ταιριάζει στο πρόσωπο.', 2),
  ('Κούρεμα + Γένια', 45, 14.00, 'Η πιο ολοκληρωμένη υπηρεσία για άνδρες που θέλουν συνολικό grooming με ισορροπία και χαρακτήρα.', 3),
  ('Παιδικό Κούρεμα', 30, 10.00, 'Ήρεμη προσέγγιση, φιλικό περιβάλλον και προσεγμένη φροντίδα για ένα άνετο και όμορφο αποτέλεσμα.', 4);

-- ============================================================
-- CUSTOMERS
-- ============================================================
CREATE TABLE customers (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL UNIQUE,
  email      TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_name  ON customers(LOWER(name));

-- ============================================================
-- WORKING HOURS
-- ============================================================
CREATE TABLE working_hours (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_open     BOOLEAN NOT NULL DEFAULT true,
  open_time   TIME,
  close_time  TIME,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (day_of_week)
);

INSERT INTO working_hours (day_of_week, is_open, open_time, close_time) VALUES
  (0, false, NULL,     NULL),       -- Sunday: closed
  (1, true,  '10:00', '18:00'),     -- Monday
  (2, true,  '09:00', '21:00'),     -- Tuesday
  (3, true,  '09:00', '21:00'),     -- Wednesday
  (4, true,  '09:00', '21:00'),     -- Thursday
  (5, true,  '09:00', '21:00'),     -- Friday
  (6, true,  '10:00', '18:00');     -- Saturday

-- ============================================================
-- BREAKS
-- ============================================================
CREATE TABLE breaks (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  break_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time   TIME NOT NULL,
  label      TEXT NOT NULL DEFAULT 'Διάλειμμα',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_breaks_date ON breaks(break_date);

-- ============================================================
-- DISCOUNTS / COUPONS
-- ============================================================
CREATE TABLE discounts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code            TEXT NOT NULL UNIQUE,
  description     TEXT,
  type            TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value           NUMERIC(8,2) NOT NULL,
  min_order       NUMERIC(8,2),
  max_uses        INTEGER,
  uses_count      INTEGER NOT NULL DEFAULT 0,
  valid_from      DATE,
  valid_until     DATE,
  per_customer_id UUID,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- APPOINTMENTS
-- ============================================================
CREATE TABLE appointments (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id           UUID REFERENCES customers(id) ON DELETE SET NULL,
  customer_name         TEXT NOT NULL,
  customer_phone        TEXT NOT NULL,
  customer_email        TEXT,
  service_id            UUID REFERENCES services(id) ON DELETE SET NULL,
  service_name          TEXT NOT NULL,
  service_price         NUMERIC(8,2) NOT NULL,
  service_duration      INTEGER NOT NULL,
  appointment_date      DATE NOT NULL,
  appointment_time      TIME NOT NULL,
  end_time              TIME NOT NULL,
  notes                 TEXT,
  status                TEXT NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','cancelled','completed','no_show')),
  discount_id           UUID REFERENCES discounts(id) ON DELETE SET NULL,
  discount_amount       NUMERIC(8,2),
  final_price           NUMERIC(8,2) NOT NULL,
  created_by            TEXT NOT NULL DEFAULT 'customer'
                        CHECK (created_by IN ('customer','admin')),
  confirmation_sent_at  TIMESTAMPTZ,
  reminder_1day_sent_at TIMESTAMPTZ,
  reminder_2hr_sent_at  TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_appointments_date    ON appointments(appointment_date);
CREATE INDEX idx_appointments_status  ON appointments(status);
CREATE INDEX idx_appointments_customer ON appointments(customer_id);
CREATE INDEX idx_appointments_phone   ON appointments(customer_phone);

-- Unique index: no two non-cancelled appointments at the same time
CREATE UNIQUE INDEX idx_appointments_slot
  ON appointments(appointment_date, appointment_time)
  WHERE status NOT IN ('cancelled');

-- ============================================================
-- ADMIN PROFILES
-- ============================================================
CREATE TABLE admin_profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT 'Admin',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- EMAIL LOGS
-- ============================================================
CREATE TABLE email_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  appointment_id  UUID REFERENCES appointments(id) ON DELETE CASCADE,
  type            TEXT NOT NULL CHECK (type IN ('confirmation','reminder_1day','reminder_2hr','custom')),
  recipient_email TEXT NOT NULL,
  recipient_name  TEXT NOT NULL,
  subject         TEXT NOT NULL,
  resend_id       TEXT,
  status          TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','failed','bounced')),
  sent_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

CREATE TRIGGER trg_services_updated_at      BEFORE UPDATE ON services      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_customers_updated_at     BEFORE UPDATE ON customers     FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_working_hours_updated_at BEFORE UPDATE ON working_hours FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_appointments_updated_at  BEFORE UPDATE ON appointments  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_discounts_updated_at     BEFORE UPDATE ON discounts     FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- AUTO UPSERT CUSTOMER ON APPOINTMENT INSERT
-- ============================================================
CREATE OR REPLACE FUNCTION upsert_customer_on_appointment()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE cust_id UUID;
BEGIN
  INSERT INTO customers (name, phone, email)
  VALUES (NEW.customer_name, NEW.customer_phone, NEW.customer_email)
  ON CONFLICT (phone)
  DO UPDATE SET
    name  = EXCLUDED.name,
    email = COALESCE(EXCLUDED.email, customers.email),
    updated_at = NOW()
  RETURNING id INTO cust_id;
  NEW.customer_id = cust_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_upsert_customer
  BEFORE INSERT ON appointments
  FOR EACH ROW EXECUTE FUNCTION upsert_customer_on_appointment();

-- ============================================================
-- INCREMENT DISCOUNT USES (RPC)
-- ============================================================
CREATE OR REPLACE FUNCTION increment_discount_uses(discount_id UUID)
RETURNS VOID LANGUAGE plpgsql AS $$
BEGIN
  UPDATE discounts SET uses_count = uses_count + 1 WHERE id = discount_id;
END;
$$;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE services       ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE working_hours  ENABLE ROW LEVEL SECURITY;
ALTER TABLE breaks         ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts      ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs     ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (SELECT 1 FROM admin_profiles WHERE id = auth.uid());
$$;

-- Services: anyone reads, admin writes
CREATE POLICY "services_read"  ON services FOR SELECT USING (true);
CREATE POLICY "services_admin" ON services FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Working hours: anyone reads, admin writes
CREATE POLICY "hours_read"  ON working_hours FOR SELECT USING (true);
CREATE POLICY "hours_admin" ON working_hours FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Breaks: anyone reads (needed for slot availability check), admin writes
CREATE POLICY "breaks_read"  ON breaks FOR SELECT USING (true);
CREATE POLICY "breaks_admin" ON breaks FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Appointments: admin reads/writes all; anon can insert (public bookings)
CREATE POLICY "appointments_admin"       ON appointments FOR ALL    TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "appointments_anon_insert" ON appointments FOR INSERT TO anon WITH CHECK (created_by = 'customer');

-- Customers: admin only
CREATE POLICY "customers_admin" ON customers FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

-- Discounts: admin manages; anon reads active ones (for coupon validation)
CREATE POLICY "discounts_admin"      ON discounts FOR ALL    TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "discounts_anon_read"  ON discounts FOR SELECT TO anon USING (is_active = true);

-- Email logs: admin only
CREATE POLICY "email_logs_admin" ON email_logs FOR ALL TO authenticated USING (is_admin());

-- Admin profiles: only self reads (security)
CREATE POLICY "admin_profiles_self" ON admin_profiles FOR SELECT TO authenticated USING (id = auth.uid());

-- ============================================================
-- HOW TO CREATE YOUR FIRST ADMIN USER:
-- 1. Create user in Supabase Auth Dashboard (Authentication > Users)
-- 2. Run: INSERT INTO admin_profiles (id) VALUES ('<user-uuid>');
-- ============================================================
