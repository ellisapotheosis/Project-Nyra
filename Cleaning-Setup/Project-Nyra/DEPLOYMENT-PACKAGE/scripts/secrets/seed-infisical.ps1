# Seeds Infisical with Nyra secrets for three paths:
#   /shared, /project-nyra, /gemini-flow
# REQUIREMENTS: Infisical CLI logged in (infisical login), projectId is known.

param(
  [string]$ProjectId = "8374cea9-e5e8-4050-bda4-b91f25ab30ef",
  [string]$Env = "dev"
)

$ErrorActionPreference = "Stop"

Write-Host ">> Seeding Infisical ($ProjectId) for env=$Env" -ForegroundColor Cyan

# /shared
infisical set --projectId=$ProjectId --env=$Env --path="/shared" --secret=APP_URL          --value="http://localhost:12008"
infisical set --projectId=$ProjectId --env=$Env --path="/shared" --secret=API_ACCESS_TOKEN --value="sk_mt_LQmtAxlB8srS5zH0gB1Gbl2vJba1ruXUXKlAU7Oz21iMAOXXfSmZSiDEOLN6Ve7S"

# /project-nyra
infisical set --projectId=$ProjectId --env=$Env --path="/project-nyra" --secret=PGUSER     --value="apotheosis"
infisical set --projectId=$ProjectId --env=$Env --path="/project-nyra" --secret=PGPASSWORD --value="1th7aa6ch8oA1!"

# /gemini-flow
infisical set --projectId=$ProjectId --env=$Env --path="/gemini-flow" --secret=GOOGLE_API_KEY --value="AIzaSyBS3NhydAcSy7ZxAqFWn70r-Vc0jn7cscQ"

Write-Host ">> Seed complete."
