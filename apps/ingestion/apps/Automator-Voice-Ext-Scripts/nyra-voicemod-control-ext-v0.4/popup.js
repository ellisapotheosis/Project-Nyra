
import { VoicemodClient } from './voicemod.js';

const el = (id) => document.getElementById(id);
const wsStatus = el('wsStatus');
const wsPort = el('wsPort');
const voicesSel = el('voices');
const soundsSel = el('sounds');
const voiceIconDiv = el('voiceIcon');
const soundIconDiv = el('soundIcon');
const boardNameInput = el('boardName');
const msg = el('msg');

const client = new VoicemodClient((status, port)=>{
  wsStatus.textContent = status;
  if (port) wsPort.textContent = port;
});

async function restoreBoardName(){
  const { boardName } = await chrome.storage.local.get({boardName:"Nyra"});
  boardNameInput.value = boardName;
}
restoreBoardName();

boardNameInput.addEventListener('change', async ()=>{
  await chrome.storage.local.set({boardName: boardNameInput.value});
  await refreshSounds();
});

async function refreshVoices(){
  try{
    const list = await client.getVoices();
    voicesSel.innerHTML = "";
    list.forEach(v=>{
      const opt = document.createElement('option');
      opt.value = v.id;
      opt.textContent = v.friendlyName || v.id;
      voicesSel.appendChild(opt);
    });
    msg.textContent = `Loaded ${list.length} voices`;
  }catch(e){
    msg.textContent = `Voices error: ${e.message}`;
  }
}

async function refreshSounds(){
  try{
    const boardName = boardNameInput.value.trim();
    const { sounds } = await client.getSoundboardByName(boardName);
    soundsSel.innerHTML = "";
    sounds.forEach(s=>{
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = s.name || s.id;
      soundsSel.appendChild(opt);
    });
    msg.textContent = `Loaded ${sounds.length} sounds from "${boardName}"`;
  }catch(e){
    msg.textContent = `Soundboard error: ${e.message}`;
  }
}

el('refreshVoices').addEventListener('click', refreshVoices);
el('refreshSounds').addEventListener('click', refreshSounds);
el('setVoice').addEventListener('click', async ()=>{
  const id = voicesSel.value;
  if (!id) return;
  try{
    await client.loadVoice(id);
    msg.textContent = `Voice set: ${id}`;
  }catch(e){ msg.textContent = e.message; }
});
el('playSound').addEventListener('click', async ()=>{
  const id = soundsSel.value;
  if (!id) return;
  try{
    await client.playMeme(id);
    msg.textContent = `Playing sound: ${id}`;
  }catch(e){ msg.textContent = e.message; }
});
el('stopSounds').addEventListener('click', async ()=>{
  try{ await client.stopAllMemeSounds(); msg.textContent = 'Stopped all sounds'; }
  catch(e){ msg.textContent = e.message; }
});

el('toggleVC').addEventListener('click', ()=> client.toggleVoiceChanger());
el('toggleHear').addEventListener('click', ()=> client.toggleHearMyVoice());
el('toggleMute').addEventListener('click', ()=> client.toggleMuteMic());

el('getVoiceIcon').addEventListener('click', async ()=>{
  const id = voicesSel.value;
  if (!id) return;
  const dataUrl = await client.getBitmapForVoice(id);
  voiceIconDiv.innerHTML = dataUrl ? `<img src="${dataUrl}">` : "(no bitmap)";
});

el('getSoundIcon').addEventListener('click', async ()=>{
  const id = soundsSel.value;
  if (!id) return;
  const dataUrl = await client.getBitmapForMeme(id);
  soundIconDiv.innerHTML = dataUrl ? `<img src="${dataUrl}">` : "(no bitmap)";
});

// Initial
await client.connect();
await refreshVoices();
await refreshSounds();
