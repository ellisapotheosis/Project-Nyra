// ==UserScript==
// @name         ChatGPT Automator v4.1 – KeepAlive, AutoDownload, UI Panel, Timed Shutdown
// @namespace    https://github.com/EllisApotheosis
// @version      4.1
// @description  Keeps ChatGPT alive, auto-downloads new file links (files.oaiusercontent.com, sandbox:/mnt/data/*, blob: w/ download attr), toast popups, and full UI control with persistent settings + shutdown timer.
// @author       Ellis
// @match        *://chat.openai.com/*
// @match        *://chatgpt.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const STORAGE_KEY = "chatgpt_automator_settings";
  const DEFAULT_SETTINGS = { keepAlive: true, autoDownload: true, showToasts: true, shutdownMinutes: 0 };
  let settings = loadSettings();
  const observedLinks = new Set();

  function loadSettings() {
    try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) }; }
    catch (e) { return { ...DEFAULT_SETTINGS }; }
  }
  function saveSettings() { localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }

  // KeepAlive: gentle keypress ping
  function keepAlive() {
    if (!settings.keepAlive) return;
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Shift", keyCode: 16, code: "ShiftLeft", which: 16, bubbles: true }));
  }

  // Link predicates
  function isDownloadableLink(a) {
    if (!a || !a.href) return false;
    const href = a.href;
    // Known patterns for ChatGPT file assets:
    // - files.oaiusercontent.com
    // - sandbox:/mnt/data/* (rare in-prod, but keep for dev)
//  - attachments and other future paths might still expose anchors with download attribute
    const hostMatch = /files\.oaiusercontent\.com/i.test(href) || href.includes("/mnt/data/");
    const hasDownloadAttr = a.hasAttribute("download");
    const isBlob = href.startsWith("blob:");
    return hostMatch || (hasDownloadAttr && (isBlob || /^https?:/i.test(href)));
  }

  // Auto-download scan
  function scanLinks(force = false) {
    if (!settings.autoDownload && !force) return;
    const links = document.querySelectorAll('a');
    links.forEach(link => {
      const href = link.href;
      if (href && isDownloadableLink(link) && (!observedLinks.has(href) || force)) {
        observedLinks.add(href);
        // click-to-download (most reliable across origins for userscripts)
        const anchor = document.createElement('a');
        anchor.href = href;
        anchor.download = link.getAttribute('download') || '';
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        requestAnimationFrame(() => anchor.remove());
        if (settings.showToasts) showToast(`📦 Downloaded: ${href.split('/').pop() || 'file'}`);
      }
    });
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed; bottom: 20px; right: 20px;
      background: #1e1e2f; color: #fff; padding: 10px 16px;
      border-radius: 6px; font-size: 14px; z-index: 2147483647;
      box-shadow: 0 0 8px #000000aa; opacity: 0.96;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
  }

  function injectUI() {
    if (document.getElementById('nyra-automator-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'nyra-automator-panel';
    panel.innerHTML = `
      <div style="position: fixed; top: 20px; left: 20px; background: #181818; color: white;
                  padding: 12px 18px; border-radius: 8px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace;
                  font-size: 13px; z-index: 2147483647; box-shadow: 0 0 10px #00000088; opacity: 0.97;">
        <strong>🧬 ChatGPT Automator</strong><br>
        <label><input type="checkbox" id="toggleKeepAlive"> Keep Alive</label><br>
        <label><input type="checkbox" id="toggleAutoDownload"> Auto Download</label><br>
        <label><input type="checkbox" id="toggleToasts"> Toast Notifications</label><br>
        <label>Auto-Shutdown (min): <input id="shutdownInput" type="number" min="0" step="1" style="width: 60px;" /></label><br>
        <button id="forceDownloadBtn">⚡ Force Download All</button>
      </div>`;
    document.body.appendChild(panel);

    const $ = id => document.getElementById(id);
    $('toggleKeepAlive').checked = settings.keepAlive;
    $('toggleAutoDownload').checked = settings.autoDownload;
    $('toggleToasts').checked = settings.showToasts;
    $('shutdownInput').value = settings.shutdownMinutes;

    $('toggleKeepAlive').addEventListener('change', e => { settings.keepAlive = e.target.checked; saveSettings(); });
    $('toggleAutoDownload').addEventListener('change', e => { settings.autoDownload = e.target.checked; saveSettings(); });
    $('toggleToasts').addEventListener('change', e => { settings.showToasts = e.target.checked; saveSettings(); });
    $('shutdownInput').addEventListener('change', e => { settings.shutdownMinutes = parseInt(e.target.value) || 0; saveSettings(); });
    $('forceDownloadBtn').addEventListener('click', () => { showToast("🚀 Forcing full download scan!"); scanLinks(true); });
  }

  function start() {
    injectUI();
    // KeepAlive timers
    if (settings.keepAlive) {
      setInterval(keepAlive, 9 * 60 * 1000);
      keepAlive();
    }
    // Observe DOM + periodic scan
    if (settings.autoDownload) {
      const observer = new MutationObserver(() => scanLinks(false));
      observer.observe(document.body, { childList: true, subtree: true });
      setInterval(() => scanLinks(false), 10000);
      scanLinks(false);
    }
    // Shutdown timer
    if (settings.shutdownMinutes > 0) {
      setTimeout(() => {
        settings.keepAlive = false;
        settings.autoDownload = false;
        saveSettings();
        showToast("🛑 Automator shut down after timer");
      }, settings.shutdownMinutes * 60 * 1000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})(); 
