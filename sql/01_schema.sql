-- DigiPiggy — Phase 2 Database Schema (MySQL 8.0+)
-- MVP-focused tables + optional future scope. Use at your own discretion in class.
-- Run this whole file in MySQL Workbench (or mysql CLI).

-- Create schema (database) if you want everything under a separate DB
CREATE DATABASE IF NOT EXISTS digipiggy DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE digipiggy;

-- 1) USERS & IDENTITY ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(120) NOT NULL UNIQUE,
  phone VARCHAR(32) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(120) NOT NULL,
  dob DATE NULL,
  status ENUM('active','locked','deleted') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS kyc_profiles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  ssn_last4 CHAR(4),
  itin VARCHAR(20),
  gov_id_type ENUM('passport','license','state_id'),
  gov_id_number VARCHAR(64),
  verified_at DATETIME NULL,
  status ENUM('pending','manual_review','verified','rejected') DEFAULT 'pending',
  CONSTRAINT fk_kyc_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS auth_providers (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  provider ENUM('email','google','apple') NOT NULL,
  provider_uid VARCHAR(191) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_ap_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS sessions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  jwt_id VARCHAR(191) NOT NULL UNIQUE,
  ip VARCHAR(64),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL,
  revoked_at TIMESTAMP NULL,
  CONSTRAINT fk_session_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 2) WALLETS, TRANSACTIONS & POTS --------------------------------------------
CREATE TABLE IF NOT EXISTS wallet_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_type ENUM('user','pot') NOT NULL,
  owner_id INT NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  available_cents BIGINT NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_wallet_owner (owner_type, owner_id)
);

CREATE TABLE IF NOT EXISTS transactions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  wallet_account_id INT NOT NULL,
  type ENUM('deposit','withdrawal','roundup','merchant_change','investment_buy','investment_sell','fee','commission','transfer') NOT NULL,
  amount_cents BIGINT NOT NULL,
  currency CHAR(3) DEFAULT 'USD',
  status ENUM('pending','posted','failed','reversed') DEFAULT 'pending',
  memo VARCHAR(255),
  external_ref VARCHAR(128) UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_tx_wallet FOREIGN KEY (wallet_account_id) REFERENCES wallet_accounts(id),
  INDEX idx_tx_user_created (user_id, created_at)
);

CREATE TABLE IF NOT EXISTS groups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL,
  owner_user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_group_owner FOREIGN KEY (owner_user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS group_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner','admin','member') DEFAULT 'member',
  UNIQUE KEY uk_group_user (group_id, user_id),
  CONSTRAINT fk_gm_group FOREIGN KEY (group_id) REFERENCES groups(id),
  CONSTRAINT fk_gm_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS pots (
  id INT PRIMARY KEY AUTO_INCREMENT,
  group_id INT,
  name VARCHAR(120) NOT NULL,
  wallet_account_id INT NOT NULL UNIQUE,
  visibility ENUM('private','group','public') DEFAULT 'private',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pot_group FOREIGN KEY (group_id) REFERENCES groups(id),
  CONSTRAINT fk_pot_wallet FOREIGN KEY (wallet_account_id) REFERENCES wallet_accounts(id)
);

CREATE TABLE IF NOT EXISTS pot_members (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pot_id INT NOT NULL,
  user_id INT NOT NULL,
  role ENUM('owner','contributor','viewer') DEFAULT 'contributor',
  UNIQUE KEY uk_pot_user (pot_id, user_id),
  CONSTRAINT fk_pm_pot FOREIGN KEY (pot_id) REFERENCES pots(id),
  CONSTRAINT fk_pm_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS pot_contributions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pot_id INT NOT NULL,
  transaction_id INT NOT NULL,
  amount_cents BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_pc_pot FOREIGN KEY (pot_id) REFERENCES pots(id),
  CONSTRAINT fk_pc_tx FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

CREATE TABLE IF NOT EXISTS savings_goals (
  id INT PRIMARY KEY AUTO_INCREMENT,
  pot_id INT NOT NULL,
  target_cents BIGINT NOT NULL,
  target_date DATE,
  name VARCHAR(120),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_goal_pot FOREIGN KEY (pot_id) REFERENCES pots(id)
);

CREATE TABLE IF NOT EXISTS goal_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  goal_id INT NOT NULL,
  snapshot_at DATE NOT NULL,
  balance_cents BIGINT NOT NULL,
  UNIQUE KEY uk_goal_date (goal_id, snapshot_at),
  CONSTRAINT fk_gp_goal FOREIGN KEY (goal_id) REFERENCES savings_goals(id)
);

-- 3) MERCHANTS, RECEIPTS & CHANGE (for 5% commission) ------------------------
CREATE TABLE IF NOT EXISTS merchants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(120) NOT NULL UNIQUE,
  category VARCHAR(64),
  contact_email VARCHAR(120),
  status ENUM('active','inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS receipts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  merchant_id INT,
  total_cents BIGINT NOT NULL,
  paid_cents BIGINT NOT NULL,
  method ENUM('cash','card','upi','other') DEFAULT 'cash',
  purchased_at DATETIME,
  source ENUM('upload','api','manual') DEFAULT 'manual',
  CONSTRAINT fk_receipt_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_receipt_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

CREATE TABLE IF NOT EXISTS roundups (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  receipt_id INT,
  purchase_cents BIGINT NOT NULL,
  roundup_cents INT NOT NULL,
  strategy ENUM('nearest_dollar','nearest_5','custom') DEFAULT 'nearest_dollar',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CHECK (roundup_cents >= 0 AND roundup_cents <= 99),
  CONSTRAINT fk_roundup_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_roundup_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(id)
);

CREATE TABLE IF NOT EXISTS change_contributions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  merchant_id INT NOT NULL,
  receipt_id INT,
  amount_cents BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_cc_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_cc_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  CONSTRAINT fk_cc_receipt FOREIGN KEY (receipt_id) REFERENCES receipts(id)
);

CREATE TABLE IF NOT EXISTS merchant_commissions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  merchant_id INT NOT NULL,
  contribution_id INT NOT NULL,
  commission_rate_bps SMALLINT DEFAULT 500, -- 500 bps = 5%\n  commission_cents BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_mc_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id),
  CONSTRAINT fk_mc_contribution FOREIGN KEY (contribution_id) REFERENCES change_contributions(id)
);

-- 4) NOTIFICATIONS & GAMIFICATION (lightweight) ------------------------------
CREATE TABLE IF NOT EXISTS badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(64) NOT NULL UNIQUE,
  name VARCHAR(120) NOT NULL,
  criteria_json JSON NOT NULL
);

CREATE TABLE IF NOT EXISTS user_badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  badge_id INT NOT NULL,
  awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_badge (user_id, badge_id),
  CONSTRAINT fk_ub_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_ub_badge FOREIGN KEY (badge_id) REFERENCES badges(id)
);

CREATE TABLE IF NOT EXISTS notification_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  email_enabled BOOLEAN DEFAULT TRUE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  push_enabled BOOLEAN DEFAULT FALSE,
  quiet_hours_json JSON,
  CONSTRAINT fk_ns_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS notifications (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  channel ENUM('email','sms','push','inapp') NOT NULL,
  title VARCHAR(160) NOT NULL,
  body TEXT NOT NULL,
  sent_at DATETIME,
  read_at DATETIME,
  CONSTRAINT fk_notif_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 5) SECURITY / AUDIT ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  actor_user_id INT,
  action VARCHAR(80) NOT NULL,
  target_type VARCHAR(64) NOT NULL,
  target_id INT,
  ip VARCHAR(64),
  user_agent VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_actor FOREIGN KEY (actor_user_id) REFERENCES users(id)
);

-- 6) OPTIONAL FUTURE: INVESTMENTS --------------------------------------------
CREATE TABLE IF NOT EXISTS investment_accounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  owner_type ENUM('user','pot') NOT NULL,
  owner_id INT NOT NULL,
  status ENUM('active','restricted','closed') DEFAULT 'active',
  INDEX idx_ia_owner (owner_type, owner_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  investment_account_id INT NOT NULL,
  side ENUM('buy','sell') NOT NULL,
  symbol VARCHAR(16) NOT NULL,
  qty DECIMAL(18,6) NOT NULL,
  price_cents BIGINT NOT NULL,
  status ENUM('new','filled','canceled','rejected') DEFAULT 'new',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_order_ia FOREIGN KEY (investment_account_id) REFERENCES investment_accounts(id)
);

CREATE TABLE IF NOT EXISTS portfolio_positions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  investment_account_id INT NOT NULL,
  symbol VARCHAR(16) NOT NULL,
  qty DECIMAL(18,6) NOT NULL,
  avg_price_cents BIGINT NOT NULL,
  UNIQUE KEY uk_pos (investment_account_id, symbol),
  CONSTRAINT fk_pos_ia FOREIGN KEY (investment_account_id) REFERENCES investment_accounts(id)
);

CREATE TABLE IF NOT EXISTS prices (
  id INT PRIMARY KEY AUTO_INCREMENT,
  symbol VARCHAR(16) NOT NULL,
  as_of DATETIME NOT NULL,
  price_cents BIGINT NOT NULL,
  UNIQUE KEY uk_price (symbol, as_of)
);

-- 7) REVENUE SPLIT (70/25/5) --------------------------------------------------
CREATE TABLE IF NOT EXISTS revenue_shares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  source_type ENUM('roundup','manual','merchant_change') NOT NULL,
  source_id INT NOT NULL,
  user_id INT,
  merchant_id INT,
  platform_cents BIGINT NOT NULL,
  user_cents BIGINT NOT NULL,
  merchant_cents BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_rs_user FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT fk_rs_merchant FOREIGN KEY (merchant_id) REFERENCES merchants(id)
);

-- 8) MINIMAL SEED FOR DEMO ----------------------------------------------------
INSERT INTO users (email,password_hash,full_name) VALUES ('demo@digipiggy.app','<hash>','Demo User')
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name);

INSERT INTO wallet_accounts (owner_type, owner_id) VALUES ('user', 1)
ON DUPLICATE KEY UPDATE owner_id=owner_id;

INSERT INTO merchants (name) VALUES ('Local Grocer')
ON DUPLICATE KEY UPDATE name=name;

INSERT INTO receipts (user_id, merchant_id, total_cents, paid_cents, purchased_at)
VALUES (1,1,1875,1900,NOW());

INSERT INTO roundups (user_id, receipt_id, purchase_cents, roundup_cents)
VALUES (1,1,1875,25);

INSERT INTO transactions (user_id, wallet_account_id, type, amount_cents, status, memo)
VALUES (1,1,'roundup',25,'posted','Round‑up from receipt #1');
