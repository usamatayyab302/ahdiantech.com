
/*
  AhdianTech 24/7 — main.js
  - Handles: live clock, video fallback, random motion alerts
  - Mobile navigation: toggles CSS classes (no inline styles)
  - Active nav state on scroll
  - Back-to-top button
  - Contact form: EmailJS (optional)
*/

(function () {
  'use strict';

  // ===== Helpers =====
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  // ===== Live Clock =====
  function updateClock() {
    var now = new Date();
    var t = now.toLocaleTimeString('en-US', { hour12: false });
    var d = String(now.getMonth() + 1).padStart(2, '0') + '/' + String(now.getDate()).padStart(2, '0') + '/' + now.getFullYear();

    var clk = $('#clock');
    var dt = $('#cam-date');
    if (clk) clk.textContent = t;
    if (dt) dt.textContent = d;
  }
  updateClock();
  window.setInterval(updateClock, 1000);

  // ===== Video fallback =====
  $all('.cam-video').forEach(function (vid) {
    vid.addEventListener('error', function () {
      vid.style.display = 'none';
      if (vid.parentElement) {
        vid.parentElement.style.background = 'linear-gradient(135deg,#040e18,#081520)';
      }
    });
    // Autoplay can be blocked on some browsers; ignore errors.
    try { vid.play(); } catch (e) {}
  });

  // ===== Motion alerts =====
  function triggerAlert(camEl) {
    if (!camEl) return;
    var alertEl = $('.cam-alert', camEl);
    if (!alertEl) return;
    alertEl.classList.add('active');
    window.setTimeout(function () { alertEl.classList.remove('active'); }, 1500);
  }

  function scheduleAlerts() {
    var cams = $all('.cam-feed');
    if (!cams.length) return;
    triggerAlert(cams[Math.floor(Math.random() * cams.length)]);
    window.setTimeout(scheduleAlerts, 8000 + Math.random() * 10000);
  }
  window.setTimeout(scheduleAlerts, 4000);

  // ===== Mobile nav =====
  var body = document.body;
  var nav = $('#main-nav');
  var overlay = $('[data-nav-overlay]');
  var toggleBtn = $('[data-nav-toggle]');
  var closeBtn = $('[data-nav-close]');

  function setNavOpen(isOpen) {
    body.classList.toggle('nav-open', isOpen);

    if (toggleBtn) {
      toggleBtn.classList.toggle('is-open', isOpen);
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    }

    if (overlay) overlay.hidden = !isOpen;

    // Prevent background scroll when the drawer is open.
    document.documentElement.classList.toggle('no-scroll', isOpen);
  }

  function openNav() { setNavOpen(true); }
  function closeNav() { setNavOpen(false); }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', function () {
      var isOpen = body.classList.contains('nav-open');
      setNavOpen(!isOpen);
    });
  }

  if (overlay) overlay.addEventListener('click', closeNav);
  if (closeBtn) closeBtn.addEventListener('click', closeNav);

  // Close menu on any nav link click (mobile)
  $all('#main-nav a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', closeNav);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeNav();
  });

  // Swipe gestures (mobile)
  var swipeStartX = 0;
  var swipeStartY = 0;
  document.addEventListener('touchstart', function (e) {
    swipeStartX = e.touches[0].clientX;
    swipeStartY = e.touches[0].clientY;
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    var dx = e.changedTouches[0].clientX - swipeStartX;
    var dy = Math.abs(e.changedTouches[0].clientY - swipeStartY);
    if (dy > 60) return;

    var isOpen = body.classList.contains('nav-open');

    // swipe right from edge
    if (dx > 60 && swipeStartX < 30) openNav();

    // swipe left to close
    if (dx < -60 && isOpen) closeNav();
  }, { passive: true });

  // ===== Active nav on scroll =====
  var navLinks = $all('#main-nav a[href^="#"]');

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;

        navLinks.forEach(function (a) { a.classList.remove('active'); });
        var active = $('#main-nav a[href="#' + entry.target.id + '"]');
        if (active) active.classList.add('active');
      });
    }, { rootMargin: '-40% 0px -55% 0px' });

    $all('section[id]').forEach(function (s) { observer.observe(s); });
  }

  // ===== Header style + back-to-top =====
  var header = $('#top-header');
  var backToTop = $('#backToTop');

  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;

    if (header) header.classList.toggle('is-scrolled', y > 50);

    if (backToTop) {
      backToTop.classList.toggle('visible', y > 400);
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ===== EmailJS (optional) =====
  // Your original file had keys embedded in HTML (see bottom script). fileciteturn2file0L563-L615
  // Better: keep them here, or set them from your server/env.

  var EMAILJS_PUBLIC_KEY  = 'PJZfqz0BjGWQyafXo';
  var EMAILJS_SERVICE_ID  = 'service_j9kxnfh';
  var EMAILJS_TEMPLATE_ID = 'template_7w36b9o';

  try { if (window.emailjs) window.emailjs.init(EMAILJS_PUBLIC_KEY); } catch (e) {}

  function showMsg(text, ok) {
    var el = $('#formMsg');
    if (!el) return;

    el.hidden = false;
    el.textContent = text;
    el.classList.toggle('is-ok', !!ok);
    el.classList.toggle('is-bad', !ok);

    window.setTimeout(function () { el.hidden = true; }, 7000);
  }

  function clearForm() {
    ['firstName', 'lastName', 'userEmail', 'userPhone', 'userMessage'].forEach(function (id) {
      var el = $('#' + id);
      if (el) el.value = '';
    });

    var ind = $('#userIndustry');
    var cams = $('#userCameras');
    if (ind) ind.selectedIndex = 0;
    if (cams) cams.selectedIndex = 0;
  }

  async function submitContactForm() {
    var btn = $('#submitBtn');

    var firstName = ($('#firstName')?.value || '').trim();
    var lastName = ($('#lastName')?.value || '').trim();
    var email = ($('#userEmail')?.value || '').trim();
    var phone = ($('#userPhone')?.value || '').trim();
    var industry = ($('#userIndustry')?.value || '').trim();
    var cameras = ($('#userCameras')?.value || '').trim();
    var message = ($('#userMessage')?.value || '').trim();

    if (!firstName || !email) {
      showMsg('⚠️ Please fill in First Name and Email.', false);
      return;
    }

    if (!window.emailjs) {
      showMsg('⚠️ EmailJS failed to load. Please try again later.', false);
      return;
    }

    btn && (btn.disabled = true);
    btn && (btn.textContent = '⏳ Sending…');

    try {
      await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
        from_name: firstName + ' ' + lastName,
        from_email: email,
        phone: phone || 'Not provided',
        industry: industry || 'Not specified',
        cameras: cameras || 'Not specified',
        message: message || '—',
        reply_to: email,
      });

      showMsg('✅ Message sent! We\'ll contact you within 24 hours.', true);
      clearForm();
    } catch (err) {
      showMsg('❌ Failed to send. Please email us directly.', false);
    }

    btn && (btn.textContent = 'Send Message & Get Free Quote');
    btn && (btn.disabled = false);
  }

  // Use form submit instead of onclick (prevents double submits + supports Enter key)
  var form = $('#contactForm');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitContactForm();
    });
  }
})();