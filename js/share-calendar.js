/* ============================================================
   Share + Add-to-Calendar utilities — real, no fluff.

   Calendar:
     • Generates an .ics file the user can save (universal — works in
       Outlook, Apple Calendar, any RFC-5545 client)
     • Provides Google Calendar quick-add deep link
     • Provides Outlook.com web compose deep link

   Share:
     • Native Web Share API where supported (mobile + Safari + Edge)
     • Fallback: explicit Twitter/Facebook/Email/Copy URL
     • LinkedIn share via the official sharing intent

   Wiring (HTML side):
     <button data-event-share='{"title":"…","date":"2026-06-12","time":"18:00","durationMinutes":120,"location":"…","description":"…","url":"…"}'>Share</button>
     <button data-add-to-calendar='{"title":…,"date":…,"time":…,…}'>Add to Calendar</button>
   The element-level handler lifts the JSON, generates the appropriate
   asset (ics, share menu) and triggers it.
   ============================================================ */

(function () {
  'use strict';

  // ── ICS generator ──────────────────────────────────────────────
  function pad(n) { return String(n).padStart(2, '0'); }

  function toICSDate(d) {
    // Returns YYYYMMDDTHHmmssZ in UTC
    return d.getUTCFullYear() +
           pad(d.getUTCMonth() + 1) +
           pad(d.getUTCDate()) + 'T' +
           pad(d.getUTCHours()) +
           pad(d.getUTCMinutes()) +
           pad(d.getUTCSeconds()) + 'Z';
  }

  function escapeICS(text) {
    return String(text || '')
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\r?\n/g, '\\n');
  }

  /**
   * Parse an event's date/time inputs into start + end Date objects.
   * Accepts:
   *   { date: "2026-06-12", time: "18:00" }            (local time, US/Pacific assumed)
   *   { startISO: "2026-06-12T18:00:00-07:00" }
   * durationMinutes defaults to 90.
   */
  function parseEventTime(e) {
    let start;
    if (e.startISO) {
      start = new Date(e.startISO);
    } else if (e.date) {
      // Treat as Pacific time. Date strings without tz are local; we
      // assume the chamber is operating in PT.
      const time = e.time || '18:00';
      start = new Date(e.date + 'T' + time + ':00');
    } else {
      throw new Error('Event needs date+time or startISO');
    }
    const dur = parseInt(e.durationMinutes || 90, 10);
    const end = new Date(start.getTime() + dur * 60 * 1000);
    return { start, end };
  }

  function buildICS(e) {
    const { start, end } = parseEventTime(e);
    const uid = (e.id || ('wvwccc-' + start.getTime() + '-' + Math.random().toString(36).slice(2, 8))) + '@woodlandhillscc.net';
    return [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//West Valley Warner Center Chamber of Commerce//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      'UID:' + uid,
      'DTSTAMP:' + toICSDate(new Date()),
      'DTSTART:' + toICSDate(start),
      'DTEND:' + toICSDate(end),
      'SUMMARY:' + escapeICS(e.title),
      'DESCRIPTION:' + escapeICS((e.description || '') + (e.url ? '\n\n' + e.url : '')),
      'LOCATION:' + escapeICS(e.location || ''),
      e.url ? 'URL:' + escapeICS(e.url) : '',
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n');
  }

  function downloadICS(e) {
    const ics = buildICS(e);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const filename = (e.title || 'event').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.ics';
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
  }

  function googleCalendarUrl(e) {
    const { start, end } = parseEventTime(e);
    const fmt = d => toICSDate(d).replace(/[-:]/g, '');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: e.title || '',
      dates: fmt(start) + '/' + fmt(end),
      details: (e.description || '') + (e.url ? '\n\n' + e.url : ''),
      location: e.location || ''
    });
    return 'https://calendar.google.com/calendar/render?' + params.toString();
  }

  function outlookWebUrl(e) {
    const { start, end } = parseEventTime(e);
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: e.title || '',
      startdt: start.toISOString(),
      enddt: end.toISOString(),
      body: (e.description || '') + (e.url ? '\n\n' + e.url : ''),
      location: e.location || ''
    });
    return 'https://outlook.live.com/calendar/0/deeplink/compose?' + params.toString();
  }

  // ── Share ──────────────────────────────────────────────────────
  function buildShareIntents(s) {
    const url = encodeURIComponent(s.url || window.location.href);
    const text = encodeURIComponent(s.text || s.title || '');
    return {
      twitter:  'https://twitter.com/intent/tweet?text=' + text + '&url=' + url,
      facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + url,
      linkedin: 'https://www.linkedin.com/sharing/share-offsite/?url=' + url,
      email:    'mailto:?subject=' + text + '&body=' + url
    };
  }

  async function share(s) {
    if (navigator.share) {
      try { await navigator.share({ title: s.title, text: s.text, url: s.url }); return; }
      catch (e) { if (e.name === 'AbortError') return; /* fall through to menu */ }
    }
    showShareMenu(s);
  }

  function showShareMenu(s) {
    const intents = buildShareIntents(s);
    const url = s.url || window.location.href;
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(11,37,69,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:14px;padding:24px;max-width:420px;width:100%;box-shadow:0 24px 56px rgba(11,37,69,0.18);">' +
        '<div style="font-family:Source Serif Pro,Georgia,serif;font-weight:600;font-size:1.15rem;color:#0B2545;margin-bottom:6px;">Share</div>' +
        '<div style="color:#6B7280;font-size:.9rem;margin-bottom:16px;word-break:break-all;">' + (s.title || url) + '</div>' +
        '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">' +
          shareBtn('Twitter / X', intents.twitter) +
          shareBtn('Facebook', intents.facebook) +
          shareBtn('LinkedIn', intents.linkedin) +
          shareBtn('Email',    intents.email)    +
        '</div>' +
        '<div style="display:flex;gap:8px;margin-top:12px;">' +
          '<input type="text" value="' + url.replace(/"/g, '&quot;') + '" readonly style="flex:1;padding:.55rem .8rem;border:1.5px solid #E5E0D2;border-radius:8px;font-size:.9rem;color:#2A3340;">' +
          '<button data-share-copy style="padding:.55rem .9rem;background:#0B2545;color:#fff;border-radius:8px;font-weight:500;cursor:pointer;">Copy</button>' +
        '</div>' +
        '<button data-share-close style="margin-top:14px;width:100%;padding:.6rem;background:transparent;border:1.5px solid #E5E0D2;border-radius:8px;color:#4D5662;cursor:pointer;">Close</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
    overlay.querySelector('[data-share-close]').addEventListener('click', () => overlay.remove());
    overlay.querySelector('[data-share-copy]').addEventListener('click', () => {
      navigator.clipboard.writeText(url).then(() => {
        const btn = overlay.querySelector('[data-share-copy]');
        const orig = btn.textContent; btn.textContent = 'Copied ✓';
        setTimeout(() => { btn.textContent = orig; }, 1400);
      });
    });
  }

  function shareBtn(label, href) {
    return '<a href="' + href + '" target="_blank" rel="noopener" style="display:flex;align-items:center;justify-content:center;gap:8px;padding:.7rem;background:#FAF7F0;border:1.5px solid #E5E0D2;border-radius:8px;color:#0B2545;font-weight:500;text-decoration:none;font-size:.9rem;">' + label + '</a>';
  }

  // ── Add-to-Calendar menu (lets the user pick ICS / Google / Outlook) ──
  function showCalendarMenu(e, anchorEl) {
    const intents = {
      ics:     () => downloadICS(e),
      google:  googleCalendarUrl(e),
      outlook: outlookWebUrl(e)
    };
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(11,37,69,0.55);z-index:9999;display:flex;align-items:center;justify-content:center;padding:20px;';
    overlay.innerHTML =
      '<div style="background:#fff;border-radius:14px;padding:24px;max-width:380px;width:100%;box-shadow:0 24px 56px rgba(11,37,69,0.18);">' +
        '<div style="font-family:Source Serif Pro,Georgia,serif;font-weight:600;font-size:1.15rem;color:#0B2545;margin-bottom:6px;">Add to calendar</div>' +
        '<div style="color:#6B7280;font-size:.9rem;margin-bottom:16px;">' + (e.title || 'Chamber event') + '</div>' +
        '<div style="display:flex;flex-direction:column;gap:8px;">' +
          '<button data-cal-ics style="padding:.7rem;background:#C9A227;color:#0B2545;border-radius:8px;font-weight:600;cursor:pointer;">📅 Download .ics (Apple / Outlook desktop / any)</button>' +
          '<a href="' + intents.google  + '" target="_blank" rel="noopener" style="padding:.7rem;background:#FAF7F0;border:1.5px solid #E5E0D2;border-radius:8px;color:#0B2545;font-weight:500;text-decoration:none;text-align:center;">Google Calendar</a>' +
          '<a href="' + intents.outlook + '" target="_blank" rel="noopener" style="padding:.7rem;background:#FAF7F0;border:1.5px solid #E5E0D2;border-radius:8px;color:#0B2545;font-weight:500;text-decoration:none;text-align:center;">Outlook.com</a>' +
        '</div>' +
        '<button data-cal-close style="margin-top:14px;width:100%;padding:.6rem;background:transparent;border:1.5px solid #E5E0D2;border-radius:8px;color:#4D5662;cursor:pointer;">Close</button>' +
      '</div>';
    document.body.appendChild(overlay);
    overlay.addEventListener('click', ev => { if (ev.target === overlay) overlay.remove(); });
    overlay.querySelector('[data-cal-close]').addEventListener('click', () => overlay.remove());
    overlay.querySelector('[data-cal-ics]').addEventListener('click', () => { intents.ics(); overlay.remove(); });
  }

  // ── Element-level wiring (data attributes) ─────────────────────
  function readJSON(el, attr) {
    try { return JSON.parse(el.getAttribute(attr) || '{}'); }
    catch (e) { console.warn('Bad JSON in', attr, e.message); return {}; }
  }

  function init() {
    document.querySelectorAll('[data-add-to-calendar]').forEach(el => {
      if (el.__wired) return; el.__wired = true;
      el.addEventListener('click', ev => {
        ev.preventDefault();
        const data = readJSON(el, 'data-add-to-calendar');
        if (!data || !data.title) return;
        showCalendarMenu(data, el);
      });
    });
    document.querySelectorAll('[data-share]').forEach(el => {
      if (el.__wired) return; el.__wired = true;
      el.addEventListener('click', ev => {
        ev.preventDefault();
        share(readJSON(el, 'data-share'));
      });
    });
    document.querySelectorAll('[data-event-share]').forEach(el => {
      if (el.__wired) return; el.__wired = true;
      el.addEventListener('click', ev => {
        ev.preventDefault();
        const e = readJSON(el, 'data-event-share');
        share({ title: e.title, text: (e.title || '') + ' — ' + (e.location || ''), url: e.url || window.location.href });
      });
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Public API for programmatic use
  window.WVCal = { downloadICS, googleCalendarUrl, outlookWebUrl, showCalendarMenu, share, showShareMenu, buildICS };
})();
