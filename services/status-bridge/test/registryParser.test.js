import assert from "node:assert/strict";
import test from "node:test";
import { readFile } from "node:fs/promises";
import { parseRegistryYaml, summarize } from "../src/server.js";

test("service registry exists and includes status bridge metadata", async () => {
  const registry = await readFile(
    new URL("../../../infra/service-registry.yaml", import.meta.url),
    "utf8"
  );

  assert.match(registry, /id: status/);
  assert.match(registry, /public_url: https:\/\/status\.projectnyra\.com/);
  assert.match(registry, /cloudflare_access: required/);
});

test("registry parser produces status summaries without secrets", async () => {
  const registry = await readFile(
    new URL("../../../infra/service-registry.yaml", import.meta.url),
    "utf8"
  );
  const services = parseRegistryYaml(registry);
  const status = summarize(services);

  assert.ok(services.length > 10);
  assert.ok(status.services.some((service) => service.id === "status"));
  assert.equal(JSON.stringify(status).includes("TOKEN"), false);
});
