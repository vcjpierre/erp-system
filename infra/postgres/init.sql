-- ERP PostgreSQL Initialization Script
-- Only runs on first database creation

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Create schema for multi-tenant
CREATE SCHEMA IF NOT EXISTS erp;

-- Set default schema
SET search_path TO erp, public;
