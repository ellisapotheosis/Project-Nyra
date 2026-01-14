// ==UserScript==
// @name         NYRA Voice Tagger (Tampermonkey v2)
// @namespace    https://nyra.ratehunter.net/
// @version      2.0
// @description  Tag ChatGPT messages/files with #NYRA/#VoiceAgent, keep a local log, export CSV, and (optionally) POST to a webhook for Notion sync.
// @author       Ellis / Apotheosis
// @match        *://chat.openai.com/*
// @match        *://chatgpt.com/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function(){
  'use strict';
  const STORE_KEY = "NYRA_TAGGER_LOG";
  const CONF_KEY  = "NYRA_TAGGER_CONF";
  const DEFAULT_CONF = { webhook: "", autoAttachButtons: true, maxHistory: 500 };
  const nowStr = () => new Date().toISOString().replace('T',' ').split('.')[0];
  const loadConf = () => { try { return { ...DEFAULT_CONF, ...JSON.parse(localStorage.getItem(CONF_KEY)||"{}") }; } catch { return { ...DEFAULT_CONF }; } };
  const saveConf = (c) => localStorage.setItem(CONF_KEY, JSON.stringify(c));
  const loadLog = () => { try { return JSON.parse(localStorage.getItem(STORE_KEY)||"[]"); } catch { return []; } };
  const saveLog = (arr) => { const c=loadConf(); localStorage.setItem(STORE_KEY, JSON.stringify((arr||[]).slice(-c.maxHistory))); };
  const toast=(m)=>{ const t=document.createElement('div'); t.textContent=m; Object.assign(t.style,{position:'fixed',bottom:'20px',right:'20px',background:'#12121a',color:'#fff',padding:'10px 14px',borderRadius:'8px',fontSize:'13px',zIndex:2147483647,boxShadow:'0 0 10px #0009'}); document.body.appendChild(t); setTimeout(()=>t.remove(),3500); };

  function detectDownloadLinks(root=document){
    const anchors = Array.from(root.querySelectorAll('a'));
    return anchors.filter(a => {
      const href = a.getAttribute('href') || "";
      const hasDownload = a.hasAttribute('download');
      const hosted = /files\.oaiusercontent\.com/i.test(href) || href.includes('/mnt/data/');
      const blob = href.startsWith('blob:');
      return (hosted || hasDownload || blob) && href;
    });
  }
  function getMessageContext(el){
    const container = el.closest('[data-message-id]') || el.closest('article,div');
    const text = container ? (container.innerText || '').trim().slice(0, 600) : '';
    return text;
  }
  function addLogEntry(entry){ const log = loadLog(); log.push({ ...entry, time: nowStr() }); saveLog(log); }

  function injectPanel(){
    if (document.getElementById('nyraTagPanel')) return;
    const panel = document.createElement('div');
    panel.id = 'nyraTagPanel';
    panel.innerHTML = `
      <div style="position:fixed; top:20px; left:20px; background:#181820; color:#fff; z-index:2147483647;
                  font:13px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Courier New', monospace;
                  padding:12px 14px; border-radius:10px; box-shadow:0 0 12px #000a; min-width: 260px;">
        <div style="font-weight:700; color:#b983ff; margin-bottom:6px;">🧬 NYRA Voice Tagger</div>
        <label style="display:block; margin:6px 0;">Tags:
          <input id="nyraTags" type="text" placeholder="#NYRA #VoiceAgent" style="width:100%; margin-top:4px;"/>
        </label>
        <label style="display:block; margin:6px 0;">Note:
          <input id="nyraNote" type="text" placeholder="optional note" style="width:100%; margin-top:4px;"/>
        </label>
        <label style="display:block; margin:6px 0;">Webhook:
          <input id="nyraWebhook" type="text" placeholder="https://your-notion-middleware/api" style="width:100%; margin-top:4px;"/>
        </label>
        <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:8px;">
          <button id="nyraTagPage">Tag Page</button>
          <button id="nyraExportCSV">Export CSV</button>
          <button id="nyraSendWebhook">Send to Notion</button>
          <label style="font-size:12px;">
            <input type="checkbox" id="nyraAutoButtons" />
            Auto-buttons on links
          </label>
        </div>
      </div>`;
    panel.querySelectorAll('button').forEach(b => Object.assign(b.style,{background:'#7169eb',color:'#fff',border:'none',padding:'6px 10px',borderRadius:'6px',cursor:'pointer'}));
    document.body.appendChild(panel);
    const conf = loadConf();
    panel.querySelector('#nyraWebhook').value = conf.webhook;
    panel.querySelector('#nyraAutoButtons').checked = !!conf.autoAttachButtons;
    panel.querySelector('#nyraTagPage').onclick = () => {
      const tags = panel.querySelector('#nyraTags').value || "#NYRA";
      const note = panel.querySelector('#nyraNote').value || "";
      addLogEntry({ type: 'page', url: location.href, filename: document.title, tags, note, context: (document.body.innerText||'').slice(0,600) });
      toast("Tagged page → log saved");
    };
    panel.querySelector('#nyraExportCSV').onclick = exportCSV;
    panel.querySelector('#nyraSendWebhook').onclick = sendWebhook;
    panel.querySelector('#nyraWebhook').onchange = (e)=>{ saveConf({ ...conf, webhook: e.target.value }); toast("Webhook saved"); };
    panel.querySelector('#nyraAutoButtons').onchange = (e)=>{ saveConf({ ...loadConf(), autoAttachButtons: e.target.checked }); toast("Auto-button setting saved"); };
  }

  function attachButtons(){
    const conf = loadConf();
    if (!conf.autoAttachButtons) return;
    detectDownloadLinks(document).forEach(a => {
      if (a.dataset.nyraTaggedBtn) return;
      a.dataset.nyraTaggedBtn = "1";
      const btn = document.createElement('button');
      btn.textContent = "＋Tag";
      Object.assign(btn.style,{marginLeft:'8px',background:'#39ff14',color:'#000',border:'none',padding:'2px 6px',borderRadius:'5px',cursor:'pointer',fontSize:'12px'});
      btn.title = "Tag this file/link into NYRA log";
      btn.addEventListener('click', (ev)=>{
        ev.preventDefault(); ev.stopPropagation();
        const panel = document.getElementById('nyraTagPanel');
        const tags = panel?.querySelector('#nyraTags')?.value || "#NYRA";
        const note = panel?.querySelector('#nyraNote')?.value || "";
        const name = (a.getAttribute('download') || a.textContent || a.href.split('/').pop() || 'file').trim().slice(0,120);
        addLogEntry({ type:'file', url:a.href, filename:name, tags, note, context: getMessageContext(a) });
        toast("Tagged link → log saved");
      });
      a.insertAdjacentElement('afterend', btn);
    });
  }

  function exportCSV(){
    const rows = loadLog();
    const header = ["time","type","filename","url","tags","note","context"];
    const csv = [header.join(",")].concat(rows.map(r => header.map(k => JSON.stringify((r[k]||"").toString())).join(","))).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = "nyra_tagger_log.csv"; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    toast("Exported CSV");
  }

  async function sendWebhook(){
    const conf = loadConf();
    const url = (conf.webhook || "").trim();
    if (!url) return toast("Set a webhook URL first");
    const payload = { entries: loadLog(), source: location.host, when: nowStr() };
    try{
      const res = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      if (!res.ok) throw new Error("HTTP "+res.status);
      toast("Sent log to webhook");
    }catch(e){ console.error(e); toast("Webhook failed (see console)"); }
  }

  injectPanel();
  attachButtons();
  const mo = new MutationObserver(()=>attachButtons());
  mo.observe(document.body, { childList:true, subtree:true });
})();
