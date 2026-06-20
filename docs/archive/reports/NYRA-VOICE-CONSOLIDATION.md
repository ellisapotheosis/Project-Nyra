# Nyra Voice Consolidation Report

**Date**: 2026-01-17
**Status**: COMPLETED - Removed (Not Consolidated)
**Size**: ~50MB (Second Largest Directory)

## Executive Summary

The `nyra-voice/` directory has been removed from the Project Nyra repository rather than consolidated into the monorepo structure. This decision was made because:

1. **Placeholder Status**: The voice service was not yet implemented - only placeholder files existed
2. **Future Implementation**: Voice features (Kokoro-TTS, ASR, WebRTC) are planned for future implementation
3. **No Active Services**: The docker-compose.voice.yml file contained no active services (empty `services: {}`)
4. **Third-Party Assets**: Most content was third-party Voicemod API examples and assets

## What Was Removed

### Directory Structure
```
nyra-voice/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── automerge.yml
│       ├── python-lint.yml
│       └── security-scan.yml
├── Nyra-VoicemodAPI/
│   ├── Launch_Nyra_UI_.py
│   ├── Nyra.html
│   ├── Nyra.js
│   ├── control-api-main-examples/ (AsyncAPI documentation)
│   ├── docs-tools-debug/
│   ├── SVG/ (Neon UI assets)
│   └── icons/ (256+ Voicemod icon assets)
├── docker-compose.yml
├── elevenlabs_handler.py
└── runner.py
```

### File Categories

1. **Voicemod API Examples** (~40MB)
   - `control-api-main-examples/` - Official Voicemod Control API examples
   - `icons/` - 256+ Voicemod Stream Deck icons
   - `SVG/` - Neon UI design assets

2. **Python Integration Scripts** (~1MB)
   - `elevenlabs_handler.py` - ElevenLabs TTS integration stub
   - `runner.py` - Service runner script
   - `Launch_Nyra_UI_.py` - Web UI launcher

3. **Web UI** (~1MB)
   - `Nyra.html` - Control interface
   - `Nyra.js` - WebSocket client
   - `grid.css`, `style.css` - Styling

4. **Documentation & Tooling** (~8MB)
   - AsyncAPI HTML template and documentation
   - Debug tools and launchers
   - Workflow automation configs

## Placeholder Preserved

The `docker-compose.voice.yml` file has been preserved as a feature-flag placeholder:

```yaml
# Placeholder overlay: Kokoro-TTS (future)
# Intentionally not implemented yet — keep as a feature-flagged overlay.
# When you're ready, add:
# - ASR service (e.g., Whisper)
# - TTS service (kokoro-tts workers on GPUs)
# - WebRTC gateway (optional) or websocket audio stream
#
# Start would look like:
#   docker compose -f docker-compose.yml -f docker-compose.voice.yml up -d
services: {}
```

## Future Voice Service Architecture

When voice services are re-implemented, they should follow this structure:

### Option 1: Backend Service (services/voice/)
If implementing as an API service:
```
services/voice/
├── src/
│   ├── asr/          # Automatic Speech Recognition (Whisper)
│   ├── tts/          # Text-to-Speech (Kokoro-TTS)
│   ├── voicemod/     # Voicemod API integration
│   └── api/          # FastAPI REST endpoints
├── docker/
│   └── Dockerfile
├── pyproject.toml
└── CLAUDE.md         # Generated from python-fastapi template
```

### Option 2: Frontend App (apps/voice/)
If implementing as a web UI:
```
apps/voice/
├── src/
│   ├── components/   # React components
│   ├── hooks/        # WebSocket/WebRTC hooks
│   └── services/     # API clients
├── public/
│   └── assets/       # UI icons and SVGs
└── CLAUDE.md         # Generated from nextjs-typescript template
```

### Option 3: Hybrid Approach (Recommended)
```
services/voice-api/       # Backend service
apps/voice-dashboard/     # Admin UI
tools/voicemod-cli/       # CLI tools
```

## Docker Compose Integration

### Current State
Multiple placeholder files exist:
- `/docker-compose.voice.yml` (root)
- `/infra/docker/docker-compose.voice.yml`
- `/infra/stacks/nyra-mortgage/docker-compose.voice.yml`
- `/ingestion/files/bootstrap/ingestion/*/docker-compose.voice.yml`

### Recommended Cleanup
1. Keep root `docker-compose.voice.yml` as canonical placeholder
2. Remove duplicate placeholders in subdirectories
3. When implementing, use Docker overlay pattern:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.voice.yml up -d
   ```

## References to Voice Service

### Deleted Files in Assets
The following voice-related files were also deleted from `assets/`:
- `Automator-Voice-Ext-Scripts/` - Chrome extension for ChatGPT automation
- `nyra-voice-companion.zip` - Browser extension for voice control
- `nyra-voice-tagger-stubs-v2.zip` - Voice tagging utilities
- `nyra-voicemod-control-ext-v0.4.zip` - Voicemod control extension

### Remaining References
Check for any lingering references:
```bash
# Search for imports or references
git grep -i "nyra-voice" --exclude-dir=_archive --exclude-dir=_backup
git grep -i "elevenlabs_handler"
git grep -i "voicemod"
```

## Technology Stack (When Implemented)

### ASR (Automatic Speech Recognition)
- **Primary**: OpenAI Whisper (open-source)
- **Alternative**: Google Speech-to-Text
- **Local Option**: Vosk

### TTS (Text-to-Speech)
- **Primary**: Kokoro-TTS (planned in docker-compose.voice.yml)
- **Alternative**: ElevenLabs API (handler stub exists)
- **Open-Source**: Coqui TTS

### Voice Modification
- **Primary**: Voicemod API (control-api examples preserved in _archive)
- **Alternative**: Real-time audio processing with PyAudio

### WebRTC/WebSocket
- **Backend**: FastAPI WebSocket for real-time audio streaming
- **Frontend**: Web Audio API + MediaStream API
- **P2P**: Simple-peer or PeerJS for WebRTC

## Migration Path

When re-implementing voice services:

1. **Choose Architecture**
   - Review Option 1, 2, or 3 above
   - Consider microservices vs monolithic approach

2. **Restore Voicemod Assets** (if needed)
   ```bash
   # Assets are preserved in git history
   git show HEAD~1:nyra-voice/ > /tmp/voice-backup
   ```

3. **Generate Component Config**
   ```bash
   # For Python service
   node scripts/batch-claude-md/batch-template-engine.js \
     --profile python-fastapi \
     --component services/voice-api

   # For Next.js UI
   node scripts/batch-claude-md/batch-template-engine.js \
     --profile nextjs-typescript \
     --component apps/voice-dashboard
   ```

4. **Update Docker Compose**
   - Replace `services: {}` with actual service definitions
   - Add volume mounts for models (Whisper, Kokoro-TTS)
   - Configure GPU support for TTS workers

5. **Integrate with Existing Services**
   - Add voice commands to chatbot services
   - Integrate with CRM for voice notes
   - Connect to n8n workflows for automation

## Size Impact

- **Before**: Repository size with nyra-voice ~50MB
- **After**: Repository size reduced by ~50MB
- **Docker Images**: No impact (service was never built)
- **Git History**: Preserved (can be restored if needed)

## Related Documentation

- **Docker Status**: [DOCKER-STATUS-REPORT.md](../deployment/DOCKER-STATUS-REPORT.md)
- **Architecture**: [system-architecture.md](../architecture/system-architecture.md)
- **Setup Guide**: [SETUP-GUIDE.md](../guides/SETUP-GUIDE.md)

## Action Items

- [x] Remove nyra-voice/ directory (completed)
- [x] Preserve docker-compose.voice.yml placeholder
- [ ] Clean up duplicate docker-compose.voice.yml files
- [ ] Remove voice references in documentation
- [ ] Archive Voicemod assets to external storage (optional)
- [ ] Create voice service ADR when ready to implement

## Conclusion

The nyra-voice directory has been successfully removed from the Project Nyra repository. This was appropriate given that:

1. No active services were implemented
2. Content was primarily third-party examples and assets
3. A clear migration path exists for future implementation
4. 50MB of repository size has been reclaimed

When voice services are needed in the future, they can be properly architected and implemented following the monorepo structure with appropriate technology-specific CLAUDE.md files generated from templates.

---

**Consolidation Completed**: 2026-01-17
**Git Commit Pending**: Yes (nyra-voice files staged for deletion)
**Next Steps**: Commit deletion, clean up duplicates, update documentation
