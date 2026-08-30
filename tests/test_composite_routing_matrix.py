from __future__ import annotations

import re
import unittest
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
LITELLM_CONFIG = ROOT / "infra/hosts/orchestrator/litellm/config.yaml"
AGENT_VAULT_COMPOSE = ROOT / "infra/hosts/orchestrator/docker-compose.agent-vault.yml"
VAULT_SIDECAR = ROOT / "infra/images/infisical-secrets-init/universal-auth-agent-sidecar.sh"
VLLM_BOOTSTRAP = ROOT / "infra/scripts/vllm-bootstrap.sh"
OPENCLAW_CLIENT = ROOT / "services/letta-integration/src/client/openclaw-client.ts"


def fallback_graph(config: dict) -> dict[str, list[str]]:
    graph: dict[str, list[str]] = {}
    for item in config["router_settings"]["fallbacks"]:
        graph.update(item)
    return graph


def has_cycle(graph: dict[str, list[str]]) -> bool:
    visiting: set[str] = set()
    visited: set[str] = set()

    def visit(node: str) -> bool:
        if node in visiting:
            return True
        if node in visited:
            return False
        visiting.add(node)
        if any(visit(child) for child in graph.get(node, [])):
            return True
        visiting.remove(node)
        visited.add(node)
        return False

    return any(visit(node) for node in graph)


class CompositeRoutingMatrixTests(unittest.TestCase):
    def test_composite_routes_and_fallbacks_are_valid(self) -> None:
        config = yaml.safe_load(LITELLM_CONFIG.read_text(encoding="utf-8"))
        models = {item["model_name"] for item in config["model_list"]}
        self.assertTrue({"composite/coding", "composite/reasoning"} <= models)

        graph = fallback_graph(config)
        for source, targets in graph.items():
            self.assertIn(source, models)
            self.assertNotIn(source, targets)
            self.assertTrue(set(targets) <= models)
        self.assertFalse(has_cycle(graph), "fallback routing must remain acyclic")

        serialized = LITELLM_CONFIG.read_text(encoding="utf-8")
        self.assertNotIn("http://ts.net", serialized)
        self.assertNotIn("CLAUDE_SUBSCRIPTION_KEY", serialized)
        self.assertNotIn("CODEX_CLI_TOKEN", serialized)

    def test_agent_vault_is_a_non_privileged_file_sink(self) -> None:
        compose = yaml.safe_load(AGENT_VAULT_COMPOSE.read_text(encoding="utf-8"))
        vault = compose["services"]["agent-vault"]
        self.assertTrue(vault["read_only"])
        self.assertIn("ALL", vault["cap_drop"])
        self.assertNotIn("ports", vault)
        self.assertNotIn("/var/run/docker.sock", str(vault))

        for consumer in ("litellm", "openclaw-gateway"):
            mounts = compose["services"][consumer]["volumes"]
            self.assertTrue(any(str(mount).endswith(":ro") for mount in mounts))

    def test_sidecar_supports_universal_auth_without_logging_tokens(self) -> None:
        script = VAULT_SIDECAR.read_text(encoding="utf-8")
        self.assertIn("INFISICAL_UNIVERSAL_AUTH_CLIENT_ID", script)
        self.assertIn("INFISICAL_UNIVERSAL_AUTH_CLIENT_SECRET", script)
        self.assertIn("login --method universal-auth", script)
        self.assertNotRegex(
            script,
            re.compile(r"echo[^\n]*(?:\$\{?INFISICAL_TOKEN|\$\{?token)", re.IGNORECASE),
        )

    def test_vllm_bootstrap_uses_current_lmcache_connector(self) -> None:
        script = VLLM_BOOTSTRAP.read_text(encoding="utf-8")
        self.assertIn("remote_url:", script)
        self.assertIn("LMCacheConnectorV1", script)
        self.assertNotIn("lmcache_config:", script)
        self.assertNotIn('api_base: http://ts.net', script)

    def test_openclaw_reads_rotating_token_file_per_request(self) -> None:
        source = OPENCLAW_CLIENT.read_text(encoding="utf-8")
        self.assertIn("authTokenFile", source)
        self.assertIn("readFile", source)
        self.assertIn("resolveAuthHeaders", source)


if __name__ == "__main__":
    unittest.main()
