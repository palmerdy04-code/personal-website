#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT_DIR"

REFRESH_FLAG="--refresh"
if [[ "${1:-}" == "--use-cache" ]]; then
  REFRESH_FLAG=""
fi

echo "Exporting Strava dashboard snapshot..."
if [[ -n "$REFRESH_FLAG" ]]; then
  python3 server.py export-strava-data "$REFRESH_FLAG"
else
  python3 server.py export-strava-data
fi

echo "Staging updated snapshot..."
git add data/strava-dashboard.json

if git diff --cached --quiet -- data/strava-dashboard.json; then
  echo "No Strava data changes to commit."
  exit 0
fi

COMMIT_MESSAGE="Refresh Strava dashboard data ($(date '+%Y-%m-%d %H:%M:%S'))"

echo "Committing updated snapshot..."
git commit -m "$COMMIT_MESSAGE"

echo "Syncing with remote main..."
git pull --rebase --autostash origin main

echo "Pushing to GitHub..."
git push origin main

echo "Done. The public site will update after GitHub Pages redeploys."
