
(async function () {
  const observed = new Set();
  let conf = await chrome.storage.sync.get(null);
  let mediaRecorder = null, audioChunks = [], ws=null, vadOn=false, speaking=false, silentFor=0;

  function toast(m){ if(!conf.showToasts) return; const t=document.createElement('div'); t.textContent=m;
    Object.assign(t.style,{position:'fixed',top:'12px',left:'50%',transform:'translateX(-50%)',background:'#272744',color:'#fff',padding:'8px 12px',borderRadius:'8px',zIndex:2147483647,boxShadow:'0 0 10px #0009'});
    document.body.appendChild(t); setTimeout(()=>t.remove(), 2200);
  }
  function keepAlive(){ if(!conf.keepAlive) return; const y=window.scrollY; window.scrollTo(0,y+1); window.scrollTo(0,y); try{ fetch(location.origin,{mode:'no-cors',cache:'no-store'}).catch(()=>{});}catch{} }
  function isDL(a){ const href=a?.href||""; return /files\.oaiusercontent\.com/i.test(href) || href.includes('/mnt/data/') || a.hasAttribute('download') || href.startsWith('blob:'); }

  function scan(force=false){
    if(!conf.autoDownload && !force) return;
    const urls=[];
    document.querySelectorAll('a').forEach(a=>{ const url=a.href; if(!url||!isDL(a)) return; if(observed.has(url)&&!force) return; observed.add(url); urls.push(url); if(conf.autoTagButtons) btn(a); });
    if(urls.length) chrome.runtime.sendMessage({ type:'downloadMany', urls });
    if(urls.length) toast(`📦 Queued ${urls.length}`);
  }

  function btn(a){
    if(a.dataset.nyraTagBtn) return; a.dataset.nyraTagBtn="1";
    const b=document.createElement('button'); b.textContent="＋Tag";
    Object.assign(b.style,{marginLeft:'8px',background:'#39ff14',color:'#000',border:'none',padding:'2px 6px',borderRadius:'5px',cursor:'pointer',fontSize:'12px'});
    b.onclick=(ev)=>{ ev.preventDefault(); ev.stopPropagation(); const tags=$('#nyraTags').value||"#NYRA"; const note=$('#nyraNote').value||"";
      const name=(a.getAttribute('download')||a.textContent||a.href.split('/').pop()||'file').trim().slice(0,120);
      addLog({ type:'file', filename:name, url:a.href, tags, note, context:getCtx(a) }); toast('Tagged'); };
    a.insertAdjacentElement('afterend', b);
  }
  function getCtx(el){ const c=el.closest('[data-message-id]')||el.closest('article,div'); return (c?.innerText||'').trim().slice(0,600); }
  function addLog(e){ try{ const arr=JSON.parse(localStorage.getItem("NYRA_TAGGER_LOG")||"[]"); arr.push({ ...e, time: new Date().toISOString().replace('T',' ').split('.')[0] }); localStorage.setItem("NYRA_TAGGER_LOG", JSON.stringify(arr.slice(-500))); chrome.storage.local.set({ NYRA_LOG: JSON.stringify(arr.slice(-500)) }); }catch{} }

  function $(id){ return document.getElementById(id); }
  function ensurePanelVisible(show){ const el = $('#nyraPanel'); if(!el) return; el.style.display = show ? 'block' : 'none'; }
  function inject(){
    if($('#nyraPanel')) { ensurePanelVisible(!!conf.panelVisible); return; }
    const r=document.createElement('div'); r.id='nyraPanel'; r.style.cssText="position:fixed;left:50%;top:16px;transform:translateX(-50%);z-index:2147483647;display:none;";
    r.innerHTML=`
    <div id="drag" style="background:#20203a;color:#fff;padding:10px 12px;border-radius:12px;box-shadow:0 0 14px #000a;min-width:420px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <div style="font-weight:700;color:#b983ff">🧬 NYRA Automator v2.0</div>
        <div><button id="centerBtn">Center</button> <button id="hideBtn">Hide</button></div>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:6px;">
        <label><input type="checkbox" id="keepAlive"> KeepAlive</label>
        <label><input type="checkbox" id="autoDownload"> AutoDL</label>
        <label><input type="checkbox" id="showToasts"> Toasts</label>
        <label><input type="checkbox" id="autoButtons"> TagBtns</label>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px;">
        <input id="nyraTags" placeholder="#NYRA #VoiceAgent">
        <input id="nyraNote" placeholder="note">
      </div>
      <hr style="border-color:#333">
      <div style="display:grid;gap:6px;">
        <input id="superagi" placeholder="SuperAGI endpoint URL">
        <input id="agentzero" placeholder="Agent-Zero endpoint URL">
        <input id="webhook" placeholder="Webhook (autosend uses this)">
        <input id="autosend" placeholder="Autosend minutes (0=off)">
        <input id="homeAssistant" placeholder="Home Assistant webhook URL (opt)">
        <input id="voicemod" placeholder="Voicemod webhook URL (opt)">
        <input id="notionToken" placeholder="Notion token (opt)">
        <input id="notionParent" placeholder="Notion parent page ID (opt)">
        <div style="display:flex;gap:6px;align-items:center;">
          <input id="notionSearchQ" placeholder="Search Notion…"><select id="notionFilter"><option value="">All</option><option value='{\"value\":\"page\"}'>Pages</option><option value='{\"value\":\"database\"}'>Databases</option></select><button id="notionSearchBtn">Search</button>
        </div>
        <input id="githubToken" placeholder="GitHub token (opt)">
        <input id="githubLicense" placeholder="GitHub license template (e.g., mit)">
        <input id="githubGitignore" placeholder="GitHub .gitignore template (e.g., Node)">
        <div style="display:flex;gap:6px;align-items:center;">
          <span style="opacity:.8">Linkwarden base:</span><code>https://cloud.linkwarden.app</code>
        </div>
        <input id="linkwardenToken" placeholder="Linkwarden token">
        <div style="display:flex;gap:6px;align-items:center;">
          <input id="tagMapKey" placeholder="#tag"> <button id="tagMapAdd">Map →</button> <select id="collectionSelect"></select>
        </div>
        <input id="subfolder" placeholder="Downloads subfolder (e.g., nyra/)">
        <label><input type="checkbox" id="saveAs"> Ask where to save</label>
        <input id="filters" placeholder="Download filters (e.g., .zip,.csv,.md)">
        <input id="whisperWs" placeholder="Whisper WS (wss://host/stream)">
        <label><input type="checkbox" id="vad"> VAD (threshold)</label>
      </div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
        <button id="force">⚡ Scan</button>
        <button id="health">Health</button>
        <button id="mdCsv">Upload .md/.csv → Notion DB</button>
        <button id="createRepo">Create GitHub Repo</button>
        <button id="lwPage">Send Page → Linkwarden</button>
        <button id="lwLinks">Send Links → Linkwarden</button>
        <button id="asrRec">Record (WS)</button>
        <button id="ttsPlay">Play TTS URL</button>
      </div>
      <input id="filePicker" type="file" multiple style="display:none" accept=".md,.csv">
      <audio id="ttsAudio" style="display:none" controls></audio>
      <div id="notionResults" style="margin-top:8px;max-height:160px;overflow:auto;font-size:12px;"></div>
    </div>`;
    r.querySelectorAll('button').forEach(b=>Object.assign(b.style,{background:'#7169eb',color:'#fff',border:'none',padding:'6px 10px',borderRadius:'6px',cursor:'pointer'}));
    document.body.appendChild(r); drag(r);

    const ids=['keepAlive','autoDownload','showToasts','autoButtons','webhook','autosend','superagi','agentzero','homeAssistant','voicemod','notionToken','notionParent','githubToken','githubLicense','githubGitignore','linkwardenToken','subfolder','filters','whisperWs'];
    ids.forEach(id=>{ const el=$('#'+id); if(!el) return; const v=conf[id]??(id==='autosend'?0:''); if(el.type==='checkbox') el.checked=!!v; else el.value=v||''; });
    $('#vad').checked = !!conf.vad;
    $('#nyraPanel').style.display = conf.panelVisible ? 'block' : 'none';

    // save
    ids.forEach(id=>{ const el=$('#'+id); if(!el) return; el.onchange=e=>{ const val=(el.type==='checkbox')?el.checked:el.value; chrome.storage.sync.set({ [id]: (id==='autosend'? parseInt(val||0): val) }); }; });
    $('#vad').onchange = e => chrome.storage.sync.set({ vad: e.target.checked });

    // load collections for Tag→Collection mapping
    refreshCollections();

    // mapping add
    $('#tagMapAdd').onclick = async () => {
      const key = ($('#tagMapKey').value||"").trim(); const sel=$('#collectionSelect'); const id=sel.value;
      if(!key || !id){ toast('Set #tag and collection'); return; }
      const map = (conf.tagMap||{}); map[key]=parseInt(id,10); conf.tagMap = map; chrome.storage.sync.set({ tagMap: map }); toast('Mapping saved');
    };

    // Notion search
    $('#notionSearchBtn').onclick = async () => {
      const token=$('#notionToken').value.trim(); if(!token) return toast('Notion token?');
      let filter = undefined; const raw=$('#notionFilter').value; try{ filter=raw? { property:'object', value: JSON.parse(raw).value }: undefined }catch{}
      const q=$('#notionSearchQ').value.trim(); const r=await chrome.runtime.sendMessage({ type:'notionSearch', token, query:q, filter: filter? { value: JSON.parse(raw).value, property:'object' } : undefined });
      const box=$('#notionResults'); box.innerHTML='';
      (r?.results||[]).forEach(item=>{
        const id=item.id; const title=((item?.properties?.title?.title?.[0]?.plain_text) || (item?.title?.[0]?.plain_text) || item.object || 'item');
        const div=document.createElement('div'); div.textContent=`${title} — ${id}`; div.style.cursor='pointer'; div.style.padding='3px 4px';
        div.onclick=()=>{ $('#notionParent').value=id; chrome.storage.sync.set({ notionParent: id }); toast('Parent set'); };
        box.appendChild(div);
      });
      if(!(r?.results||[]).length) box.textContent='No results.';
    };

    // buttons
    $('#hideBtn').onclick=()=>{ $('#nyraPanel').style.display='none'; chrome.storage.sync.set({ panelVisible:false }); };
    $('#centerBtn').onclick=()=>{ r.style.left='50%'; r.style.top='16px'; r.style.transform='translateX(-50%)'; };

    $('#force').onclick=()=>scan(true);
    $('#health').onclick=async()=>{ const r=await chrome.runtime.sendMessage({ type:'health' }); toast((r?.a?.ok?'SA✅':'SA❌')+' '+(r?.b?.ok?'AZ✅':'AZ❌')); };
    $('#mdCsv').onclick=()=>$('#filePicker').click();
    $('#filePicker').addEventListener('change', handleNotionUpload);
    $('#createRepo').onclick=async()=>{
      const name=prompt('New repo name:'), token=$('#githubToken').value.trim(); if(!name||!token) return toast('Repo name + token');
      const r=await chrome.runtime.sendMessage({ type:'githubCreateRepo', token, name, private:true });
      if(r?.ok){ navigator.clipboard.writeText(r.cli||''); toast('Repo created + CLI copied'); } else toast('GitHub failed');
    };
    $('#lwPage').onclick=()=>sendToLw([ { url: location.href, title: document.title } ]);
    $('#lwLinks').onclick=()=>{
      const anchors=[...document.querySelectorAll('a')].filter(a=>a.href && isDL(a)).map(a=>({ url:a.href, title:(a.textContent.trim()||a.href) }));
      sendToLw(anchors);
    };

    // ASR WS
    $('#asrRec').onclick=async()=>{
      if(ws){ ws.close(); ws=null; toast('ASR off'); return; }
      const url=$('#whisperWs').value.trim(); if(!url) return toast('Set Whisper WS');
      try{
        ws = new WebSocket(url);
        ws.onopen = async () => {
          toast('ASR connected');
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          mediaRecorder = new MediaRecorder(stream, { mimeType:'audio/webm' });
          mediaRecorder.ondataavailable = e => {
            if(e.data.size>0) e.data.arrayBuffer().then(buf=>{ if(!ws || ws.readyState!==1) return; const b64 = btoa(String.fromCharCode(...new Uint8Array(buf))); ws.send(JSON.stringify({ type:'chunk', b64 })); });
          };
          mediaRecorder.start(350);
        };
        ws.onmessage = ev => {
          try{ const m=JSON.parse(ev.data); if(m.type==='result') toast('🗣 '+(m.text||'')); }catch{}
        };
        ws.onclose = ()=>{ toast('ASR closed'); if(mediaRecorder){try{mediaRecorder.stop()}catch{} mediaRecorder=null;} ws=null; };
      }catch{ toast('WS error'); }
    };

    document.addEventListener('keydown',e=>{
      if(e.ctrlKey&&e.key===';'){ 
        const el=$('#nyraPanel'); const vis=el.style.display!=='none'; el.style.display= vis?'none':'block'; 
        chrome.storage.sync.set({ panelVisible: !vis });
      }
      if(e.ctrlKey&&e.shiftKey&&e.key.toLowerCase()==='d'){ scan(true); }
    });
  }

  async function refreshCollections(){
    const meta = await chrome.runtime.sendMessage({ type:'lwFetchMeta' });
    const sel = document.getElementById('collectionSelect'); if(!sel) return;
    sel.innerHTML=''; (meta?.collections||[]).forEach(c=>{ const o=document.createElement('option'); o.value=c.id; o.textContent=((c.parent?.name? c.parent.name+' > ':'')+c.name)||('ID '+c.id); sel.appendChild(o); });
  }

  async function sendToLw(items){
    const tagText = (document.getElementById('nyraTags').value||""); const note=(document.getElementById('nyraNote').value||"");
    const tags = tagText.split(/\s+/).filter(Boolean);
    let ok=0, dup=0, fail=0;
    for (const it of items){
      const ex = await chrome.runtime.sendMessage({ type:'linkwardenExists', url: it.url });
      if (ex?.exists) { dup++; continue; }
      // tag→collection mapping
      const map = (await chrome.storage.sync.get('tagMap')).tagMap || {};
      let collectionId = undefined;
      for (const t of tags){ if(map[t]){ collectionId = map[t]; break; } }
      const r = await chrome.runtime.sendMessage({ type:'linkwardenCreate', url: it.url, title: it.title, description: note, tags, collectionId });
      if(r?.ok) ok++; else fail++;
    }
    toast(`LW: saved ${ok}, duplicates ${dup}, failed ${fail}`);
  }

  async function handleNotionUpload(ev){
    const files=[...ev.target.files];
    const md=files.find(f=>f.name.endsWith('.md')); const csv=files.find(f=>f.name.endsWith('.csv'));
    if(!md){ toast('Pick at least one .md'); return; }
    const mdText=await md.text(); let dbId=null;
    if(csv){
      const text=await csv.text(); const lines=text.split(/\r?\n/).filter(x=>x.length); const cols=lines[0].split(','); const rows=lines.slice(1).map(l=>{const parts=l.split(','); const obj={}; cols.forEach((c,i)=>obj[c]=parts[i]||""); return obj;});
      const mk=await chrome.runtime.sendMessage({ type:'notionCreateDB', token: $('#notionToken').value, parent: $('#notionParent').value, title: md.name.replace(/\.md$/,''), columns: cols });
      if(mk?.ok){ dbId=mk.id; await chrome.runtime.sendMessage({ type:'notionInsertRows', token: $('#notionToken').value, db: dbId, rows }); }
    }
    const headers = { 'Authorization':'Bearer '+$('#notionToken').value, 'Notion-Version':'2022-06-28', 'Content-Type':'application/json' };
    await fetch('https://api.notion.com/v1/pages', { method:'POST', headers, body: JSON.stringify({ parent:{ page_id: $('#notionParent').value }, properties:{ title:{ title:[{ type:'text', text:{ content: md.name.replace(/\.md$/,'') } }] } }, children:[{ object:'block', type:'code', code:{ language:'markdown', rich_text:[{type:'text', text:{content: mdText}}] } }] }) });
    toast(dbId? 'Page + DB uploaded':'Page uploaded');
  }

  function drag(root){
    const h = root.querySelector('#drag'); let dx=0,dy=0,sx=0,sy=0; h.style.cursor='move';
    h.onmousedown=e=>{ sx=e.clientX; sy=e.clientY; const cs=getComputedStyle(root); dx=parseInt(cs.left)||0; dy=parseInt(cs.top)||0; root.style.transform=''; document.onmousemove=ev=>{ root.style.left=(dx+ev.clientX-sx)+'px'; root.style.top=(dy+ev.clientY-sy)+'px'; }; document.onmouseup=()=>{ document.onmousemove=null; document.onmouseup=null; }; };
  }
  chrome.storage.onChanged.addListener(ch => { Object.entries(ch).forEach(([k,v]) => conf[k]=v.newValue); });

  if (conf.keepAlive) setInterval(keepAlive, 8*60*1000);
  if (conf.autoDownload) { const mo=new MutationObserver(()=>scan(false)); mo.observe(document.body,{childList:true,subtree:true}); setInterval(()=>scan(false), 10000); scan(false); }
  inject();

  chrome.runtime.onMessage.addListener((m)=>{
    if(m?.type==='nyra_toggle_panel'){
      const el = document.getElementById('nyraPanel'); if(!el) return;
      const vis = el.style.display !== 'none'; el.style.display = vis ? 'none' : 'block';
      chrome.storage.sync.set({ panelVisible: !vis });
    }
    if(m?.type==='centerPanel'){
      const el=document.getElementById('nyraPanel'); if(el){ el.style.left='50%'; el.style.top='16px'; el.style.transform='translateX(-50%)'; el.style.display='block'; chrome.storage.sync.set({ panelVisible: true }); }
    }
  });
})();
