
// v2.0 background: hardcode Linkwarden base; add collections/tags fetch; duplicate checker; Notion search; GitHub; alarms; queue.
const DEFAULTS = {
  keepAlive: true, autoDownload: true, showToasts: true, autoTagButtons: true,
  webhook: "", autosendMinutes: 0,
  superagiUrl: "", agentzeroUrl: "",
  homeAssistantUrl: "", voicemodUrl: "",
  notionToken: "", notionParent: "",
  githubToken: "", githubLicense: "", githubGitignore: "",
  saveAs: false, subfolder: "", filters: ".zip,.csv,.json,.md,.png,.jpg",
  linkwardenToken: "", panelVisible: false,
  whisperWs: "",
  tagMap: {} // { "#tag": collectionId }
};
const LW_BASE = "https://cloud.linkwarden.app";

chrome.runtime.onInstalled.addListener(()=> chrome.storage.sync.set(DEFAULTS));

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)); }

// Autosend
chrome.alarms.onAlarm.addListener(async (a)=>{
  if (a.name !== 'nyra_autosend') return;
  const conf = await chrome.storage.sync.get(null);
  const rows = JSON.parse(await chrome.storage.local.get('NYRA_LOG').then(v=>v.NYRA_LOG||'[]'));
  if (!rows.length || !conf.webhook) return;
  try { await fetch(conf.webhook, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ entries: rows, source: 'nyra-ext', when: new Date().toISOString() }) }); }
  catch {}
});
async function updateAlarm(){
  const { autosendMinutes } = await chrome.storage.sync.get('autosendMinutes');
  chrome.alarms.clear('nyra_autosend');
  if (Number(autosendMinutes)>0) chrome.alarms.create('nyra_autosend', { periodInMinutes: Math.max(autosendMinutes, 1) });
}
chrome.storage.onChanged.addListener(ch => { if ('autosendMinutes' in ch) updateAlarm(); });
updateAlarm();

// Downloads queue
let q = [], active = false;
function passFilter(url, filters){
  const list=(filters||"").split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if (!list.length) return true; const u=url.toLowerCase(); return list.some(ext => u.endsWith(ext));
}
async function runQ(){
  if(active) return; active = true;
  const conf = await chrome.storage.sync.get(['saveAs','subfolder','filters']);
  while(q.length){
    const url = q.shift();
    if (!passFilter(url, conf.filters)) continue;
    let filename;
    try { const tail = url.split('/').pop().split('?')[0] || 'file.dat'; filename = (conf.subfolder?(conf.subfolder.replace(/^[\\/]+|[\\/]+$/g,'')+'/'):'') + tail; } catch {}
    await new Promise((res)=> chrome.downloads.download({ url, saveAs: !!conf.saveAs, filename }, _=> res()));
    await sleep(600);
  }
  active = false;
}

// Linkwarden helpers
async function lwCollections(token){
  const r = await fetch(`${LW_BASE}/api/v1/collections`, { headers:{ 'Authorization':'Bearer '+token }});
  const j = await r.json().catch(()=>({})); return Array.isArray(j)? j : (j?.data||[]);
}
async function lwTags(token){
  const r = await fetch(`${LW_BASE}/api/v1/tags`, { headers:{ 'Authorization':'Bearer '+token }});
  const j = await r.json().catch(()=>({})); return Array.isArray(j)? j : (j?.data||[]);
}
async function lwExists(token, url){
  if(!token || !url) return false;
  try {
    let r = await fetch(`${LW_BASE}/api/v1/links?url=${encodeURIComponent(url)}`, { headers:{ 'Authorization': 'Bearer '+token } });
    if (r.ok) {
      const j = await r.json().catch(()=>({}));
      if (Array.isArray(j) && j.length) return true;
      if (j?.data && Array.isArray(j.data) && j.data.length) return true;
    }
    r = await fetch(`${LW_BASE}/api/v1/links?search=${encodeURIComponent(url)}`, { headers:{ 'Authorization': 'Bearer '+token } });
    if (r.ok) {
      const j = await r.json().catch(()=>({}));
      const arr = Array.isArray(j)? j : (Array.isArray(j?.data)? j.data : []);
      if (arr.some(x => (x.url||"").trim() === url.trim())) return true;
    }
  } catch {}
  return false;
}
async function lwCreate(token, payload){
  const r = await fetch(`${LW_BASE}/api/v1/links`, { method:'POST', headers:{ 'Authorization':'Bearer '+token, 'Content-Type':'application/json' }, body: JSON.stringify(payload)});
  const j = await r.json().catch(()=>({}));
  return { ok:r.ok, status:r.status, body:j };
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    try {
      if (msg?.type === 'downloadMany'){
        (msg.urls||[]).forEach(u => q.push(u)); runQ(); sendResponse({ ok:true, enqueued:(msg.urls||[]).length }); return;
      }
      if (msg?.type === 'health'){
        const ping = async (label, url) => { if(!url) return { label, ok:false, code:0 }; try{ const r=await fetch(url,{ method:'HEAD' }); return {label, ok:r.ok, code:r.status}; }catch{ return {label, ok:false, code:0}; } };
        const c = await chrome.storage.sync.get(null);
        const [a,b] = await Promise.all([ping('superagi', c.superagiUrl), ping('agentzero', c.agentzeroUrl)]);
        sendResponse({ ok:true, a, b }); return;
      }
      if (msg?.type === 'githubCreateRepo'){
        const c = await chrome.storage.sync.get(null);
        const body = { name: msg.name, private: !!msg.private, auto_init: true };
        if (c.githubLicense) body.license_template = c.githubLicense;
        if (c.githubGitignore) body.gitignore_template = c.githubGitignore;
        const r = await fetch('https://api.github.com/user/repos', { method:'POST', headers:{ 'Authorization':'Bearer '+(c.githubToken||msg.token), 'Content-Type':'application/json' }, body: JSON.stringify(body) });
        const j = await r.json();
        sendResponse({ ok: r.ok, status: r.status, clone: j.clone_url, ssh: j.ssh_url, html: j.html_url,
          cli: `git init && git add . && git commit -m "init" && git branch -M main && git remote add origin ${j.ssh_url||j.clone_url} && git push -u origin main` }); return;
      }
      if (msg?.type === 'notionCreateDB'){
        const headers = { 'Authorization': 'Bearer ' + msg.token, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
        const props = {}; (msg.columns||[]).forEach(c => { props[c.toString()] = c.toLowerCase()==='name' ? { title:{} } : { rich_text:{} }; });
        const r = await fetch('https://api.notion.com/v1/databases', { method:'POST', headers, body: JSON.stringify({ parent:{type:'page_id',page_id:msg.parent}, title:[{type:'text',text:{content:msg.title||'NYRA Data'}}], properties: props }) });
        const j = await r.json(); sendResponse({ ok:r.ok, status:r.status, id:j.id, raw:j }); return;
      }
      if (msg?.type === 'notionInsertRows'){
        const headers = { 'Authorization': 'Bearer ' + msg.token, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
        for (const row of (msg.rows||[])){
          const props = {}; for (const [k,v] of Object.entries(row)){
            if (k.toLowerCase()==='name') props[k] = { title: [{ type:'text', text:{ content: String(v) } }] };
            else props[k] = { rich_text: [{ type:'text', text:{ content: String(v) } }] };
          }
          await fetch('https://api.notion.com/v1/pages', { method:'POST', headers, body: JSON.stringify({ parent:{database_id:msg.db}, properties: props }) });
          await sleep(120);
        }
        sendResponse({ ok:true, inserted: (msg.rows||[]).length }); return;
      }
      if (msg?.type === 'notionSearch'){
        const headers = { 'Authorization': 'Bearer ' + msg.token, 'Notion-Version': '2022-06-28', 'Content-Type': 'application/json' };
        const r = await fetch('https://api.notion.com/v1/search', { method:'POST', headers, body: JSON.stringify({ query: msg.query||"", page_size: 20, filter: msg.filter||undefined }) });
        const j = await r.json(); sendResponse({ ok:r.ok, results:j.results||[] }); return;
      }
      if (msg?.type === 'lwFetchMeta'){
        const c = await chrome.storage.sync.get('linkwardenToken');
        const [cols, tags] = await Promise.all([lwCollections(c.linkwardenToken), lwTags(c.linkwardenToken)]);
        sendResponse({ ok:true, collections: cols, tags }); return;
      }
      if (msg?.type === 'linkwardenExists'){
        const c = await chrome.storage.sync.get('linkwardenToken');
        const exists = await lwExists(c.linkwardenToken, msg.url);
        sendResponse({ ok:true, exists }); return;
      }
      if (msg?.type === 'linkwardenCreate'){
        const c = await chrome.storage.sync.get(null);
        const payload = { url: msg.url, name: msg.title||msg.url, description: msg.description||"", tags: msg.tags||[], collectionId: msg.collectionId||undefined };
        const r = await lwCreate(c.linkwardenToken, payload);
        sendResponse(r); return;
      }
    } catch(e){ sendResponse({ ok:false, error: e.message }); }
  })();
  return true;
});
