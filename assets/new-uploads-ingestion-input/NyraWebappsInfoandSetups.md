Nyra Mortgage Assistant – System Specification (Dyad Prompt)

Overview

Nyra Mortgage Assistant is a web application aimed at automating mortgage lead management and follow-up, inspired by platforms like Bonzo and Agent Legend\[1]. It will exist in two versions: a Team Version for general use (core features without AI/voice) and a Personal Version with enhanced AI agents, dynamic rate quoting, full lead follow-up automation, and a Nyra voice assistant. This specification outlines the system architecture, features, and best-practice defaults for building the Personal Version first, then deriving the Team Version by disabling certain AI/voice modules. The goal is to use the user’s existing Tailwind UI as a base, adding new functionality layer by layer in a self-contained manner. We cover front-end design, backend schema, key integrations (Microsoft Graph, Twilio, etc.), scheduling logic, AI components, and a development roadmap for initial implementation.

Frontend \& UI

•	Tech \& Framework: Build the front-end as a responsive web app using Tailwind CSS (leveraging the existing HTML/vanilla JS components) and integrate React with Material-UI (MUI) for complex components and templates. This allows reuse of the provided static UI while introducing MUI’s structured components (e.g. pre-built login page, dashboard layout) for consistency and easier theming via Toolpad.

•	Dark Mode by Default: Enable a dark theme as the default appearance to improve UX. Use Tailwind’s dark mode classes or MUI’s theming to apply a dark palette (e.g. dark backgrounds, light text). Provide a theme toggle in the UI (the current navbar has a theme-switch menu for Light/Dark variants). For example, default to a dark theme (e.g. dark background, neon/accent highlights) but allow switching to light if needed.

•	Responsive Design: Ensure all pages are mobile-friendly and adapt to various screen sizes. Leverage Tailwind’s responsive utilities (e.g. md:flex, lg:grid) and MUI’s grid system. The existing layout uses a fixed sidebar for desktop and hides it on mobile\[2]; continue this approach with a collapsible drawer (using MUI’s Drawer or a Tailwind toggle) for smaller screens.

•	UI Components: Reuse and enhance provided components: the top navigation bar (with branding and user menu), sidebar menus for Campaign Types and Integrations\[3], and the dashboard content area. Introduce MUI form elements and modal dialogs as needed (e.g. for creating a new campaign or editing lead details) to complement the Tailwind-styled cards and buttons. Maintain a cohesive look by mapping Tailwind color classes to MUI theme (primary: #2563eb, secondary: #0ea5e9, accent: #8b5cf6 as defined in Tailwind config\[4]).

•	Auth \& Pages: Incorporate a secure login and signup page using an MUI template for a polished design (e.g. a sign-in form with Material TextFields). After login, the main view is the Dashboard (showing campaign stats, quick actions) and subpages for Leads, Campaigns, Analytics, Settings (placeholders exist in nav). In Personal version, add extra pages for Voice Assistant and Dev Agent Portal (these will be hidden or removed in Team version).

Lead Intake System

•	Lead Sources Integration: Automate lead capture by connecting to external sources:

•	Outlook Email (Microsoft Graph API): Set up an integration to pull new lead emails from a designated Outlook/Office365 inbox or folder. Use Microsoft Graph API (via OAuth2 with broker’s Office account) to monitor incoming emails containing lead info (e.g. from Zillow, LendingTree, or LeadMailbox alerts). Implement either a periodic poll (e.g. check every 5 minutes) or Graph webhook subscription for new messages. Parse the email content (or attachments/JSON if provided) to extract lead data (name, contact, loan info).

•	LeadMailbox API / Parser: If LeadMailbox (a lead management CRM) offers an API, use it to fetch leads directly. If not, parse the structured email notifications from LeadMailbox. The system can look for keywords or markers in the email subject/body to identify lead details. For example, use regex or simple NLP to find loan purpose or property info in the email text.

•	Auto-Classification of Leads: Upon intake, automatically categorize each lead into one of the campaign types: Refinance, Cash-Out Refi, Home Equity (HELOC/HELOAN), or Purchase. This can be determined by fields in the lead (e.g. “looking for cash out” vs “new home purchase”) or the lead source tag. Implement simple rules first (e.g. if loan purpose contains "cash out" or "debt consolidation", classify as Cash-Out Refi; if “home equity” or HELOC keywords, classify as Home Equity; if purchase price provided, classify as Purchase; else default to Refinance). This classification will decide which pre-written campaign timeline to attach the lead to.

•	Campaign Assignment: Once a new lead is captured and classified, attach it to the corresponding messaging campaign. Each campaign type has a predefined sequence of touches (texts, emails, calls) spread over days. For example, a Refinance lead triggers the “Refinance Leads” campaign timeline\[5]. The system should record a new entry in a Leads table (with lead info, source, category) and create scheduled communication events for that lead according to the campaign template (see Campaign Scheduler below). If the same lead comes in via duplicate sources, ensure no duplicate campaign runs (handle via lead email/phone as unique key).

•	Opt-Out \& Compliance: Implement TCPA-compliant opt-out handling. Include “STOP” instructions in initial texts (the UI has a checkbox to include STOP text\[6]). If a lead replies via SMS with "STOP" (or "UNSUBSCRIBE"), the system should immediately mark that lead as opted-out (store a flag in DB) and cancel any future scheduled messages to them\[7]. Leverage Twilio’s incoming message webhook to capture responses: on receiving a STOP message, update the lead’s status and send a final confirmation if required. Similarly, provide an unsubscribe link in emails and honor those requests. All opt-outs should be logged for compliance audit.

•	Integration Credentials \& Settings: Provide UI in Settings or Integrations for connecting these sources. For example, a form to input Microsoft Graph credentials or generate an auth token, and a section to input Twilio API keys (Twilio integration is highlighted in the sidebar\[8]). Store these securely (in a Supabase secure storage or server env variables). Also include toggles for which lead sources are active (so brokers can use Outlook email, Gmail, or both – Gmail integration is listed as well\[9], which could be added via Gmail API in the future).

Campaign Scheduler

•	Pre-Written Campaign Timelines: Define a campaign template for each lead type (Refi, Purchase, HELOC, etc.) consisting of a sequence of communication events over a 30–60 day period\[10]. Each event has a channel (SMS, email, phone call/voicemail), a relative timing, and message content template. For example, for Day 0 (day lead received): Immediately (T+0) send a text, after 30 minutes send an email, after 2 hours initiate a “missed call” with voicemail. From Day 1 or 2 onward, schedule events at specific times of day – e.g. Day 2 at 10:00 AM send a follow-up email, Day 3 at 5:30 PM send a text, Week 2 make a call, etc. This approach ensures immediate follow-up then regular touchpoints during business hours on subsequent days\[11]. Each campaign timeline will be stored (perhaps in a CampaignTemplates table or JSON config) so it can be applied to new leads automatically.

•	Scheduling Engine: Implement a backend scheduler service that creates and dispatches these events. When a lead is added, generate all the scheduled events for that lead according to the timeline template (compute the exact datetime for each event based on lead’s creation time for Day0 relative events, and calendar dates for fixed Day 2+ events). Save these in a ScheduledEvents (or Communications) table with fields: lead\_id, type (sms/email/call), scheduled\_datetime, status, etc. A background job runner will regularly check for due events and execute them. For precision, using a job queue library (e.g. Bull or Agenda in Node.js) is recommended to schedule jobs at specific times. Alternatively, use CRON tasks (e.g. a cron job every minute to send due messages, or use Supabase Edge Functions with a cron trigger if available).

•	Message Dispatch: For each scheduled event, the system sends out the communication via the appropriate integration:

•	SMS: Use Twilio API to send text messages. The content can be a template filled with the lead’s name or loan info. The Twilio phone number is configured in settings. After sending, update the event status (sent, and later possibly delivered status via Twilio callbacks).

•	Email: Use an email service or SMTP. This could be via Outlook Graph send mail, or a service like SendGrid. The email content can include dynamic fields (loan quote, agent signature, etc.). Support HTML emails for rich content (and embedded visuals from the Quote Generator).

•	Voice Call (Ping) \& Voicemail: Use Twilio Voice to simulate a call. For a “missed call ping,” the system can initiate an outbound call via Twilio Voice API and immediately hang up after one ring (so the recipient’s phone shows a missed call). Then, a few minutes later, drop a voicemail: initiate another call that goes straight to voicemail or plays a prerecorded message. Leverage Twilio’s Answering Machine Detection to play the voicemail recording when the call is answered by voicemail. The prerecorded voicemail file can be uploaded by the user (e.g. an MP3 of the broker’s voice) and stored (e.g. in Supabase storage or Twilio assets) for playback. Each voice event can thus either call+hangup or call+play-message as needed to mimic the Bonzo/Agent Legend strategy\[12].

•	Campaign Management: Provide a UI to monitor and adjust campaigns. On the Campaigns page, list each campaign type with its message schedule. Allow editing the schedule (e.g. changing times or message content) and saving changes to the template. Also display a timeline of communications for each lead in the Leads detail view (so the broker can see what has been sent and what is upcoming). The communication panel UI (the bottom-right widget in the HTML) can show recent interactions and allow manual sending of a message if needed\[13].

•	Logging \& Audit: Every automated communication is logged in the database (in a Communications/Logs table) with timestamp, channel, content, and status (pending, sent, delivered, responded, etc.). This provides an audit trail for compliance\[14] and allows re-sending or cancelling events. If a message fails (e.g. Twilio error, email bounce), mark it and possibly retry or alert the user. Also log lead responses (like reply texts or emails) in the same thread for context. In the Personal version, these logs might feed into the AI’s memory; in Team version, they’re just for user reference and compliance reports.

Quote Generator (v1)

•	Purpose: Provide an automated loan quote for each lead, to include in follow-ups. Initially, this will use placeholder logic and manual inputs (since the existing Excel-based rate sheet is locked). The idea is to eventually replace manual quoting with dynamic pricing from a rate engine\[15].

•	v1 Implementation: Start with a simple form or script to calculate a basic mortgage payment. For example, allow the broker to input or confirm key figures for the lead (loan amount, estimated interest rate, term, property taxes, insurance, etc.), then compute monthly Principal \& Interest (P\&I) and optionally PITI (P\&I plus taxes, insurance, and PMI). Use standard formulas for monthly payments. Also calculate potential cash-out amount or cash-to-close if it’s a refinance scenario. These results can be stored as a Quote object linked to the lead.

•	Visuals: Generate a quick visual representation of the quote to include in emails or texts. For example, a small bar chart or pie chart showing the monthly payment breakdown (principal vs interest vs escrow), or a comparison of current vs new payment if refinancing. This can be done by using a chart library (like Chart.js) to render a chart on a canvas and then converting to an image, or using an external image API. The image URL or base64 can be embedded in an email template to give the borrower a visual aid. If not using an image, a formatted summary text (e.g. “$2,150 total payment (PITI) with $500 cash-out at closing”) can be included.

•	Future Integration: Plan for integrating a real pricing engine: for example, LenderPrice API or Rocket Mortgage’s rate API (if available) to fetch live rate quotes. Once access is available, an agent or backend module can input the borrower’s info into these systems to retrieve accurate quotes\[16]. RocketMortgage might not have a public API, but a headless browser or RPA approach could be attempted by an AI agent. LenderPrice or similar LOS pricing engines do often provide APIs for partners – if so, secure the API credentials in settings and call their endpoint (with loan parameters) to get interest rates, points, etc. Then update the Quote with the official data.

•	Integration with Campaigns: Tie the Quote into the campaign messaging. For instance, the Day 1 follow-up email could include “Here’s a quick quote for you” with the calculated payment and the visual. If quotes are not ready automatically, allow the broker to review/edit the quote before it goes out (e.g. a notification that asks the user to confirm the auto-generated quote). Eventually, with fully automated quoting, the AI or backend will generate the quote immediately so early communications include it without manual step.

Voice Integration (Personal Version)

•	Voice Assistant UI: Add a dedicated page (or modal) in the Personal version for the Nyra Voice Assistant. This page provides a real-time voice conversation interface, allowing the user (Ellis) to speak with the AI assistant. Use the browser’s microphone input (via the Web Speech API or a library like react-speech-recognition) to capture the user’s voice. Display a “Hold to Talk” button or always-listening toggle to start/stop recording audio. Immediately transcribe the speech to text (for example, using the Web Speech API locally, or sending the audio to a speech-to-text service for better accuracy if needed). Show the recognized text in the chat interface.

•	Real-Time Response: Once the user’s query is transcribed, send it to the Nyra backend (likely the orchestrator agent, see AI Dev Portal) to generate a response. The response (text) is then converted to speech and played back to the user. For TTS (text-to-speech) generation, start with ElevenLabs API for a high-quality, lifelike voice for Nyra. ElevenLabs can clone voices or use preset voices; choose one that fits Nyra’s persona (or eventually clone the user’s preferred voice). The generated audio stream or file is then played in the browser (e.g. using an HTML5 Audio element). Aim for low latency: possibly break the response into sentences and stream them as they come (ElevenLabs supports streaming).

•	Voice Tech Evaluation: Keep the voice system modular to allow swapping out providers: evaluate Voicemod’s Control SDK (if available) for real-time voice modulation or local voice generation. Also consider an open-source TTS approach: Kyutai’s NextTTS model can be run locally (with an RTX 5090 GPU, as available) for real-time streaming speech\[17], possibly via a ComfyUI workflow node\[18]. ComfyUI plus a custom node for TTS could generate audio on the local machine, avoiding external API calls. The system could either use local TTS when the user’s hardware is online (the laptop GPU) and fall back to cloud TTS when not. Similarly, for speech-to-text (STT), we can use a local model (like Whisper or Vosk) or a cloud API (Google Cloud Speech) depending on latency and accuracy needs.

•	Interactive Conversations: The voice assistant should handle back-and-forth conversation. Implement barge-in logic if needed (e.g. detect if user interrupts the assistant). The assistant’s responses should also be displayed as text on the screen (for clarity or if audio is off). The conversation context should be preserved (use the GPT memory store so Nyra remembers previous questions in the session). For example, if the user asks via voice “What’s the status of lead John Doe’s loan?” the system (Nyra agent) can recall John Doe’s data and respond, then a follow-up question “What documents are we missing for him?” would be answered in context without repeating who “him” is.

•	Orchestrator vs Direct Agent: Depending on the query type, the voice input might be handled by different AI agents. We will have an Orchestrator AI agent that can route the query: if it’s about development or internal system (for the Dev Portal), the orchestrator might handle or delegate to a dev agent; if it’s a general mortgage question or something Nyra knows, Nyra (as a primary assistant agent) can answer directly. The system should identify the context (perhaps via keywords or a classification prompt to GPT) to choose the appropriate responder. In practice, initial implementation can keep it simple (one AI handles all voice queries), but structure the code to allow plugging in a decision layer later.

•	Twilio Voice (Future): As an extension, consider integrating Twilio’s voice channels to allow phone call interactions. For example, the user could call a Twilio number to access Nyra via phone, or Nyra could call the user proactively with updates. Twilio’s Voice Agent or TwiML bins could connect the call audio to our assistant (perhaps using Twilio Media Streams to pipe audio to our STT service and respond via synthesized voice). This is a complex orchestration but could enable voice access when the user isn’t at the web app. For now, focus on the in-browser voice chat as the primary interface.

AI Dev Portal (Personal Only)

•	Purpose: The Personal version will include an AI Developer Portal – a private page where the user can interact with the AI agents regarding development and system management tasks. This is essentially a multi-agent “control center” for Nyra. The user (Ellis) can ask Nyra about ongoing development progress, instruct new features, review agent logs, and even get coding assistance. The portal is only available in the nyra-assistant-ellison build and not accessible in the Team version.

•	Design \& UI: Provide a chat-style interface (similar to ChatGPT or a console) where Ellis can converse with the Orchestrator Agent (Nyra’s coordinator). On one side, a text area (and optional voice input, reusing the Voice Integration) allows Ellis to ask questions or give commands. The assistant’s responses appear in a dialogue format. Above or alongside the chat, display a panel with System Status and Agent Logs: for example, a list of the various agents (Lead intake agent, Quote agent, Compliance agent, etc.) with their current status or last action, and a real-time log feed of recent actions taken by the agents (like “Lead classified as Refi – scheduled SMS” or “Generated quote for Lead #123”). This gives transparency into the AI’s autonomous activities.

•	Memory \& Context: Unlike a stateless chatbot, Nyra here should maintain persistent memory of the project’s context and past conversations. Use GPT-4 or Claude with a vector-store memory: e.g., store key conversation points and project data (requirements, decisions) in a database or embed into a vector store (like Pinecone or Supabase pg\_vector). Each query, fetch relevant history and logs to include in the prompt so the AI has continuity. This way, when Ellis resumes the conversation after a day, Nyra still “remembers” previous discussions about tasks or issues. No hard resets unless explicitly cleared.

•	Agent Collaboration: The orchestrator agent can take certain commands from the user and coordinate sub-agents to execute them. For instance, if Ellis says “Generate a new campaign template for VA loans and add it,” the orchestrator might instruct a code-gen agent to create the template JSON and insert it into the system. The portal could list such proposed changes or actions for confirmation (to avoid autonomous changes without approval). In a future iteration, this could tie into a CI/CD pipeline or use a framework like AutoGPT or LangChain to let agents propose code and have it validated. Initially, implement a simpler flow: Nyra can output suggestions or code blocks which the user can manually review and apply.

•	Embedded Code Editor (Optional): For a more interactive dev experience, embed a code editor component (like Monaco Editor or CodeMirror) where the assistant can display code snippets or the user can open a file from the project. This would allow viewing code that Nyra suggests modifying or creating. In an advanced scenario, the user could even execute code directly (for example, running a snippet in a sandbox or triggering a backend rebuild). However, initially this can be read-only or just for copy-paste convenience. The main goal is to let the AI help with development (explain code, suggest improvements, maybe generate functions) in context.

•	Use Cases: In this portal, Ellis can ask things like: “What is the next scheduled message for lead Jane?” and Nyra (with access to the database) will answer from data. Or “Show me the error logs from the past hour” and the portal can display logs. Or “I have an idea for a feature: auto-send birthday greetings to past clients” and Nyra will record it or even create a task stub. Essentially, this blends conversational AI with dev ops, enhancing personal productivity.

Branching Structure for Team vs Personal

•	Codebase Strategy: Maintain a single codebase with conditional modules to produce the two versions – nyra-assistant-team (Team Version) and nyra-assistant-ellison (Personal Version). Use configuration flags or environment variables to enable/disable features. For example, a flag ENABLE\_AI\_FEATURES=false can strip out or hide the AI-heavy components for the Team build. In a React app, one could use environment-specific builds (e.g. .env.team vs .env.personal) and conditionally include routes or components. Likewise, backend services can check the mode to decide whether to load certain agents or endpoints.

•	Features to Exclude in Team Version: All AI and voice related functionality should be turned off or removed in the Team variant. This includes the Voice Assistant page, the AI Dev Portal, any GPT-based lead scoring or chatbots, and dynamic auto-quoting by AI. The Team version will still have automation (campaign scheduling, template-based messages) since that’s rules-based, but any responses or content that would come from an AI model should be replaced with static or user-provided content. For instance, in the Team version, the broker would manually write their campaign message templates (or use default texts), whereas in the Personal version Nyra could potentially draft or adjust messages using AI.

•	Build/Deployment: Set up two separate deployment outputs. This could be two separate front-end builds and env files, and perhaps a runtime check for backend. For example, when building for Team, exclude the AI modules from bundling. If hosting on a platform, deploy two instances with different configurations. The repository can be structured so that the core functionality is in a shared directory, and a separate folder (or config) holds personal-only extensions (voice, AI portal, agent logic). Use clear separation to avoid accidentally leaking personal features into team build.

•	User/Role Management: Another approach (if a unified app is desired) is to use role-based feature flags. E.g., the “Ellis” user (personal) has admin privileges that show the AI portal and voice, whereas other users do not see those options. However, since the question explicitly wants two exportable versions, it’s cleaner to build them as parallel products.

•	Testing Both: Ensure that after implementing features for Personal, test that the Team variant runs smoothly with those features disabled. For instance, wrap AI API calls in checks so if no API key or if in Team mode, those calls are skipped entirely. The Team version’s UI should not have blank spots – so likely hide the Voice page and Dev portal navigation entries. The remaining features (lead intake, campaign automation, quoting UI) should function normally for team users.

•	White-Labeling: Although not asked explicitly, consider that the Team version might be used by other brokers/teams. So keep the branding (name “Nyra”) somewhat configurable for white-label. At least in code, don’t hardcode personal identifiers that are not toggled by config. This will make it easier to offer the Team app to others with their custom branding in the future\[19].

Suggested Third-Party Tools \& Libraries

(Incorporate these libraries to accelerate development and adhere to best practices in the respective areas.)

\- Supabase (PostgreSQL DB + Auth): Use Supabase for the backend data store and authentication. Supabase Auth provides easy user sign-up/login (email/password or OAuth) to secure the app. The database (Postgres) will house leads, campaigns, users, communication logs, etc., and Supabase’s JS client can be used on the front-end to query data securely. Also, Supabase storage can keep any uploaded assets (like voicemail audio files or image assets). Using Supabase aligns with a serverless approach, and we can write edge functions for webhooks (e.g., a Supabase function endpoint for Twilio to call on incoming SMS).

\- Microsoft Graph API (Outlook integration): As noted, integrate via MS Graph to fetch Outlook emails. Utilize the official Graph JavaScript or Python SDK on the backend to subscribe to mail notifications or periodically read from the mailbox. This will require Azure app registration and user consent. The Graph API provides structured data (JSON) for emails which eases parsing.

\- Twilio (SMS, Voice): Leverage Twilio’s Node.js SDK for sending SMS and making calls. Twilio’s services cover our needs for text messaging, phone calls, and even WhatsApp if needed later. Use Twilio Programmable Voice for handling the voicemail drop calls (with TwiML instructions to play recordings). Also use Twilio Conversations or SendGrid (Twilio owns SendGrid) for sending emails in a coordinated way if desired. Twilio will also handle incoming message webhooks for STOP opt-outs.

\- Material-UI + Toolpad: Material-UI (MUI) React components will be used for out-of-the-box UI elements like modals, buttons, and responsive grid layouts. MUI Toolpad is specifically useful for building internal tool UIs; since our app has a dashboard/admin flavor, using Toolpad’s components (like <DashboardLayout>, data grids, forms) can speed up development\[20]. It also ensures consistent styling with the MUI theme. We will integrate Tailwind with MUI by limiting Tailwind mostly to utility classes and custom designs, while using MUI for standard components and theming.

\- n8n (Workflow Orchestrator) \[Future]: Consider using n8n (an open-source workflow automation tool) for scheduling and integrating various services without writing all logic from scratch. For example, n8n flows could handle “when a new lead is added, wait X minutes then send SMS, wait Y then send email,” etc. This can complement or replace our custom scheduler if complexity grows. It’s not needed in the MVP, but structuring our system to possibly trigger n8n workflows (via webhooks or API calls) could offload some automation logic to a visual tool, making it easier to adjust sequences without code changes.

\- AI Libraries: For the AI capabilities, use OpenAI’s API (GPT-4 or GPT-3.5) for natural language understanding and generation (e.g., classifying leads, composing message text, answering user queries in Dev Portal). If using Claude (Anthropic) for long-form memory, that could be via their API. Employ a library like LangChain to manage prompts and memory for the orchestrator agent. Multi-agent collaboration can be orchestrated with frameworks like LangChain Agents or custom logic. We might also use Open Interpreter or similar to allow the AI to execute code (for example, running a Python snippet to get some data) in a controlled sandbox – this aligns with the dev assistant concept.

Optional Enhancements

•	Visual Agent Network Viewer: To make the multi-agent system transparent, implement a visual representation of the agents and their interactions. This could be a modal in the Dev Portal that shows a Mermaid.js diagram or a dynamic graph (using D3.js) illustrating each agent (Lead Intake Agent, Quote Agent, Orchestrator, etc.) and communication between them. For instance, when the orchestrator delegates a task to the quote generator agent, an arrow could light up. This is mostly for the Personal version as a debugging/visual aid to understand the AI system’s structure. It could be updated in real-time or just a static diagram.

•	Scheduled Functions for Events: We can incorporate more robust scheduling by using serverless cron jobs. For example, Supabase Edge Functions can be triggered on an interval to scan and send due communications, or we could integrate with a cron-as-a-service. Another approach is to use Node Cron in our backend if it’s running constantly. For reliability, an external scheduler or even database-driven scheduling (with pg\_cron extension) could ensure messages go out even if one service restarts. In the long term, using a message queue (like RabbitMQ or Redis queues) and worker processes might be needed as volume grows.

•	Further Integrations: Down the line, integrate with Loan Origination Systems (LOS) and CRMs: e.g., connect to LendingPad or Encompass to push pulled credit or application data automatically\[21], or sync lead status with Salesforce/HubSpot for team version clients. These aren’t immediate, but designing the system with a modular API layer will make adding integrations easier.

•	Compliance Checks: Implement automated compliance scans (especially for personal version to assist the user). For instance, an agent that reviews communications to ensure no restricted language, or checks that certain disclosures have been sent within required time frames (this ties into the compliance \& reporting from the plan\[22]). The system could alert the user if, say, a Lead has no credit pull recorded after X days, etc. This could use simple rules or even an AI classification of risk.

Backend Schema \& API Endpoints

(A concise proposal of the database schema and key API endpoints is given to guide implementation.)

•	Database Schema: Using a relational database (Supabase/Postgres), create tables such as:

•	Users: (id, name, email, password\_hash … plus role or version flag to distinguish personal user vs team users)

•	Leads: (id, name, email, phone, source, type, received\_datetime, status, opted\_out etc. – store classification type like “Refi” or “Purchase” in type).

•	CampaignTemplates: (id, type, name, timeline\_json … where timeline\_json defines the sequence of events relative to Day0 and day-of-week/time for later days, including message templates.) Alternatively, separate CampaignEvents table with one row per template event (fields: campaign\_type, offset\_minutes or day+time, channel, template\_content).

•	ScheduledEvents/Communications: (id, lead\_id, channel (sms/email/voice), scheduled\_time, status (pending/sent/etc), template\_id, content, result\_info). This table is populated when leads come in. It can also log completed sends by updating status or inserting into a CommunicationsLog table if we want to separate future events vs sent history.

•	Quotes: (id, lead\_id, loan\_amount, interest\_rate, term, monthly\_PI, monthly\_PITI, cash\_out, ltv, dtI, created\_by\_ai BOOL, created\_at). Stores quote calculations. Possibly include a JSON field for full amortization or breakdown.

•	AgentLogs (Dev only): (id, timestamp, agent\_name, message etc.) to accumulate logs from AI agents’ actions or important decisions. This is for the Dev Portal display.

•	Settings/Integrations: Could be a table or simply use environment variables. If using a table: (user\_id, setting\_name, value) for things like Twilio Account SID/auth, email SMTP credentials, API keys, etc., so they can be managed via UI. Sensitive values should be encrypted.

•	Example API Endpoints: (assuming a RESTful API or RPC endpoints, these could be implemented as Supabase Edge Functions or an Express server in Node)

•	POST /api/leads – Add a new lead (used by email parser or manual input form). Request body might be the lead info JSON. Server will save the lead and trigger campaign scheduling (creating ScheduledEvents for that lead). Respond with lead ID and scheduled events created.

•	GET /api/leads – List leads for the authenticated user (with basic info and status). Support query params like ?status=active or pagination.

•	GET /api/leads/{id} – Get detailed info for a single lead, including associated communications log and quote if available.

•	POST /api/leads/{id}/optout – Mark a lead as opted out (this can be called internally when an SMS "STOP" is received, or via UI if the user manually opts them out).

•	POST /api/campaigns/test-send – (For user to test a campaign message) Possibly triggers sending a test message to the user’s number/email for a given template.

•	GET /api/campaign-templates – Fetch the campaign templates (so the front-end can display or edit them).

•	PUT /api/campaign-templates/{type} – Update the timeline or messages for a campaign type.

•	POST /api/quote/{lead\_id}/generate – Generate a quote for a lead. In v1 this might simply calculate based on provided or default parameters. In future, it could call external APIs or an AI agent to populate.

•	GET /api/quote/{lead\_id} – Retrieve the saved quote (if any) for display.

•	POST /api/devagent – (Personal only) Endpoint to handle messages from the Dev Portal to the orchestrator AI. This takes a user query/command, calls the AI system (perhaps an internal function using OpenAI API), and returns the assistant’s response (and possibly triggers some action).

•	GET /api/agent-logs – (Personal) Returns recent agent logs from the database for display in the portal. This could be filtered by agent or severity.

•	Webhook endpoints: e.g. POST /webhook/twilio/sms for incoming SMS (Twilio will call this with a payload when a lead replies STOP or otherwise), POST /webhook/graph for Outlook notifications if using Graph webhooks, etc. These will update the system state accordingly.

All API endpoints should enforce authentication (use Supabase Auth JWT or similar) to protect data. The personal version might also have an extra layer for the dev commands (only the admin user can call them).

Initial Development Plan

To implement the Personal Version efficiently, proceed in structured stages:

1\.	Backend Setup \& Auth: Initialize the Supabase project (or backend server). Define the database schema (tables for users, leads, templates, etc.) and set up Supabase Auth for user management. Verify that the user can register and log in via a basic UI. This provides the foundation for secure data separation.

2\.	UI Scaffolding: Import the existing Tailwind CSS and HTML components into a React project (if using React). Recreate the layout using MUI’s responsive container and the Tailwind classes for styling. Ensure the dark mode default is applied (e.g. add a dark class on body or use MUI theme provider with dark palette). Implement the navigation bar and sidebar as React components, and create empty pages for Dashboard, Leads, Campaigns, etc., as well as placeholders for Voice and Dev Portal (hidden behind a feature flag/env for now). Confirm that the UI is responsive and theming works.

3\.	Lead Intake Integration (Phase 1): Implement a simple lead ingestion flow. For initial testing, this could be a manual form on the Leads page to input a new lead (name, email, loan type). Submitting this form calls POST /api/leads which saves to DB and triggers creation of scheduled events (we can write a backend function to simulate scheduling by just logging for now). This ensures the data model and basic scheduling logic are in place. Later, integrate the actual Outlook email fetch: set up a background script or cron that fetches the latest email and if a new lead email is found, calls the same POST /api/leads internally. (During development, this can be mocked or tested with sample emails.)

4\.	Campaign Scheduling \& Twilio (Phase 1): Develop the campaign scheduler service. This could run as part of the backend (e.g. a Node cron job checking ScheduledEvents every minute). For now, implement logic to find any event due in the past <= now, mark it as sending, and actually perform the send. Focus first on SMS sending via Twilio (since that’s straightforward): integrate Twilio API with test credentials, and have the scheduler send out a dummy SMS to a developer test number when a scheduled SMS event’s time comes. Verify the message is received. Next, implement email sending for scheduled email events (could use a simple SMTP to your own email for test). The voice call events can be stubbed initially (log that “would call now”), to be expanded later. Ensure that after sending, the event status updates to “sent” and appears in a communications log.

5\.	Lead Management UI: Build out the Leads page to display leads from the database. Show key info like name, loan type, status (e.g. “Active” or “Opted-Out”), and when they came in. Allow clicking a lead to view details: on a Lead Detail view, list the timeline of communications (both past sent and future scheduled). This data comes from the Communications table. Also show a section for Quote (if available) on the lead detail. This will help in testing that everything is hooking together.

6\.	Quote Generator (Phase 1): Create a simple quote form/modal that a user can open for a lead. Let the user input loan amount, interest, etc., and compute a monthly payment. Display the result in a modal and save it to the Quotes table. Also, generate a basic chart or even just text summary and store that (or regenerate on the fly for emails). Integrate this with campaigns by updating the email template to include the quote info (e.g., in the Day 1 email template, insert placeholders for payment or attach the chart image if generated). Test that the email that goes out contains this info.

7\.	Opt-Out Logic: Implement the Twilio webhook for incoming SMS. In the development environment, you can simulate this by calling the webhook endpoint with sample data. Make sure sending "STOP" triggers the database update (lead.opted\_out = true) and the scheduler checks this flag before sending anything (i.e., skip or cancel any pending events for opted-out leads). Similarly, add a manual “Opt Out” button in the UI on the Lead detail so a user can stop communications for that lead.

8\.	Voice Assistant (Phase 1): Implement the voice page with minimal functionality to start. Use the Web Speech API for speech-to-text in the browser (this avoids needing server STT initially). When the user speaks, capture the text and simply echo it back via text-to-speech using the browser’s SpeechSynthesis (as a placeholder). This tests the microphone and audio output pipeline. Then integrate ElevenLabs: call the ElevenLabs API with a fixed text (e.g., “Hello, I am Nyra.”) and play the returned audio to ensure API connectivity. After that, wire the pipeline: user speaks -> text -> (send text to a dummy AI endpoint that just responds with a canned answer or the same text for now) -> TTS -> play audio. This establishes the round trip. Later, the dummy AI endpoint will be replaced with the real orchestrator logic using OpenAI.

9\.	Orchestrator \& Dev Portal (Phase 1): Set up a basic OpenAI API call for the Dev Portal chat. For example, create an endpoint /api/devagent that takes a prompt, and returns GPT-4’s response (with some system prompt giving it knowledge of being an assistant for this project). Incorporate minimal context (maybe agent logs or a hardcoded “project summary”) just to test. On the front-end, build the Dev Portal page to display a chat interface (user query and response). Test this with a simple question like “How many leads do we have?” – since the AI doesn’t yet have integration, initially it won’t know. This is just to get the plumbing in place. You can then enhance the orchestrator to actually query the database for such questions (either by pattern matching certain queries in code, or by giving GPT tools/knowledge via plugins or additional context in the prompt). Setting up LangChain agents here would be next steps after MVP.

10\.	Refine AI and Voice (Phase 2): With the core flows working in basic form, now focus on improving the AI integration. Feed real data to GPT for Dev Portal queries (e.g., include a summary of leads or recent events in the prompt). Expand the orchestrator to handle at least two modes: dev questions vs general (or implement a simple command syntax like “/dev” prefix for dev tasks vs normal). For voice, integrate the actual OpenAI conversation: allow the user to ask something via voice, send that text to the same AI agent and get an answer, then TTS. This effectively merges the Dev Portal chat agent with the voice interface (one could reuse the orchestrator agent for both). Also, experiment with local TTS if feasible and compare.

11\.	Polish UI \& Branching: Clean up the UI, ensure all features are accessible and intuitive. Add loading spinners and error handling (e.g., if an API call fails or AI times out, inform the user). At this stage, implement the build toggle for Team version: e.g., disable the voice and dev portal routes via config. Test the Team build thoroughly – a team user should experience a robust lead management and campaign tool without any AI elements appearing. Ensure documentation or comments in code clearly delineate these sections for maintainability.

12\.	Testing \& Iteration: Populate the system with some sample data (maybe import some dummy leads) and simulate the full cycle: lead comes in -> scheduled messages go out (perhaps using test phone numbers/email addresses) -> opt-out if needed -> check logs -> try voice queries etc. Conduct end-to-end testing. Use this phase to identify any bugs or improvements (like adjusting campaign timings, improving classification logic with real examples, etc.).

Throughout development, maintain best practices: use version control, write modular code (e.g., separate service classes for lead intake, scheduler, comms sending), and include comments for any complex logic (especially around orchestrating the AI agents). By following this plan, we first achieve a working Personal version with core automation, then we can confidently strip back the AI for the Team version deliverable. Each layer of functionality is added progressively, which aligns well with using an AI co-developer like Dyad to generate code for one piece at a time and integrate it.

\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_\_

\[1] \[10] \[11] \[12] \[14] \[15] \[16] \[19] \[21] \[22] MortgageAssistBONZOStepByStepGuide.txt

file://file-B1XQaYh7R4nMSRM33Lk4a9

\[2] \[3] \[4] \[5] \[6] \[7] \[8] \[9] \[13] index.html

file://file-KCxTbuyEF22y9xyV8fQzby

\[17] Kyutai TTS

https://kyutai.org/next/tts

\[18] KyutaiTTS ComfyUI Node

https://comfyai.run/documentation/KyutaiTTS

\[20] Page Container - Toolpad Core - MUI

https://mui.com/toolpad/core/react-page-container/



