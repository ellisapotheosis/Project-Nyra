# Infisical Secret Keys - Project Nyra

The following keys should be configured in Infisical for the `nyra` project.

## Core Secrets

- `POSTGRES_PASSWORD`: Main database password
- `REDIS_PASSWORD`: Redis cache password
- `MONGO_ROOT_PASSWORD`: MongoDB password for Infisical backend
- `INFISICAL_ENCRYPTION_KEY`: 32-character hex key for secret encryption
- `INFISICAL_JWT_SECRET`: Secret for Infisical JWT signing

## AI & APIs

- `ANTHROPIC_API_KEY`: Anthropic Claude API key
- `OPENAI_API_KEY`: OpenAI API key
- `OPENROUTER_API_KEY`: OpenRouter API key
- `GOOGLE_GEMINI_API_KEY`: Google Gemini API key
- `NEXUS_JWT_SECRET`: JWT secret for Nexus Router
- `NEXUS_ADMIN_TOKEN`: Admin token for Nexus Router

## Application Specific

- `TWENTY_API_KEY`: API key for Twenty CRM access
- `TWENTY_DB_PASSWORD`: Password for Twenty PostgreSQL instance
- `N8N_ENCRYPTION_KEY`: Encryption key for n8n workflows
- `ACTIVEPIECES_ENCRYPTION_KEY`: 32-character key for Activepieces
- `ACTIVEPIECES_JWT_SECRET`: JWT secret for Activepieces

## Integration Secrets

- `TWILIO_ACCOUNT_SID`: Twilio account identifier
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `SENDGRID_API_KEY`: SendGrid API key for emails
- `GITHUB_TOKEN`: GitHub Personal Access Token
