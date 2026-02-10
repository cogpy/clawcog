import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";
import { resolveStorePath } from "./paths.js";

describe("resolveStorePath", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("uses OPENCOG_HOME for tilde expansion", () => {
    vi.stubEnv("OPENCOG_HOME", "/srv/opencog-home");
    vi.stubEnv("HOME", "/home/other");

    const resolved = resolveStorePath("~/.opencog/agents/{agentId}/sessions/sessions.json", {
      agentId: "research",
    });

    expect(resolved).toBe(
      path.resolve("/srv/opencog-home/.opencog/agents/research/sessions/sessions.json"),
    );
  });
});
