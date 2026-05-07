/* ============================================================
   Picks the right API base for the current host.
   - localhost            → /api  (Express on same origin)
   - *.pages.dev          → Render service URL
   - production domain    → Render service URL
   - anything else        → /api  (assume same-origin proxy)

   Override with: window.CHAMBER_API_BASE_OVERRIDE = 'https://...'
   set BEFORE this script loads (e.g. in a <meta> or <script>).
   ============================================================ */
(function () {
  // Render service URL — update once the service is deployed.
  // Paste the resulting onrender.com URL here.
  var RENDER_API_BASE = 'https://wvwccc-chamber-api.onrender.com/api';

  if (window.CHAMBER_API_BASE_OVERRIDE) {
    window.CHAMBER_API_BASE = window.CHAMBER_API_BASE_OVERRIDE;
    return;
  }

  var host = window.location.hostname;
  var isLocal = host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local');

  if (isLocal) {
    // Same-origin Express server on the same port.
    window.CHAMBER_API_BASE = '/api';
  } else {
    // Cloudflare Pages or production — call Render.
    window.CHAMBER_API_BASE = RENDER_API_BASE;
  }
})();
