/* ═══════════════════════════════════════
   NAJAH EVENTS — VENUES PAGE JS
═══════════════════════════════════════ */

const VENUES = [
  { id:1, name:'Main Auditorium', building:'Main Campus', type:'auditorium', capacity:800, area:'1,200 m²', status:'available', image:'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&q=80', features:['Stage','Sound System','Projector','Backstage','AC','Accessible'], notes:'Ideal for large conferences, keynote talks, and official ceremonies.' },
  { id:2, name:'Engineering Hall', building:'Engineering Faculty', type:'hall', capacity:350, area:'650 m²', status:'busy', image:'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80', features:['Projector','Wi-Fi','Sound System','Seating','Whiteboard'], notes:'Great for tech talks, exhibitions, and mid-size community events.' },
  { id:3, name:'Expo Hall', building:'Student Activities Center', type:'hall', capacity:600, area:'980 m²', status:'available', image:'https://images.unsplash.com/photo-1515169067868-5387ec356754?w=800&q=80', features:['Booths','Power Outlets','Wi-Fi','Open Space','AC'], notes:'Best for expos with booths — companies, projects fairs, and showcases.' },
  { id:4, name:'Outdoor Stage', building:'Central Yard', type:'outdoor', capacity:1200, area:'Open Area', status:'available', image:'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800&q=80', features:['Stage','Lighting','Outdoor Seating','Security','Generators'], notes:'Perfect for festivals, graduation vibes, and large student gatherings.' },
  { id:5, name:'Workshop Room A', building:'Library Building', type:'classroom', capacity:60, area:'110 m²', status:'maintenance', image:'https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=800&q=80', features:['Whiteboard','Projector','Wi-Fi'], notes:'Small workshops and training. Currently under maintenance.' },
  { id:6, name:'Computer Lab 2', building:'IT Center', type:'lab', capacity:40, area:'95 m²', status:'available', image:'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=800&q=80', features:['Computers','High-Speed Internet','Projector','AC','UPS'], notes:'Hands-on sessions: coding workshops, demos, and hack activities.' },
  { id:7, name:'Faculty Seminar Room', building:'Admin Building', type:'classroom', capacity:80, area:'150 m²', status:'available', image:'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&q=80', features:['Smart Board','Video Conference','AC','Projector'], notes:'Ideal for seminars, panels, and small conferences.' },
  { id:8, name:'Sports Complex Hall', building:'Sports & Recreation', type:'outdoor', capacity:500, area:'2,000 m²', status:'busy', image:'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80', features:['Changing Rooms','Scoreboard','Bleachers','Security'], notes:'Multi-sport complex for tournaments and athletic events.' },
];

// ── KPIs ───────────────────────────────────
document.getElementById('kpiTotal').textContent = VENUES.length;
document.getElementById('kpiAvail').textContent = VENUES.filter(v => v.status === 'available').length;
document.getElementById('kpiSeats').textContent = Math.max(...VENUES.map(v => v.capacity));

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
  const q = document.getElementById('searchInput').value.trim().toLowerCase();
  const type = document.getElementById('typeSelect').value;
  const av = document.getElementById('availSelect').value;
  const only = document.getElementById('onlyAvail').checked;
  const minC = parseInt(document.getElementById('minCap').value || '0', 10);
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
  const s = document.getElementById('sortSelect').value;
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
  if (reset) { shown = 0; grid.innerHTML = ''; list = getSort(getFiltered()); }
  const page = list.slice(shown, shown + PER);
  grid.insertAdjacentHTML('beforeend', page.map(renderCard).join(''));
  shown += page.length;
  empty.style.display = list.length ? 'none' : 'block';
  loadBtn.style.display = shown < list.length ? 'inline-flex' : 'none';
  count.textContent = `${list.length} venue${list.length !== 1 ? 's' : ''} found`;
}

// ── Detail Modal ───────────────────────────
const modal = new bootstrap.Modal(document.getElementById('venueModal'));

function openDetails(id) {
  const v = VENUES.find(x => x.id === id);
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
  modal.show();
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
document.getElementById('clearBtn').addEventListener('click', () => {
  ['searchInput','minCap'].forEach(id => document.getElementById(id).value = '');
  ['typeSelect','availSelect','sortSelect'].forEach(id => document.getElementById(id).selectedIndex = 0);
  document.getElementById('onlyAvail').checked = false;
  render(true);
});
document.getElementById('loadMoreBtn').addEventListener('click', () => render(false));

render(true);
