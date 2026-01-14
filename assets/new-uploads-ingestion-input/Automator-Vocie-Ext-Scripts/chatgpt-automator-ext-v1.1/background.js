
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({
    keepAlive: true,
    autoDownload: true,
    showToasts: true,
    shutdownMinutes: 0
  });
});

// Receive download requests and trigger chrome.downloads (more reliable than anchor clicks)
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.type === 'download' && msg.url) {
    chrome.downloads.download({ url: msg.url, saveAs: false }, id => {
      sendResponse({ ok: true, id, url: msg.url, lastError: chrome.runtime.lastError?.message });
    });
    return true; // async
  }
  return false;
});
