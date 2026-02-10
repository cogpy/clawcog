---
summary: "CLI reference for `opencog config` (get/set/unset config values)"
read_when:
  - You want to read or edit config non-interactively
title: "config"
---

# `opencog config`

Config helpers: get/set/unset values by path. Run without a subcommand to open
the configure wizard (same as `opencog configure`).

## Examples

```bash
opencog config get browser.executablePath
opencog config set browser.executablePath "/usr/bin/google-chrome"
opencog config set agents.defaults.heartbeat.every "2h"
opencog config set agents.list[0].tools.exec.node "node-id-or-name"
opencog config unset tools.web.search.apiKey
```

## Paths

Paths use dot or bracket notation:

```bash
opencog config get agents.defaults.workspace
opencog config get agents.list[0].id
```

Use the agent list index to target a specific agent:

```bash
opencog config get agents.list
opencog config set agents.list[1].tools.exec.node "node-id-or-name"
```

## Values

Values are parsed as JSON5 when possible; otherwise they are treated as strings.
Use `--json` to require JSON5 parsing.

```bash
opencog config set agents.defaults.heartbeat.every "0m"
opencog config set gateway.port 19001 --json
opencog config set channels.whatsapp.groups '["*"]' --json
```

Restart the gateway after edits.
