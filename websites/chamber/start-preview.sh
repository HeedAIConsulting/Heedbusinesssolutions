#!/usr/bin/env bash
# ============================================================
#  WVWC Chamber site — one-click preview (Mac/Linux)
#  Usage:  bash start-preview.sh
# ============================================================
set -e
cd "$(dirname "$0")"

echo
echo " ════════════════════════════════════════════════════════════"
echo "  West Valley ~ Warner Center Chamber — Local Preview"
echo " ════════════════════════════════════════════════════════════"
echo

# Check Node
if ! command -v node >/dev/null 2>&1; then
  echo "  [!] Node.js required. Install LTS from https://nodejs.org/"
  exit 1
fi
echo "  [+] Node.js $(node --version) detected"

# Install deps if missing
if [ ! -d "node_modules/express" ]; then
  echo "  [+] Installing dependencies (one-time, ~30 sec)..."
  npm install --silent --no-audit --no-fund
  echo "  [+] Dependencies installed."
fi

# .env hint
if [ ! -f ".env" ]; then
  echo "  [i] No .env file — AI runs in demo mode."
  echo "      To go live: cp .env.example .env  (then add ANTHROPIC_API_KEY)"
fi

echo
echo "  [+] Opening browser to http://localhost:5500/"
echo "  [+] Starting server. Press Ctrl+C to stop."
echo

# Background-open the browser
( sleep 2; (open http://localhost:5500/ 2>/dev/null) || (xdg-open http://localhost:5500/ 2>/dev/null) || true ) &

node server.js
