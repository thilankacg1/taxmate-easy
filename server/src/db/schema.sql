-- ATO deduction categories (reference table)
CREATE TABLE IF NOT EXISTS ato_categories (
  id        SERIAL PRIMARY KEY,
  code      VARCHAR(50) UNIQUE NOT NULL,
  name      VARCHAR(100) NOT NULL,
  description TEXT,
  gst_applicable BOOLEAN DEFAULT true
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(100),
  abn           VARCHAR(20),
  gst_registered BOOLEAN DEFAULT false,
  created_at    TIMESTAMP DEFAULT NOW()
);

-- Receipts table
CREATE TABLE IF NOT EXISTS receipts (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
  vendor          VARCHAR(255),
  purchase_date   DATE,
  total_amount    DECIMAL(10,2) NOT NULL,
  gst_amount      DECIMAL(10,2) DEFAULT 0,
  pre_gst_amount  DECIMAL(10,2),
  gst_free        BOOLEAN DEFAULT false,
  category_id     INTEGER REFERENCES ato_categories(id),
  description     TEXT,
  ai_confidence   VARCHAR(20),
  financial_year  VARCHAR(10),
  notes           TEXT,
  created_at      TIMESTAMP DEFAULT NOW()
);