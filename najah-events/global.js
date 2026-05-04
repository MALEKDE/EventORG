/* ═══════════════════════════════════════
   NAJAH EVENTS — GLOBAL JS
   Includes: theme toggle, nav, counters,
   scroll-reveal, toast, auth helpers
═══════════════════════════════════════ */

/* ── Theme System ─────────────────────── */
const THEME_KEY = 'najah_theme';

function getTheme() {
  return localStorage.getItem(THEME_KEY) || 'dark';
}

function applyTheme(theme, animate) {
  document.documentElement.setAttribute('data-theme', theme);
  // Update all toggle thumbs icons
  document.querySelectorAll('.theme-toggle-icon').forEach(el => {
    el.textContent = theme === 'dark' ? '🌙' : '☀️';
  });
  if (!animate) return;
  // Brief flash overlay for smooth transition
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:${theme==='light'?'#f5f0e8':'#080c14'};opacity:0;pointer-events:none;z-index:99999;transition:opacity 0.25s ease;`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => {
    overlay.style.opacity = '0.35';
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 260);
    }, 180);
  });
}

function toggleTheme() {
  const next = getTheme() === 'dark' ? 'light' : 'dark';
  localStorage.setItem(THEME_KEY, next);
  applyTheme(next, true);
}

// Apply saved theme immediately (before render)
(function() { applyTheme(getTheme(), false); })();

/* ── Build Theme Toggle Button HTML ──── */
function buildThemeToggle() {
  return `
    <li class="nav-item d-flex align-items-center ms-lg-2">
      <button class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle light/dark mode" aria-label="Toggle theme">
        <span class="theme-toggle-thumb">
          <span class="theme-toggle-icon">${getTheme()==='dark'?'🌙':'☀️'}</span>
        </span>
      </button>
    </li>`;
}

/* ── Navbar scroll behavior ─────────── */
(function initNavbar() {
  const nav = document.getElementById('mainNav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Close mobile nav on outside click ── */
document.addEventListener('click', e => {
  const nc = document.getElementById('navMenu');
  if (nc && nc.classList.contains('show') && !e.target.closest('.navbar')) {
    const tog = document.querySelector('.navbar-toggler');
    if (tog) tog.click();
  }
});

/* ── Animated counters ───────────────── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const suffix = el.dataset.suffix || '';
  const duration = 1800, step = 16;
  const increment = target / (duration / step);
  let current = 0;
  const update = () => {
    current = Math.min(current + increment, target);
    el.textContent = Math.floor(current).toLocaleString() + suffix;
    if (current < target) setTimeout(update, step);
  };
  update();
}

function initCounters() {
  const els = document.querySelectorAll('[data-counter]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounter(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  els.forEach(c => obs.observe(c));
}

/* ── Scroll reveal ───────────────────── */
function initScrollReveal() {
  const els = document.querySelectorAll('[data-reveal]');
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.animationDelay = (e.target.dataset.reveal || 0) + 'ms';
        e.target.classList.add('animate-fade-up');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(el => { el.style.opacity = '0'; obs.observe(el); });
}

/* ── Toast Notifications ─────────────── */
let _toastContainer;
function getToastContainer() {
  if (!_toastContainer) {
    _toastContainer = document.querySelector('.toast-container-custom');
    if (!_toastContainer) {
      _toastContainer = document.createElement('div');
      _toastContainer.className = 'toast-container-custom';
      document.body.appendChild(_toastContainer);
    }
  }
  return _toastContainer;
}
function showToast(message, type = 'success') {
  const icons = {
    success: '<i class="bi bi-check-circle-fill toast-icon" style="color:#22c55e"></i>',
    error:   '<i class="bi bi-x-circle-fill toast-icon" style="color:#ef4444"></i>',
    info:    '<i class="bi bi-info-circle-fill toast-icon" style="color:var(--gold)"></i>',
    warning: '<i class="bi bi-exclamation-triangle-fill toast-icon" style="color:#f59e0b"></i>',
  };
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.innerHTML = `${icons[type] || icons.info}<span>${message}</span>`;
  getToastContainer().appendChild(el);
  setTimeout(() => {
    el.style.transition = '0.3s ease';
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

/* ── Auth helpers ────────────────────── */
function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('najah_user') || 'null'); }
  catch { return null; }
}
function setCurrentUser(user) { localStorage.setItem('najah_user', JSON.stringify(user)); }
function logout() { localStorage.removeItem('najah_user'); window.location.href = 'index.html'; }

/* ── Render nav user slot ────────────── */
function renderNavUser() {
  const user = getCurrentUser();
  const slot = document.getElementById('navUserSlot');
  if (!slot) return;

  const toggleBtn = buildThemeToggle();

  if (user) {
    slot.innerHTML = toggleBtn + `
      <li class="nav-item dropdown ms-lg-1">
        <a class="btn-ghost d-flex align-items-center gap-2" href="#" data-bs-toggle="dropdown" style="padding:0.4rem 0.85rem;">
          <span style="width:28px;height:28px;border-radius:50%;background:var(--gold-subtle);border:1px solid var(--border);display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;color:var(--gold);font-weight:700;flex-shrink:0;">${(user.name||'U')[0].toUpperCase()}</span>
          <span class="d-none d-lg-inline" style="font-size:0.85rem;color:var(--text-secondary);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${user.name||'User'}</span>
          <i class="bi bi-chevron-down" style="font-size:0.65rem;color:var(--text-muted);"></i>
        </a>
        <ul class="dropdown-menu dropdown-menu-end" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);min-width:185px;padding:0.5rem;box-shadow:var(--shadow-deep);">
          <li><a class="dropdown-item" href="dashboard.html" style="color:var(--text-secondary);font-size:0.85rem;padding:0.6rem 1rem;border-radius:var(--radius-sm);display:flex;align-items:center;gap:0.6rem;"><i class="bi bi-grid"></i> Dashboard</a></li>
          ${user.role==='admin'?'<li><a class="dropdown-item" href="admin.html" style="color:var(--text-secondary);font-size:0.85rem;padding:0.6rem 1rem;border-radius:var(--radius-sm);display:flex;align-items:center;gap:0.6rem;"><i class="bi bi-shield-check"></i> Admin Panel</a></li>':''}
          <li><hr class="dropdown-divider" style="border-color:var(--border-subtle);margin:0.35rem 0;"></li>
          <li><a class="dropdown-item" href="#" onclick="logout()" style="color:#ef4444;font-size:0.85rem;padding:0.6rem 1rem;border-radius:var(--radius-sm);display:flex;align-items:center;gap:0.6rem;"><i class="bi bi-box-arrow-right"></i> Logout</a></li>
        </ul>
      </li>`;
  } else {
    slot.innerHTML = toggleBtn + `
      <li class="nav-item ms-lg-1">
        <a class="btn-outline-gold" href="login.html" style="padding:0.42rem 1.1rem;font-size:0.82rem;">Login</a>
      </li>
      <li class="nav-item ms-lg-1">
        <a class="btn-gold" href="register.html" style="padding:0.42rem 1.1rem;font-size:0.82rem;">Sign Up</a>
      </li>`;
  }
}

/* ── Init ──────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  applyTheme(getTheme(), false); // re-apply after DOM ready for toggles
  initCounters();
  initScrollReveal();
  renderNavUser();
});
