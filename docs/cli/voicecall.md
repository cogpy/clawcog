---
summary: "CLI reference for `opencog voicecall` (voice-call plugin command surface)"
read_when:
  - You use the voice-call plugin and want the CLI entry points
  - You want quick examples for `voicecall call|continue|status|tail|expose`
title: "voicecall"
---

# `opencog voicecall`

`voicecall` is a plugin-provided command. It only appears if the voice-call plugin is installed and enabled.

Primary doc:

- Voice-call plugin: [Voice Call](/plugins/voice-call)

## Common commands

```bash
opencog voicecall status --call-id <id>
opencog voicecall call --to "+15555550123" --message "Hello" --mode notify
opencog voicecall continue --call-id <id> --message "Any questions?"
opencog voicecall end --call-id <id>
```

## Exposing webhooks (Tailscale)

```bash
opencog voicecall expose --mode serve
opencog voicecall expose --mode funnel
opencog voicecall unexpose
```

Security note: only expose the webhook endpoint to networks you trust. Prefer Tailscale Serve over Funnel when possible.
