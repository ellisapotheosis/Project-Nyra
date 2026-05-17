# Iframe CSP Test Report

Header checks from this WSL session were limited by DNS/timeouts. The registry therefore defaults sensitive and unknown surfaces to link-first or unknown-test-required.

| Service                      | URL                                      | X-Frame-Options | frame-ancestors | Access/Auth             | Iframe decision       | Reason                                      |
| ---------------------------- | ---------------------------------------- | --------------- | --------------- | ----------------------- | --------------------- | ------------------------------------------- |
| Clawteam                     | https://clawteam.projectnyra.com         | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| GasTeam                      | https://gasteam.projectnyra.com          | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| GasTown                      | https://gastown.projectnyra.com          | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Openclaw Gateway             | https://openclaw-gateway.projectnyra.com | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Openwebui                    | https://openwebui.projectnyra.com        | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| App                          | https://app.projectnyra.com              | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| RateHunter Landing           | https://ratehunter.net                   | unknown         | unknown         | not-required            | link-first            | Public page; preview only after header test |
| RateHunter Landing           | https://ratehunter.net                   | unknown         | unknown         | not-required            | link-first            | Public page; preview only after header test |
| Borrower ChatUI              | https://borrower-chat.projectnyra.com    | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Broker ChatUI                | https://broker-chat.projectnyra.com      | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Campaign Builder             | https://campaigns.projectnyra.com        | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Quote Workspace              | https://quotes.projectnyra.com           | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Crm                          | https://crm.projectnyra.com              | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Twenty                       | https://twenty.projectnyra.com           | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Admin Page                   | https://admin.projectnyra.com            | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Cadvisor                     | https://cadvisor.projectnyra.com         | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Grafana                      | https://grafana.projectnyra.com          | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Home Assistant               | https://ha.projectnyra.com               | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Litellm                      | https://litellm.projectnyra.com          | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Nexus                        | https://nexus.projectnyra.com            | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Nexus Router                 | https://nexus-router.projectnyra.com     | unknown         | unknown         | service-token-or-signed | link-first            | Sensitive surface                           |
| Portainer Oracle             | https://portainer-oracle.projectnyra.com | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Prometheus                   | https://prometheus.projectnyra.com       | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Status Bridge                | https://status.projectnyra.com           | unknown         | unknown         | required                | iframe-ok             | Sensitive surface                           |
| Activepieces                 | https://activepieces.projectnyra.com     | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Api                          | https://api.projectnyra.com              | unknown         | unknown         | not-required            | unknown-test-required | Sensitive surface                           |
| Git Ssh                      | https://git-ssh.projectnyra.com          | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Gitea                        | https://gitea.projectnyra.com            | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Hooks                        | https://hooks.projectnyra.com            | unknown         | unknown         | service-token-or-signed | unknown-test-required | Sensitive surface                           |
| Links                        | https://links.projectnyra.com            | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Linkwarden                   | https://linkwarden.projectnyra.com       | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| N8N                          | https://n8n.projectnyra.com              | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Paperclip                    | https://paperclip.projectnyra.com        | unknown         | unknown         | required                | unknown-test-required | Sensitive surface                           |
| Worker RTX3090Ti OpenClaw UI | https://claw-3090.projectnyra.com        | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Worker RTX5090 OpenClaw UI   | https://claw-5090.projectnyra.com        | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Worker RTX3060 Nerve UI      | https://nerve-3060.projectnyra.com       | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Worker RTX3090Ti Nerve UI    | https://nerve-3090.projectnyra.com       | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Worker RTX5090 Nerve UI      | https://nerve-5090.projectnyra.com       | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
| Worker RTX3060 PicoClaw UI   | https://picoclaw-3060.projectnyra.com    | unknown         | unknown         | required                | link-first            | Sensitive surface                           |
