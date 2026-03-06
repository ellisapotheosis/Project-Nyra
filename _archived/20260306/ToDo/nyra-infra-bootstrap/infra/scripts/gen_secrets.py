import base64
import secrets
import re
from pathlib import Path

ENV_PATH = Path(__file__).resolve().parents[1] / "env" / "nyra.env"

def rand_b64(nbytes: int) -> str:
    return base64.b64encode(secrets.token_bytes(nbytes)).decode("utf-8").rstrip("=")

def rand_hex(nbytes: int) -> str:
    return secrets.token_hex(nbytes)

def load_env(text: str) -> dict[str, str]:
    out = {}
    for line in text.splitlines():
        if not line or line.strip().startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        out[k.strip()] = v.strip()
    return out

def set_kv(text: str, key: str, value: str) -> str:
    pat = re.compile(rf"^{re.escape(key)}=.*$", re.M)
    if pat.search(text):
        return pat.sub(f"{key}={value}", text)
    return text + f"\n{key}={value}\n"

def main():
    raw = ENV_PATH.read_text(encoding="utf-8")

    def ensure(key: str, gen):
        nonlocal raw
        cur = load_env(raw).get(key, "")
        if cur and cur not in {"replace_me"}:
            return
        raw = set_kv(raw, key, gen())

    ensure("NYRA_POSTGRES_PASSWORD", lambda: rand_b64(24))
    ensure("LITELLM_MASTER_KEY", lambda: "sk-" + rand_b64(32))
    ensure("GRAFANA_ADMIN_PASSWORD", lambda: rand_b64(20))

    ensure("TWENTY_PG_PASSWORD", lambda: rand_b64(24))
    ensure("TWENTY_APP_SECRET", lambda: rand_b64(32))

    ensure("N8N_POSTGRES_PASSWORD", lambda: rand_b64(24))
    ensure("N8N_ENCRYPTION_KEY", lambda: rand_hex(32))

    ensure("AP_POSTGRES_PASSWORD", lambda: rand_b64(24))
    ensure("AP_ENCRYPTION_KEY", lambda: rand_hex(16))
    ensure("AP_JWT_SECRET", lambda: rand_b64(32))
    ensure("AP_API_KEY", lambda: rand_b64(24))

    ENV_PATH.write_text(raw, encoding="utf-8")
    print(f"✅ Secrets ensured in {ENV_PATH}")

if __name__ == "__main__":
    main()
