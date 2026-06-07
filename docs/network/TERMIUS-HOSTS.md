# Termius Hosts

Use these entries from iPhone Termius when the phone is connected to the
`trex-fiordland.ts.net` tailnet.

Target machines do not receive Termius private keys. Each target only needs the
matching public key in `authorized_keys`. The public key currently installed by
the repair pass is the existing key already found on the PCs with comment
`#ssh.id - @ellisapotheosis`; if the iPhone Termius app generated a different
key, export or copy that public key from Termius and add it to each target's
`authorized_keys`.

| Name             | Host                                     | Port | User     | Notes                                                     |
| ---------------- | ---------------------------------------- | ---: | -------- | --------------------------------------------------------- |
| Oracle VPS       | `oracle.trex-fiordland.ts.net`           |   23 | `ubuntu` | Cloud VPS. Use MagicDNS from Termius and Windows clients. |
| Orchestrator     | `orchestrator.trex-fiordland.ts.net`     | 2223 | `edane`  | Windows OpenSSH endpoint.                                 |
| Worker RTX5090   | `worker-rtx5090.trex-fiordland.ts.net`   | 2223 | `edane`  | Current local workstation.                                |
| Worker RTX3090Ti | `worker-rtx3090ti.trex-fiordland.ts.net` | 2223 | `edane`  | Windows OpenSSH endpoint.                                 |
| Worker RTX3060   | `worker-rtx3060.trex-fiordland.ts.net`   | 2223 | `edane`  | Windows OpenSSH endpoint.                                 |

Recommended Termius settings:

- Authentication: SSH key, using the private key that matches the installed public key.
- Strict host checking: on after first successful connection.
- Mosh: disabled for these hosts unless `mosh-server` and UDP firewall rules are deliberately configured later.
- Agent forwarding: disabled.
- Port forwarding: disabled by default; create explicit forwards only when needed.

WSL-specific note: WSL does not run the local Tailscale daemon in this setup.
From WSL, Oracle may use its Tailscale IP (`100.64.0.3`) on port `23`; from
Termius and Windows clients, prefer the MagicDNS host above.
