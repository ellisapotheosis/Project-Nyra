
document.addEventListener('DOMContentLoaded', async () => {
  const $ = id => document.getElementById(id);

  chrome.storage.sync.get(null, data => {
    $('keepAlive').checked = !!data.keepAlive;
    $('autoDownload').checked = !!data.autoDownload;
    $('showToasts').checked = !!data.showToasts;
    $('shutdown').value = Number.isFinite(data.shutdownMinutes) ? data.shutdownMinutes : 0;
  });

  ['keepAlive', 'autoDownload', 'showToasts'].forEach(setting => {
    document.getElementById(setting).addEventListener('change', e => {
      const obj = {}; obj[setting] = e.target.checked; chrome.storage.sync.set(obj);
    });
  });

  $('shutdown').addEventListener('change', e => {
    const minutes = parseInt(e.target.value, 10) || 0;
    chrome.storage.sync.set({ shutdownMinutes: minutes });
  });

  $('forceDownload').addEventListener('click', async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab && tab.id) {
      chrome.tabs.sendMessage(tab.id, { type: 'forceScan' });
    }
  });
});
