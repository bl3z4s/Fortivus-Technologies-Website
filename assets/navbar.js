// assets/navbar.js - centralized mobile menu behavior and accessibility
(function(){
  function toggleMenu(open) {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      menu.classList.remove('hidden');
      document.documentElement.style.overflow = 'hidden';
      menu.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '0'));
    } else {
      menu.classList.add('hidden');
      document.documentElement.style.overflow = '';
      menu.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));
    }
  }

  function onKeyDown(e) {
    const menu = document.getElementById('mobile-menu');
    if (!menu) return;
    const isOpen = !menu.classList.contains('hidden');
    if (e.key === 'Escape' && isOpen) {
      toggleMenu(false);
      document.getElementById('mobile-menu-btn').focus();
    }
  }

  function init() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    if (!btn || !menu) return;

    // initial aria states
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'mobile-menu');
    menu.setAttribute('role', 'menu');
    menu.querySelectorAll('a, button').forEach(el => el.setAttribute('tabindex', '-1'));

    btn.addEventListener('click', (e) => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      toggleMenu(open);
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      const menuEl = document.getElementById('mobile-menu');
      const btnEl = document.getElementById('mobile-menu-btn');
      if (!menuEl || !btnEl) return;
      if (!menuEl.classList.contains('hidden')) {
        if (!menuEl.contains(e.target) && !btnEl.contains(e.target)) {
          toggleMenu(false);
        }
      }
    });

    // keyboard
    document.addEventListener('keydown', onKeyDown);
  }

  // wait for DOM and lucide include injections
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
