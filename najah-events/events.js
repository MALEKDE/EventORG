/* ═══════════════════════════════════════
   NAJAH EVENTS — EVENTS PAGE JS
═══════════════════════════════════════ */

const EVENTS = [
  { id:1, title:'Career & Internship Expo 2026', category:'expo', date:'2026-04-12', venue:'Main Auditorium', seats:500, registered:380, img:'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80', desc:'Connect with top companies, explore internships, and build your professional network.' },
  { id:2, title:'TechTalk Summit', category:'conference', date:'2026-04-05', venue:'Engineering Hall', seats:350, registered:340, img:'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=600&q=80', desc:'Leading minds in technology share insights on AI, cybersecurity, and the future of software.' },
  { id:3, title:'Projects Innovation Fair', category:'workshop', date:'2026-05-01', venue:'Expo Hall', seats:300, registered:120, img:'https://images.unsplash.com/photo-1558008258-3256797b43f3?w=600&q=80', desc:'Showcase your academic projects and innovations to faculty, industry, and peers.' },
  { id:4, title:'Spring Cultural Festival', category:'festival', date:'2026-05-15', venue:'Outdoor Stage', seats:1200, registered:650, img:'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=600&q=80', desc:'Celebrate campus diversity with music, art, food, and cultural performances.' },
  { id:5, title:'Python & Data Science Workshop', category:'workshop', date:'2026-04-18', venue:'Computer Lab 2', seats:40, registered:36, img:'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&q=80', desc:'Hands-on workshop covering Python, pandas, and data visualization techniques.' },
  { id:6, title:'Startup Pitch Competition', category:'conference', date:'2026-04-25', venue:'Main Auditorium', seats:200, registered:88, img:'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=600&q=80', desc:'Present your startup idea to a panel of investors and industry experts.' },
  { id:7, title:'Volleyball Championship', category:'sports', date:'2026-05-08', venue:'Sports Complex', seats:400, registered:210, img:'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&q=80', desc:'Inter-faculty volleyball tournament. Root for your faculty team!' },
  { id:8, title:'Architecture Design Expo', category:'expo', date:'2026-05-20', venue:'Engineering Hall', seats:250, registered:95, img:'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=600&q=80', desc:'Graduating architecture students present their semester projects and thesis work.' },
  { id:9, title:'Photography & Media Workshop', category:'workshop', date:'2026-04-22', venue:'Workshop Room A', seats:30, registered:28, img:'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80', desc:'Learn professional photography composition, lighting, and post-processing techniques.' },
];

const catColors = {
  expo: 'background:rgba(201,168,76,0.15);color:var(--gold);border-color:rgba(201,168,76,0.3)',
  conference: 'background:rgba(139,92,246,0.15);color:#a78bfa;border-color:rgba(139,92,246,0.3)',
  workshop: 'background:rgba(251,191,36,0.15);color:#fbbf24;border-color:rgba(251,191,36,0.3)',
  festival: 'background:rgba(244,114,182,0.15);color:#f472b6;border-color:rgba(244,114,182,0.3)',
  sports: 'background:rgba(52,211,153,0.15);color:#34d399;border-color:rgba(52,211,153,0.3)',
};

function spotsLeft(e) { return e.seats - e.registered; }

function renderCard(e) {
  const spots = spotsLeft(e);
  const full = spots <= 0;
  const pct = Math.min(100, Math.round(e.registered / e.seats * 100));
  const dateStr = new Date(e.date).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'});
  const catStyle = catColors[e.category] || '';
  const catLabel = e.category.charAt(0).toUpperCase() + e.category.slice(1);

  return `
    <div class="col-sm-6 col-lg-4">
      <div class="event-card">
        <div class="ec-img">
          <img src="${e.img}" alt="${e.title}" loading="lazy">
          <div class="ec-badges">
            <span class="badge-category" style="${catStyle}">${catLabel}</span>
            ${full ? '<span class="badge-busy">Full</span>' : spots <= 20 ? '<span class="badge-busy"><i class="bi bi-fire me-1"></i>Almost Full</span>' : '<span class="badge-available"><i class="bi bi-circle-fill" style="font-size:0.4rem"></i> Open</span>'}
          </div>
        </div>
        <div class="ec-body">
          <div class="ec-title">${e.title}</div>
          <div class="ec-desc">${e.desc}</div>
          <div class="ec-meta">
            <div class="ec-meta-row"><i class="bi bi-calendar3"></i><span>${dateStr}</span></div>
            <div class="ec-meta-row"><i class="bi bi-geo-alt"></i><span>${e.venue}</span></div>
            <div class="ec-meta-row"><i class="bi bi-people"></i><span>${e.registered} / ${e.seats} registered</span></div>
          </div>
          <div style="height:4px;background:var(--bg-surface);border-radius:2px;margin-bottom:1rem;overflow:hidden;">
            <div style="height:100%;width:${pct}%;background:${full ? '#f87171' : pct>75 ? '#fbbf24' : 'var(--gold)'};border-radius:2px;transition:width 0.8s ease;"></div>
          </div>
          <div class="ec-footer">
            <div class="ec-seats">
              ${full ? '<span style="color:#f87171">Registration closed</span>' : `<span>${spots}</span> spots left`}
            </div>
            <button class="btn-gold ms-auto" data-id="${e.id}" onclick="openRegister(${e.id})" ${full ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}>
              <i class="bi bi-person-plus me-1"></i> Register
            </button>
          </div>
        </div>
      </div>
    </div>`;
}

// ── State ─────────────────────────────────
const PER_PAGE = 6;
let shown = 0;
let filtered = [];

function getFiltered() {
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const cat = document.getElementById('categorySelect').value;
  return EVENTS.filter(e => {
    const hay = (e.title + ' ' + e.venue + ' ' + e.category).toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (cat !== 'all' && e.category !== cat) return false;
    return true;
  });
}

function renderGrid(reset = false) {
  const grid = document.getElementById('eventsGrid');
  const empty = document.getElementById('emptyState');
  const loadBtn = document.getElementById('loadMoreBtn');
  const count = document.getElementById('resultCount');

  if (reset) { shown = 0; grid.innerHTML = ''; filtered = getFiltered(); }

  const page = filtered.slice(shown, shown + PER_PAGE);
  grid.insertAdjacentHTML('beforeend', page.map(renderCard).join(''));
  shown += page.length;

  empty.style.display = filtered.length ? 'none' : 'block';
  loadBtn.style.display = shown < filtered.length ? 'inline-flex' : 'none';
  count.textContent = `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`;
}

// ── Register Modal ────────────────────────
let selectedEvent = null;
const regModal = new bootstrap.Modal(document.getElementById('registerModal'));

function openRegister(id) {
  const user = getCurrentUser();
  if (!user) { showToast('Please login to register for events', 'info'); window.location.href = 'login.html'; return; }
  selectedEvent = EVENTS.find(e => e.id === id);
  if (!selectedEvent) return;
  document.getElementById('modalEventTitle').textContent = 'Register: ' + selectedEvent.title;
  const dateStr = new Date(selectedEvent.date).toLocaleDateString('en-GB', {day:'numeric',month:'long',year:'numeric'});
  document.getElementById('modalEventInfo').innerHTML = `
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
      <span style="font-size:0.8rem;color:var(--text-muted)"><i class="bi bi-calendar3 me-1" style="color:var(--gold)"></i>${dateStr}</span>
      <span style="font-size:0.8rem;color:var(--text-muted)"><i class="bi bi-geo-alt me-1" style="color:var(--gold)"></i>${selectedEvent.venue}</span>
      <span style="font-size:0.8rem;color:var(--text-muted)"><i class="bi bi-people me-1" style="color:var(--gold)"></i>${spotsLeft(selectedEvent)} spots left</span>
    </div>`;
  if (user) { document.getElementById('regName').value = user.name || ''; document.getElementById('regId').value = user.email || ''; }
  regModal.show();
}

document.getElementById('submitRegBtn').addEventListener('click', () => {
  const name = document.getElementById('regName').value.trim();
  const id = document.getElementById('regId').value.trim();
  if (!name || !id) { showToast('Please fill all required fields', 'error'); return; }
  regModal.hide();
  showToast(`Registered for "${selectedEvent.title}" successfully!`, 'success');
  // Save to localStorage
  const regs = JSON.parse(localStorage.getItem('najah_registrations') || '[]');
  regs.push({ eventId: selectedEvent.id, eventTitle: selectedEvent.title, name, studentId: id, date: new Date().toISOString(), status: 'confirmed' });
  localStorage.setItem('najah_registrations', JSON.stringify(regs));
});

// ── Category Pills ────────────────────────
document.querySelectorAll('.cat-pill').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('categorySelect').value = btn.dataset.cat;
    renderGrid(true);
  });
});

// ── Events ────────────────────────────────
['searchInput','categorySelect','dateSelect','sortSelect'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => renderGrid(true));
});

document.getElementById('clearBtn').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  document.getElementById('categorySelect').value = 'all';
  document.getElementById('dateSelect').value = 'all';
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  document.querySelector('.cat-pill[data-cat="all"]').classList.add('active');
  renderGrid(true);
});

document.getElementById('loadMoreBtn').addEventListener('click', () => renderGrid(false));

// Init
renderGrid(true);
