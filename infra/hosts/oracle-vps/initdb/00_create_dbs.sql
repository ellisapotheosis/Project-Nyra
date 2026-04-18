-- Nyra Oracle One-VM init
-- Creates additional databases for nyra_ai / activepieces / n8n.

CREATE DATABASE nyra_ai;
CREATE DATABASE activepieces;
CREATE DATABASE n8n;

\connect nyra_ai;
