
(function(){
  const ACCENT = '#7169EB';
  function copyLastAnswer() {
    const answers = Array.from(document.querySelectorAll('[data-message-author-role="assistant"], .markdown, .prose')).filter(el => el.innerText?.trim().length > 0);
    const last = answers.at(-1);
    if(!last) return;
    const txt = last.innerText;
    navigator.clipboard.writeText(txt).then(()=>{
      toast('Copied last answer');
    });
  }
  function toggleCompact() {
    document.documentElement.classList.toggle('apoth-compact');
    toast('Compact UI ' + (document.documentElement.classList.contains('apoth-compact') ? 'ON' : 'OFF'));
  }
  function toast(msg){
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;right:12px;bottom:12px;background:#11121a;color:white;padding:8px 10px;border-radius:10px;box-shadow:0 0 10px ' + ACCENT + ';z-index:999999;font:12px/1.2 system-ui';
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 1600);
  }
  chrome.runtime.onMessage.addListener((req)=>{
    if(req?.action==='copyLast') copyLastAnswer();
    if(req?.action==='toggleCompact') toggleCompact();
  });
  // Keyboard overrides inside page (fallback if Commands API doesn't fire)
  document.addEventListener('keydown', (e)=>{
    if(e.altKey && e.shiftKey && e.code==='KeyC'){ e.preventDefault(); copyLastAnswer(); }
    if(e.altKey && e.shiftKey && e.code==='KeyU'){ e.preventDefault(); toggleCompact(); }
  });
})();
