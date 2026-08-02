// assets/include.js - small client-side include loader
document.addEventListener('DOMContentLoaded', () => {
  const includes = Array.from(document.querySelectorAll('[data-include]'));
  if (includes.length === 0) return;

  // Helper to fetch and inject a single include element
  async function fetchAndInject(el) {
    const url = el.getAttribute('data-include');
    if (!url) return;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Failed to fetch ${url}`);
      const html = await res.text();

      // If placeholder is in <head>, inject into document.head
      const isHeadInclude = el.parentElement && el.parentElement.tagName === 'HEAD';
      // If this is the header partial, remove any existing legacy nav before inserting
      const lowerUrl = (url || '').toLowerCase();
      if (!isHeadInclude && lowerUrl.includes('header')) {
        try {
          document.querySelectorAll('nav#navbar').forEach(n => n.remove());
          const legacyMobile = document.getElementById('mobile-menu');
          if (legacyMobile) legacyMobile.remove();
        } catch (e) { /* ignore */ }
      }

      if (isHeadInclude) {
        document.head.insertAdjacentHTML('beforeend', html);
        el.remove();
      } else {
        el.innerHTML = html;
      }

      // allow icons to be created if lucide is loaded on the page
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
      }

      // Remove legacy nav/footer only when injecting the header or footer partial.
      // This avoids race conditions where parallel fetches could remove the
      // newly-injected header/footer.
      try {
        const lowerUrl = (url || '').toLowerCase();
        if (!isHeadInclude && lowerUrl.includes('header')) {
          document.querySelectorAll('nav#navbar').forEach(n => { if (!el.contains(n)) n.remove(); });
        }
        if (!isHeadInclude && lowerUrl.includes('footer')) {
          document.querySelectorAll('footer').forEach(f => { if (!el.contains(f)) f.remove(); });
        }
      } catch (e) {
        console.warn('Failed to remove legacy nav/footer', e);
      }
    } catch (err) {
      console.error('Include failed:', url, err);
    }
  }

  // Preferentially inject header first to avoid duplicate nav elements and
  // to ensure any legacy nav is removed before other scripts run.
  const headerInclude = includes.find(i => (i.getAttribute('data-include') || '').toLowerCase().includes('header'));
  const footerInclude = includes.find(i => (i.getAttribute('data-include') || '').toLowerCase().includes('footer'));

  const remaining = includes.filter(i => i !== headerInclude && i !== footerInclude);

  (async () => {
    try {
      if (headerInclude) await fetchAndInject(headerInclude);
      // Inject other includes in parallel
      await Promise.all(remaining.map(i => fetchAndInject(i)));
      // Inject footer last if present
      if (footerInclude) await fetchAndInject(footerInclude);
    } finally {
      // Load navbar accessibility/behavior script once after includes are injected
      try {
        if (!document.querySelector('script[src="assets/navbar.js"]')) {
          const s = document.createElement('script');
          s.src = 'assets/navbar.js';
          s.defer = true;
          document.body.appendChild(s);
        }
      } catch (e) { console.warn('Failed to load navbar.js', e); }
    }
  })();
});
