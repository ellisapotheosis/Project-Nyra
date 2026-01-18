
(async function () {
  const observed = new Set();
  let conf = await chrome.storage.sync.get(null);
  function toast(m){ if(!conf.showToasts) return; const t=document.createElement('div'); t.textContent=m; Object.assign(t.style,{position:'fixed',top:'12px',left:'50%',transform:'translateX(-50%)',background:'#272744',color:'#fff',padding:'8px 12px',borderRadius:'8px',zIndex:2147483647,boxShadow:'0 0 10px #0009'}); document.body.appendChild(t); setTimeout(()=>t.remove(), 2000); }
  function keepAlive(){ if(!conf.keepAlive) return; const y=window.scrollY; window.scrollTo(0,y+1); window.scrollTo(0,y); try{ fetch(location.origin,{mode:'no-cors'}).catch(()=>{});}catch{} }
  function isDL(a){ const href=a?.href||""; return /files\.oaiusercontent\.com/i.test(href) || href.includes('/mnt/data/') || a.hasAttribute('download') || href.startsWith('blob:'); }
  function scan(force=false){ if(!conf.autoDownload && !force) return; const urls=[]; document.querySelectorAll('a').forEach(a=>{ const url=a.href; if(!url||!isDL(a)) return; if(observed.has(url)&&!force) return; observed.add(url); urls.push(url); }); if(urls.length) chrome.runtime.sendMessage({ type:'downloadMany', urls }); if(urls.length) toast(`📦 Queued ${urls.length}`); }
  function $(id){ return document.getElementById(id); }
  function ensurePanelVisible(show){ const el = $('#nyraPanel'); if(!el) return; el.style.display = show ? 'block' : 'none'; }
  function inject(){ if($('#nyraPanel')) { ensurePanelVisible(!!conf.panelVisible); return; } const r=document.createElement('div'); r.id='nyraPanel'; r.style.cssText="position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:2147483647;display:none;"; r.innerHTML=`
    <div id="drag" style="background:#20203a;color:#fff;padding:10px 12px;border-radius:12px;box-shadow:0 0 14px #000a;min-width:340px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;color:#b983ff">🧬 NYRA Automator v2.1</div>
        <div><button id="centerBtn">Center</button> <button id="hideBtn">Hide</button></div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">
        <label><input type="checkbox" id="keepAlive"> KeepAlive</label>
        <label><input type="checkbox" id="autoDownload"> AutoDL</label>
        <label><input type="checkbox" id="showToasts"> Toasts</label>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
        <button id="force">⚡ Scan</button>
        <a href="${chrome.runtime.getURL('whisper-test/index.html')}" target="_blank"><button>Whisper Test</button></a>
      </div>
    </div>`; r.querySelectorAll('button').forEach(b=>Object.assign(b.style,{background:'#7169eb',color:'#fff',border:'none',padding:'6px 10px',borderRadius:'6px',cursor:'pointer'})); document.body.appendChild(r); drag(r);
    $('#keepAlive').checked=!!conf.keepAlive; $('#autoDownload').checked=!!conf.autoDownload; $('#showToasts').checked=!!conf.showToasts; $('#nyraPanel').style.display = conf.panelVisible ? 'block' : 'none';
    $('#keepAlive').onchange=e=>chrome.storage.sync.set({keepAlive:e.target.checked}); $('#autoDownload').onchange=e=>chrome.storage.sync.set({autoDownload:e.target.checked}); $('#showToasts').onchange=e=>chrome.storage.sync.set({showToasts:e.target.checked});
    $('#hideBtn').onclick=()=>{ $('#nyraPanel').style.display='none'; chrome.storage.sync.set({ panelVisible:false }); }; $('#centerBtn').onclick=()=>{ r.style.left='50%'; r.style.top='16px'; r.style.transform='translateX(-50%)'; }; $('#force').onclick=()=>scan(true);
    document.addEventListener('keydown',e=>{ if(e.ctrlKey&&e.key===';'){ const el=$('#nyraPanel'); const vis=el.style.display!=='none'; el.style.display= vis?'none':'block'; chrome.storage.sync.set({ panelVisible: !vis }); } if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='d'){ scan(true); } });
  }
  function drag(root){ const h = root.querySelector('#drag'); let dx=0,dy=0,sx=0,sy=0; h.style.cursor='move'; h.onmousedown=e=>{ sx=e.clientX; sy=e.clientY; const cs=getComputedStyle(root); dx=parseInt(cs.left)||0; dy=parseInt(cs.top)||0; root.style.transform=''; document.onmousemove=ev=>{ root.style.left=(dx+ev.clientX-sx)+'px'; root.style.top=(dy+ev.clientY-sy)+'px'; }; document.onmouseup=()=>{ document.onmousemove=null; document.onmouseup=null; }; }; }
  chrome.storage.onChanged.addListener(ch => { Object.entries(ch).forEach(([k,v]) => conf[k]=v.newValue); });
  if (conf.keepAlive) setInterval(keepAlive, 8*60*1000);
  if (conf.autoDownload) { const mo=new MutationObserver(()=>scan(false)); mo.observe(document.body,{childList:true,subtree:true}); setInterval(()=>scan(false), 10000); scan(false); }
  inject();
  chrome.runtime.onMessage.addListener((m)=>{ if(m?.type==='nyra_toggle_panel'){ const el = document.getElementById('nyraPanel'); if(!el) return; const vis = el.style.display !== 'none'; el.style.display = vis ? 'none' : 'block'; chrome.storage.sync.set({ panelVisible: !vis }); } if(m?.type==='centerPanel'){ const el=document.getElementById('nyraPanel'); if(el){ el.style.left='50%'; el.style.top='16px'; el.style.transform='translateX(-50%)'; el.style.display='block'; chrome.storage.sync.set({ panelVisible: true }); } } });
})();
