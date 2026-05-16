# Runtime Config Stubs

The prompt package requested concrete Nexus and LiteLLM configuration examples.
The live root paths are currently not writable by the normal repo user:

- `configs/litellm/`
- `configs/nexus/`

Those paths also contain placeholder directory shapes that should not be
rewritten without an explicit infra permissions pass. To keep the prompt package
moving without changing ownership, the examples were staged here:

- `docs/configs/litellm-config.example.yaml`
- `docs/configs/nexus.example.toml`

Promotion rule:

1. Fix filesystem ownership or replace the placeholder directories in a
   dedicated infra change.
2. Copy the example content to the live runtime path.
3. Source secrets from Infisical or the host `.env` files.
4. Run compose validation before deployment.

No secret values are present in these examples.
