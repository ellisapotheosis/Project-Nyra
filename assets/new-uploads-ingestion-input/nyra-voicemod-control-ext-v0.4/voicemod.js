
export class VoicemodClient {
  constructor(onStatus){
    this.onStatus = onStatus || (()=>{});
    this.ws = null;
    this.portList = [59129,20000,39273,42152,43782,46667,35679,37170,38501,33952,30546];
    this.msgId = 0;
    this.pending = new Map();
    this.clientKey = null;
  }

  async connect(){
    const { apiKey } = await chrome.storage.local.get({ apiKey: null });
    if (!apiKey) throw new Error("Set your Voicemod API key in Options.");
    this.clientKey = apiKey;

    for (const port of this.portList){
      try{
        await this._open(`ws://localhost:${port}/v1`, port);
        this.onStatus('connected', port);
        return;
      }catch(e){
        // try next
      }
    }
    this.onStatus('disconnected', null);
    throw new Error("Could not connect to Voicemod on any known port.");
  }

  async _open(url, port){
    await new Promise((resolve, reject)=>{
      const ws = new WebSocket(url);
      ws.onopen = async () => {
        this.ws = ws;
        this.port = port;
        this.ws.onmessage = (ev)=> this._onMessage(ev);
        this.ws.onclose = ()=> this.onStatus('disconnected', null);
        try {
          const res = await this._send("registerClient", { clientKey: this.clientKey });
          const code = res?.payload?.status?.code;
          if (code !== 200){
            reject(new Error("Unauthorized registerClient (status " + code + ")"));
          } else {
            resolve();
          }
        } catch (e){
          reject(e);
        }
      };
      ws.onerror = (err)=> reject(err);
    });
  }

  _send(action, payload={}){
    if (!this.ws || this.ws.readyState !== 1) throw new Error("WS not connected");
    const id = (++this.msgId).toString();
    const msg = { action, id, payload };
    const p = new Promise((resolve, reject)=>{
      const t = setTimeout(()=>{
        this.pending.delete(id);
        reject(new Error(action + " timed out"));
      }, 7000);
      this.pending.set(id, { resolve:(data)=>{ clearTimeout(t); resolve(data); }, reject });
    });
    this.ws.send(JSON.stringify(msg));
    return p;
  }

  _onMessage(ev){
    try {
      const data = JSON.parse(ev.data);
      const id = data?.id || data?.actionID || data?.actionId;
      if (id && this.pending.has(id)){
        const { resolve } = this.pending.get(id);
        this.pending.delete(id);
        resolve(data);
      }
    } catch (e){
      console.warn("WS parse error", e);
    }
  }

  // API wrappers
  async getVoices(){
    const res = await this._send("getVoices", {});
    const list = res?.actionObject?.voices || res?.payload?.voices || [];
    return list;
  }

  async loadVoice(voiceID){
    await this._send("loadVoice", { voiceID });
  }

  async getCurrentVoice(){
    const res = await this._send("getCurrentVoice", {});
    return res?.actionObject?.voiceID || null;
  }

  async getSoundboardByName(name){
    const res = await this._send("getAllSoundboard", {});
    const boards = res?.actionObject?.soundboards || [];
    const board = boards.find(b => (b.name || b.Name || "").toLowerCase() === name.toLowerCase());
    if (!board) throw new Error(`Soundboard "${name}" not found`);
    const sounds = board.sounds || [];
    return { board, sounds };
  }

  async playMeme(FileNameOrId){
    await this._send("playMeme", { FileName: FileNameOrId, IsKeyDown: true });
  }

  async stopAllMemeSounds(){
    await this._send("stopAllMemeSounds", {});
  }

  async toggleVoiceChanger(){ await this._send("toggleVoiceChanger", {}); }
  async toggleHearMyVoice(){ await this._send("toggleHearMyVoice", {}); }
  async toggleMuteMic(){ await this._send("toggleMuteMic", {}); }

  async getBitmapForVoice(voiceID){
    const res = await this._send("getBitmap", { voiceID });
    const obj = res?.actionObject || res?.payload || {};
    const images = obj.result || obj;
    const b64 = images?.transparent || images?.selected || images?.default;
    return b64 ? `data:image/gif;base64,${b64}` : null;
  }

  async getBitmapForMeme(memeId){
    const res = await this._send("getBitmap", { memeId });
    const obj = res?.actionObject || res?.payload || {};
    const images = obj.result || obj;
    const b64 = images?.image || images?.default || images?.transparent;
    return b64 ? `data:image/gif;base64,${b64}` : null;
  }
}
