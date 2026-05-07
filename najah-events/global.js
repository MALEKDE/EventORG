/* ═══════════════════════════════════════════════════════════
   NAJAH EVENTS V4 — Advanced Animation Engine
═══════════════════════════════════════════════════════════ */

const THEME_KEY = 'najah_theme';
function getTheme() { return localStorage.getItem(THEME_KEY) || 'dark'; }
function applyTheme(theme, animate) {
  document.documentElement.setAttribute('data-theme', theme);
  document.querySelectorAll('.theme-toggle-icon').forEach(el => { el.textContent = theme==='dark'?'🌙':'☀️'; });
  if (!animate) return;
  const overlay = document.createElement('div');
  overlay.style.cssText = `position:fixed;inset:0;background:${theme==='light'?'#f5f0e8':'#060912'};opacity:0;pointer-events:none;z-index:99999;transition:opacity 0.25s;`;
  document.body.appendChild(overlay);
  requestAnimationFrame(() => { overlay.style.opacity='0.4'; setTimeout(()=>{ overlay.style.opacity='0'; setTimeout(()=>overlay.remove(),280); },180); });
}
function toggleTheme() { const n=getTheme()==='dark'?'light':'dark'; localStorage.setItem(THEME_KEY,n); applyTheme(n,true); }
(function(){ applyTheme(getTheme(),false); })();

function buildThemeToggle() {
  return `<li class="nav-item d-flex align-items-center ms-lg-2"><button class="theme-toggle-btn" onclick="toggleTheme()" title="Toggle theme" aria-label="Toggle theme"><span class="theme-toggle-thumb"><span class="theme-toggle-icon">${getTheme()==='dark'?'🌙':'☀️'}</span></span></button></li>`;
}

(function initNavbar(){
  const nav=document.getElementById('mainNav'); if(!nav) return;
  const fn=()=>nav.classList.toggle('scrolled',window.scrollY>20);
  window.addEventListener('scroll',fn,{passive:true}); fn();
})();

document.addEventListener('click',e=>{
  const nc=document.getElementById('navMenu');
  if(nc&&nc.classList.contains('show')&&!e.target.closest('.navbar')) document.querySelector('.navbar-toggler')?.click();
});

/* ── Custom Cursor ── */
function initCursor() {
  if(window.matchMedia('(hover:none)').matches||window.innerWidth<1024) return;
  const dot=Object.assign(document.createElement('div'),{className:'cursor-dot'});
  const ring=Object.assign(document.createElement('div'),{className:'cursor-ring'});
  document.body.appendChild(dot); document.body.appendChild(ring);
  let mx=-200,my=-200,rx=-200,ry=-200;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;},{passive:true});
  const lerp=(a,b,t)=>a+(b-a)*t;
  (function tick(){
    rx=lerp(rx,mx,0.12); ry=lerp(ry,my,0.12);
    dot.style.transform=`translate(${mx-4}px,${my-4}px)`;
    ring.style.transform=`translate(${rx-20}px,${ry-20}px)`;
    requestAnimationFrame(tick);
  })();
  document.addEventListener('mouseover',e=>{ if(e.target.closest('a,button,[data-cursor]')){ dot.classList.add('cursor-hover');ring.classList.add('cursor-hover'); }});
  document.addEventListener('mouseout',e=>{ if(e.target.closest('a,button,[data-cursor]')){ dot.classList.remove('cursor-hover');ring.classList.remove('cursor-hover'); }});
  document.addEventListener('mousedown',()=>{dot.classList.add('cursor-click');ring.classList.add('cursor-click');});
  document.addEventListener('mouseup',()=>{dot.classList.remove('cursor-click');ring.classList.remove('cursor-click');});
}

/* ── Magnetic Buttons ── */
function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const dx=(e.clientX-r.left-r.width/2)*0.28, dy=(e.clientY-r.top-r.height/2)*0.28;
      btn.style.transform=`translate(${dx}px,${dy}px)`; btn.style.transition='transform 0.08s ease';
    });
    btn.addEventListener('mouseleave',()=>{ btn.style.transform='translate(0,0)'; btn.style.transition='transform 0.55s cubic-bezier(0.34,1.56,0.64,1)'; });
  });
}

/* ── 3D Tilt ── */
function initTilt() {
  document.querySelectorAll('[data-tilt]').forEach(card=>{
    const s=parseFloat(card.dataset.tilt)||10;
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=((e.clientX-r.left)/r.width-0.5)*s, y=((e.clientY-r.top)/r.height-0.5)*s;
      card.style.transform=`perspective(900px) rotateY(${x}deg) rotateX(${-y}deg) translateZ(10px)`;
      card.style.transition='transform 0.08s ease';
    });
    card.addEventListener('mouseleave',()=>{ card.style.transform='perspective(900px) rotateY(0) rotateX(0) translateZ(0)'; card.style.transition='transform 0.65s cubic-bezier(0.4,0,0.2,1)'; });
  });
}

/* ── Counters ── */
function animateCounter(el) {
  const target=parseInt(el.dataset.target,10), suffix=el.dataset.suffix||'';
  const dur=2200, fps=60, steps=dur/(1000/fps); let step=0;
  const easeOut=t=>1-Math.pow(1-t,3);
  const id=setInterval(()=>{ step++; const p=easeOut(Math.min(step/steps,1)); el.textContent=Math.floor(p*target).toLocaleString()+suffix; if(step>=steps){el.textContent=target.toLocaleString()+suffix;clearInterval(id);} },1000/fps);
}
function initCounters() {
  const obs=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){animateCounter(e.target);obs.unobserve(e.target);} }); },{threshold:0.5});
  document.querySelectorAll('[data-counter]').forEach(c=>obs.observe(c));
}

/* ── Scroll Reveal ── */
function initScrollReveal() {
  const obs=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){ const d=parseInt(e.target.dataset.reveal||0); setTimeout(()=>e.target.classList.add('reveal-visible'),d); obs.unobserve(e.target); } }); },{threshold:0.08});
  document.querySelectorAll('[data-reveal]').forEach(el=>{ el.classList.add('reveal-hidden'); obs.observe(el); });
}

/* ── Word Reveal ── */
function initWordReveal() {
  document.querySelectorAll('[data-word-reveal]').forEach(el=>{
    const words=el.textContent.trim().split(/\s+/);
    el.innerHTML=words.map((w,i)=>`<span class="word-wrap"><span class="word" style="transition-delay:${i*55}ms">${w}</span></span>`).join(' ');
    const obs=new IntersectionObserver(entries=>{ entries.forEach(e=>{ if(e.isIntersecting){ setTimeout(()=>e.target.querySelectorAll('.word').forEach(w=>w.classList.add('word-visible')),100); obs.unobserve(e.target); } }); },{threshold:0.2});
    obs.observe(el);
  });
}

/* ── Text Scramble ── */
class TextScramble {
  constructor(el){ this.el=el; this.chars='!<>—_\\/[]{}=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; }
  setText(text){ const len=text.length; let frame=0;
    return new Promise(res=>{ const update=()=>{ let out='',done=0; for(let i=0;i<len;i++){ const prog=frame/(35*(i/len+0.3)); if(prog>=1){out+=text[i];done++;} else out+=`<span class="sc">${this.chars[Math.floor(Math.random()*this.chars.length)]}</span>`; } this.el.innerHTML=out; if(done<len){frame++;requestAnimationFrame(update);}else{this.el.textContent=text;res();} }; update(); }); }
}
function initScramble() {
  const el=document.querySelector('[data-scramble]'); if(!el) return;
  const phrases=el.dataset.scramble.split('|'); let i=0;
  const sc=new TextScramble(el);
  const next=()=>sc.setText(phrases[i%phrases.length]).then(()=>{i++;setTimeout(next,2800);});
  setTimeout(next,1200);
}

/* ── Parallax ── */
function initParallax() {
  const els=document.querySelectorAll('[data-parallax]'); if(!els.length) return;
  window.addEventListener('scroll',()=>{ const sy=window.scrollY; els.forEach(el=>{ el.style.transform=`translateY(${sy*parseFloat(el.dataset.parallax||0.3)}px)`; }); },{passive:true});
}

/* ── Marquee ── */
function initMarquee() { document.querySelectorAll('.marquee-track').forEach(t=>{t.innerHTML+=t.innerHTML;}); }

/* ── Hero Canvas ── */
function initHeroCanvas() {
  const canvas=document.getElementById('heroCanvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d'); let W,H,particles=[];
  const resize=()=>{ W=canvas.width=canvas.offsetWidth; H=canvas.height=canvas.offsetHeight; };
  resize(); window.addEventListener('resize',()=>{resize();particles=make();});
  function make(){ const arr=[],count=Math.min(65,Math.floor(W*H/13000));
    for(let i=0;i<count;i++) arr.push({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.5+.4,a:Math.random()*.4+.1});
    return arr; }
  particles=make();
  let mx=-9999,my=-9999;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;},{passive:true});
  (function loop(){
    ctx.clearRect(0,0,W,H);
    particles.forEach(p=>{
      const dx=p.x-mx,dy=p.y-my,dist=Math.hypot(dx,dy);
      if(dist<90){p.vx+=dx/dist*.018;p.vy+=dy/dist*.018;}
      const spd=Math.hypot(p.vx,p.vy); if(spd>.75){p.vx*=.75/spd;p.vy*=.75/spd;}
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0)p.x=W;if(p.x>W)p.x=0;if(p.y<0)p.y=H;if(p.y>H)p.y=0;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fillStyle=`rgba(201,168,76,${p.a})`;ctx.fill();
    });
    for(let i=0;i<particles.length;i++) for(let j=i+1;j<particles.length;j++){
      const a=particles[i],b=particles[j],d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<130){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(201,168,76,${.07*(1-d/130)})`;ctx.lineWidth=.5;ctx.stroke();}
    }
    requestAnimationFrame(loop);
  })();
}

/* ── Preloader ── */
function initPreloader() {
  const pre=document.getElementById('preloader'); if(!pre) return;
  window.addEventListener('load',()=>{ setTimeout(()=>{ pre.classList.add('preloader-done'); setTimeout(()=>pre.remove(),600); },700); });
}

/* ── Toast ── */
let _tc;
function getTC(){ if(!_tc){_tc=document.querySelector('.toast-container-custom')||Object.assign(document.createElement('div'),{className:'toast-container-custom'});if(!_tc.parentNode)document.body.appendChild(_tc);} return _tc; }
function showToast(msg,type='success'){
  const icons={success:'<i class="bi bi-check-circle-fill" style="color:#22c55e;font-size:1.1rem"></i>',error:'<i class="bi bi-x-circle-fill" style="color:#ef4444;font-size:1.1rem"></i>',info:'<i class="bi bi-info-circle-fill" style="color:var(--gold);font-size:1.1rem"></i>',warning:'<i class="bi bi-exclamation-triangle-fill" style="color:#f59e0b;font-size:1.1rem"></i>'};
  const el=document.createElement('div'); el.className='toast-item'; el.innerHTML=`${icons[type]||icons.info}<span>${msg}</span>`; getTC().appendChild(el);
  setTimeout(()=>{el.style.transition='.3s';el.style.opacity='0';el.style.transform='translateX(20px)';setTimeout(()=>el.remove(),300);},3500);
}

/* ── Auth ── */
function getCurrentUser(){try{return JSON.parse(localStorage.getItem('najah_user')||'null');}catch{return null;}}
function setCurrentUser(u){localStorage.setItem('najah_user',JSON.stringify(u));}
function logout(){localStorage.removeItem('najah_user');window.location.href='index.html';}

/* ── Nav User ── */
function renderNavUser() {
  const user=getCurrentUser(), slot=document.getElementById('navUserSlot'); if(!slot) return;
  const tog=buildThemeToggle();
  if(user){
    slot.innerHTML=tog+`<li class="nav-item dropdown ms-lg-1"><a class="btn-ghost d-flex align-items-center gap-2" href="#" data-bs-toggle="dropdown" style="padding:0.4rem 0.85rem;"><span class="nav-avatar">${(user.name||'U')[0].toUpperCase()}</span><span class="d-none d-lg-inline" style="font-size:.85rem;color:var(--text-secondary);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${user.name||'User'}</span><i class="bi bi-chevron-down" style="font-size:.65rem;color:var(--text-muted);"></i></a><ul class="dropdown-menu dropdown-menu-end" style="background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-md);min-width:190px;padding:.5rem;box-shadow:var(--shadow-deep);"><li><a class="dropdown-item" href="dashboard.html" style="color:var(--text-secondary);font-size:.85rem;padding:.6rem 1rem;border-radius:var(--radius-sm);display:flex;align-items:center;gap:.6rem;"><i class="bi bi-grid"></i> Dashboard</a></li>${user.role==='admin'?'<li><a class="dropdown-item" href="admin.html" style="color:var(--text-secondary);font-size:.85rem;padding:.6rem 1rem;border-radius:var(--radius-sm);display:flex;align-items:center;gap:.6rem;"><i class="bi bi-shield-check"></i> Admin Panel</a></li>':''}<li><hr class="dropdown-divider" style="border-color:var(--border-subtle);margin:.35rem 0;"></li><li><a class="dropdown-item" href="#" onclick="logout()" style="color:#ef4444;font-size:.85rem;padding:.6rem 1rem;border-radius:var(--radius-sm);display:flex;align-items:center;gap:.6rem;"><i class="bi bi-box-arrow-right"></i> Logout</a></li></ul></li>`;
  } else {
    slot.innerHTML=tog+`<li class="nav-item ms-lg-1"><a class="btn-outline-gold" href="login.html" style="padding:.42rem 1.1rem;font-size:.82rem;">Login</a></li><li class="nav-item ms-lg-1"><a class="btn-gold" href="register.html" style="padding:.42rem 1.1rem;font-size:.82rem;" data-magnetic>Sign Up</a></li>`;
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  applyTheme(getTheme(),false);
  initCounters(); initScrollReveal(); renderNavUser();
  initCursor(); initMagnetic(); initTilt();
  initScramble(); initParallax(); initMarquee();
  initWordReveal(); initHeroCanvas(); initPreloader();
});
