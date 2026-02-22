-- ============================================
-- DEEPSHIFT: Coal Mine Digital Shift Management System
-- PostgreSQL Schema for Supabase
-- Generated: 2026-01-30
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUM TYPES
-- ============================================

CREATE TYPE user_role AS ENUM ('worker', 'foreman', 'overman', 'manager');

CREATE TYPE shift_type AS ENUM ('morning', 'evening', 'night');

CREATE TYPE shift_status AS ENUM ('draft', 'submitted', 'approved', 'archived');

CREATE TYPE attendance_status AS ENUM ('present', 'absent');

CREATE TYPE equipment_condition AS ENUM ('ok', 'faulty');

CREATE TYPE incident_type AS ENUM ('PPE', 'equipment', 'gas', 'temperature', 'other');

CREATE TYPE severity_level AS ENUM ('low', 'medium', 'high');

CREATE TYPE approval_entity_type AS ENUM ('worker_log', 'section_report', 'shift');

CREATE TYPE approval_status AS ENUM ('approved', 'rejected');

CREATE TYPE audit_action AS ENUM ('created', 'updated', 'approved', 'rejected');

-- ============================================
-- TABLE: sections
-- ============================================

CREATE TABLE sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sections IS 'Mine sections/areas where workers are assigned';

-- ============================================
-- TABLE: users
-- ============================================

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    role user_role NOT NULL,
    section_id UUID REFERENCES sections(id) ON DELETE SET NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(20),
    email VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE users IS 'System users including workers, foremen, overmen, and managers';

-- Index for role-based queries
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_section_id ON users(section_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_employee_code ON users(employee_code);

-- ============================================
-- TABLE: shifts
-- ============================================

CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_date DATE NOT NULL,
    shift_type shift_type NOT NULL,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    overman_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status shift_status NOT NULL DEFAULT 'draft',
    handover_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    approved_at TIMESTAMPTZ,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Unique constraint: one shift per section per date per type
    CONSTRAINT unique_shift_per_section UNIQUE (shift_date, shift_type, section_id)
);

COMMENT ON TABLE shifts IS 'Daily shift records for each mine section';

-- Indexes for analytics and queries
CREATE INDEX idx_shifts_shift_date ON shifts(shift_date);
CREATE INDEX idx_shifts_section_id ON shifts(section_id);
CREATE INDEX idx_shifts_status ON shifts(status);
CREATE INDEX idx_shifts_overman_id ON shifts(overman_id);
CREATE INDEX idx_shifts_date_section ON shifts(shift_date, section_id);
CREATE INDEX idx_shifts_date_status ON shifts(shift_date, status);

-- ============================================
-- TABLE: worker_shift_logs
-- ============================================

CREATE TABLE worker_shift_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    worker_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    attendance_status attendance_status NOT NULL DEFAULT 'present',
    check_in_time TIMESTAMPTZ,
    check_out_time TIMESTAMPTZ,
    tasks_performed TEXT,
    safety_check_passed BOOLEAN NOT NULL DEFAULT FALSE,
    safety_remarks TEXT,
    remarks TEXT,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- One log per worker per shift
    CONSTRAINT unique_worker_per_shift UNIQUE (shift_id, worker_id)
);

COMMENT ON TABLE worker_shift_logs IS 'Individual worker attendance and task logs for each shift';

-- Indexes
CREATE INDEX idx_worker_shift_logs_shift_id ON worker_shift_logs(shift_id);
CREATE INDEX idx_worker_shift_logs_worker_id ON worker_shift_logs(worker_id);
CREATE INDEX idx_worker_shift_logs_attendance ON worker_shift_logs(attendance_status);
CREATE INDEX idx_worker_shift_logs_safety ON worker_shift_logs(safety_check_passed);

-- ============================================
-- TABLE: equipment_logs
-- ============================================

CREATE TABLE equipment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    equipment_name VARCHAR(255) NOT NULL,
    equipment_code VARCHAR(50),
    condition_status equipment_condition NOT NULL,
    issue_description TEXT,
    evidence_url TEXT,
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE equipment_logs IS 'Equipment condition and issue reports per shift';

-- Indexes
CREATE INDEX idx_equipment_logs_shift_id ON equipment_logs(shift_id);
CREATE INDEX idx_equipment_logs_section_id ON equipment_logs(section_id);
CREATE INDEX idx_equipment_logs_condition ON equipment_logs(condition_status);
CREATE INDEX idx_equipment_logs_reported_by ON equipment_logs(reported_by);
CREATE INDEX idx_equipment_logs_equipment_name ON equipment_logs(equipment_name);

-- ============================================
-- TABLE: incident_reports
-- ============================================

CREATE TABLE incident_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    section_id UUID NOT NULL REFERENCES sections(id) ON DELETE RESTRICT,
    incident_type incident_type NOT NULL,
    severity_level severity_level NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location_details TEXT,
    evidence_url TEXT,
    reported_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    witnesses TEXT[],
    immediate_action_taken TEXT,
    is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE incident_reports IS 'Safety incidents and hazard reports';

-- Indexes
CREATE INDEX idx_incident_reports_shift_id ON incident_reports(shift_id);
CREATE INDEX idx_incident_reports_section_id ON incident_reports(section_id);
CREATE INDEX idx_incident_reports_incident_type ON incident_reports(incident_type);
CREATE INDEX idx_incident_reports_severity ON incident_reports(severity_level);
CREATE INDEX idx_incident_reports_reported_by ON incident_reports(reported_by);
CREATE INDEX idx_incident_reports_created_at ON incident_reports(created_at);
CREATE INDEX idx_incident_reports_is_resolved ON incident_reports(is_resolved);

-- ============================================
-- TABLE: approvals
-- ============================================

CREATE TABLE approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type approval_entity_type NOT NULL,
    entity_id UUID NOT NULL,
    approved_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    approval_status approval_status NOT NULL,
    remarks TEXT,
    approved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE approvals IS 'Approval records for shifts, worker logs, and section reports';

-- Indexes
CREATE INDEX idx_approvals_entity_type ON approvals(entity_type);
CREATE INDEX idx_approvals_entity_id ON approvals(entity_id);
CREATE INDEX idx_approvals_approved_by ON approvals(approved_by);
CREATE INDEX idx_approvals_status ON approvals(approval_status);
CREATE INDEX idx_approvals_approved_at ON approvals(approved_at);
CREATE INDEX idx_approvals_entity ON approvals(entity_type, entity_id);

-- ============================================
-- TABLE: audit_logs
-- ============================================

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    action audit_action NOT NULL,
    performed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE audit_logs IS 'Immutable audit trail for all system changes';

-- Indexes for audit queries
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_entity_id ON audit_logs(entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_performed_by ON audit_logs(performed_by);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- GIN index for JSONB queries
CREATE INDEX idx_audit_logs_old_data ON audit_logs USING GIN (old_data);
CREATE INDEX idx_audit_logs_new_data ON audit_logs USING GIN (new_data);

-- ============================================
-- TABLE: shift_handovers (Additional for handover tracking)
-- ============================================

CREATE TABLE shift_handovers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outgoing_shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE RESTRICT,
    incoming_shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    handover_notes TEXT,
    pending_issues TEXT,
    safety_concerns TEXT,
    handed_over_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    received_by UUID REFERENCES users(id) ON DELETE SET NULL,
    handover_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    acknowledgment_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE shift_handovers IS 'Shift handover records between consecutive shifts';

-- Indexes
CREATE INDEX idx_shift_handovers_outgoing ON shift_handovers(outgoing_shift_id);
CREATE INDEX idx_shift_handovers_incoming ON shift_handovers(incoming_shift_id);
CREATE INDEX idx_shift_handovers_time ON shift_handovers(handover_time);

-- ============================================
-- FUNCTIONS: Updated timestamp trigger
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_sections_updated_at
    BEFORE UPDATE ON sections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at
    BEFORE UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_worker_shift_logs_updated_at
    BEFORE UPDATE ON worker_shift_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_equipment_logs_updated_at
    BEFORE UPDATE ON equipment_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_incident_reports_updated_at
    BEFORE UPDATE ON incident_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- FUNCTIONS: Audit log trigger
-- ============================================

CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    audit_action_type audit_action;
    old_record JSONB;
    new_record JSONB;
BEGIN
    IF TG_OP = 'INSERT' THEN
        audit_action_type := 'created';
        old_record := NULL;
        new_record := to_jsonb(NEW);
    ELSIF TG_OP = 'UPDATE' THEN
        audit_action_type := 'updated';
        old_record := to_jsonb(OLD);
        new_record := to_jsonb(NEW);
    END IF;

    INSERT INTO audit_logs (
        entity_type,
        entity_id,
        action,
        performed_by,
        old_data,
        new_data
    ) VALUES (
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        audit_action_type,
        NULL,
        old_record,
        new_record
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to key tables
CREATE TRIGGER audit_shifts
    AFTER INSERT OR UPDATE ON shifts
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_worker_shift_logs
    AFTER INSERT OR UPDATE ON worker_shift_logs
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_equipment_logs
    AFTER INSERT OR UPDATE ON equipment_logs
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_incident_reports
    AFTER INSERT OR UPDATE ON incident_reports
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_approvals
    AFTER INSERT ON approvals
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- ============================================
-- VIEWS: Analytics-ready views
-- ============================================

-- Daily shift summary view
CREATE VIEW v_daily_shift_summary AS
SELECT 
    s.shift_date,
    s.shift_type,
    sec.section_name,
    s.status,
    u.name AS overman_name,
    COUNT(DISTINCT wsl.worker_id) FILTER (WHERE wsl.attendance_status = 'present') AS workers_present,
    COUNT(DISTINCT wsl.worker_id) FILTER (WHERE wsl.attendance_status = 'absent') AS workers_absent,
    COUNT(DISTINCT wsl.id) FILTER (WHERE wsl.safety_check_passed = TRUE) AS safety_checks_passed,
    COUNT(DISTINCT el.id) FILTER (WHERE el.condition_status = 'faulty') AS equipment_issues,
    COUNT(DISTINCT ir.id) AS incidents_reported,
    COUNT(DISTINCT ir.id) FILTER (WHERE ir.severity_level = 'high') AS high_severity_incidents
FROM shifts s
LEFT JOIN sections sec ON s.section_id = sec.id
LEFT JOIN users u ON s.overman_id = u.id
LEFT JOIN worker_shift_logs wsl ON s.id = wsl.shift_id
LEFT JOIN equipment_logs el ON s.id = el.shift_id
LEFT JOIN incident_reports ir ON s.id = ir.shift_id
GROUP BY s.id, s.shift_date, s.shift_type, sec.section_name, s.status, u.name;

-- Incident analytics view
CREATE VIEW v_incident_analytics AS
SELECT 
    DATE_TRUNC('month', ir.created_at) AS month,
    sec.section_name,
    ir.incident_type,
    ir.severity_level,
    COUNT(*) AS incident_count,
    COUNT(*) FILTER (WHERE ir.is_resolved = TRUE) AS resolved_count
FROM incident_reports ir
LEFT JOIN sections sec ON ir.section_id = sec.id
GROUP BY DATE_TRUNC('month', ir.created_at), sec.section_name, ir.incident_type, ir.severity_level;

-- Worker attendance analytics view
CREATE VIEW v_worker_attendance AS
SELECT 
    u.id AS worker_id,
    u.name AS worker_name,
    u.employee_code,
    sec.section_name,
    DATE_TRUNC('month', s.shift_date) AS month,
    COUNT(*) FILTER (WHERE wsl.attendance_status = 'present') AS days_present,
    COUNT(*) FILTER (WHERE wsl.attendance_status = 'absent') AS days_absent,
    ROUND(
        COUNT(*) FILTER (WHERE wsl.attendance_status = 'present')::NUMERIC / 
        NULLIF(COUNT(*), 0) * 100, 
        2
    ) AS attendance_percentage
FROM users u
LEFT JOIN sections sec ON u.section_id = sec.id
LEFT JOIN worker_shift_logs wsl ON u.id = wsl.worker_id
LEFT JOIN shifts s ON wsl.shift_id = s.id
WHERE u.role = 'worker'
GROUP BY u.id, u.name, u.employee_code, sec.section_name, DATE_TRUNC('month', s.shift_date);

-- ============================================
-- SEED DATA: Initial test data
-- ============================================

-- Insert sample sections
INSERT INTO sections (id, section_name, description) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Section A - Main Shaft', 'Primary extraction area with main ventilation'),
    ('a0000000-0000-0000-0000-000000000002', 'Section B - East Wing', 'Secondary extraction area'),
    ('a0000000-0000-0000-0000-000000000003', 'Section C - West Wing', 'Development area for new seams'),
    ('a0000000-0000-0000-0000-000000000004', 'Section D - Surface Operations', 'Surface plant and logistics');

-- Insert sample users
INSERT INTO users (id, name, employee_code, role, section_id) VALUES
    -- Managers
    ('b0000000-0000-0000-0000-000000000001', 'John Smith', 'MGR001', 'manager', NULL),
    ('b0000000-0000-0000-0000-000000000002', 'Mary Johnson', 'MGR002', 'manager', NULL),
    
    -- Overmen
    ('c0000000-0000-0000-0000-000000000001', 'Robert Wilson', 'OVM001', 'overman', 'a0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000002', 'James Brown', 'OVM002', 'overman', 'a0000000-0000-0000-0000-000000000002'),
    ('c0000000-0000-0000-0000-000000000003', 'David Lee', 'OVM003', 'overman', 'a0000000-0000-0000-0000-000000000001'),
    
    -- Foremen
    ('d0000000-0000-0000-0000-000000000001', 'Michael Davis', 'FRM001', 'foreman', 'a0000000-0000-0000-0000-000000000001'),
    ('d0000000-0000-0000-0000-000000000002', 'William Miller', 'FRM002', 'foreman', 'a0000000-0000-0000-0000-000000000002'),
    ('d0000000-0000-0000-0000-000000000003', 'Richard Garcia', 'FRM003', 'foreman', 'a0000000-0000-0000-0000-000000000003'),
    
    -- Workers
    ('e0000000-0000-0000-0000-000000000001', 'Thomas Anderson', 'WRK001', 'worker', 'a0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000002', 'Charles Martinez', 'WRK002', 'worker', 'a0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000003', 'Joseph Robinson', 'WRK003', 'worker', 'a0000000-0000-0000-0000-000000000001'),
    ('e0000000-0000-0000-0000-000000000004', 'Daniel Clark', 'WRK004', 'worker', 'a0000000-0000-0000-0000-000000000002'),
    ('e0000000-0000-0000-0000-000000000005', 'Matthew Lewis', 'WRK005', 'worker', 'a0000000-0000-0000-0000-000000000002'),
    ('e0000000-0000-0000-0000-000000000006', 'Anthony Walker', 'WRK006', 'worker', 'a0000000-0000-0000-0000-000000000003'),
    ('e0000000-0000-0000-0000-000000000007', 'Mark Hall', 'WRK007', 'worker', 'a0000000-0000-0000-0000-000000000003'),
    ('e0000000-0000-0000-0000-000000000008', 'Steven Young', 'WRK008', 'worker', 'a0000000-0000-0000-0000-000000000004');

-- Insert sample shifts
INSERT INTO shifts (id, shift_date, shift_type, section_id, overman_id, status, created_at) VALUES
    ('f0000000-0000-0000-0000-000000000001', '2026-01-30', 'morning', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'draft', NOW()),
    ('f0000000-0000-0000-0000-000000000002', '2026-01-30', 'morning', 'a0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', 'draft', NOW()),
    ('f0000000-0000-0000-0000-000000000003', '2026-01-29', 'morning', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', 'approved', NOW() - INTERVAL '1 day'),
    ('f0000000-0000-0000-0000-000000000004', '2026-01-29', 'evening', 'a0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000003', 'approved', NOW() - INTERVAL '1 day');

-- Insert sample worker shift logs
INSERT INTO worker_shift_logs (shift_id, worker_id, attendance_status, tasks_performed, safety_check_passed, submitted_at) VALUES
    ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000001', 'present', 'Coal extraction from face 3A, equipment inspection', TRUE, NOW() - INTERVAL '1 day'),
    ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000002', 'present', 'Support installation, ventilation check', TRUE, NOW() - INTERVAL '1 day'),
    ('f0000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000003', 'absent', NULL, FALSE, NULL),
    ('f0000000-0000-0000-0000-000000000004', 'e0000000-0000-0000-0000-000000000001', 'present', 'Continued extraction, maintenance support', TRUE, NOW() - INTERVAL '12 hours');

-- Insert sample equipment logs
INSERT INTO equipment_logs (shift_id, section_id, equipment_name, equipment_code, condition_status, issue_description, reported_by) VALUES
    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Continuous Miner CM-01', 'EQ-CM-001', 'ok', NULL, 'e0000000-0000-0000-0000-000000000001'),
    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'Conveyor Belt CB-03', 'EQ-CB-003', 'faulty', 'Belt alignment issue causing material spillage', 'e0000000-0000-0000-0000-000000000002'),
    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'Shuttle Car SC-02', 'EQ-SC-002', 'ok', NULL, 'e0000000-0000-0000-0000-000000000001');

-- Insert sample incident reports
INSERT INTO incident_reports (shift_id, section_id, incident_type, severity_level, title, description, reported_by) VALUES
    ('f0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'PPE', 'low', 'Missing hard hat', 'Worker found without hard hat in extraction area. Immediately corrected.', 'd0000000-0000-0000-0000-000000000001'),
    ('f0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'equipment', 'medium', 'Hydraulic leak on roof bolter', 'Minor hydraulic fluid leak detected on roof bolter RB-04. Equipment isolated for repair.', 'c0000000-0000-0000-0000-000000000003');

-- Insert sample approvals
INSERT INTO approvals (entity_type, entity_id, approved_by, approval_status, remarks) VALUES
    ('shift', 'f0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001', 'approved', 'All logs complete and verified'),
    ('shift', 'f0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000001', 'approved', 'Approved with note on equipment issue');

-- ============================================
-- ROW LEVEL SECURITY (RLS) - Prepared for Supabase Auth
-- ============================================

-- Enable RLS on all tables (policies to be added when auth is implemented)
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE worker_shift_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_handovers ENABLE ROW LEVEL SECURITY;

-- Temporary policy to allow all operations (for development)
-- Remove these and add proper policies when authentication is implemented
CREATE POLICY "Allow all for development" ON sections FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON users FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON shifts FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON worker_shift_logs FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON equipment_logs FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON incident_reports FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON approvals FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON audit_logs FOR ALL USING (true);
CREATE POLICY "Allow all for development" ON shift_handovers FOR ALL USING (true);

-- ============================================
-- GRANTS (for Supabase anon and authenticated roles)
-- ============================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON sections, users, shifts, worker_shift_logs, equipment_logs, incident_reports, approvals, shift_handovers TO authenticated;
GRANT INSERT ON audit_logs TO authenticated;

GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- END OF SCHEMA
-- ============================================
