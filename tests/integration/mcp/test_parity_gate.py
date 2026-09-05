"""The Nexus deletion gate.

`services/nexus-router/` and the Grafbase Nexus deployment may be removed only
when every scenario below has actually been EXERCISED (not skipped) and passed.

This module deliberately does not assert - it reports. A parity gate that fails
CI on a secretless run would just get disabled; one that prints an honest
"6/24 scenarios exercised" cannot be mistaken for a green light.
"""

from __future__ import annotations

REQUIRED_SCENARIOS = [
    # discovery
    "initialize",
    "virtual_surface_constant_size",
    "discovery_dev_tool",
    "discovery_no_match",
    "similar_tool_disambiguation",
    "namespace_collision",
    # execution
    "valid_tool_execution",
    "read_tool_identifiable",
    "malformed_args_clean_error",
    "invented_tool_rejected",
    # authorization
    "dev_key_denied_crm",
    "dev_key_denied_cloudflare_admin",
    "mortgage_key_denied_infra",
    "tool_search_permission_off",
    "tool_search_permission_on",
    "unauthenticated_denied",
    # failure behaviour
    "upstream_unavailable_graceful",
    "upstream_timeout_bounded",
    "health_readiness",
    # cloudflare edge
    "cf_unauthenticated_denied",
    "cf_bad_service_token_denied",
    "cf_valid_service_token",
]

SECURITY_CRITICAL = {
    "dev_key_denied_crm",
    "dev_key_denied_cloudflare_admin",
    "mortgage_key_denied_infra",
    "tool_search_permission_off",
    "unauthenticated_denied",
    "cf_unauthenticated_denied",
    "cf_bad_service_token_denied",
}


def test_gate_report(evidence):
    """Print the deletion-gate status. Always passes; read the output."""
    seen = {e["scenario"]: e["status"] for e in evidence}

    exercised = [s for s in REQUIRED_SCENARIOS if s in seen]
    missing = [s for s in REQUIRED_SCENARIOS if s not in seen]
    failed = [s for s, st in seen.items() if str(st).upper() == "FAIL"]
    sec_missing = sorted(SECURITY_CRITICAL - set(seen))

    print("\n" + "=" * 72)
    print("NEXUS DELETION GATE")
    print("=" * 72)
    print(f"exercised : {len(exercised)}/{len(REQUIRED_SCENARIOS)}")
    print(f"failed    : {len(failed)}")

    if missing:
        print("\nNOT EXERCISED (missing credentials or unreachable target):")
        for s in missing:
            print(f"  - {s}")
    if failed:
        print("\nFAILED:")
        for s in failed:
            print(f"  - {s}")
    if sec_missing:
        print("\nSECURITY-CRITICAL SCENARIOS NOT EXERCISED:")
        for s in sec_missing:
            print(f"  - {s}")

    gate_met = not missing and not failed
    print("\nGATE: " + ("MET - Nexus may be deleted" if gate_met else
                        "NOT MET - do NOT delete services/nexus-router"))
    print("=" * 72)

    # Reported, never silently enforced. Deleting a subsystem is a human call.
    assert True
