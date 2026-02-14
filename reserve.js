// 3 slot states:
// - available (green)
// - pending   (blue)  -> request sent
// - reserved  (red)   -> approved by admin
const eventsData = {
  "career-expo": {
    eventName: "Career Expo 2026",
    venueName: "Main Hall",
    venueImg: "https://images.unsplash.com/photo-1515165562835-c3b8b0b5f3ff?auto=format&fit=crop&w=1400&q=60",
    slots: [
      { id:"A1", x:8,  y:18, w:14, h:16, status:"available" },
      { id:"A2", x:26, y:18, w:14, h:16, status:"reserved" },
      { id:"A3", x:44, y:18, w:14, h:16, status:"available" },
      { id:"A4", x:62, y:18, w:14, h:16, status:"available" },

      { id:"B1", x:8,  y:40, w:14, h:16, status:"reserved" },
      { id:"B2", x:26, y:40, w:14, h:16, status:"available" },
      { id:"B3", x:44, y:40, w:14, h:16, status:"available" },
      { id:"B4", x:62, y:40, w:14, h:16, status:"reserved" },
    ]
  },

  "tech-conf": {
    eventName: "Tech Conference",
    venueName: "Engineering Hall",
    venueImg: "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=1400&q=60",
    slots: [
      { id:"E1", x:10, y:22, w:18, h:18, status:"available" },
      { id:"E2", x:33, y:22, w:18, h:18, status:"available" },
      { id:"E3", x:56, y:22, w:18, h:18, status:"reserved" },

      { id:"F1", x:10, y:48, w:18, h:18, status:"available" },
      { id:"F2", x:33, y:48, w:18, h:18, status:"reserved" },
      { id:"F3", x:56, y:48, w:18, h:18, status:"available" },
    ]
  },

  "projects-fair": {
    eventName: "Projects Fair",
    venueName: "Expo Hall",
    venueImg: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60",
    slots: [
      { id:"X1", x:12, y:26, w:16, h:16, status:"available" },
      { id:"X2", x:32, y:26, w:16, h:16, status:"available" },
      { id:"X3", x:52, y:26, w:16, h:16, status:"reserved" },

      { id:"Y1", x:12, y:50, w:16, h:16, status:"available" },
      { id:"Y2", x:32, y:50, w:16, h:16, status:"reserved" },
      { id:"Y3", x:52, y:50, w:16, h:16, status:"available" },
    ]
  }
};

// Elements
const eventNameEl = document.getElementById("eventName");
const venueNameEl = document.getElementById("venueName");
const venueImgEl = document.getElementById("venueImg");
const slotsLayer = document.getElementById("slotsLayer");

const selectedSlotBadge = document.getElementById("selectedSlotBadge");
const selectedSlotInput = document.getElementById("selectedSlotInput");
const eventIdInput = document.getElementById("eventIdInput");
const form = document.getElementById("reservationForm");

let selectedSlotId = null;

// Helpers
function getEventIdFromUrl(){
  return new URLSearchParams(window.location.search).get("event");
}

function resetSelection(){
  selectedSlotId = null;
  selectedSlotInput.value = "";
  selectedSlotBadge.className = "badge rounded-pill text-bg-secondary";
  selectedSlotBadge.textContent = "No slot selected";
}

function selectSlot(id){
  selectedSlotId = id;
  selectedSlotInput.value = id;

  selectedSlotBadge.className = "badge rounded-pill text-bg-primary";
  selectedSlotBadge.textContent = "Selected: " + id;

  document.querySelectorAll(".slot").forEach(s => {
    if (s.dataset.slotId === id) s.classList.add("selected");
    else s.classList.remove("selected");
  });
}

function renderReservation(eventObj){
  // text
  eventNameEl.textContent = eventObj.eventName;
  venueNameEl.textContent = eventObj.venueName;

  // hidden eventId
  eventIdInput.value = currentEventId;

  // image
  venueImgEl.src = eventObj.venueImg;

  // slots
  resetSelection();
  slotsLayer.innerHTML = "";

  eventObj.slots.forEach(slot => {
    const el = document.createElement("div");

    // base slot class
    el.classList.add("slot");
    el.dataset.slotId = slot.id;

    // apply status class
    if (slot.status === "available") el.classList.add("available");
    if (slot.status === "reserved") el.classList.add("reserved");
    if (slot.status === "pending")  el.classList.add("pending");

    el.textContent = slot.id;

    el.style.left = slot.x + "%";
    el.style.top = slot.y + "%";
    el.style.width = slot.w + "%";
    el.style.height = slot.h + "%";

    // only clickable if available
    if (slot.status === "available"){
      el.addEventListener("click", () => selectSlot(slot.id));
      el.title = "Available";
    } else if (slot.status === "pending"){
      el.title = "Pending request";
    } else {
      el.title = "Reserved";
    }

    slotsLayer.appendChild(el);
  });
}

// Init
const currentEventId = getEventIdFromUrl();
let eventObj = eventsData[currentEventId];

if (!eventObj){
  eventNameEl.textContent = "Event not found";
  venueNameEl.textContent = "—";
  venueImgEl.src = "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1400&q=60";
  slotsLayer.innerHTML = "";
  selectedSlotBadge.textContent = "No slot selected";
} else {
  renderReservation(eventObj);
}

// Submit (frontend only)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!eventObj){
    alert("Invalid event. Please go back to Events page and try again.");
    return;
  }

  if (!selectedSlotId){
    alert("Please select an available slot (green) before sending the request.");
    return;
  }

  // Turn selected slot to PENDING (blue) so nobody else can request it
  const slot = eventObj.slots.find(s => s.id === selectedSlotId);

  if (!slot){
    alert("Slot not found. Please refresh and try again.");
    return;
  }

  // Safety: prevent double request
  if (slot.status !== "available"){
    alert("This slot is not available anymore.");
    return;
  }

  slot.status = "pending"; // 🔵 lock it

  // Re-render map
  renderReservation(eventObj);

  alert(`Request sent ✅
Event: ${eventObj.eventName}
Venue: ${eventObj.venueName}
Slot: ${selectedSlotId}
Status: Pending (locked)
(Admin approval later)`);
});

// Navbar scrolled effect
window.addEventListener("scroll", () => {
  const nav = document.querySelector(".navbar");
  nav.classList.toggle("scrolled", window.scrollY > 40);
});

// Dark mode
document.getElementById("themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});
