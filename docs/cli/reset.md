---
summary: "CLI reference for `opencog reset` (reset local state/config)"
read_when:
  - You want to wipe local state while keeping the CLI installed
  - You want a dry-run of what would be removed
title: "reset"
---

# `opencog reset`

Reset local config/state (keeps the CLI installed).

```bash
opencog reset
opencog reset --dry-run
opencog reset --scope config+creds+sessions --yes --non-interactive
```
