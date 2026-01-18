
(async function () {
  const observed = new Set();
  let settings = await chrome.storage.sync.get(null);

  function showToast(message) {
    if (!settings.showToasts) return;
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px; background: #1e1e2f; color: #fff;
      padding: 10px 16px; border-radius: 6px; font-size: 14px; z-index: 2147483647;
      box-shadow: 0 0 8px #000000aa; opacity: 0.96;`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function keepAlive() {
    if (!settings.keepAlive) return;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift", bubbles: true }));
  }

  function isDownloadable(a) {
    if (!a || !a.href) return false;
    const href = a.href;
    const hostMatch = /files\.oaiusercontent\.com/i.test(href) || href.includes("/mnt/data/");
    const hasDownload = a.hasAttribute("download");
    const isBlob = href.startsWith("blob:");
    return hostMatch || (hasDownload && (isBlob || /^https?:/i.test(href)));
  }

  function normalizeFilename(url) {
    const ext = url.split('.').pop().split('?')[0].slice(0, 6);
    const ts = new Date().toISOString().replace(/[:T]/g, '-').split('.')[0];
    return `chatgpt_file_${ts}.${ext}`;
  }

  async function recordHistory(filename) {
    chrome.storage.local.get('downloadHistory', ({ downloadHistory = [] }) => {
      const now = new Date().toLocaleString();
      downloadHistory.unshift({ name: filename, time: now });
      if (downloadHistory.length > 10) downloadHistory = downloadHistory.slice(0, 10);
      chrome.storage.local.set({ downloadHistory });
    });
  }

  async function handleDownload(url) {
    try {
      const normName = normalizeFilename(url);
      await chrome.runtime.sendMessage({ type: 'download', url });
      showToast(`📦 Downloaded: ${normName}`);
      recordHistory(normName);
    } catch (e) {
      console.log("download failed", e);
    }
  }

  function scanLinks(force = false) {
    if (!settings.autoDownload && !force) return;
    document.querySelectorAll('a').forEach(a => {
      const url = a.href;
      if (url && isDownloadable(a) && (!observed.has(url) || force)) {
        observed.add(url);
        handleDownload(url);
      }
    });
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'forceScan') scanLinks(true);
  });

  chrome.storage.onChanged.addListener((changes) => {
    Object.entries(changes).forEach(([k, v]) => settings[k] = v.newValue);
  });

  if (settings.keepAlive) {
    setInterval(keepAlive, 9 * 60 * 1000);
    keepAlive();
  }
  if (settings.autoDownload) {
    const mo = new MutationObserver(() => scanLinks(false));
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(() => scanLinks(false), 10000);
    scanLinks(false);
  }
  if (settings.shutdownMinutes > 0) {
    setTimeout(() => {
      settings.keepAlive = false;
      settings.autoDownload = false;
      chrome.storage.sync.set({ keepAlive: false, autoDownload: false });
      showToast("🛑 Automator shut down after timer");
    }, settings.shutdownMinutes * 60 * 1000);
  }
})();
