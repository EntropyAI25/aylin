/* Launch gate (custom domain only; the demo/preview URLs are never gated): before LAUNCH every page shows the coming-soon page; after it, the full site.
   6:00 PM IST on 5 Nov 2026. Open any page with ?preview=1 to bypass (kept for the tab session). */
(function () {
  var LAUNCH = Date.parse('2026-11-05T18:00:00+05:30');
  window.AYLIN_LAUNCH = LAUNCH;
  if (!/(^|\.)theaylinlabel\.in$/i.test(location.hostname)) return;
  var onSoon = /coming-soon/.test(location.pathname);
  var live = Date.now() >= LAUNCH;
  var preview = false;
  try {
    if (/[?&]preview=1\b/.test(location.search)) sessionStorage.setItem('aylin-preview', '1');
    preview = sessionStorage.getItem('aylin-preview') === '1';
  } catch (e) {}
  if (!onSoon && !live && !preview) { location.replace('/coming-soon'); return; }
  if (onSoon && live) { location.replace('/'); }
})();
