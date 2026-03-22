-- Review-day reset: keep minimal users, clear operational data
-- Run in Supabase SQL Editor as project owner.

BEGIN;

-- 1) Ensure at least one section exists for foreman/overman/workers
INSERT INTO public.sections (id, section_name, description, is_active)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Section A - Review', 'Review demo section', true)
ON CONFLICT (id) DO NOTHING;

-- 2) Clear transactional/operational data (only if table exists)
DO $$
DECLARE
  t text;
  tables text[] := ARRAY[
    'worker_feedback_reports',
    'notifications',
    'messages',
    'remarks',
    'task_assignments',
    'tasks',
    'approvals',
    'incident_reports',
    'equipment_logs',
    'worker_shift_logs',
    'shift_handovers',
    'shifts',
    'audit_logs'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    IF EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = t
    ) THEN
      EXECUTE format('TRUNCATE TABLE public.%I RESTART IDENTITY CASCADE', t);
    END IF;
  END LOOP;
END $$;

-- 3) Keep only 5 review users in public.users
DELETE FROM public.users
WHERE COALESCE(email, '') <> ALL (ARRAY[
  'manager@deepshift.com',
  'overmen@deepshift.com',
  'forman@deepshift.com',
  'worker1@deepshift.com',
  'worker2@deepshift.com'
]);

-- 4) Upsert the 5 required users
INSERT INTO public.users (
  id, name, employee_code, role, section_id, is_active, phone, email
)
VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Manager User', 'M001', 'manager', NULL, true, '9000000010', 'manager@deepshift.com'),
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Overmen User', 'O001', 'overman', '11111111-1111-1111-1111-111111111111', true, '9000000011', 'overmen@deepshift.com'),
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Forman User', 'F001', 'foreman', '11111111-1111-1111-1111-111111111111', true, '9000000012', 'forman@deepshift.com'),
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Worker One', 'W001', 'worker', '11111111-1111-1111-1111-111111111111', true, '9000000013', 'worker1@deepshift.com'),
  ('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1', 'Worker Two', 'W002', 'worker', '11111111-1111-1111-1111-111111111111', true, '9000000014', 'worker2@deepshift.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  employee_code = EXCLUDED.employee_code,
  role = EXCLUDED.role,
  section_id = EXCLUDED.section_id,
  is_active = EXCLUDED.is_active,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email,
  updated_at = NOW();

-- 5) Seed today's active shift for Section A so attendance/reporting can start immediately
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'shifts'
  ) THEN
    INSERT INTO public.shifts (
      id,
      shift_date,
      shift_type,
      section_id,
      overman_id,
      status,
      handover_notes
    )
    VALUES (
      '22222222-2222-2222-2222-222222222222',
      CURRENT_DATE,
      'morning',
      '11111111-1111-1111-1111-111111111111',
      'cccccccc-cccc-cccc-cccc-cccccccccccc',
      'draft',
      'Seeded by review_reset.sql for demo start'
    )
    ON CONFLICT (id) DO UPDATE SET
      shift_date = EXCLUDED.shift_date,
      shift_type = EXCLUDED.shift_type,
      section_id = EXCLUDED.section_id,
      overman_id = EXCLUDED.overman_id,
      status = EXCLUDED.status,
      handover_notes = EXCLUDED.handover_notes,
      updated_at = NOW();
  END IF;
END $$;

COMMIT;
