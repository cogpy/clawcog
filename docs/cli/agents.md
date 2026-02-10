---
summary: "CLI reference for `opencog agents` (list/add/delete/set identity)"
read_when:
  - You want multiple isolated agents (workspaces + routing + auth)
title: "agents"
---

# `opencog agents`

Manage isolated agents (workspaces + auth + routing).

Related:

- Multi-agent routing: [Multi-Agent Routing](/concepts/multi-agent)
- Agent workspace: [Agent workspace](/concepts/agent-workspace)

## Examples

```bash
opencog agents list
opencog agents add work --workspace ~/.opencog/workspace-work
opencog agents set-identity --workspace ~/.opencog/workspace --from-identity
opencog agents set-identity --agent main --avatar avatars/opencog.png
opencog agents delete work
```

## Identity files

Each agent workspace can include an `IDENTITY.md` at the workspace root:

- Example path: `~/.opencog/workspace/IDENTITY.md`
- `set-identity --from-identity` reads from the workspace root (or an explicit `--identity-file`)

Avatar paths resolve relative to the workspace root.

## Set identity

`set-identity` writes fields into `agents.list[].identity`:

- `name`
- `theme`
- `emoji`
- `avatar` (workspace-relative path, http(s) URL, or data URI)

Load from `IDENTITY.md`:

```bash
opencog agents set-identity --workspace ~/.opencog/workspace --from-identity
```

Override fields explicitly:

```bash
opencog agents set-identity --agent main --name "OpenCog" --emoji "🦞" --avatar avatars/opencog.png
```

Config sample:

```json5
{
  agents: {
    list: [
      {
        id: "main",
        identity: {
          name: "OpenCog",
          theme: "space lobster",
          emoji: "🦞",
          avatar: "avatars/opencog.png",
        },
      },
    ],
  },
}
```
