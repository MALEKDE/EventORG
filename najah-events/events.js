/* ═══════════════════════════════════════
   NAJAH EVENTS — EVENTS PAGE JS
   Backend connected version
═══════════════════════════════════════ */

let EVENTS = [];

const catColors = {
  expo: 'background:rgba(201,168,76,0.15);color:var(--gold);border-color:rgba(201,168,76,0.3)',
  conference: 'background:rgba(139,92,246,0.15);color:#a78bfa;border-color:rgba(139,92,246,0.3)',
  workshop: 'background:rgba(251,191,36,0.15);color:#fbbf24;border-color:rgba(251,191,36,0.3)',
  festival: 'background:rgba(244,114,182,0.15);color:#f472b6;border-color:rgba(244,114,182,0.3)',
  sports: 'background:rgba(52,211,153,0.15);color:#34d399;border-color:rgba(52,211,153,0.3)',
};

function normalizeEvent(event) {
  return {
    id: Number(event.id),
    title: event.title || 'Untitled Event',
    category: event.category || 'workshop',
    date: event.date,
    venue: event.venue || 'TBA',
    seats: Number(event.seats || 0),
    registered: Number(event.registered || 0),
    img: event.img || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&q=80',
    desc: event.desc || '',
    isRegistered: Boolean(event.is_registered || event.isRegistered)
  };
}

function spotsLeft(e) {
  return Math.max(0, e.seats - e.registered);
}

function getUserName(user) {
  return user?.name || user?.full_name || user?.fullName || '';
}

function getUserStudentOrEmail(user) {
  return user?.student_id || user?.studentId || user?.email || '';
}

function safeDate(dateValue, options) {
  if (!dateValue) return 'TBA';
  const date = new Date(dateValue + 'T00:00:00');
  if (Number.isNaN(date.getTime())) return dateValue;
  return date.toLocaleDateString('en-GB', options);
}

async function loadEvents() {
  const grid = document.getElementById('eventsGrid');
  const count = document.getElementById('resultCount');

  if (grid) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5" style="color:var(--text-muted);">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Loading events from database...
      </div>`;
  }

  try {
    const response = await fetch('backend/events/get_events.php');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Could not load events');
    }

    EVENTS = (result.data.events || []).map(normalizeEvent);
    renderGrid(true);

  } catch (error) {
    console.error('Events loading error:', error);
    if (grid) {
      grid.innerHTML = '';
    }
    if (count) {
      count.textContent = '0 events found';
    }
    showToast('Could not load events from database. Check Apache, MySQL, and the SQL import.', 'error');
    renderGrid(true);
  }
}

function renderCard(e) {
  const spots = spotsLeft(e);
  const full = spots <= 0;
  const pct = e.seats > 0 ? Math.min(100, Math.round(e.registered / e.seats * 100)) : 0;
  const dateStr = safeDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' });
  const catStyle = catColors[e.category] || '';
  const catLabel = e.category ? e.category.charAt(0).toUpperCase() + e.category.slice(1) : 'Event';
  const buttonDisabled = full || e.isRegistered;
  const buttonLabel = e.isRegistered
    ? '<i class="bi bi-check2-circle me-1"></i> Registered'
    : '<i class="bi bi-person-plus me-1"></i> Register';

  return `
    <div class="col-sm-6 col-lg-4">
      <div class="event-card">
        <div class="ec-img">
          <img src="${e.img}" alt="${e.title}" loading="lazy">
          <div class="ec-badges">
            <span class="badge-category" style="${catStyle}">${catLabel}</span>
            ${e.isRegistered
              ? '<span class="badge-available"><i class="bi bi-check-circle me-1"></i>Registered</span>'
              : full
                ? '<span class="badge-busy">Full</span>'
                : spots <= 20
                  ? '<span class="badge-busy"><i class="bi bi-fire me-1"></i>Almost Full</span>'
                  : '<span class="badge-available"><i class="bi bi-circle-fill" style="font-size:0.4rem"></i> Open</span>'}
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
            <div style="height:100%;width:${pct}%;background:${full ? '#f87171' : pct > 75 ? '#fbbf24' : 'var(--gold)'};border-radius:2px;transition:width 0.8s ease;"></div>
          </div>
          <div class="ec-footer">
            <div class="ec-seats">
              ${full ? '<span style="color:#f87171">Registration closed</span>' : `<span>${spots}</span> spots left`}
            </div>
            <button class="btn-gold ms-auto" data-id="${e.id}" onclick="openRegister(${e.id})" ${buttonDisabled ? 'disabled style="opacity:0.55;cursor:not-allowed;"' : ''}>
              ${buttonLabel}
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
  const q = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
  const cat = document.getElementById('categorySelect')?.value || 'all';
  const dateFilter = document.getElementById('dateSelect')?.value || 'all';
  const sort = document.getElementById('sortSelect')?.value || 'date';

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  let result = EVENTS.filter(e => {
    const hay = (e.title + ' ' + e.venue + ' ' + e.category + ' ' + e.desc).toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (cat !== 'all' && e.category !== cat) return false;

    if (dateFilter !== 'all') {
      const eventDate = new Date(e.date + 'T00:00:00');
      if (Number.isNaN(eventDate.getTime())) return true;

      if (dateFilter === 'thisMonth') {
        if (eventDate.getMonth() !== currentMonth || eventDate.getFullYear() !== currentYear) return false;
      }

      if (dateFilter === 'nextMonth') {
        const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
        if (eventDate.getMonth() !== nextMonthDate.getMonth() || eventDate.getFullYear() !== nextMonthDate.getFullYear()) return false;
      }
    }

    return true;
  });

  result.sort((a, b) => {
    if (sort === 'popular') return b.registered - a.registered;
    if (sort === 'name') return a.title.localeCompare(b.title);
    return new Date(a.date) - new Date(b.date);
  });

  return result;
}

function renderGrid(reset = false) {
  const grid = document.getElementById('eventsGrid');
  const empty = document.getElementById('emptyState');
  const loadBtn = document.getElementById('loadMoreBtn');
  const count = document.getElementById('resultCount');

  if (!grid || !empty || !loadBtn || !count) return;

  if (reset) {
    shown = 0;
    grid.innerHTML = '';
    filtered = getFiltered();
  }

  const page = filtered.slice(shown, shown + PER_PAGE);
  grid.insertAdjacentHTML('beforeend', page.map(renderCard).join(''));
  shown += page.length;

  empty.style.display = filtered.length ? 'none' : 'block';
  loadBtn.style.display = shown < filtered.length ? 'inline-flex' : 'none';
  count.textContent = `${filtered.length} event${filtered.length !== 1 ? 's' : ''} found`;
}

// ── Register Modal ────────────────────────
let selectedEvent = null;
const registerModalElement = document.getElementById('registerModal');
const regModal = registerModalElement ? new bootstrap.Modal(registerModalElement) : null;

function openRegister(id) {
  const user = getCurrentUser();

  if (!user) {
    showToast('Please login to register for events', 'info');
    window.location.href = 'login.html';
    return;
  }

  selectedEvent = EVENTS.find(e => e.id === Number(id));
  if (!selectedEvent) return;

  if (selectedEvent.isRegistered) {
    showToast('You are already registered for this event', 'info');
    return;
  }

  if (spotsLeft(selectedEvent) <= 0) {
    showToast('Sorry, this event is full', 'error');
    return;
  }

  document.getElementById('modalEventTitle').textContent = 'Register: ' + selectedEvent.title;
  const dateStr = safeDate(selectedEvent.date, { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('modalEventInfo').innerHTML = `
    <div style="display:flex;gap:1.5rem;flex-wrap:wrap;">
      <span style="font-size:0.8rem;color:var(--text-muted)"><i class="bi bi-calendar3 me-1" style="color:var(--gold)"></i>${dateStr}</span>
      <span style="font-size:0.8rem;color:var(--text-muted)"><i class="bi bi-geo-alt me-1" style="color:var(--gold)"></i>${selectedEvent.venue}</span>
      <span style="font-size:0.8rem;color:var(--text-muted)"><i class="bi bi-people me-1" style="color:var(--gold)"></i>${spotsLeft(selectedEvent)} spots left</span>
    </div>`;

  document.getElementById('regName').value = getUserName(user);
  document.getElementById('regId').value = getUserStudentOrEmail(user);

  const roleSelect = document.getElementById('regRole');
  if (roleSelect && user.role) {
    const roleMap = {
      student: 'Student',
      company: 'Company Representative',
      club: 'Student',
      admin: 'Faculty'
    };
    roleSelect.value = roleMap[user.role] || 'Student';
  }

  regModal?.show();
}

async function submitRegistration() {
  if (!selectedEvent) return;

  const submitBtn = document.getElementById('submitRegBtn');
  const name = document.getElementById('regName').value.trim();
  const studentIdOrEmail = document.getElementById('regId').value.trim();
  const roleText = document.getElementById('regRole').value;
  const notes = document.getElementById('regNotes').value.trim();

  if (!name || !studentIdOrEmail) {
    showToast('Please fill all required fields', 'error');
    return;
  }

  const oldContent = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registering...';

  try {
    const response = await fetch('backend/events/register_event.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: selectedEvent.id,
        full_name: name,
        student_id_or_email: studentIdOrEmail,
        role_text: roleText,
        notes
      })
    });

    const result = await response.json();

    if (!result.success) {
      if (response.status === 401) {
        localStorage.removeItem('najah_user');
        showToast('Please login again', 'info');
        window.location.href = 'login.html';
        return;
      }

      showToast(result.message || 'Registration failed', 'error');
      return;
    }

    const registration = result.data.registration;
    const event = EVENTS.find(e => e.id === selectedEvent.id);

    if (event) {
      event.registered = Number(registration.registered_count);
      event.isRegistered = true;
    }


    regModal?.hide();
    showToast(`Registered for "${selectedEvent.title}" successfully!`, 'success');
    renderGrid(true);

  } catch (error) {
    console.error('Registration error:', error);
    showToast('Connection error. Check Apache and MySQL.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = oldContent;
  }
}

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
['searchInput', 'categorySelect', 'dateSelect', 'sortSelect'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', () => renderGrid(true));
});

const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    document.getElementById('searchInput').value = '';
    document.getElementById('categorySelect').value = 'all';
    document.getElementById('dateSelect').value = 'all';
    document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
    document.querySelector('.cat-pill[data-cat="all"]')?.classList.add('active');
    renderGrid(true);
  });
}

const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => renderGrid(false));
}

const submitRegBtn = document.getElementById('submitRegBtn');
if (submitRegBtn) {
  submitRegBtn.addEventListener('click', submitRegistration);
}

// Init
loadEvents();
