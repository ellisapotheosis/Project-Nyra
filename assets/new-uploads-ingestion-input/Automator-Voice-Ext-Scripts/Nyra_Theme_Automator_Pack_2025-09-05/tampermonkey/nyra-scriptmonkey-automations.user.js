// ==UserScript==
// @name         Nyra Scriptmonkey Automations
// @namespace    https://github.com/EllisApotheosis
// @version      0.1.0
// @description  Utility hotkeys, auto-expand code blocks, quick scroll, and focus the composer in ChatGPT/OpenAI.
// @author       EllisApotheosis
// @match        https://chatgpt.com/*
// @match        https://*.openai.com/*
// @grant        GM_addStyle
// @run-at       document-end
// ==/UserScript==

(function() {
  'use strict';
  const ACCENT = '#7169EB';

  GM_addStyle(`
    .apoth-hl { outline: 2px solid ${ACCENT}; box-shadow: 0 0 12px ${ACCENT}; border-radius: 8px; }
  `);

  function focusComposer(){
    const el = document.querySelector('textarea, [contenteditable="true"]');
    if(el){ el.focus(); el.scrollIntoView({behavior:'smooth', block:'center'}); highlight(el); }
  }
  function expandAllCode(){
    document.querySelectorAll('pre').forEach(pre => {
      pre.style.maxHeight = 'unset';
      pre.style.overflow = 'visible';
    });
    toast('Expanded all code blocks');
  }
  function copyConversation(){
    const nodes = Array.from(document.querySelectorAll('[data-message-author-role], .markdown, .prose'));
    const txt = nodes.map(n => n.innerText.trim()).filter(Boolean).join('\n\n');
    navigator.clipboard.writeText(txt);
    toast('Conversation copied');
  }
  function highlight(el){
    el.classList.add('apoth-hl');
    setTimeout(()=>el.classList.remove('apoth-hl'), 1200);
  }
  function toast(msg){
    const t = document.createElement('div');
    t.textContent = msg;
    t.style.cssText = 'position:fixed;left:50%;transform:translateX(-50%);bottom:20px;background:#11121a;color:white;padding:8px 10px;border-radius:10px;box-shadow:0 0 10px '+ACCENT+';z-index:999999;font:12px/1.2 system-ui';
    document.body.appendChild(t);
    setTimeout(()=>t.remove(), 1500);
  }

  // Hotkeys
  document.addEventListener('keydown', (e)=>{
    if(e.ctrlKey && e.shiftKey && e.code==='KeyL'){ e.preventDefault(); focusComposer(); }
    if(e.ctrlKey && e.shiftKey && e.code==='KeyE'){ e.preventDefault(); expandAllCode(); }
    if(e.ctrlKey && e.shiftKey && e.code==='KeyA'){ e.preventDefault(); copyConversation(); }
  });
})();