// Demo events data (later replace with backend API)
const allEvents = [
  {
    title: "Career Expo 2026",
    venue: "Main Hall",
    date: "2026-03-12",
    category: "expo",
    img: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=60"
  },
  {
    title: "Tech Conference",
    venue: "Engineering Hall",
    date: "2026-04-05",
    category: "conference",
    img: "https://images.unsplash.com/photo-1558008258-3256797b43f3?auto=format&fit=crop&w=1200&q=60"
  },
  {
    title: "Projects Fair",
    venue: "Expo Hall",
    date: "2026-05-01",
    category: "expo",
    img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=60"
  },
  {
    title: "Startup Pitch Night",
    venue: "Business Center",
    date: "2026-03-22",
    category: "conference",
    img: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=60"
  },
  {
    title: "AI Workshop",
    venue: "Lab A2",
    date: "2026-04-14",
    category: "workshop",
    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=60"
  },
  {
    title: "Spring Festival",
    venue: "Outdoor Stage",
    date: "2026-04-20",
    category: "festival",
    img: "https://images.unsplash.com/photo-1515165562835-c3b8b0b5f3ff?auto=format&fit=crop&w=1200&q=60"
  },
  // Add more demo events so "Load more" makes sense
  {
    title: "Cybersecurity Day",
    venue: "IT Building",
    date: "2026-05-10",
    category: "conference",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=60"
  },
  {
    title: "Robotics Showcase",
    venue: "Engineering Hall",
    date: "2026-05-18",
    category: "expo",
    img: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=1200&q=60"
  },
  {
    title: "Design Thinking Workshop",
    venue: "Innovation Hub",
    date: "2026-06-02",
    category: "workshop",
    img: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=60"
  },
  {
    title: "Summer Culture Night",
    venue: "Main Auditorium",
    date: "2026-06-15",
    category: "festival",
    img: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=60"
  }
];

const grid = document.getElementById("eventsGrid");
const loadMoreBtn = document.getElementById("loadMoreBtn");
const searchInput = document.getElementById("searchInput");
const categorySelect = document.getElementById("categorySelect");
const resultCount = document.getElementById("resultCount");

let visibleCount = 6; // show 6 first

function formatDate(iso){
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function getFilteredEvents(){
  const q = searchInput.value.trim().toLowerCase();
  const cat = categorySelect.value;

  return allEvents.filter(ev => {
    const matchesSearch =
      ev.title.toLowerCase().includes(q) ||
      ev.venue.toLowerCase().includes(q) ||
      ev.date.includes(q);

    const matchesCat = (cat === "all") || (ev.category === cat);

    return matchesSearch && matchesCat;
  });
}

function render(){
  const filtered = getFilteredEvents();
  const toShow = filtered.slice(0, visibleCount);

  grid.innerHTML = toShow.map(ev => `
    <div class="col-md-4">
      <div class="card event-card h-100">
        <img src="${ev.img}" class="card-img-top" alt="${ev.title}">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between align-items-start mb-2">
            <span class="badge badge-soft text-capitalize">${ev.category}</span>
            <span class="text-muted small"><i class="bi bi-calendar-event"></i> ${formatDate(ev.date)}</span>
          </div>
          <h5 class="card-title">${ev.title}</h5>
          <p class="text-muted mb-3"><i class="bi bi-geo-alt"></i> ${ev.venue}</p>
          <div class="mt-auto">
            <button class="btn btn-primary w-100">Register</button>
          </div>
        </div>
      </div>
    </div>
  `).join("");

  resultCount.textContent = `${filtered.length} event(s) found`;

  // Hide load more if nothing more
  loadMoreBtn.style.display = (visibleCount >= filtered.length) ? "none" : "inline-block";
}

loadMoreBtn.addEventListener("click", () => {
  visibleCount += 6;
  render();
});

searchInput.addEventListener("input", () => {
  visibleCount = 6;
  render();
});

categorySelect.addEventListener("change", () => {
  visibleCount = 6;
  render();
});

// Navbar background on scroll
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navbar");
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

// Dark mode (same as home)
const toggle = document.getElementById("themeToggle");
const icon = toggle.querySelector("i");

function setTheme(isDark){
  document.body.classList.toggle("dark-mode", isDark);
  icon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-fill";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

setTheme(localStorage.getItem("theme") === "dark");

toggle.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark-mode"));
});

// Initial render
render();
