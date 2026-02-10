import path from "node:path";
import { describe, expect, it } from "vitest";
import { resolveGatewayStateDir } from "./paths.js";

describe("resolveGatewayStateDir", () => {
  it("uses the default state dir when no overrides are set", () => {
    const env = { HOME: "/Users/test" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".opencog"));
  });

  it("appends the profile suffix when set", () => {
    const env = { HOME: "/Users/test", OPENCOG_PROFILE: "rescue" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".opencog-rescue"));
  });

  it("treats default profiles as the base state dir", () => {
    const env = { HOME: "/Users/test", OPENCOG_PROFILE: "Default" };
    expect(resolveGatewayStateDir(env)).toBe(path.join("/Users/test", ".opencog"));
  });

  it("uses OPENCOG_STATE_DIR when provided", () => {
    const env = { HOME: "/Users/test", OPENCOG_STATE_DIR: "/var/lib/opencog" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/var/lib/opencog"));
  });

  it("expands ~ in OPENCOG_STATE_DIR", () => {
    const env = { HOME: "/Users/test", OPENCOG_STATE_DIR: "~/opencog-state" };
    expect(resolveGatewayStateDir(env)).toBe(path.resolve("/Users/test/opencog-state"));
  });

  it("preserves Windows absolute paths without HOME", () => {
    const env = { OPENCOG_STATE_DIR: "C:\\State\\opencog" };
    expect(resolveGatewayStateDir(env)).toBe("C:\\State\\opencog");
  });
});
