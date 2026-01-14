
# Nyra Voicemod Control (Extension)

A Chrome (MV3) extension that talks to the **Voicemod Control API** on localhost and gives you:
- Live **voice** list
- Filtered **soundboard** list (default: `Nyra`)
- **Set Voice**, **Play Sound**, **Stop All**, **Toggle Voice Changer**, **Toggle Hear Myself**, **Mute/Unmute Mic**
- Fetch & display **bitmaps/icons**
- **Context menu**: Nyra → Speak selection (Chrome TTS)

## Install
1) Request an API key and install Voicemod (see docs).  
2) Load this folder via **chrome://extensions → Load unpacked**.  
3) Open **Options** and paste your API key; ensure Voicemod is running.  
4) Open the popup.

## Notes
- We cycle the documented port list and send `registerClient` first, then run commands.  
- Voices come from `getVoices`; soundboards come from `getAllSoundboard`.  
- Slots/rows in the Voicemod UI are not exposed via API; we simply list the `Nyra` board's items.  
- Bitmaps use `getBitmap` for `voiceID` or `memeId`.
