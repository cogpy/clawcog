---
summary: "CLI reference for `opencog browser` (profiles, tabs, actions, extension relay)"
read_when:
  - You use `opencog browser` and want examples for common tasks
  - You want to control a browser running on another machine via a node host
  - You want to use the Chrome extension relay (attach/detach via toolbar button)
title: "browser"
---

# `opencog browser`

Manage OpenCog’s browser control server and run browser actions (tabs, snapshots, screenshots, navigation, clicks, typing).

Related:

- Browser tool + API: [Browser tool](/tools/browser)
- Chrome extension relay: [Chrome extension](/tools/chrome-extension)

## Common flags

- `--url <gatewayWsUrl>`: Gateway WebSocket URL (defaults to config).
- `--token <token>`: Gateway token (if required).
- `--timeout <ms>`: request timeout (ms).
- `--browser-profile <name>`: choose a browser profile (default from config).
- `--json`: machine-readable output (where supported).

## Quick start (local)

```bash
opencog browser --browser-profile chrome tabs
opencog browser --browser-profile opencog start
opencog browser --browser-profile opencog open https://example.com
opencog browser --browser-profile opencog snapshot
```

## Profiles

Profiles are named browser routing configs. In practice:

- `opencog`: launches/attaches to a dedicated OpenCog-managed Chrome instance (isolated user data dir).
- `chrome`: controls your existing Chrome tab(s) via the Chrome extension relay.

```bash
opencog browser profiles
opencog browser create-profile --name work --color "#FF5A36"
opencog browser delete-profile --name work
```

Use a specific profile:

```bash
opencog browser --browser-profile work tabs
```

## Tabs

```bash
opencog browser tabs
opencog browser open https://docs.opencog.ai
opencog browser focus <targetId>
opencog browser close <targetId>
```

## Snapshot / screenshot / actions

Snapshot:

```bash
opencog browser snapshot
```

Screenshot:

```bash
opencog browser screenshot
```

Navigate/click/type (ref-based UI automation):

```bash
opencog browser navigate https://example.com
opencog browser click <ref>
opencog browser type <ref> "hello"
```

## Chrome extension relay (attach via toolbar button)

This mode lets the agent control an existing Chrome tab that you attach manually (it does not auto-attach).

Install the unpacked extension to a stable path:

```bash
opencog browser extension install
opencog browser extension path
```

Then Chrome → `chrome://extensions` → enable “Developer mode” → “Load unpacked” → select the printed folder.

Full guide: [Chrome extension](/tools/chrome-extension)

## Remote browser control (node host proxy)

If the Gateway runs on a different machine than the browser, run a **node host** on the machine that has Chrome/Brave/Edge/Chromium. The Gateway will proxy browser actions to that node (no separate browser control server required).

Use `gateway.nodes.browser.mode` to control auto-routing and `gateway.nodes.browser.node` to pin a specific node if multiple are connected.

Security + remote setup: [Browser tool](/tools/browser), [Remote access](/gateway/remote), [Tailscale](/gateway/tailscale), [Security](/gateway/security)
