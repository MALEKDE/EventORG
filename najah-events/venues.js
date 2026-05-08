/* ═══════════════════════════════════════
   NAJAH EVENTS — VENUES PAGE JS
   Backend connected version
═══════════════════════════════════════ */

let VENUES = [];

function normalizeVenue(venue) {
  const features = Array.isArray(venue.features)
    ? venue.features
    : String(venue.features || '')
        .split(',')
        .map(item => item.trim())
        .filter(Boolean);

  return {
    id: Number(venue.id),
    name: venue.name || 'Untitled Venue',
    building: venue.building || 'Najah University',
    type: venue.type || 'hall',
    capacity: Number(venue.capacity || 0),
    area: venue.area || 'N/A',
    status: venue.status || 'available',
    image: venue.image || 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80',
    features,
    notes: venue.notes || ''
  };
}

function updateKpis() {
  const total = document.getElementById('kpiTotal');
  const available = document.getElementById('kpiAvail');
  const seats = document.getElementById('kpiSeats');

  if (total) total.textContent = VENUES.length;
  if (available) available.textContent = VENUES.filter(v => v.status === 'available').length;
  if (seats) seats.textContent = VENUES.length ? Math.max(...VENUES.map(v => v.capacity)) : 0;
}

async function loadVenues() {
  const grid = document.getElementById('venuesGrid');
  const count = document.getElementById('resultCount');

  if (grid) {
    grid.innerHTML = `
      <div class="col-12 text-center py-5" style="color:var(--text-muted);">
        <div class="spinner-border spinner-border-sm me-2" role="status"></div>
        Loading venues from database...
      </div>`;
  }

  try {
    const response = await fetch('backend/venues/get_venues.php');
    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || 'Could not load venues');
    }

    VENUES = (result.data.venues || []).map(normalizeVenue);
    updateKpis();
    render(true);

  } catch (error) {
    console.error('Venues loading error:', error);
    VENUES = [];
    updateKpis();

    if (grid) grid.innerHTML = '';
    if (count) count.textContent = '0 venues found';

    showToast('Could not load venues from database. Check Apache, MySQL, and the SQL import.', 'error');
    render(true);
  }
}

// ── Helpers ────────────────────────────────
function statusBadge(s) {
  if (s === 'available') return '<span class="badge-available"><i class="bi bi-circle-fill" style="font-size:0.4rem"></i> Available</span>';
  if (s === 'busy') return '<span class="badge-busy"><i class="bi bi-clock-history me-1"></i>Busy</span>';
  return '<span class="badge-maintenance"><i class="bi bi-tools me-1"></i>Maintenance</span>';
}
function typeLabel(t) { return {auditorium:'Auditorium',hall:'Hall',classroom:'Classroom',outdoor:'Outdoor',lab:'Lab'}[t] || 'Venue'; }

function renderCard(v) {
  const disabled = v.status !== 'available';
  const chips = v.features.slice(0, 4).map(f => `<span class="feature-chip"><i class="bi bi-check2"></i>${f}</span>`).join('');
  const more = v.features.length > 4 ? `<span class="feature-chip">+${v.features.length - 4}</span>` : '';
  return `
    <div class="col-sm-6 col-lg-4">
      <div class="venue-card">
        <div class="vc-img-wrap">
          <img src="${v.image}" alt="${v.name}" loading="lazy">
          <div class="vc-overlay-badges">
            ${statusBadge(v.status)}
            <span class="vc-cap-badge"><i class="bi bi-people me-1"></i>${v.capacity}</span>
          </div>
        </div>
        <div class="vc-body">
          <div class="d-flex align-items-start justify-content-between gap-2 mb-1">
            <div class="vc-title">${v.name}</div>
            <span class="badge-gold" style="font-size:0.65rem;flex-shrink:0;">${typeLabel(v.type)}</span>
          </div>
          <div class="vc-building"><i class="bi bi-geo-alt me-1"></i>${v.building}</div>
          <div class="vc-chips">${chips}${more}</div>
          <div class="vc-actions">
            <button class="btn-ghost flex-grow-1 justify-content-center" onclick="openDetails(${v.id})"><i class="bi bi-eye me-1"></i>Details</button>
            <button class="btn-gold flex-grow-1 justify-content-center" onclick="bookVenue(${v.id})" ${disabled ? 'disabled style="opacity:0.4;cursor:not-allowed;"' : ''}><i class="bi bi-calendar2-check me-1"></i>Book</button>
          </div>
        </div>
      </div>
    </div>`;
}

// ── Filter & Render ────────────────────────
const PER = 6;
let shown = 0, list = [];

function getFiltered() {
  const q = document.getElementById('searchInput')?.value.trim().toLowerCase() || '';
  const type = document.getElementById('typeSelect')?.value || 'all';
  const av = document.getElementById('availSelect')?.value || 'all';
  const only = document.getElementById('onlyAvail')?.checked || false;
  const minC = parseInt(document.getElementById('minCap')?.value || '0', 10);
  return VENUES.filter(v => {
    const hay = (v.name + ' ' + v.building + ' ' + v.features.join(' ')).toLowerCase();
    if (q && !hay.includes(q)) return false;
    if (type !== 'all' && v.type !== type) return false;
    if (av !== 'all' && v.status !== av) return false;
    if (only && v.status !== 'available') return false;
    if (minC && v.capacity < minC) return false;
    return true;
  });
}

function getSort(arr) {
  const s = document.getElementById('sortSelect')?.value || 'recommended';
  const out = [...arr];
  if (s === 'cap_desc') out.sort((a, b) => b.capacity - a.capacity);
  else if (s === 'cap_asc') out.sort((a, b) => a.capacity - b.capacity);
  else if (s === 'name') out.sort((a, b) => a.name.localeCompare(b.name));
  else out.sort((a, b) => (b.status === 'available' ? 1 : 0) - (a.status === 'available' ? 1 : 0) || b.capacity - a.capacity);
  return out;
}

function render(reset = false) {
  const grid = document.getElementById('venuesGrid');
  const empty = document.getElementById('emptyState');
  const loadBtn = document.getElementById('loadMoreBtn');
  const count = document.getElementById('resultCount');
  if (!grid || !empty || !loadBtn || !count) return;

  if (reset) { shown = 0; grid.innerHTML = ''; list = getSort(getFiltered()); }
  const page = list.slice(shown, shown + PER);
  grid.insertAdjacentHTML('beforeend', page.map(renderCard).join(''));
  shown += page.length;
  empty.style.display = list.length ? 'none' : 'block';
  loadBtn.style.display = shown < list.length ? 'inline-flex' : 'none';
  count.textContent = `${list.length} venue${list.length !== 1 ? 's' : ''} found`;
}

// ── Detail Modal ───────────────────────────
const venueModalElement = document.getElementById('venueModal');
const modal = venueModalElement ? new bootstrap.Modal(venueModalElement) : null;

function openDetails(id) {
  const v = VENUES.find(x => x.id === Number(id));
  if (!v) return;
  document.getElementById('mTitle').textContent = v.name;
  document.getElementById('mSub').textContent = `${typeLabel(v.type)} · ${v.building}`;
  document.getElementById('mImg').src = v.image;
  document.getElementById('mCap').textContent = v.capacity.toLocaleString();
  document.getElementById('mArea').textContent = v.area;
  document.getElementById('mStatus').innerHTML = statusBadge(v.status);
  document.getElementById('mFeatures').innerHTML = v.features.map(f => `<span class="feature-chip"><i class="bi bi-check2"></i>${f}</span>`).join('');
  document.getElementById('mNotes').textContent = v.notes;
  const bookBtn = document.getElementById('mBookBtn');
  bookBtn.href = `reserve.html?venue=${v.id}`;
  bookBtn.style.opacity = v.status === 'available' ? '1' : '0.4';
  bookBtn.style.pointerEvents = v.status === 'available' ? 'auto' : 'none';
  modal?.show();
}

function bookVenue(id) {
  const user = getCurrentUser();
  if (!user) { showToast('Please login to book a venue', 'info'); setTimeout(() => window.location.href = 'login.html', 1200); return; }
  window.location.href = `reserve.html?venue=${id}`;
}

// ── Listeners ─────────────────────────────
['searchInput','typeSelect','availSelect','sortSelect','onlyAvail','minCap'].forEach(id => {
  const el = document.getElementById(id);
  if (el) { el.addEventListener('input', () => render(true)); el.addEventListener('change', () => render(true)); }
});

const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
  clearBtn.addEventListener('click', () => {
    ['searchInput','minCap'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    ['typeSelect','availSelect','sortSelect'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.selectedIndex = 0;
    });
    const onlyAvail = document.getElementById('onlyAvail');
    if (onlyAvail) onlyAvail.checked = false;
    render(true);
  });
}

const loadMoreBtn = document.getElementById('loadMoreBtn');
if (loadMoreBtn) {
  loadMoreBtn.addEventListener('click', () => render(false));
}

loadVenues();
