
(async function(){
  const toggle = document.getElementById('toggle');
  const center = document.getElementById('center');
  const status = document.getElementById('status');
  const sitePerms = document.getElementById('sitePerms');
  async function activeTabId(){ const [tab] = await chrome.tabs.query({ active: true, currentWindow: true }); return tab?.id; }
  async function send(msg){ const id = await activeTabId(); if(!id){ status.textContent = "No active tab"; return; } try{ await chrome.tabs.sendMessage(id, msg); status.textContent = "OK"; }catch(e){ status.textContent = "Content script not ready (open a ChatGPT tab)"; } }
  toggle.addEventListener('click', ()=> send({ type:'nyra_toggle_panel' }));
  center.addEventListener('click', ()=> send({ type:'centerPanel' }));
  sitePerms.addEventListener('click', async ()=>{ await chrome.tabs.create({ url: "chrome://settings/content/siteDetails?site=https%3A%2F%2Fchatgpt.com" }); });
})();
