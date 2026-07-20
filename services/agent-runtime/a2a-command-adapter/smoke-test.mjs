const base = (process.env.ADAPTER_TEST_URL || "http://127.0.0.1:8762").replace(/\/$/, "");
const health = await fetch(`${base}/health`).then((r) => r.json());
if (!health.ok) throw new Error("health failed");
const card = await fetch(`${base}/.well-known/agent-card.json`).then((r) => r.json());
if (!card.name) throw new Error("agent card failed");
const sent = await fetch(base, {
  method: "POST", headers: { "content-type": "application/json", "x-litellm-trace-id": crypto.randomUUID() },
  body: JSON.stringify({ jsonrpc: "2.0", id: "smoke", method: "message/send", params: { message: { role: "user", parts: [{ kind: "text", text: "Return the word READY" }] } } })
}).then((r) => r.json());
if (!sent.result?.id) throw new Error(`send failed: ${JSON.stringify(sent)}`);
console.log(JSON.stringify({ health, card: card.name, task: sent.result.id }, null, 2));
