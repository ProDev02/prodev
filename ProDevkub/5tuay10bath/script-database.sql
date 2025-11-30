CREATE DATABASE fivetuay10bath_db;

CREATE USER fivetuay10bath_user WITH PASSWORD 'fivetuay10bath_pass';
GRANT ALL PRIVILEGES ON DATABASE fivetuay10bath_db TO fivetuay10bath_user;

\c fivetuay10bath_db fivetuay10bath_user;

CREATE TABLE IF NOT EXISTS buildings (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(100)    NOT NULL,
    code_name   VARCHAR(3)      NOT NULL,
    description TEXT,
    floor_count INT             NOT NULL,
    created_at  TIMESTAMPTZ     DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS floors (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    floor_number    VARCHAR(5)  NOT NULL,
    unit_count      INT         NOT NULL    CHECK (unit_count >= 0),
    building_id     UUID        NOT NULL    REFERENCES buildings(id)    ON DELETE CASCADE,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_floors_building_floor UNIQUE (building_id, floor_number)
    );

CREATE TABLE IF NOT EXISTS units (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_number             VARCHAR(10)     NOT NULL,
    unit_type               VARCHAR(20)     NOT NULL,
    unit_size               DECIMAL(5, 2)   NOT NULL    CHECK (unit_size >= 0),
    water_meter             INT             NOT NULL    DEFAULT 0 CHECK (water_meter >= 0 AND water_meter <= 9999),
    electric_meter          INT             NOT NULL    DEFAULT 0 CHECK (electric_meter >= 0 AND electric_meter <= 9999),
    status                  VARCHAR(20)     NOT NULL    DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'PENDING', 'RESERVED', 'OCCUPIED')),
    latest_aircon_service   DATE,
    floor_id                UUID            NOT NULL    REFERENCES floors(id)   ON DELETE CASCADE,
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    CONSTRAINT uq_units_floor_unit  UNIQUE (floor_id, unit_number)
    );

CREATE TABLE IF NOT EXISTS extra_charges (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id     UUID            REFERENCES units(id)    ON DELETE CASCADE,
    topic       VARCHAR(50)     NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2)  NOT NULL,
    status      VARCHAR(10)     NOT NULL    DEFAULT 'UNPAID'    CHECK (status IN ('UNPAID', 'PAID')),
    created_at  TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL    DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS users (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name              VARCHAR(50)     NOT NULL,
    last_name               VARCHAR(50)     NOT NULL,
    phone                   VARCHAR(15)     NOT NULL,
    email                   VARCHAR(50)     NOT NULL    UNIQUE,
    password                VARCHAR(254)    NOT NULL,
    role                    VARCHAR(20)     NOT NULL    DEFAULT 'USER'  CHECK (role IN ('USER', 'ADMIN', 'TENANT', 'STAFF')),
    identification_number   CHAR(13)        NOT NULL    UNIQUE  CHECK (LENGTH(identification_number) = 13),
    profile_image_url       TEXT,
    birth_date              DATE,
    active                  BOOLEAN         NOT NULL    DEFAULT FALSE,
    emergency_contact_name  VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS maintenances (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    unit_id                 UUID            NOT NULL    REFERENCES units(id)    ON DELETE CASCADE,
    title                   VARCHAR(50)     NOT NULL,
    description             TEXT,
    price                   DECIMAL(10, 2)  NOT NULL    DEFAULT 0,
    priority                VARCHAR(10)     CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    maintenance_type        VARCHAR(20)     NOT NULL    CHECK (maintenance_type IN (
    'ELECTRIC',
    'WATER',
    'PHONE',
    'AIR_CONDITIONAL',
    'FURNITURE',
    'FIRE_ALARM_SYSTEM',
    'WATER_LEAKAGE',
    'FLOOR_WALL',
    'BATHROOM',
    'PAINT',
    'CEMENT_WOOD',
    'OTHER')),
    assigned_to             UUID            REFERENCES users(id)    ON DELETE CASCADE,
    reported_by             UUID            NOT NULL    REFERENCES users(id)    ON DELETE CASCADE,
    status                  VARCHAR(20)     NOT NULL    DEFAULT 'REPORTED'  CHECK (status IN ('REPORTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')),
    scheduled_at            TIMESTAMPTZ,
    estimated_finish_time   TIMESTAMPTZ,
    started_at              TIMESTAMPTZ,
    completed_at            TIMESTAMPTZ,
    cancelled_at            TIMESTAMPTZ,
    created_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at              TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    path                    TEXT            UNIQUE,

    CHECK( scheduled_at < estimated_finish_time)
    );

CREATE TABLE IF NOT EXISTS apartment_configs (
    id                      UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    electric_price_per_unit DECIMAL(10, 2)  NOT NULL    CHECK (electric_price_per_unit >= 0),
    water_price_per_unit    DECIMAL(10, 2)  NOT NULL    CHECK (water_price_per_unit >= 0),
    common_fee              DECIMAL(10, 2)  NOT NULL    CHECK (common_fee >= 0),
    internet_price          DECIMAL(10, 2)  NOT NULL    CHECK (internet_price >= 0),
    created_at              TIMESTAMP       NOT NULL    DEFAULT NOW(),
    updated_at              TIMESTAMP       NOT NULL    DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS contracts (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id             UUID            NOT NULL    REFERENCES users(id)    ON DELETE CASCADE,
    unit_id             UUID            NOT NULL    REFERENCES units(id)    ON DELETE CASCADE,
    rent_type           VARCHAR(10)     NOT NULL    CHECK (rent_type IN ('MONTHLY', 'YEARLY')),
    rent_amount         DECIMAL(10, 2)  NOT NULL    CHECK (rent_amount >= 0),
    water_billing_type  VARCHAR(25)     NOT NULL    CHECK (water_billing_type IN ('PER_UNIT', 'FLAT_RATE', 'TIERED')),
    internet            BOOLEAN         NOT NULL,
    start_date          DATE            NOT NULL,
    end_date            DATE            NOT NULL,
    status              VARCHAR(20)     NOT NULL    DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SIGNED', 'ACTIVE', 'EXPIRED')),
    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    CHECK (start_date < end_date),
    path TEXT UNIQUE
    );
CREATE TABLE IF NOT EXISTS interest_configs (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    interest_type       VARCHAR(50) NOT NULL,      -- SIMPLE / COMPOUND
    interest_rate_percent NUMERIC(10,4) NOT NULL,  -- 15.0000 = 15%
    grace_period_days   INTEGER NOT NULL,
    effective_from      DATE NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,

    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS invoices (
    id                  UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id         UUID            NOT NULL    REFERENCES contracts(id)    ON DELETE CASCADE,
    apartment_config_id UUID            NOT NULL    REFERENCES apartment_configs(id),
    interest_config_id  UUID            REFERENCES interest_configs(id),
    billing_month       DATE            NOT NULL,
    electric_usage      INT             NOT NULL,
    water_usage         INT             NOT NULL,
    status              VARCHAR(10)     NOT NULL    DEFAULT 'UNPAID'    CHECK (status IN ('UNPAID', 'PAID', 'OVERDUE')),
    due_date            TIMESTAMPTZ     NOT NULL,
    total_amount        DECIMAL(10, 2)  NOT NULL    CHECK (total_amount >= 0),
    paid_date           TIMESTAMPTZ,
    --For interest
    outstanding_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    interest_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_interest NUMERIC(10,2) NOT NULL DEFAULT 0,
    is_interest_applied BOOLEAN NOT NULL DEFAULT FALSE,
    last_interest_calculated_date DATE,

    created_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at          TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    CHECK (paid_date IS NULL OR created_at < paid_date),
    path TEXT UNIQUE
    );
CREATE TABLE IF NOT EXISTS start_meters
(
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL  REFERENCES contracts(id) ON DELETE CASCADE ,
    month DATE ,
    water_start INT NOT NULL,
    electric_start INT NOT NULL
);

CREATE TABLE IF NOT EXISTS invoice_payments (
    id UUID PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE ,
    amount_paid NUMERIC(12, 2) NOT NULL,
    payment_date DATE NOT NULL,
    note TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS supplies (
    id          UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(20)     NOT NULL,
    category    VARCHAR(20)     NOT NULL,
    quantity    INT             NOT NULL    DEFAULT 0,
    min_stock   INT             NOT NULL    DEFAULT 0,
    created_at  TIMESTAMPTZ     NOT NULL    DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL    DEFAULT NOW()
    );


-- -- Delete unit will cause maintenance report deleted too
-- ALTER TABLE maintenance_reports
--     DROP CONSTRAINT IF EXISTS maintenance_reports_unit_id_fkey;
-- ALTER TABLE maintenance_reports
--     ADD CONSTRAINT maintenance_reports_unit_id_fkey
--         FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE ;
--
-- -- units -> contracts
-- ALTER TABLE contracts
--     DROP CONSTRAINT IF EXISTS contracts_unit_id_fkey;
-- ALTER TABLE contracts
--     ADD CONSTRAINT contracts_unit_id_fkey
--         FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE ;
--
-- -- contracts -> invoices
-- ALTER TABLE invoices
--     DROP CONSTRAINT IF EXISTS invoices_contract_id_fkey;
-- ALTER TABLE invoices
--     ADD CONSTRAINT invoices_contract_id_fkey
--         FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE ;
--
-- -- user => contracts
-- ALTER TABLE contracts
--     DROP CONSTRAINT IF EXISTS contracts_user_id_fkey;
-- ALTER TABLE contracts
--     ADD CONSTRAINT contracts_user_id_fkey
--         FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ;
--
-- -- users => maintenance
-- ALTER TABLE maintenance_reports
--     DROP CONSTRAINT IF EXISTS maintenance_reports_assigned_to_fkey;
-- ALTER TABLE maintenance_reports
--     ADD CONSTRAINT maintenance_reports_assigned_to_fkey
--         FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE ;
--
-- --
-- ALTER TABLE maintenance_reports
--     DROP CONSTRAINT IF EXISTS maintenance_reports_reported_by_fkey;
-- ALTER TABLE maintenance_reports
--     ADD CONSTRAINT maintenance_reports_reported_by_fkey
--         FOREIGN KEY (reported_by) REFERENCES users(id) ON DELETE CASCADE ;


CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ======================================================
-- 🏢 Building
-- ======================================================
INSERT INTO buildings (name, code_name, description, floor_count)
VALUES ('DeawKoiKid Tower', 'DKK', 'Main apartment building with 2 floors (24 rooms)', 2),
       ('Riverfront Residences', 'RFR', 'Secondary river-view building with 2 floors (6 rooms)', 2);

-- ======================================================
-- 🧱 Floors
-- ======================================================
INSERT INTO floors (floor_number, unit_count, building_id)
VALUES ('1', 12, (SELECT id FROM buildings WHERE code_name = 'DKK')),
       ('2', 12, (SELECT id FROM buildings WHERE code_name = 'DKK')),
       ('1', 3, (SELECT id FROM buildings WHERE code_name = 'RFR')),
       ('2', 3, (SELECT id FROM buildings WHERE code_name = 'RFR'));

-- ======================================================
-- 🏠 Units (24 rooms)
-- ======================================================
INSERT INTO units (unit_number, unit_type, unit_size, water_meter, electric_meter, status, latest_aircon_service, floor_id)
VALUES
-- === Floor 1 ===
('DKK101', 'A', 32.5, 0, 0, 'OCCUPIED', '2024-08-10',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK102', 'A', 33.0, 0, 0, 'OCCUPIED', '2024-09-01',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK103', 'B', 34.5, 0, 0, 'OCCUPIED', '2024-09-15',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK104', 'B', 35.0, 0, 0, 'PENDING', '2025-05-20',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK105', 'C', 40.0, 0, 0, 'AVAILABLE', '2025-06-05',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK106', 'C', 41.0, 0, 0, 'AVAILABLE', '2025-07-01',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK107', 'A', 32.0, 0, 0, 'RESERVED', '2025-03-01',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK108', 'B', 36.0, 0, 0, 'RESERVED', '2025-03-25',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK109', 'C', 45.0, 0, 0, 'RESERVED', '2025-04-20',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK110', 'A', 31.0, 0, 0, 'OCCUPIED', '2025-02-10',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK111', 'B', 37.5, 0, 0, 'OCCUPIED', '2025-01-05',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK112', 'C', 43.0, 0, 0, 'OCCUPIED', '2025-03-15',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),

-- === Floor 2 ===
('DKK201', 'A', 33.0, 0, 0, 'AVAILABLE', '2025-02-10',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK202', 'B', 37.0, 0, 0, 'AVAILABLE', '2025-03-12',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK203', 'C', 46.0, 0, 0, 'AVAILABLE', '2025-04-10',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK204', 'A', 31.5, 0, 0, 'AVAILABLE', '2025-05-01',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK205', 'B', 38.0, 0, 0, 'RESERVED', '2025-06-10',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK206', 'C', 44.5, 0, 0, 'RESERVED', '2025-07-15',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK207', 'A', 30.0, 0, 0, 'RESERVED', '2025-08-01',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK208', 'B', 36.0, 0, 0, 'RESERVED', '2025-09-01',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK209', 'C', 47.0, 0, 0, 'OCCUPIED', '2024-11-18',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK210', 'A', 35.0, 0, 0, 'OCCUPIED', '2024-09-10',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK211', 'B', 42.0, 0, 0, 'OCCUPIED', '2024-07-20',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),
('DKK212', 'C', 48.0, 0, 0, 'AVAILABLE', '2025-07-10',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'DKK'))),

-- === Riverfront Residences ===
('RFR101', 'A', 34.0, 0, 0, 'OCCUPIED', '2024-08-22',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'RFR'))),
('RFR102', 'B', 36.0, 0, 0, 'RESERVED', '2025-02-15',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'RFR'))),
('RFR103', 'C', 40.0, 0, 0, 'AVAILABLE', '2025-03-05',
 (SELECT id FROM floors WHERE floor_number = '1' AND building_id = (SELECT id FROM buildings WHERE code_name = 'RFR'))),
('RFR201', 'A', 35.5, 0, 0, 'OCCUPIED', '2024-06-18',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'RFR'))),
('RFR202', 'B', 38.5, 0, 0, 'RESERVED', '2025-01-12',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'RFR'))),
('RFR203', 'C', 42.0, 0, 0, 'PENDING', '2025-04-02',
 (SELECT id FROM floors WHERE floor_number = '2' AND building_id = (SELECT id FROM buildings WHERE code_name = 'RFR')));

-- ======================================================
-- 👥 Users
-- ======================================================
INSERT INTO users (first_name, last_name, phone, email, password, role, identification_number, active)
VALUES ('Admin', 'Root', '0800000000', 'admin@apt.com', crypt('admin', gen_salt('bf')), 'ADMIN', '1234567890123', true),
       ('Staff', 'One', '0801111111', 'staff1@apt.com', crypt('staff', gen_salt('bf')), 'STAFF', '1234567890124', true),
       ('Staff', 'Two', '0802222222', 'staff2@apt.com', crypt('staff', gen_salt('bf')), 'STAFF', '1234567890125', true),
       ('Tenant', 'A', '0803333333', 'tenant1@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890126',
        true),
       ('Tenant', 'B', '0804444444', 'tenant2@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890127',
        true),
       ('Tenant', 'C', '0805555555', 'tenant3@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890128',
        true),
       ('Tenant', 'D', '0806666666', 'tenant4@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890129',
        true),
       ('Tenant', 'E', '0807777777', 'tenant5@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890130',
        true),
       ('Tenant', 'F', '0808888888', 'tenant6@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890131',
        true),
       ('Tenant', 'G', '0809999999', 'tenant7@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890132',
        false),
       ('Tenant', 'H', '0810000000', 'tenant8@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890133',
        false),
       ('Tenant', 'I', '0811111111', 'tenant9@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890134',
        false),
       ('Tenant', 'J', '0812222222', 'tenant10@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890135',
        false),
       ('Tenant', 'K', '0813333333', 'tenant11@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890136',
        false),
       ('Tenant', 'L', '0814444444', 'tenant12@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890137',
        false),
       ('Tenant', 'M', '0815555555', 'tenant13@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890138',
        false),
       ('Tenant', 'N', '0816667777', 'tenant14@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890142',
        true),
       ('Tenant', 'O', '0817778888', 'tenant15@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890143',
        true),
       ('Tenant', 'P', '0818889999', 'tenant16@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890144',
        false),
       ('Tenant', 'Q', '0820000001', 'tenant17@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT', '1234567890145',
        false),
       ('Prospect', 'Pending', '0816666666', 'prospect@apt.com', crypt('user', gen_salt('bf')), 'USER', '1234567890139',
        false),
       ('Former', 'Tenant', '0817777777', 'former@apt.com', crypt('user', gen_salt('bf')), 'USER', '1234567890140',
        false),
       ('Visitor', 'User', '0818888888', 'visitor@apt.com', crypt('user', gen_salt('bf')), 'USER', '1234567890141',
        false),
       ('Tenant', 'HistoryA', '0821111111', 'tenant18@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT',
        '1234567890146',
        false),
       ('Tenant', 'HistoryB', '0822222222', 'tenant19@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT',
        '1234567890147',
        false),
       ('Tenant', 'HistoryC', '0823333333', 'tenant20@apt.com', crypt('tenant', gen_salt('bf')), 'TENANT',
        '1234567890148',
        false);

-- ======================================================
-- ⚙️ Apartment Config
-- ======================================================
INSERT INTO apartment_configs (electric_price_per_unit, water_price_per_unit, common_fee, internet_price)
VALUES (7.50, 15.00, 1200.00, 500.00);

-- ======================================================
-- 📜 Contracts (Active and Signed)
-- ======================================================
INSERT INTO contracts (user_id, unit_id, rent_type, rent_amount, water_billing_type, internet, start_date, end_date,
                       status)
VALUES ((SELECT id FROM users WHERE email = 'admin@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK101'),
        'MONTHLY', 16000.00, 'PER_UNIT', true, '2024-04-01', '2025-03-31', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant18@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK101'),
        'MONTHLY', 15500.00, 'PER_UNIT', true, '2023-02-01', '2024-01-31', 'EXPIRED'),
       ((SELECT id FROM users WHERE email = 'staff1@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK102'),
        'MONTHLY', 12000.00, 'PER_UNIT', true, '2024-06-01', '2025-05-31', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant19@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK102'),
        'MONTHLY', 11800.00, 'PER_UNIT', true, '2023-06-01', '2024-05-31', 'EXPIRED'),
       ((SELECT id FROM users WHERE email = 'staff2@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK103'),
        'MONTHLY', 12500.00, 'PER_UNIT', true, '2024-08-01', '2025-07-31', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'prospect@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK104'),
        'MONTHLY', 12800.00, 'PER_UNIT', true, '2026-02-01', '2027-01-31', 'DRAFT'),
       ((SELECT id FROM users WHERE email = 'former@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK105'),
        'MONTHLY', 13400.00, 'PER_UNIT', true, '2023-01-01', '2023-12-31', 'EXPIRED'),
       ((SELECT id FROM users WHERE email = 'tenant1@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK110'),
        'MONTHLY', 12000.00, 'PER_UNIT', true, '2025-02-01', '2026-01-31', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant2@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK111'),
        'YEARLY', 140000.00, 'FLAT_RATE', false, '2025-01-01', '2025-12-31', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant3@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK209'),
        'MONTHLY', 13200.00, 'PER_UNIT', true, '2024-11-01', '2025-10-31', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant20@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK209'),
        'MONTHLY', 12800.00, 'PER_UNIT', true, '2023-11-01', '2024-10-31', 'EXPIRED'),
       ((SELECT id FROM users WHERE email = 'tenant4@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK112'),
        'MONTHLY', 13800.00, 'PER_UNIT', true, '2025-03-01', '2026-02-28', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant5@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK210'),
        'MONTHLY', 15000.00, 'PER_UNIT', true, '2024-09-01', '2025-08-31', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant6@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK211'),
        'YEARLY', 145000.00, 'FLAT_RATE', false, '2024-07-01', '2025-06-30', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant14@apt.com'), (SELECT id FROM units WHERE unit_number = 'RFR101'),
        'MONTHLY', 12500.00, 'PER_UNIT', true, '2024-05-01', '2025-04-30', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant15@apt.com'), (SELECT id FROM units WHERE unit_number = 'RFR201'),
        'YEARLY', 138000.00, 'FLAT_RATE', false, '2024-03-01', '2025-02-28', 'ACTIVE'),
       ((SELECT id FROM users WHERE email = 'tenant7@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK107'),
        'MONTHLY', 11800.00, 'PER_UNIT', true, '2025-12-01', '2026-11-30', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'tenant8@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK108'),
        'MONTHLY', 12100.00, 'PER_UNIT', true, '2025-12-15', '2026-12-14', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'tenant9@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK109'),
        'YEARLY', 150000.00, 'FLAT_RATE', false, '2026-01-01', '2026-12-31', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'tenant10@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK205'),
        'MONTHLY', 13000.00, 'PER_UNIT', true, '2025-11-01', '2026-10-31', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'tenant11@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK206'),
        'MONTHLY', 13600.00, 'PER_UNIT', true, '2025-11-10', '2026-11-09', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'tenant12@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK207'),
        'MONTHLY', 11200.00, 'PER_UNIT', true, '2025-11-20', '2026-11-19', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'tenant13@apt.com'), (SELECT id FROM units WHERE unit_number = 'DKK208'),
        'MONTHLY', 11900.00, 'PER_UNIT', true, '2025-12-01', '2026-11-30', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'tenant16@apt.com'), (SELECT id FROM units WHERE unit_number = 'RFR102'),
        'MONTHLY', 12300.00, 'PER_UNIT', true, '2025-12-05', '2026-12-04', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'tenant17@apt.com'), (SELECT id FROM units WHERE unit_number = 'RFR202'),
        'MONTHLY', 12900.00, 'PER_UNIT', true, '2025-12-10', '2026-12-09', 'SIGNED'),
       ((SELECT id FROM users WHERE email = 'visitor@apt.com'), (SELECT id FROM units WHERE unit_number = 'RFR203'),
        'MONTHLY', 12200.00, 'PER_UNIT', true, '2026-03-01', '2027-02-28', 'DRAFT');

-- ======================================================
-- 💰 Invoices
-- ======================================================
WITH billing_months AS (SELECT *
                        FROM (VALUES ('2025-08-01'::date, 165, 18, 'PAID', '2025-08-25 23:59:59+07'::timestamptz,
                                      '2025-08-20 10:00:00+07'::timestamptz),
                                     ('2025-09-01'::date, 180, 20, 'PAID', '2025-09-25 23:59:59+07'::timestamptz,
                                      '2025-09-22 09:00:00+07'::timestamptz),
                                     ('2025-10-01'::date, 175, 19, 'UNPAID', '2025-10-25 23:59:59+07'::timestamptz,
                                      NULL)) AS m(billing_month, electric_usage, water_usage, status, due_date,
                                                  paid_date))
INSERT
INTO invoices (contract_id, apartment_config_id, billing_month, electric_usage, water_usage, status, due_date,
               total_amount, paid_date, created_at, updated_at)
SELECT c.id,
       ac.id,
       m.billing_month,
       m.electric_usage,
       m.water_usage,
       m.status,
       m.due_date,
       (CASE WHEN c.rent_type = 'YEARLY' THEN c.rent_amount / 12 ELSE c.rent_amount END)
           + (m.electric_usage * ac.electric_price_per_unit)
           + (m.water_usage * ac.water_price_per_unit)
           + ac.common_fee
           + (CASE WHEN c.internet THEN ac.internet_price ELSE 0 END),
       m.paid_date,
       m.billing_month + TIME '00:00',
       COALESCE(m.paid_date, m.due_date)
FROM contracts c
         CROSS JOIN apartment_configs ac
         CROSS JOIN billing_months m
WHERE c.status = 'ACTIVE';

-- ======================================================
-- 🛠 Maintenances (งานซ่อม)
-- ======================================================
INSERT INTO maintenances (unit_id, title, description, price, priority, maintenance_type,
                          assigned_to, reported_by, status,
                          scheduled_at, estimated_finish_time, started_at)
VALUES
-- ชั้น 1
((SELECT id FROM units WHERE unit_number = 'DKK101'), 'Air conditioner cleaning',
 'Regular AC maintenance for admin room',
 800.00, 'LOW', 'AIR_CONDITIONAL',
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 (SELECT id FROM users WHERE email = 'admin@apt.com'),
 'COMPLETED',
 '2025-09-10 09:00:00+07', '2025-09-10 09:30:00+07', '2025-09-10 09:00:00+07'),

((SELECT id FROM units WHERE unit_number = 'DKK102'), 'Lighting replacement', 'Replace LED bulb in bathroom',
 200.00, 'LOW', 'ELECTRIC',
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 'COMPLETED',
 '2025-09-11 14:00:00+07', '2025-09-11 14:30:00+07', '2025-09-11 14:05:00+07'),

((SELECT id FROM units WHERE unit_number = 'DKK103'), 'Water leak fix', 'Minor leak from kitchen sink',
 1200.00, 'MEDIUM', 'WATER_LEAKAGE',
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 'IN_PROGRESS',
 '2025-09-20 10:00:00+07', '2025-09-20 11:00:00+07', '2025-09-20 10:15:00+07'),

((SELECT id FROM units WHERE unit_number = 'DKK104'), 'Wall repaint', 'Touch-up paint on living room wall',
 2500.00, 'LOW', 'PAINT',
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant1@apt.com'),
 'SCHEDULED',
 '2025-09-25 09:00:00+07', '2025-09-25 12:00:00+07', NULL),

((SELECT id FROM units WHERE unit_number = 'DKK110'), 'Power socket replacement', 'Replace damaged power outlet',
 400.00, 'LOW', 'ELECTRIC',
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant2@apt.com'),
 'SCHEDULED',
 '2025-09-26 14:00:00+07', '2025-09-26 15:00:00+07', NULL),

((SELECT id FROM units WHERE unit_number = 'DKK112'), 'Fire alarm system check', 'Routine inspection',
 0.00, 'LOW', 'FIRE_ALARM_SYSTEM',
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 (SELECT id FROM users WHERE email = 'admin@apt.com'),
 'COMPLETED',
 '2025-09-05 08:30:00+07', '2025-09-05 09:00:00+07', '2025-09-05 08:35:00+07'),

-- ชั้น 2
((SELECT id FROM units WHERE unit_number = 'DKK205'), 'Bathroom pipe leak', 'Pipe behind sink leaking slowly',
 950.00, 'MEDIUM', 'WATER_LEAKAGE',
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant3@apt.com'),
 'IN_PROGRESS',
 '2025-09-22 10:00:00+07', '2025-09-22 11:30:00+07', '2025-09-22 10:15:00+07'),

((SELECT id FROM units WHERE unit_number = 'DKK206'), 'Window repair', 'Sliding window stuck, needs oiling',
 300.00, 'LOW', 'OTHER',
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant1@apt.com'),
 'SCHEDULED',
 '2025-09-24 13:00:00+07', '2025-09-24 14:00:00+07', NULL),

((SELECT id FROM units WHERE unit_number = 'DKK209'), 'Ceiling repaint', 'Water stain marks after leak fixed',
 1800.00, 'LOW', 'PAINT',
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant2@apt.com'),
 'COMPLETED',
 '2025-09-15 10:00:00+07', '2025-09-15 12:00:00+07', '2025-09-15 10:15:00+07'),

((SELECT id FROM units WHERE unit_number = 'DKK210'), 'AC malfunction', 'AC blowing hot air intermittently',
 2500.00, 'HIGH', 'AIR_CONDITIONAL',
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant3@apt.com'),
 'IN_PROGRESS',
 '2025-09-21 09:00:00+07', '2025-09-21 11:00:00+07', '2025-09-21 09:15:00+07'),

((SELECT id FROM units WHERE unit_number = 'DKK211'), 'Door hinge repair', 'Front door hinge squeaking',
 200.00, 'LOW', 'OTHER',
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant1@apt.com'),
 'SCHEDULED',
 '2025-09-27 14:00:00+07', '2025-09-27 15:00:00+07', NULL),

((SELECT id FROM units WHERE unit_number = 'DKK212'), 'Cement crack fix', 'Small crack near window frame',
 600.00, 'LOW', 'CEMENT_WOOD',
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant2@apt.com'),
 'SCHEDULED',
 '2025-09-28 10:00:00+07', '2025-09-28 11:30:00+07', NULL),

((SELECT id FROM units WHERE unit_number = 'DKK105'), 'Post-move cleaning', 'Deep clean after lease ended',
 1500.00, 'LOW', 'OTHER',
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 (SELECT id FROM users WHERE email = 'former@apt.com'),
 'COMPLETED',
 '2024-01-10 09:00:00+07', '2024-01-10 12:00:00+07', '2024-01-10 09:15:00+07'),

((SELECT id FROM units WHERE unit_number = 'DKK201'), 'Pre-leasing inspection', 'Check room conditions before listing',
 0.00, 'LOW', 'OTHER',
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 'COMPLETED',
 '2024-07-05 10:00:00+07', '2024-07-05 11:00:00+07', '2024-07-05 10:05:00+07'),

((SELECT id FROM units WHERE unit_number = 'RFR101'), 'Filter replacement', 'Replace AC filter after summer season',
 600.00, 'LOW', 'AIR_CONDITIONAL',
 (SELECT id FROM users WHERE email = 'staff1@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant14@apt.com'),
 'COMPLETED',
 '2024-10-02 09:00:00+07', '2024-10-02 09:45:00+07', '2024-10-02 09:05:00+07'),

((SELECT id FROM units WHERE unit_number = 'RFR202'), 'Pre-move inspection', 'Inspect reserved unit before handover',
 0.00, 'LOW', 'OTHER',
 (SELECT id FROM users WHERE email = 'staff2@apt.com'),
 (SELECT id FROM users WHERE email = 'tenant16@apt.com'),
 'SCHEDULED',
 '2025-12-02 10:00:00+07', '2025-12-02 10:45:00+07', NULL);

-- ======================================================
-- 📦 Supplies (ของใช้ในงานซ่อม)
-- ======================================================
INSERT INTO supplies (name, category, quantity, min_stock)
VALUES ('Light Bulb', 'ELECTRICAL', 50, 10),
       ('Pipe', 'PLUMBING', 30, 5),
       ('Wrench', 'TOOLS', 20, 5),
       ('Wire', 'ELECTRICAL', 25, 5),
       ('Paint', 'BUILDING', 10, 2),
       ('AC Filter', 'AIR_CONDITIONER', 15, 5),
       ('Door Hinge', 'HARDWARE', 12, 3),
       ('Screwdriver', 'TOOLS', 18, 5),
       ('Switch Socket', 'ELECTRICAL', 20, 5),
       ('Cement', 'BUILDING', 25, 5);
