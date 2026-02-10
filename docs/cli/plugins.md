---
summary: "CLI reference for `opencog plugins` (list, install, enable/disable, doctor)"
read_when:
  - You want to install or manage in-process Gateway plugins
  - You want to debug plugin load failures
title: "plugins"
---

# `opencog plugins`

Manage Gateway plugins/extensions (loaded in-process).

Related:

- Plugin system: [Plugins](/tools/plugin)
- Plugin manifest + schema: [Plugin manifest](/plugins/manifest)
- Security hardening: [Security](/gateway/security)

## Commands

```bash
opencog plugins list
opencog plugins info <id>
opencog plugins enable <id>
opencog plugins disable <id>
opencog plugins doctor
opencog plugins update <id>
opencog plugins update --all
```

Bundled plugins ship with OpenCog but start disabled. Use `plugins enable` to
activate them.

All plugins must ship a `opencog.plugin.json` file with an inline JSON Schema
(`configSchema`, even if empty). Missing/invalid manifests or schemas prevent
the plugin from loading and fail config validation.

### Install

```bash
opencog plugins install <path-or-spec>
```

Security note: treat plugin installs like running code. Prefer pinned versions.

Supported archives: `.zip`, `.tgz`, `.tar.gz`, `.tar`.

Use `--link` to avoid copying a local directory (adds to `plugins.load.paths`):

```bash
opencog plugins install -l ./my-plugin
```

### Update

```bash
opencog plugins update <id>
opencog plugins update --all
opencog plugins update <id> --dry-run
```

Updates only apply to plugins installed from npm (tracked in `plugins.installs`).
