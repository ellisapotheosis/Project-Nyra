let clientKey = localStorage.getItem("nyra-api-key") || "";
let polling = false;
let hotkeyEnabled = false;
let lastSpoken = "";

document.addEventListener("DOMContentLoaded", () => {
  const keyInput = document.getElementById("api-key");
  keyInput.value = clientKey;

  keyInput.addEventListener("change", () => {
    clientKey = keyInput.value;
    localStorage.setItem("nyra-api-key", clientKey);
  });

  document.getElementById("speak-btn").addEventListener("click", speakInput);
  document.getElementById("read-toggle").addEventListener("change", togglePolling);
  document.getElementById("read-once").addEventListener("click", readClipboardOnce);
  document.getElementById("hotkey-toggle").addEventListener("change", e => {
    hotkeyEnabled = e.target.checked;
  });

  window.addEventListener("keydown", handleHotkey);
});

function speakInput() {
  const text = document.getElementById("voice-input").value.trim();
  if (!text || !clientKey) return alert("Text or API key missing.");

  fetch("http://localhost:59125/v1/speak", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-client-key": clientKey
    },
    body: JSON.stringify({ text })
  }).then(r => {
    if (!r.ok) throw new Error("Failed to speak");
    return r.text();
  }).then(console.log).catch(e => {
    console.error("Speech failed:", e);
    alert("Speak failed. Is Voicemod running?");
  });
}

function togglePolling(e) {
  polling = e.target.checked;
  if (polling) pollClipboard();
}

function pollClipboard() {
  if (!polling) return;
  readClipboardOnce();
  setTimeout(pollClipboard, 3000);
}

async function readClipboardOnce() {
  try {
    const text = await navigator.clipboard.readText();
    if (text && text !== lastSpoken) {
      lastSpoken = text;
      document.getElementById("voice-input").value = text;
      speakInput();
    }
  } catch (e) {
    console.error("Clipboard error:", e);
  }
}

function handleHotkey(e) {
  if (hotkeyEnabled && e.ctrlKey && e.key === "n") {
    speakInput();
  }
}
