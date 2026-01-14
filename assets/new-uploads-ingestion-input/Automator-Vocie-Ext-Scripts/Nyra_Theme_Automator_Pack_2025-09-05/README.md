# Nyra Theme + Automator Pack

This bundle includes:
- **Stylus theme** (`styles/Apotheosis_Xulbux_Glow_v3.user.css`) — fixes hidden-on-black text by forcing accent color on true black backgrounds.
- **Automator Chrome Extension** (`automator_extension/`) — load unpacked to get hotkeys (copy last answer, toggle compact UI).
- **Tampermonkey/Scriptmonkey userscript** (`tampermonkey/nyra-scriptmonkey-automations.user.js`) — helpful hotkeys & utilities.

## Install

### 1) Stylus Theme
1. Install the **Stylus** extension for your browser.
2. Open Stylus → *Manage* → *Write new style* → *Import* this file (`Apotheosis_Xulbux_Glow_v3.user.css`) or drag it into Stylus.
3. Ensure the variable **Accent Hex** is `#7169EB` (Xulbux Purple).

### 2) Automator Extension (MV3)
1. Go to `chrome://extensions` → toggle **Developer mode** (top right).
2. Click **Load unpacked** and select the `automator_extension` folder.
3. Hotkeys:
   - **Alt+Shift+C** → copy the last assistant message
   - **Alt+Shift+U** → toggle compact UI

### 3) Tampermonkey / Scriptmonkey
1. Install **Tampermonkey** (or Scriptmonkey) extension.
2. Click the extension icon → *Create a new script…* → paste the contents of `nyra-scriptmonkey-automations.user.js` **or** drag the file in to install.

## Notes
- The CSS includes a safety rule that makes any text drawn **directly on pure black** (`#000` / `rgb(0, 0, 0)`) show in the accent purple to avoid invisible text.
- If you run into any element still hiding, add its selector to the `:where(...)` block near the end of the CSS and reload.

Generated: 2025-09-05
