# systemd in WSL

For Docker Desktop + WSL2 backend: **not required**.

Enable only if you need Linux services to auto-start inside WSL:
```bash
sudo tee /etc/wsl.conf >/dev/null <<'EOF'
[boot]
systemd=true
EOF
```
Then in Windows PowerShell:
```powershell
wsl --shutdown
```
