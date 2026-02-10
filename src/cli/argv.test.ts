import { describe, expect, it } from "vitest";
import {
  buildParseArgv,
  getFlagValue,
  getCommandPath,
  getPrimaryCommand,
  getPositiveIntFlagValue,
  getVerboseFlag,
  hasHelpOrVersion,
  hasFlag,
  shouldMigrateState,
  shouldMigrateStateFromPath,
} from "./argv.js";

describe("argv helpers", () => {
  it("detects help/version flags", () => {
    expect(hasHelpOrVersion(["node", "opencog", "--help"])).toBe(true);
    expect(hasHelpOrVersion(["node", "opencog", "-V"])).toBe(true);
    expect(hasHelpOrVersion(["node", "opencog", "status"])).toBe(false);
  });

  it("extracts command path ignoring flags and terminator", () => {
    expect(getCommandPath(["node", "opencog", "status", "--json"], 2)).toEqual(["status"]);
    expect(getCommandPath(["node", "opencog", "agents", "list"], 2)).toEqual(["agents", "list"]);
    expect(getCommandPath(["node", "opencog", "status", "--", "ignored"], 2)).toEqual(["status"]);
  });

  it("returns primary command", () => {
    expect(getPrimaryCommand(["node", "opencog", "agents", "list"])).toBe("agents");
    expect(getPrimaryCommand(["node", "opencog"])).toBeNull();
  });

  it("parses boolean flags and ignores terminator", () => {
    expect(hasFlag(["node", "opencog", "status", "--json"], "--json")).toBe(true);
    expect(hasFlag(["node", "opencog", "--", "--json"], "--json")).toBe(false);
  });

  it("extracts flag values with equals and missing values", () => {
    expect(getFlagValue(["node", "opencog", "status", "--timeout", "5000"], "--timeout")).toBe(
      "5000",
    );
    expect(getFlagValue(["node", "opencog", "status", "--timeout=2500"], "--timeout")).toBe(
      "2500",
    );
    expect(getFlagValue(["node", "opencog", "status", "--timeout"], "--timeout")).toBeNull();
    expect(getFlagValue(["node", "opencog", "status", "--timeout", "--json"], "--timeout")).toBe(
      null,
    );
    expect(getFlagValue(["node", "opencog", "--", "--timeout=99"], "--timeout")).toBeUndefined();
  });

  it("parses verbose flags", () => {
    expect(getVerboseFlag(["node", "opencog", "status", "--verbose"])).toBe(true);
    expect(getVerboseFlag(["node", "opencog", "status", "--debug"])).toBe(false);
    expect(getVerboseFlag(["node", "opencog", "status", "--debug"], { includeDebug: true })).toBe(
      true,
    );
  });

  it("parses positive integer flag values", () => {
    expect(getPositiveIntFlagValue(["node", "opencog", "status"], "--timeout")).toBeUndefined();
    expect(
      getPositiveIntFlagValue(["node", "opencog", "status", "--timeout"], "--timeout"),
    ).toBeNull();
    expect(
      getPositiveIntFlagValue(["node", "opencog", "status", "--timeout", "5000"], "--timeout"),
    ).toBe(5000);
    expect(
      getPositiveIntFlagValue(["node", "opencog", "status", "--timeout", "nope"], "--timeout"),
    ).toBeUndefined();
  });

  it("builds parse argv from raw args", () => {
    const nodeArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["node", "opencog", "status"],
    });
    expect(nodeArgv).toEqual(["node", "opencog", "status"]);

    const versionedNodeArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["node-22", "opencog", "status"],
    });
    expect(versionedNodeArgv).toEqual(["node-22", "opencog", "status"]);

    const versionedNodeWindowsArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["node-22.2.0.exe", "opencog", "status"],
    });
    expect(versionedNodeWindowsArgv).toEqual(["node-22.2.0.exe", "opencog", "status"]);

    const versionedNodePatchlessArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["node-22.2", "opencog", "status"],
    });
    expect(versionedNodePatchlessArgv).toEqual(["node-22.2", "opencog", "status"]);

    const versionedNodeWindowsPatchlessArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["node-22.2.exe", "opencog", "status"],
    });
    expect(versionedNodeWindowsPatchlessArgv).toEqual(["node-22.2.exe", "opencog", "status"]);

    const versionedNodeWithPathArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["/usr/bin/node-22.2.0", "opencog", "status"],
    });
    expect(versionedNodeWithPathArgv).toEqual(["/usr/bin/node-22.2.0", "opencog", "status"]);

    const nodejsArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["nodejs", "opencog", "status"],
    });
    expect(nodejsArgv).toEqual(["nodejs", "opencog", "status"]);

    const nonVersionedNodeArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["node-dev", "opencog", "status"],
    });
    expect(nonVersionedNodeArgv).toEqual(["node", "opencog", "node-dev", "opencog", "status"]);

    const directArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["opencog", "status"],
    });
    expect(directArgv).toEqual(["node", "opencog", "status"]);

    const bunArgv = buildParseArgv({
      programName: "opencog",
      rawArgs: ["bun", "src/entry.ts", "status"],
    });
    expect(bunArgv).toEqual(["bun", "src/entry.ts", "status"]);
  });

  it("builds parse argv from fallback args", () => {
    const fallbackArgv = buildParseArgv({
      programName: "opencog",
      fallbackArgv: ["status"],
    });
    expect(fallbackArgv).toEqual(["node", "opencog", "status"]);
  });

  it("decides when to migrate state", () => {
    expect(shouldMigrateState(["node", "opencog", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "opencog", "health"])).toBe(false);
    expect(shouldMigrateState(["node", "opencog", "sessions"])).toBe(false);
    expect(shouldMigrateState(["node", "opencog", "memory", "status"])).toBe(false);
    expect(shouldMigrateState(["node", "opencog", "agent", "--message", "hi"])).toBe(false);
    expect(shouldMigrateState(["node", "opencog", "agents", "list"])).toBe(true);
    expect(shouldMigrateState(["node", "opencog", "message", "send"])).toBe(true);
  });

  it("reuses command path for migrate state decisions", () => {
    expect(shouldMigrateStateFromPath(["status"])).toBe(false);
    expect(shouldMigrateStateFromPath(["agents", "list"])).toBe(true);
  });
});
