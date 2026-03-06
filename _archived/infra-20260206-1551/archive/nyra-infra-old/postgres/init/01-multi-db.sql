-- superuser assumed from POSTGRES_PASSWORD env (postgres default user)
DO
$$
BEGIN
  -- nyra app
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nyra') THEN
    CREATE ROLE nyra LOGIN PASSWORD 'nyra_pass';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nyra_db') THEN
    CREATE DATABASE nyra_db OWNER nyra;
  END IF;

  -- metamcp (if you want a separate DB/user)
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'metamcp') THEN
    CREATE ROLE metamcp LOGIN PASSWORD 'supersecret';
  END IF;
  IF NOT EXISTS (SELECT FROM pg_database WHERE datname = 'metamcp_db') THEN
    CREATE DATABASE metamcp_db OWNER metamcp;
  END IF;

  -- add more services here similarly...
END
$$;
