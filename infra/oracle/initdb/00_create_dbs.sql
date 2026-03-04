-- Nyra Oracle One-VM init
-- Creates additional databases for nyra_ai / activepieces / n8n
-- and installs ruvector extension in nyra_ai (RuVector-Postgres image supports it).

CREATE DATABASE nyra_ai;
CREATE DATABASE activepieces;
CREATE DATABASE n8n;

\connect nyra_ai;

CREATE EXTENSION IF NOT EXISTS ruvector;
