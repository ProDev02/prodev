CREATE DATABASE IF NOT EXISTS papapig99_db 
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_ai_ci;

CREATE USER IF NOT EXISTS 'papapig99_user'@'%' IDENTIFIED BY 'itds323';
GRANT ALL PRIVILEGES ON papapig99_db.* TO 'papapig99_user'@'%';

FLUSH PRIVILEGES;

USE papapig99_db;
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL COMMENT "'ADMIN', 'USER'"
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS users (
  email VARCHAR(255) PRIMARY KEY,
  password VARCHAR(255),
  name VARCHAR(255),
  role_id INT NOT NULL,
  CONSTRAINT fk_users_role FOREIGN KEY (role_id)
    REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(255),
  location VARCHAR(255),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status ENUM('OPEN','CLOSED') NOT NULL DEFAULT 'CLOSED',
  sale_start_at DATETIME NOT NULL,
  sale_end_at DATETIME,
  sale_until_soldout BOOLEAN DEFAULT FALSE,
  door_open_time VARCHAR(255),
  poster_image_url VARCHAR(255),
  seatmap_image_url VARCHAR(255),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS event_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  event_id INT NOT NULL,
  name VARCHAR(255),
  start_time TIME NOT NULL,
  use_zone_template BOOLEAN NOT NULL DEFAULT FALSE,  
  CONSTRAINT fk_sessions_event FOREIGN KEY (event_id)
    REFERENCES events(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS zone_templates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  group_name VARCHAR(100),
  capacity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS event_zones (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  group_name VARCHAR(100),
  capacity INT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  CONSTRAINT fk_zones_session FOREIGN KEY (session_id)
    REFERENCES event_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS registrations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  event_id INT NOT NULL,
  session_id INT NOT NULL,
  zone_id INT NOT NULL,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,                
  total_price DECIMAL(10,2) NOT NULL DEFAULT 0,          
  payment_reference VARCHAR(255),                        
  payment_status ENUM('UNPAID','PAID') NOT NULL DEFAULT 'UNPAID',
  paid_at DATETIME,
  ticket_code VARCHAR(64) UNIQUE NOT NULL,
  is_checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at DATETIME,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_registrations_user FOREIGN KEY (email)
    REFERENCES users(email) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_registrations_event FOREIGN KEY (event_id)
    REFERENCES events(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_registrations_session FOREIGN KEY (session_id)
    REFERENCES event_sessions(id) ON UPDATE CASCADE ON DELETE CASCADE,
  CONSTRAINT fk_registrations_zone FOREIGN KEY (zone_id)
    REFERENCES event_zones(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- DATA
INSERT INTO roles (id, code)
VALUES (1, 'ADMIN'), (2, 'USER')
ON DUPLICATE KEY UPDATE code=VALUES(code);

INSERT INTO users (email, password, name, role_id)
VALUES 
  ('admin@test.com', 'password', 'Admin01', 1),
  ('user@test.com', 'password', 'Pornpat Punthong', 2)
ON DUPLICATE KEY UPDATE name=VALUES(name);

INSERT INTO zone_templates (id, name, group_name, capacity, price)
VALUES
(1, 'Zone A2-A5 PREMIUM', 'PREMIUM', 25, 20000),
(2, 'Zone A2-A5 DARK PINK', 'DARK PINK', 25, 1500),
(3, 'Zone A2-A5 PINK', 'PINK', 25, 12000),
(4, 'Zone B3', 'PINK', 73, 12000),
(5, 'Zone B4', 'PINK', 73, 12000),
(6, 'Zone A1', 'GREEN', 73, 9000),
(7, 'Zone A6', 'GREEN', 73, 9000),
(8, 'Zone B15', 'BLUE', 73, 7500),
(9, 'Zone B16', 'BLUE', 73, 7500),
(10, 'Zone B1', 'GOLD', 73, 6500),
(11, 'Zone B2', 'GOLD', 73, 6500),
(12, 'Zone B5', 'GOLD', 73, 6500),
(13, 'Zone B6', 'GOLD', 73, 6500),
(14, 'Zone B7', 'GOLD', 73, 6500),
(15, 'Zone B8', 'GOLD', 73, 6500),
(16, 'Zone B11', 'GOLD', 73, 6500),
(17, 'Zone B12', 'GOLD', 73, 6500),
(18, 'Zone B13', 'GOLD', 73, 6500),
(19, 'Zone B14', 'GOLD', 73, 6500),
(20, 'Zone B17', 'GOLD', 73, 6500),
(21, 'Zone B18', 'GOLD', 73, 6500),
(22, 'Zone C1', 'ORANGE', 73, 5000),
(23, 'Zone C2', 'ORANGE', 73, 5000),
(24, 'Zone C3', 'ORANGE', 73, 5000),
(25, 'Zone C4', 'ORANGE', 73, 5000),
(26, 'Zone C5', 'ORANGE', 73, 5000),
(27, 'Zone C6', 'ORANGE', 73, 5000),
(28, 'Zone C7', 'ORANGE', 73, 5000),
(29, 'Zone C8', 'ORANGE', 73, 5000),
(30, 'Zone C9', 'ORANGE', 73, 5000),
(31, 'Zone C10', 'ORANGE', 73, 5000),
(32, 'Zone C11', 'ORANGE', 73, 5000),
(33, 'Zone D1', 'YELLOW', 73, 3500),
(34, 'Zone D2', 'YELLOW', 73, 3500),
(35, 'Zone D3', 'YELLOW', 73, 3500),
(36, 'Zone D4', 'YELLOW', 73, 3500),
(37, 'Zone D5', 'YELLOW', 73, 3500),
(38, 'Zone D6', 'YELLOW', 73, 3500)
ON DUPLICATE KEY UPDATE name=VALUES(name);

-- EVENT 1: MARIAH CAREY (ใช้ zone template)
INSERT INTO events (
  id, title, description, category, location,
  start_date, end_date, status,
  sale_start_at, sale_end_at, sale_until_soldout,
  door_open_time,
  poster_image_url, seatmap_image_url
) VALUES (
  1,
  'MARIAH CAREY The Celebration of Mimi',
  'คอนเสิร์ตฉลองอัลบั้ม The Emancipation of Mimi พร้อมโชว์พิเศษจาก Mariah Carey ที่แฟน ๆ ห้ามพลาด',
  'concert',
  'อิมแพค ชาเลนเจอร์ ฮอลล์ เมืองทองธานี',
  '2025-10-11', '2025-10-12',
  'OPEN',
  '2025-07-19 10:00:00', NULL, TRUE,
  'ก่อนเริ่มงาน 1 ชม.',
  '/images/poster_mariah.jpg', '/images/seatmap_mariah.jpg'
);

INSERT INTO event_sessions (id, event_id, name, start_time, use_zone_template)
VALUES
  (1, 1, 'รอบแรก 11 ต.ค.', '19:00:00', TRUE),
  (2, 1, 'รอบสอง 12 ต.ค.', '20:00:00', TRUE);

INSERT INTO event_zones (session_id, name, group_name, capacity, price)
SELECT 1, name, group_name, capacity, price FROM zone_templates;

INSERT INTO event_zones (session_id, name, group_name, capacity, price)
SELECT 2, name, group_name, capacity, price FROM zone_templates;

-- EVENT 2: ONE LUMPINEE HEROES 2025 (ไม่ใช้ template)
INSERT INTO events (
  id, title, description, category, location,
  start_date, end_date, status,
  sale_start_at, sale_end_at, sale_until_soldout,
  door_open_time,
  poster_image_url, seatmap_image_url
) VALUES (
  2,
  'ONE LUMPINEE HEROES 2025',
  'การแข่งขันมวยไทย + MMA ระดับโลกที่เวทีลุมพินี การต่อสู้สุดมันส์ประจำสัปดาห์',
  'sport',
  'สนามมวยเวทีลุมพินี กรุงเทพฯ',
  '2025-09-05', '2025-09-05',
  'OPEN',
  '2025-08-15 10:00:00', NULL, TRUE,
  'ก่อนเริ่มงาน 1 ชม.',
  '/images/poster_onelumpinee.jpg', '/images/seatmap_lumpinee.jpg'
);

INSERT INTO event_sessions (id, event_id, name, start_time, use_zone_template)
VALUES (3, 2, 'ศึกพิเศษ ศุกร์ 5 ก.ย.', '19:30:00', FALSE);

INSERT INTO event_zones (session_id, name, capacity, price)
VALUES
(3, 'Ringside', 200, 3500),
(3, 'Cat 1',    300, 2750),
(3, 'Cat 2',    400, 2000),
(3, 'Cat 3',    500, 1000);

-- EVENT 3: GOT7 NEST FEST 2025 (ไม่ใช้ template)
INSERT INTO events (
  id, title, description, category, location,
  start_date, end_date, status,
  sale_start_at, sale_end_at, sale_until_soldout,
  door_open_time,
  poster_image_url, seatmap_image_url
) VALUES (
  3,
  'GOT7 NEST FEST 2025',
  'คอนเสิร์ตใหญ่ของ GOT7 รวมเพลงฮิตและโชว์พิเศษสุดเซอร์ไพรส์!',
  'concert',
  'ราชมังคลากีฬาสถาน หัวหมาก',
  '2025-11-02', '2025-11-03',
  'OPEN',
  '2025-09-15 10:00:00', NULL, TRUE,
  'ก่อนเริ่มงาน 1 ชม.',
  '/images/poster_got7_nestfest.jpg', '/images/seatmap_got7_nestfest.jpg'
);

INSERT INTO event_sessions (id, event_id, name, start_time, use_zone_template)
VALUES
  (4, 3, 'รอบแรก 2 พ.ย.', '19:00:00', FALSE),
  (5, 3, 'รอบสอง 3 พ.ย.', '19:00:00', FALSE);

INSERT INTO event_zones (session_id, name, capacity, price)
VALUES
(4, 'Zone A Front Stage', 200, 12000),
(4, 'Zone B Middle', 350, 8000),
(4, 'Zone C Back', 600, 4000);

INSERT INTO event_zones (session_id, name, capacity, price)
VALUES
(5, 'Zone A Front Stage', 200, 12000),
(5, 'Zone B Middle', 350, 8000),
(5, 'Zone C Back', 600, 4000);

-- EVENT 4: THE MAGICIANS SHOW 2025
INSERT INTO events (
  id, title, description, category, location,
  start_date, end_date, status,
  sale_start_at, sale_end_at, sale_until_soldout,
  door_open_time,
  poster_image_url, seatmap_image_url
) VALUES (
  4,
  'THE MAGICIANS SHOW 2025',
  'โชว์มายากลระดับโลก ณ M Theatre กรุงเทพฯ',
  'show',
  'M Theatre กรุงเทพฯ',
  '2025-12-20', '2025-12-21',
  'OPEN',
  '2025-07-21 10:00:00', NULL, TRUE,
  'ก่อนเริ่มงาน 30 นาที',
  '/images/poster_magicians_2025.jpg', '/images/seatmap_mtheatre.jpg'
);

INSERT INTO event_sessions (id, event_id, name, start_time, use_zone_template)
VALUES
  (6, 4, 'เสาร์ 20 ธ.ค.', '14:00:00', FALSE),
  (7, 4, 'อาทิตย์ 21 ธ.ค.', '14:00:00', FALSE);

INSERT INTO event_zones (session_id, name, capacity, price)
VALUES
(6, 'Front Row', 100, 2500),
(6, 'Middle Row', 150, 1800),
(6, 'Back Row', 200, 1200),
(7, 'Front Row', 100, 2500),
(7, 'Middle Row', 150, 1800),
(7, 'Back Row', 200, 1200);

-- EVENT 5: OCSC EXPO 2025
INSERT INTO events (
  id, title, description, category, location,
  start_date, end_date, status,
  sale_start_at, sale_end_at, sale_until_soldout,
  door_open_time,
  poster_image_url
) VALUES (
  5,
  'OCSC EXPO 2025',
  'งานแนะแนวศึกษาต่อต่างประเทศและทุนการศึกษาครั้งใหญ่ประจำปี',
  'education',
  'Royal Paragon Hall, Siam Paragon',
  '2025-12-15', '2025-12-17',
  'OPEN',
  '2025-09-10 09:00:00', NULL, TRUE,
  '09:00 น.',
  '/images/poster_ocsc_2025.jpg'
);

INSERT INTO event_sessions (id, event_id, name, start_time, use_zone_template)
VALUES
  (8, 5, 'วันศุกร์ 15 ธ.ค.', '10:00:00', FALSE),
  (9, 5, 'วันเสาร์ 16 ธ.ค.', '10:00:00', FALSE),
  (10, 5, 'วันอาทิตย์ 17 ธ.ค.', '10:00:00', FALSE);

INSERT INTO event_zones (session_id, name, capacity, price)
VALUES
(8, 'Exhibition Area', 1000, 0),
(9, 'Exhibition Area', 1000, 0),
(10, 'Exhibition Area', 1000, 0);


-- EVENT 6: THAILAND TECH & BUSINESS SUMMIT 2025 (business)
INSERT INTO events (
  id, title, description, category, location,
  start_date, end_date, status,
  sale_start_at, sale_end_at, sale_until_soldout,
  door_open_time,
  poster_image_url, seatmap_image_url
) VALUES (
  6,
  'THAILAND TECH & BUSINESS SUMMIT 2025',
  'งานสัมมนาธุรกิจและเทคโนโลยีสำหรับผู้ประกอบการและสตาร์ทอัพ รวบรวม Keynote และ Workshop จากผู้นำในวงการ',
  'business',
  'Queen Sirikit National Convention Center (QSNCC), Bangkok',
  '2026-10-25', '2026-10-26',
  'OPEN',
  '2025-08-20 09:00:00', NULL, TRUE,
  '08:30 น.',
  '/images/poster_ttbs_2025.jpg',
  '/images/seatmap_ttbs_2025.jpg'
);

INSERT INTO event_sessions (id, event_id, name, start_time, use_zone_template)
VALUES
  (11, 6, 'Day 1 – 25 ต.ค.', '09:00:00', FALSE),
  (12, 6, 'Day 2 – 26 ต.ค.', '09:00:00', FALSE);

INSERT INTO event_zones (session_id, name, capacity, price)
VALUES
  (11, 'VIP Business Lounge', 150, 4500),
  (11, 'Conference Standard', 500, 2500),
  (11, 'Startup Zone', 300, 1500),
  (12, 'VIP Business Lounge', 150, 4500),
  (12, 'Conference Standard', 500, 2500),
  (12, 'Startup Zone', 300, 1500);




-- SHOW: Louis CK Extra Show in Bangkok 2026
INSERT INTO events (
  id, title, description, category, location,
  start_date, end_date, status,
  sale_start_at, sale_end_at, sale_until_soldout,
  door_open_time,
  poster_image_url, seatmap_image_url
) VALUES (
  102,
  'Louis CK Extra Show in Bangkok 2026',
  'สแตนด์อัพคอมเมดี้จาก Louis CK ที่ Siam Pic-Ganesha Theatre สำหรับแฟนคอมเมดี้ตัวจริง',
  'show',
  'KBank Siam Pic-Ganesha Theatre, Siam Square One',
  '2026-03-20', '2026-03-20',
  'OPEN',
  '2025-12-01 10:00:00', NULL, TRUE,
  'ก่อนเริ่มโชว์ 30 นาที',
  '/images/poster_louisck_bkk_2026.jpg',
  '/images/seatmap_louisck_bkk_2026.jpg'
);

INSERT INTO event_sessions (id, event_id, name, start_time, use_zone_template)
VALUES
  (203, 102, 'Extra Show – 20 มี.ค. 2026', '19:30:00', FALSE);

INSERT INTO event_zones (session_id, name, capacity, price)
VALUES
  (203, 'Front Zone', 150, 3500),
  (203, 'Standard Zone', 250, 2200),
  (203, 'Balcony', 200, 1500);



-- SPORT: ONE Friday Fights 133 at Lumpinee Stadium
INSERT INTO events (
  id, title, description, category, location,
  start_date, end_date, status,
  sale_start_at, sale_end_at, sale_until_soldout,
  door_open_time,
  poster_image_url, seatmap_image_url
) VALUES (
  105,
  'ONE Friday Fights 133',
  'การต่อสู้ Muay Thai และ MMA รายการ ONE Friday Fights จาก ONE Championship ณ เวทีลุมพินี',
  'sport',
  'Lumpinee Boxing Stadium, Bangkok',
  '2025-12-14', '2025-12-14',
  'OPEN',
  '2025-09-30 10:00:00', NULL, TRUE,
  'ก่อนเริ่มศึก 1 ชม.',
  '/images/poster_one_friday_fights_133.jpg',
  '/images/seatmap_one_friday_fights_133.jpg'
);

INSERT INTO event_sessions (id, event_id, name, start_time, use_zone_template)
VALUES
  (207, 105, 'ONE Friday Fights 133 – 14 พ.ย. 2025', '19:30:00', FALSE);

INSERT INTO event_zones (session_id, name, capacity, price)
VALUES
  (207, 'Ringside', 250, 3500),
  (207, 'Side Stand', 400, 2200),
  (207, 'Back Stand', 600, 1200);
