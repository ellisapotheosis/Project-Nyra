Param(
  [string]$Profile = 'default',
  [ValidateSet('qdrant','neo4j','postgres')]
  [string]$Target = 'qdrant',
  [string]$Input = './docs'
)
$env:NYRA_INGEST_PROFILE = $Profile
$env:NYRA_INGEST_TARGET = $Target
$env:NYRA_INGEST_INPUT = (Resolve-Path $Input).Path
python ./ingestion/scripts/ingest.py
