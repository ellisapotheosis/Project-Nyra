#!/usr/bin/env python3
import secrets
from pathlib import Path

env = Path('infra/env/nyra.env')
if not env.exists():
    raise SystemExit('Create infra/env/nyra.env from example first')

text = env.read_text().splitlines()
out = []
keys = {
    'POSTGRES_PASSWORD': 32,
    'REDIS_PASSWORD': 32,
    'MONGO_ROOT_PASSWORD': 32,
    'NEXUS_ADMIN_TOKEN': 48,
    'LITELLM_MASTER_KEY': 48,
    'N8N_ENCRYPTION_KEY': 32,
    'N8N_BASIC_AUTH_PASSWORD': 20,
    'ACTIVEPIECES_JWT_SECRET': 48,
    'ACTIVEPIECES_ENCRYPTION_KEY': 48,
    'TWENTY_ENCRYPTION_SECRET': 48,
    'TWENTY_JWT_SECRET': 48,
    'TWENTY_PASSWORD_SALT': 48,
    'GRAFANA_ADMIN_PASSWORD': 24,
}

for line in text:
    if '=' not in line or line.strip().startswith('#'):
      out.append(line)
      continue
    k,v = line.split('=',1)
    if k in keys and v.strip()=='' :
      out.append(f"{k}={secrets.token_urlsafe(keys[k]//2)}")
    else:
      out.append(line)

env.write_text('\n'.join(out)+'\n')
print('Secrets generated in infra/env/nyra.env')
