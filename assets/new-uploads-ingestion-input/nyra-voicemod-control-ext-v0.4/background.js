
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "nyra-tts-selection",
    title: "Nyra: Speak selection",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "nyra-tts-selection" && info.selectionText) {
    chrome.storage.local.get(["ttsVoiceName"]).then(({ ttsVoiceName }) => {
      const utter = new SpeechSynthesisUtterance(info.selectionText);
      if (ttsVoiceName) utter.voice = speechSynthesis.getVoices().find(v => v.name === ttsVoiceName) || null;
      speechSynthesis.speak(utter);
    });
  }
});
