---
summary: "CLI reference for `opencog logs` (tail gateway logs via RPC)"
read_when:
  - You need to tail Gateway logs remotely (without SSH)
  - You want JSON log lines for tooling
title: "logs"
---

# `opencog logs`

Tail Gateway file logs over RPC (works in remote mode).

Related:

- Logging overview: [Logging](/logging)

## Examples

```bash
opencog logs
opencog logs --follow
opencog logs --json
opencog logs --limit 500
```
