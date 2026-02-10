import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import {
  resolveDefaultConfigCandidates,
  resolveConfigPath,
  resolveOAuthDir,
  resolveOAuthPath,
  resolveStateDir,
} from "./paths.js";

describe("oauth paths", () => {
  it("prefers OPENCOG_OAUTH_DIR over OPENCOG_STATE_DIR", () => {
    const env = {
      OPENCOG_OAUTH_DIR: "/custom/oauth",
      OPENCOG_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.resolve("/custom/oauth"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join(path.resolve("/custom/oauth"), "oauth.json"),
    );
  });

  it("derives oauth path from OPENCOG_STATE_DIR when unset", () => {
    const env = {
      OPENCOG_STATE_DIR: "/custom/state",
    } as NodeJS.ProcessEnv;

    expect(resolveOAuthDir(env, "/custom/state")).toBe(path.join("/custom/state", "credentials"));
    expect(resolveOAuthPath(env, "/custom/state")).toBe(
      path.join("/custom/state", "credentials", "oauth.json"),
    );
  });
});

describe("state + config path candidates", () => {
  it("uses OPENCOG_STATE_DIR when set", () => {
    const env = {
      OPENCOG_STATE_DIR: "/new/state",
    } as NodeJS.ProcessEnv;

    expect(resolveStateDir(env, () => "/home/test")).toBe(path.resolve("/new/state"));
  });

  it("uses OPENCOG_HOME for default state/config locations", () => {
    const env = {
      OPENCOG_HOME: "/srv/opencog-home",
    } as NodeJS.ProcessEnv;

    const resolvedHome = path.resolve("/srv/opencog-home");
    expect(resolveStateDir(env)).toBe(path.join(resolvedHome, ".opencog"));

    const candidates = resolveDefaultConfigCandidates(env);
    expect(candidates[0]).toBe(path.join(resolvedHome, ".opencog", "opencog.json"));
  });

  it("prefers OPENCOG_HOME over HOME for default state/config locations", () => {
    const env = {
      OPENCOG_HOME: "/srv/opencog-home",
      HOME: "/home/other",
    } as NodeJS.ProcessEnv;

    const resolvedHome = path.resolve("/srv/opencog-home");
    expect(resolveStateDir(env)).toBe(path.join(resolvedHome, ".opencog"));

    const candidates = resolveDefaultConfigCandidates(env);
    expect(candidates[0]).toBe(path.join(resolvedHome, ".opencog", "opencog.json"));
  });

  it("orders default config candidates in a stable order", () => {
    const home = "/home/test";
    const resolvedHome = path.resolve(home);
    const candidates = resolveDefaultConfigCandidates({} as NodeJS.ProcessEnv, () => home);
    const expected = [
      path.join(resolvedHome, ".opencog", "opencog.json"),
      path.join(resolvedHome, ".opencog", "clawdbot.json"),
      path.join(resolvedHome, ".opencog", "moltbot.json"),
      path.join(resolvedHome, ".opencog", "moldbot.json"),
      path.join(resolvedHome, ".clawdbot", "opencog.json"),
      path.join(resolvedHome, ".clawdbot", "clawdbot.json"),
      path.join(resolvedHome, ".clawdbot", "moltbot.json"),
      path.join(resolvedHome, ".clawdbot", "moldbot.json"),
      path.join(resolvedHome, ".moltbot", "opencog.json"),
      path.join(resolvedHome, ".moltbot", "clawdbot.json"),
      path.join(resolvedHome, ".moltbot", "moltbot.json"),
      path.join(resolvedHome, ".moltbot", "moldbot.json"),
      path.join(resolvedHome, ".moldbot", "opencog.json"),
      path.join(resolvedHome, ".moldbot", "clawdbot.json"),
      path.join(resolvedHome, ".moldbot", "moltbot.json"),
      path.join(resolvedHome, ".moldbot", "moldbot.json"),
    ];
    expect(candidates).toEqual(expected);
  });

  it("prefers ~/.opencog when it exists and legacy dir is missing", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "opencog-state-"));
    try {
      const newDir = path.join(root, ".opencog");
      await fs.mkdir(newDir, { recursive: true });
      const resolved = resolveStateDir({} as NodeJS.ProcessEnv, () => root);
      expect(resolved).toBe(newDir);
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });

  it("CONFIG_PATH prefers existing config when present", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "opencog-config-"));
    const previousHome = process.env.HOME;
    const previousUserProfile = process.env.USERPROFILE;
    const previousHomeDrive = process.env.HOMEDRIVE;
    const previousHomePath = process.env.HOMEPATH;
    const previousOpenCogConfig = process.env.OPENCOG_CONFIG_PATH;
    const previousOpenCogState = process.env.OPENCOG_STATE_DIR;
    try {
      const legacyDir = path.join(root, ".opencog");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyPath = path.join(legacyDir, "opencog.json");
      await fs.writeFile(legacyPath, "{}", "utf-8");

      process.env.HOME = root;
      if (process.platform === "win32") {
        process.env.USERPROFILE = root;
        const parsed = path.win32.parse(root);
        process.env.HOMEDRIVE = parsed.root.replace(/\\$/, "");
        process.env.HOMEPATH = root.slice(parsed.root.length - 1);
      }
      delete process.env.OPENCOG_CONFIG_PATH;
      delete process.env.OPENCOG_STATE_DIR;

      vi.resetModules();
      const { CONFIG_PATH } = await import("./paths.js");
      expect(CONFIG_PATH).toBe(legacyPath);
    } finally {
      if (previousHome === undefined) {
        delete process.env.HOME;
      } else {
        process.env.HOME = previousHome;
      }
      if (previousUserProfile === undefined) {
        delete process.env.USERPROFILE;
      } else {
        process.env.USERPROFILE = previousUserProfile;
      }
      if (previousHomeDrive === undefined) {
        delete process.env.HOMEDRIVE;
      } else {
        process.env.HOMEDRIVE = previousHomeDrive;
      }
      if (previousHomePath === undefined) {
        delete process.env.HOMEPATH;
      } else {
        process.env.HOMEPATH = previousHomePath;
      }
      if (previousOpenCogConfig === undefined) {
        delete process.env.OPENCOG_CONFIG_PATH;
      } else {
        process.env.OPENCOG_CONFIG_PATH = previousOpenCogConfig;
      }
      if (previousOpenCogConfig === undefined) {
        delete process.env.OPENCOG_CONFIG_PATH;
      } else {
        process.env.OPENCOG_CONFIG_PATH = previousOpenCogConfig;
      }
      if (previousOpenCogState === undefined) {
        delete process.env.OPENCOG_STATE_DIR;
      } else {
        process.env.OPENCOG_STATE_DIR = previousOpenCogState;
      }
      if (previousOpenCogState === undefined) {
        delete process.env.OPENCOG_STATE_DIR;
      } else {
        process.env.OPENCOG_STATE_DIR = previousOpenCogState;
      }
      await fs.rm(root, { recursive: true, force: true });
      vi.resetModules();
    }
  });

  it("respects state dir overrides when config is missing", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "opencog-config-override-"));
    try {
      const legacyDir = path.join(root, ".opencog");
      await fs.mkdir(legacyDir, { recursive: true });
      const legacyConfig = path.join(legacyDir, "opencog.json");
      await fs.writeFile(legacyConfig, "{}", "utf-8");

      const overrideDir = path.join(root, "override");
      const env = { OPENCOG_STATE_DIR: overrideDir } as NodeJS.ProcessEnv;
      const resolved = resolveConfigPath(env, overrideDir, () => root);
      expect(resolved).toBe(path.join(overrideDir, "opencog.json"));
    } finally {
      await fs.rm(root, { recursive: true, force: true });
    }
  });
});
