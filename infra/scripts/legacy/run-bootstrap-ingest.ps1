# Run the zipped/unzipped bootstrap ingestion
$compose = Join-Path $PSScriptRoot '..\compose\compose.ingestion.yml'
docker compose -f $compose up -d --build
