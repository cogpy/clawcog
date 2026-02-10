#!/usr/bin/env bash
set -euo pipefail

cd /repo

export OPENCOG_STATE_DIR="/tmp/opencog-test"
export OPENCOG_CONFIG_PATH="${OPENCOG_STATE_DIR}/opencog.json"

echo "==> Build"
pnpm build

echo "==> Seed state"
mkdir -p "${OPENCOG_STATE_DIR}/credentials"
mkdir -p "${OPENCOG_STATE_DIR}/agents/main/sessions"
echo '{}' >"${OPENCOG_CONFIG_PATH}"
echo 'creds' >"${OPENCOG_STATE_DIR}/credentials/marker.txt"
echo 'session' >"${OPENCOG_STATE_DIR}/agents/main/sessions/sessions.json"

echo "==> Reset (config+creds+sessions)"
pnpm opencog reset --scope config+creds+sessions --yes --non-interactive

test ! -f "${OPENCOG_CONFIG_PATH}"
test ! -d "${OPENCOG_STATE_DIR}/credentials"
test ! -d "${OPENCOG_STATE_DIR}/agents/main/sessions"

echo "==> Recreate minimal config"
mkdir -p "${OPENCOG_STATE_DIR}/credentials"
echo '{}' >"${OPENCOG_CONFIG_PATH}"

echo "==> Uninstall (state only)"
pnpm opencog uninstall --state --yes --non-interactive

test ! -d "${OPENCOG_STATE_DIR}"

echo "OK"
