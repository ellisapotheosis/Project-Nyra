type VoicePayload = { command?: string; transcript?: string; audioUrl?: string; tags?: string[]; };
export async function handleVoiceCommand(payload: VoicePayload, superagiUrl: string): Promise<{ ok: boolean; data?: any; error?: string; }> {
  try {
    const res = await fetch(superagiUrl, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    if (!res.ok) return { ok:false, error:`HTTP ${res.status}` };
    const data = await res.json().catch(()=>({}));
    return { ok:true, data };
  } catch(e:any){ return { ok:false, error:e?.message||'network error' }; }
}
