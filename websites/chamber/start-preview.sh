#!/usr/bin/env bash
# ============================================================
#  WVWC Chamber site — one-click preview launcher (Mac/Linux)
#  Run:  bash start-preview.sh
# ============================================================
set -e
cd "$(dirname "$0")"

echo
echo " ============================================================"
echo "  West Valley Chamber — Local Preview"
echo " ============================================================"
echo
echo "  Starting server at http://localhost:5500/"
echo "  Browser will open automatically."
echo "  Press Ctrl+C to stop."
echo

# Open browser in background after server starts
( sleep 1; (open http://localhost:5500/ 2>/dev/null) || (xdg-open http://localhost:5500/ 2>/dev/null) || true ) &

if command -v python3 >/dev/null 2>&1; then
  python3 -m http.server 5500
elif command -v python >/dev/null 2>&1; then
  python -m http.server 5500
elif command -v npx >/dev/null 2>&1; then
  npx --yes serve -l 5500 .
else
  echo "  Could not find Python or Node.js. Install one and retry."
  exit 1
fi
