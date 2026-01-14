# Google Workspace Integration Guide

Complete guide for integrating Google Workspace services (Gmail, Calendar, Drive, Docs) with Project Nyra for mortgage lead management and automation.

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Google Cloud Project Setup](#google-cloud-project-setup)
- [OAuth 2.0 Configuration](#oauth-20-configuration)
- [Service Account Setup](#service-account-setup)
- [Gmail Integration](#gmail-integration)
- [Google Calendar Integration](#google-calendar-integration)
- [Google Drive Integration](#google-drive-integration)
- [Google Docs Integration](#google-docs-integration)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

---

## Overview

Google Workspace integration enables Project Nyra to:

- **Gmail**: Send automated emails, parse incoming leads, manage email templates
- **Calendar**: Schedule appointments, create reminders, manage loan officer calendars
- **Drive**: Store and organize mortgage documents, application files
- **Docs**: Generate dynamic loan documents, contracts, disclosures

**Architecture**:
- Uses Google Workspace APIs via OAuth 2.0 for user-delegated access
- Service accounts for server-to-server automation
- MCP server for unified API access

---

## Prerequisites

- Google Workspace account (Business Standard or higher recommended)
- Google Cloud Platform account
- Domain ownership verification (for production)
- Administrative access to Google Workspace Admin Console

**Costs**:
- Google Workspace: $12-$18/user/month
- Google Cloud Platform API calls: Free tier covers most usage

---

## Google Cloud Project Setup

### 1. Create New Project

1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Click **Select a project** → **New Project**
3. Enter project details:
   - **Project name**: `project-nyra-integration`
   - **Organization**: Your organization
   - **Location**: Your Google Workspace organization
4. Click **Create**

### 2. Enable Required APIs

Navigate to **APIs & Services** → **Library** and enable:

```
☐ Gmail API
☐ Google Calendar API
☐ Google Drive API
☐ Google Docs API
☐ Google Sheets API (optional)
☐ Admin SDK API (for user management)
```

**Via gcloud CLI**:
```bash
gcloud services enable gmail.googleapis.com
gcloud services enable calendar-json.googleapis.com
gcloud services enable drive.googleapis.com
gcloud services enable docs.googleapis.com
gcloud services enable admin.googleapis.com
```

### 3. Configure OAuth Consent Screen

1. Go to **APIs & Services** → **OAuth consent screen**
2. Select **Internal** (for Google Workspace users only)
3. Fill in application information:
   - **App name**: Project Nyra
   - **User support email**: support@yourdomain.com
   - **App logo**: Upload Nyra logo (120x120px)
   - **Application home page**: https://nyra.yourdomain.com
   - **Privacy policy**: https://nyra.yourdomain.com/privacy
4. Add scopes:
   ```
   https://www.googleapis.com/auth/gmail.send
   https://www.googleapis.com/auth/gmail.readonly
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/drive.file
   https://www.googleapis.com/auth/documents
   ```
5. Add test users (for testing phase)
6. Click **Save and Continue**

---

## OAuth 2.0 Configuration

### 1. Create OAuth 2.0 Credentials

1. Navigate to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name**: Nyra OAuth Client
   - **Authorized JavaScript origins**:
     - `http://localhost:3000` (development)
     - `https://nyra.yourdomain.com` (production)
   - **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (development)
     - `https://nyra.yourdomain.com/api/auth/callback/google` (production)
5. Click **Create**
6. Download JSON credentials file

### 2. Add Credentials to Environment

Add to `.env`:

```bash
# Google OAuth 2.0
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/callback/google

# OAuth Scopes (space-separated)
GOOGLE_SCOPES="https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/drive.file"
```

### 3. Implement OAuth Flow

**Backend (FastAPI example)**:

```python
from fastapi import FastAPI, HTTPException
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
import os

app = FastAPI()

@app.get("/auth/google")
async def google_auth():
    """Redirect user to Google OAuth consent screen"""
    from google_auth_oauthlib.flow import Flow

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        },
        scopes=os.getenv("GOOGLE_SCOPES").split()
    )

    flow.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    authorization_url, state = flow.authorization_url(
        access_type='offline',
        include_granted_scopes='true'
    )

    return {"auth_url": authorization_url, "state": state}

@app.get("/auth/google/callback")
async def google_callback(code: str, state: str):
    """Handle OAuth callback and exchange code for tokens"""
    from google_auth_oauthlib.flow import Flow

    flow = Flow.from_client_config(
        {
            "web": {
                "client_id": os.getenv("GOOGLE_CLIENT_ID"),
                "client_secret": os.getenv("GOOGLE_CLIENT_SECRET"),
                "redirect_uris": [os.getenv("GOOGLE_REDIRECT_URI")],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token"
            }
        },
        scopes=os.getenv("GOOGLE_SCOPES").split()
    )

    flow.redirect_uri = os.getenv("GOOGLE_REDIRECT_URI")
    flow.fetch_token(code=code)

    credentials = flow.credentials

    # Store credentials securely (database, encrypted)
    # credentials.token, credentials.refresh_token, credentials.token_uri

    return {"status": "success", "message": "Google Workspace connected"}
```

---

## Service Account Setup

For server-to-server automation without user interaction.

### 1. Create Service Account

1. Go to **IAM & Admin** → **Service Accounts**
2. Click **+ CREATE SERVICE ACCOUNT**
3. Enter details:
   - **Name**: nyra-automation
   - **Description**: Service account for Nyra automation
4. Click **Create and Continue**
5. Skip role assignment (not needed for Workspace APIs)
6. Click **Done**

### 2. Generate Service Account Key

1. Click on the created service account
2. Go to **Keys** tab
3. Click **Add Key** → **Create new key**
4. Select **JSON**
5. Click **Create**
6. Download JSON key file

### 3. Enable Domain-Wide Delegation

1. Click on service account
2. Click **Show Advanced Settings**
3. Under **Domain-wide delegation**, click **View Google Workspace Admin Console**
4. Copy the **Client ID**
5. In Google Workspace Admin Console:
   - Go to **Security** → **API Controls** → **Manage Domain-wide Delegation**
   - Click **Add new**
   - Enter Client ID
   - Add OAuth scopes:
     ```
     https://www.googleapis.com/auth/gmail.send,
     https://www.googleapis.com/auth/calendar.events,
     https://www.googleapis.com/auth/drive.file
     ```
   - Click **Authorize**

### 4. Configure Service Account in Environment

```bash
# Google Service Account
GOOGLE_SERVICE_ACCOUNT_EMAIL=nyra-automation@project-nyra-integration.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=/path/to/service-account-key.json
GOOGLE_WORKSPACE_ADMIN_EMAIL=admin@yourdomain.com
```

---

## Gmail Integration

### Send Email with Service Account

```python
from googleapiclient.discovery import build
from google.oauth2 import service_account
import base64
from email.mime.text import MIMEText

# Load service account credentials
SCOPES = ['https://www.googleapis.com/auth/gmail.send']
SERVICE_ACCOUNT_FILE = 'service-account-key.json'

credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)

# Delegate to user (impersonate)
delegated_credentials = credentials.with_subject('user@yourdomain.com')

# Build Gmail API client
service = build('gmail', 'v1', credentials=delegated_credentials)

# Create email
message = MIMEText('Your mortgage quote is ready!')
message['to'] = 'borrower@example.com'
message['subject'] = 'Your Mortgage Quote'
raw_message = base64.urlsafe_b64encode(message.as_bytes()).decode('utf-8')

# Send email
result = service.users().messages().send(
    userId='me',
    body={'raw': raw_message}
).execute()

print(f"Sent message ID: {result['id']}")
```

### Read Incoming Emails

```python
# List messages
results = service.users().messages().list(
    userId='me',
    q='from:lead@example.com subject:mortgage'
).execute()

messages = results.get('messages', [])

for message in messages:
    msg = service.users().messages().get(
        userId='me',
        id=message['id']
    ).execute()

    # Parse email content
    print(f"Message ID: {msg['id']}")
    print(f"Subject: {msg['payload']['headers'][0]['value']}")
```

---

## Google Calendar Integration

### Create Calendar Event

```python
from googleapiclient.discovery import build
from google.oauth2 import service_account
from datetime import datetime, timedelta

# Load credentials (same as Gmail)
SCOPES = ['https://www.googleapis.com/auth/calendar.events']
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
delegated_credentials = credentials.with_subject('loanofficer@yourdomain.com')

service = build('calendar', 'v3', credentials=delegated_credentials)

# Create event
event = {
    'summary': 'Mortgage Consultation - John Doe',
    'description': 'Initial consultation for $500K mortgage',
    'start': {
        'dateTime': (datetime.now() + timedelta(days=2)).isoformat(),
        'timeZone': 'America/New_York',
    },
    'end': {
        'dateTime': (datetime.now() + timedelta(days=2, hours=1)).isoformat(),
        'timeZone': 'America/New_York',
    },
    'attendees': [
        {'email': 'borrower@example.com'},
        {'email': 'loanofficer@yourdomain.com'}
    ],
    'reminders': {
        'useDefault': False,
        'overrides': [
            {'method': 'email', 'minutes': 24 * 60},
            {'method': 'popup', 'minutes': 30}
        ]
    }
}

result = service.events().insert(calendarId='primary', body=event).execute()
print(f"Event created: {result.get('htmlLink')}")
```

---

## Google Drive Integration

### Upload Document

```python
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

SCOPES = ['https://www.googleapis.com/auth/drive.file']
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
delegated_credentials = credentials.with_subject('admin@yourdomain.com')

service = build('drive', 'v3', credentials=delegated_credentials)

file_metadata = {
    'name': 'Mortgage Application - John Doe.pdf',
    'parents': ['<folder_id>']  # Optional: specify parent folder
}

media = MediaFileUpload('mortgage-application.pdf', mimetype='application/pdf')

file = service.files().create(
    body=file_metadata,
    media_body=media,
    fields='id, webViewLink'
).execute()

print(f"File ID: {file.get('id')}")
print(f"View link: {file.get('webViewLink')}")
```

---

## Google Docs Integration

### Generate Document from Template

```python
from googleapiclient.discovery import build

SCOPES = ['https://www.googleapis.com/auth/documents']
credentials = service_account.Credentials.from_service_account_file(
    SERVICE_ACCOUNT_FILE, scopes=SCOPES
)
delegated_credentials = credentials.with_subject('admin@yourdomain.com')

docs_service = build('docs', 'v1', credentials=delegated_credentials)
drive_service = build('drive', 'v3', credentials=delegated_credentials)

# Copy template document
template_id = '<template_document_id>'
copy = drive_service.files().copy(
    fileId=template_id,
    body={'name': 'Loan Agreement - John Doe'}
).execute()

document_id = copy.get('id')

# Replace placeholders
requests = [
    {
        'replaceAllText': {
            'containsText': {
                'text': '{{BORROWER_NAME}}',
                'matchCase': True
            },
            'replaceText': 'John Doe'
        }
    },
    {
        'replaceAllText': {
            'containsText': {
                'text': '{{LOAN_AMOUNT}}',
                'matchCase': True
            },
            'replaceText': '$500,000'
        }
    }
]

result = docs_service.documents().batchUpdate(
    documentId=document_id,
    body={'requests': requests}
).execute()

print(f"Document generated: https://docs.google.com/document/d/{document_id}")
```

---

## Testing

### Test Gmail Send

```bash
curl -X POST http://localhost:8010/google/gmail/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "test@example.com",
    "subject": "Test Email",
    "body": "This is a test email from Project Nyra"
  }'
```

### Test Calendar Event Creation

```bash
curl -X POST http://localhost:8010/google/calendar/create \
  -H "Content-Type: application/json" \
  -d '{
    "summary": "Test Appointment",
    "start": "2026-01-20T10:00:00-05:00",
    "end": "2026-01-20T11:00:00-05:00",
    "attendees": ["attendee@example.com"]
  }'
```

---

## Troubleshooting

### Common Errors

#### Error: `invalid_grant`

**Cause**: Refresh token expired or service account not delegated

**Solution**:
- Re-authorize OAuth flow to get new refresh token
- Verify domain-wide delegation is enabled for service account
- Check service account is impersonating correct user

#### Error: `insufficient permission`

**Cause**: Missing OAuth scopes

**Solution**:
- Add required scopes to OAuth consent screen
- Re-authorize with new scopes
- For service accounts, add scopes in domain-wide delegation

#### Error: `quotaExceeded`

**Cause**: API rate limit exceeded

**Solution**:
- Implement exponential backoff
- Request quota increase in Google Cloud Console
- Optimize API calls (batch operations)

### Rate Limits

**Gmail API**:
- 250 quota units/user/second
- 1 billion quota units/day

**Calendar API**:
- 1,000,000 queries/day
- 10 queries/second/user

**Drive API**:
- 1,000 queries/100 seconds/user
- 10,000 queries/100 seconds/project

### Security Best Practices

1. **Never commit credentials** to version control
2. **Use Infisical** for production secrets management
3. **Rotate service account keys** every 90 days
4. **Minimize OAuth scopes** - only request what's needed
5. **Validate redirect URIs** to prevent phishing
6. **Enable 2FA** on Google Workspace admin accounts
7. **Monitor API usage** via Google Cloud Console

---

## Resources

- [Google Workspace API Documentation](https://developers.google.com/workspace)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Service Account Guide](https://developers.google.com/identity/protocols/oauth2/service-account)
- [Python Quickstarts](https://developers.google.com/workspace/guides/get-started)
- [API Rate Limits](https://developers.google.com/workspace/guides/limits)

---

**Generated**: 2026-01-13
**Maintained by**: Project Nyra Development Team
