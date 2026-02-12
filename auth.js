// ===== Theme (persist like your events page) =====
const themeToggle = document.getElementById("themeToggle");
const icon = themeToggle?.querySelector("i");

function setTheme(isDark){
  document.body.classList.toggle("dark-mode", isDark);
  if(icon) icon.className = isDark ? "bi bi-sun-fill" : "bi bi-moon-fill";
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

setTheme(localStorage.getItem("theme") === "dark");

themeToggle?.addEventListener("click", () => {
  setTheme(!document.body.classList.contains("dark-mode"));
});

// Navbar scroll background
window.addEventListener("scroll", () => {
  const nav = document.getElementById("mainNav");
  if(!nav) return;
  nav.classList.toggle("scrolled", window.scrollY > 20);
});

// ===== Toast helper =====
const toastEl = document.getElementById("appToast");
const toastBody = document.getElementById("toastBody");
const toast = toastEl ? new bootstrap.Toast(toastEl, { delay: 2600 }) : null;

function showToast(message){
  if(!toastBody || !toast) return alert(message);
  toastBody.textContent = message;
  toast.show();
}

// ===== Demo "DB" in localStorage =====
const USERS_KEY = "najah_users";
const SESSION_KEY = "najah_session";

function getUsers(){
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || []; }
  catch { return []; }
}

function saveUsers(users){
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setSession(user, remember){
  const payload = { email: user.email, name: user.name, role: user.role, ts: Date.now() };
  if(remember){
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    sessionStorage.removeItem(SESSION_KEY);
  }else{
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(payload));
    localStorage.removeItem(SESSION_KEY);
  }
}

function emailValid(email){
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// ===== Password UI helpers =====
function bindToggle(btnId, inputId){
  const btn = document.getElementById(btnId);
  const input = document.getElementById(inputId);
  if(!btn || !input) return;

  btn.addEventListener("click", () => {
    const isPass = input.type === "password";
    input.type = isPass ? "text" : "password";
    btn.innerHTML = isPass ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
  });
}

bindToggle("toggleLoginPass", "loginPassword");
bindToggle("toggleRegPass", "regPassword");

// ===== Forgot password (demo) =====
const sendResetBtn = document.getElementById("sendResetBtn");
sendResetBtn?.addEventListener("click", () => {
  const email = (document.getElementById("forgotEmail")?.value || "").trim();
  if(!emailValid(email)){
    showToast("Please enter a valid email.");
    return;
  }
  showToast("Reset link sent (demo). Check your inbox.");
  const modal = bootstrap.Modal.getInstance(document.getElementById("forgotModal"));
  modal?.hide();
});

// ===== Register page logic =====
const registerForm = document.getElementById("registerForm");
const regPassword = document.getElementById("regPassword");
const regConfirm = document.getElementById("regConfirm");
const strengthBar = document.getElementById("strengthBar");
const strengthText = document.getElementById("strengthText");

function passwordStrength(p){
  let score = 0;
  if(p.length >= 6) score++;
  if(/[A-Z]/.test(p)) score++;
  if(/[0-9]/.test(p)) score++;
  if(/[^A-Za-z0-9]/.test(p)) score++;
  if(p.length >= 10) score++;
  return Math.min(score, 5);
}

function updateStrength(){
  if(!regPassword || !strengthBar || !strengthText) return;
  const p = regPassword.value;
  const s = passwordStrength(p);
  const pct = (s/5)*100;

  strengthBar.style.width = `${pct}%`;

  const labels = ["—","Weak","Fair","Good","Strong","Very strong"];
  strengthText.textContent = `Strength: ${labels[s]}`;
}

regPassword?.addEventListener("input", updateStrength);

registerForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = (document.getElementById("regName")?.value || "").trim();
  const role = (document.getElementById("regRole")?.value || "").trim();
  const email = (document.getElementById("regEmail")?.value || "").trim().toLowerCase();
  const pass = (regPassword?.value || "");
  const conf = (regConfirm?.value || "");
  const terms = document.getElementById("termsCheck")?.checked;

  // Basic validation
  let ok = true;

  if(name.length < 3) ok = false;
  if(!role) ok = false;
  if(!emailValid(email)) ok = false;
  if(pass.length < 6) ok = false;
  if(conf !== pass) ok = false;
  if(!terms) ok = false;

  // Bootstrap-ish invalid UI
  registerForm.classList.add("was-validated");

  // Extra confirm mismatch feedback
  if(regConfirm){
    if(conf !== pass){
      regConfirm.setCustomValidity("mismatch");
      ok = false;
    } else {
      regConfirm.setCustomValidity("");
    }
  }

  if(!ok){
    showToast("Please fix the highlighted fields.");
    return;
  }

  const users = getUsers();
  const exists = users.some(u => u.email === email);
  if(exists){
    showToast("This email is already registered. Try login.");
    return;
  }

  users.push({ name, role, email, pass }); // demo only (no hashing)
  saveUsers(users);

  showToast("Account created! Redirecting to login...");
  setTimeout(() => window.location.href = "login.html", 900);
});

// ===== Login page logic =====
const loginForm = document.getElementById("loginForm");
const demoLoginBtn = document.getElementById("demoLoginBtn");

demoLoginBtn?.addEventListener("click", () => {
  // Create a demo user if not exists
  const users = getUsers();
  const demoEmail = "demo@najah.edu";
  let demo = users.find(u => u.email === demoEmail);
  if(!demo){
    demo = { name:"Demo User", role:"student", email: demoEmail, pass:"Demo123!" };
    users.push(demo);
    saveUsers(users);
  }

  setSession(demo, true);
  showToast("Logged in as Demo User ✅");
  setTimeout(() => window.location.href = "index.html", 700);
});

loginForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  const email = (document.getElementById("loginEmail")?.value || "").trim().toLowerCase();
  const pass = (document.getElementById("loginPassword")?.value || "");
  const remember = document.getElementById("rememberMe")?.checked;

  loginForm.classList.add("was-validated");

  if(!emailValid(email) || pass.length < 6){
    showToast("Please enter valid credentials.");
    return;
  }

  const users = getUsers();
  const user = users.find(u => u.email === email && u.pass === pass);

  if(!user){
    showToast("Incorrect email or password.");
    return;
  }

  setSession(user, !!remember);
  showToast(`Welcome, ${user.name} ✅`);

  setTimeout(() => window.location.href = "index.html", 700);
});
