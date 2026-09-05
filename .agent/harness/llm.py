"""Shared model-call helper. Factored out of conductor so memory/ can reuse.

Provider selection is env-driven:

    AGENT_PROVIDER   anthropic (default) | openai
    AGENT_MODEL      model id / alias
    AGENT_BASE_URL   OpenAI-compatible base URL (openai provider only)
    AGENT_API_KEY    key for AGENT_BASE_URL (openai provider only)

AGENT_BASE_URL / AGENT_API_KEY exist so this harness can be pointed at the Nyra
LiteLLM gateway WITHOUT setting OPENAI_BASE_URL / OPENAI_API_KEY globally.
Setting those globally breaks native subscription auth for Claude Code and
Codex, which is why the project forbids it outside a scoped profile.

To run a lane on the orchestrator CPU memory-manager (BitNet b1.58 2B-4T):

    AGENT_PROVIDER=openai
    AGENT_MODEL=nyra-memory
    AGENT_BASE_URL=http://100.64.0.3:4000/v1     # LiteLLM, never the origin
    AGENT_API_KEY=<scoped LiteLLM virtual key>

Address the LiteLLM alias, never http://100.64.0.10:8087 directly: the gateway
is where routing, budget and key scoping live.

See infra/env/agent-memory.env.example.
"""
import os


def _openai_client():
    """Build an OpenAI-compatible client.

    base_url/api_key are passed explicitly rather than left to the SDK's
    environment lookup, so a lane can target LiteLLM without OPENAI_* leaking
    into the rest of the process.
    """
    from openai import OpenAI

    kwargs = {}
    base_url = os.getenv("AGENT_BASE_URL")
    if base_url:
        kwargs["base_url"] = base_url
    api_key = os.getenv("AGENT_API_KEY")
    if api_key:
        kwargs["api_key"] = api_key
    return OpenAI(**kwargs)


def llm_available():
    """True iff provider + credentials are configured. Validation / dream cycle
    check this before making calls so they degrade gracefully offline."""
    provider = os.getenv("AGENT_PROVIDER", "anthropic").lower()
    if provider == "anthropic":
        return bool(os.getenv("ANTHROPIC_API_KEY"))
    if provider == "openai":
        # A self-hosted gateway is still gated by a virtual key, so require a
        # key either way; AGENT_API_KEY wins when a custom base URL is in use.
        return bool(os.getenv("AGENT_API_KEY") or os.getenv("OPENAI_API_KEY"))
    return False


def call_model(system, user, *, temperature=0.3, max_tokens=4096, model=None):
    provider = os.getenv("AGENT_PROVIDER", "anthropic").lower()
    if provider == "anthropic":
        from anthropic import Anthropic
        c = Anthropic()
        r = c.messages.create(
            model=model or os.getenv("AGENT_MODEL", "claude-sonnet-4-5"),
            max_tokens=max_tokens, temperature=temperature,
            system=system,
            messages=[{"role": "user", "content": user}],
        )
        return r.content[0].text
    if provider == "openai":
        c = _openai_client()
        r = c.chat.completions.create(
            model=model or os.getenv("AGENT_MODEL", "gpt-4o"),
            temperature=temperature,
            messages=[{"role": "system", "content": system},
                      {"role": "user", "content": user}],
        )
        return r.choices[0].message.content
    raise ValueError(f"unknown provider: {provider}")
