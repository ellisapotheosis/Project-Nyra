🔁 Deployment Order (important)

On worker-rtx5090 (new PC):

Windows

Set-ExecutionPolicy Bypass -Scope Process
.\setup-dns-windows.ps1


Restart WSL

wsl --shutdown


Inside Ubuntu

bash setup-dns-wsl.sh


Restart WSL again

wsl --shutdown

🧪 Sanity Checks (run anywhere)
Windows
Resolve-DnsName registry.npmjs.org
netsh dns show encryption


You should see Cloudflare templates only.

WSL
resolvectl status || cat /etc/resolv.conf
time curl -I https://registry.npmjs.org


Expected:

<300ms consistently

No hangs

No integrity errors