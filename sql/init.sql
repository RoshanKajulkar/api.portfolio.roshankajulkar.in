CREATE DATABASE portfolio;

CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,

  city VARCHAR(100) DEFAULT 'Unknown',
  region VARCHAR(100) DEFAULT 'Unknown',
  region_code VARCHAR(20) DEFAULT 'Unknown',

  country VARCHAR(100) DEFAULT 'Unknown',
  country_name VARCHAR(100) DEFAULT 'Unknown',
  country_code VARCHAR(10) DEFAULT 'Unknown',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
