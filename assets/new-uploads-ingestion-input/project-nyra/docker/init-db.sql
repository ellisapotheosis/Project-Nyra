-- Initial database setup
CREATE DATABASE IF NOT EXISTS ratehunter_dev;
CREATE DATABASE IF NOT EXISTS ratehunter_test;

-- Create extensions
\c ratehunter_dev;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

\c ratehunter_test;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
