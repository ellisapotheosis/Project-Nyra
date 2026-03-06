
async function restore(){
  const o = await chrome.storage.local.get({ apiKey:"", boardName:"Nyra", ttsVoiceName:"" });
  document.getElementById('apiKey').value = o.apiKey || "";
  document.getElementById('boardName').value = o.boardName || "Nyra";
  document.getElementById('ttsVoiceName').value = o.ttsVoiceName || "";
}
restore();

document.getElementById('save').addEventListener('click', async ()=>{
  const apiKey = document.getElementById('apiKey').value.trim();
  const boardName = document.getElementById('boardName').value.trim();
  const ttsVoiceName = document.getElementById('ttsVoiceName').value.trim();
  await chrome.storage.local.set({ apiKey, boardName, ttsVoiceName });
  document.getElementById('status').textContent = "Saved ✓";
  setTimeout(()=> document.getElementById('status').textContent = "", 1500);
});
