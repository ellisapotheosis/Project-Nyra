
(async function () {
  const observed = new Set();
  let settings = await chrome.storage.sync.get(null);

  function log(...args){ console.log("[ChatGPT Automator]", ...args); }

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

  async function handleDownload(url) {
    try {
      await chrome.runtime.sendMessage({ type: 'download', url });
      showToast(`📦 Downloaded: ${url.split('/').pop() || 'file'}`);
    } catch (e) {
      log("download failed", e);
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

  // Listen for force scan from popup
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg && msg.type === 'forceScan') { scanLinks(true); }
  });

  // React to settings changes live
  chrome.storage.onChanged.addListener((changes) => {
    Object.entries(changes).forEach(([k, v]) => settings[k] = v.newValue);
  });

  // Timers and observers
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
