#!/bin/bash

# create-multiple-postgresql-databases.sh
# Script to create multiple PostgreSQL databases on initialization with pgvector extension
# Usage: Set POSTGRES_MULTIPLE_DATABASES environment variable with comma-separated database names

set -e
set -u

function create_user_and_database() {
	local database=$1
	echo "Creating database '$database' with pgvector extension"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
	    CREATE DATABASE $database;
	    GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL

	# Enable pgvector extension in the new database
	echo "Enabling pgvector extension in '$database'"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname="$database" <<-EOSQL
	    CREATE EXTENSION IF NOT EXISTS vector;
EOSQL
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
	echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
	for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
		create_user_and_database $db
	done
	echo "Multiple databases created with pgvector extension"
fi
