// ── ROUTING ── //
const NAV_CLASSES = ['solid', 'solid-dark', 'solid-teal', 'solid-green', 'solid-olive'];
const PLANT_NAV = {
  'planta-mary':    'solid',
  'planta-amapola': 'solid-dark',
  'planta-corisa':  'solid-teal',
  'planta-ianca':   'solid-green',
  'planta-inalsa':  'solid-olive',
};
let currentPage = 'home';

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + id);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(initReveal, 100);
  }
  currentPage = id;
  navbar.classList.remove(...NAV_CLASSES);
  if (id === 'home') {
    updateNavSolid();
  } else {
    navbar.classList.add(PLANT_NAV[id] || 'solid');
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH = document.getElementById('navbar').offsetHeight;
  const offsets = {
    about:       -25,
    trayectoria: -25,
    plantas:     -25,
    novedades:   -25,
    contact:     -5
  };
  const offset = offsets[id] ?? 20;
  const top = el.getBoundingClientRect().top + window.scrollY - navH - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ── NAV ──
const navbar = document.getElementById('navbar');
function updateNavSolid() {
  if (currentPage !== 'home') return;
  navbar.classList.toggle('solid', window.scrollY > 60);
}
window.addEventListener('scroll', updateNavSolid);

// Make nav always solid on inner pages
function toggleMobile() {
  document.getElementById('mobileNav').classList.toggle('open');
}

// ── SCROLL REVEAL ──
function initReveal() {
  const els = document.querySelectorAll('.page.active .reveal');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  els.forEach(el => { el.classList.remove('in'); io.observe(el); });
}
initReveal();

// ── COUNTER ANIMATION ──
function animateCounters() {
  document.querySelectorAll('.m-num[data-target]').forEach(el => {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const duration = 1800;
    const start = performance.now();
    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(ease * target).toLocaleString('es-VE') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
// Trigger counter when trayectoria is visible
const trayEl = document.getElementById('trayectoria');
if (trayEl) {
  const co = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animateCounters(); co.disconnect(); } });
  }, { threshold: 0.3 });
  co.observe(trayEl);
}

// ── FORM ──
function sendForm(btn) {
  const txt = btn.textContent;
  btn.textContent = '✓ Enviado — te contactaremos pronto';
  btn.style.background = '#27ae60';
  btn.disabled = true;
  setTimeout(() => { btn.textContent = txt; btn.style.background = ''; btn.disabled = false; }, 4500);
}

(function () {
  var MARY_DATA = {
    welcome: {
      msg: '¡Hola! Soy <strong>Mary</strong>, tu asistente virtual de <strong>Alimentos Mary</strong>.<br>¿En qué puedo ayudarte hoy?',
      chips: [
        { label: '💼 Empleos y Vacantes', action: 'empleos' }
      ]
    },
    empleos: {
      msg: '¡Nos alegra tu interés en formar parte de <strong>Alimentos Mary</strong>! Consulta nuestras <strong>vacantes activas</strong> directamente en LinkedIn y postúlate desde allí.<br><br><a href="https://www.linkedin.com/company/alimentos-mary/jobs/" target="_blank" rel="noopener" style="display:inline-block;margin-top:6px;padding:8px 14px;background:#0a66c2;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">🔗 Ver vacantes en LinkedIn</a>',
      chips: [{ label: '⬅ Volver al inicio', action: 'welcome' }]
    }
  };

  var KEYWORDS = {
    empleos: ['empleo','trabajo','vacante','postular','cv','curriculum','contratar','plaza','puesto','aplicar','rrhh','recursos humanos','linkedin']
  };

  var maryIsOpen = false;
  var maryFirstOpen = true;

  window.maryToggle = function () {
    maryIsOpen = !maryIsOpen;
    var win   = document.getElementById('chat-mary-win');
    var dot   = document.getElementById('mary-dot');
    var iOpen = document.getElementById('mbt-open');
    var lbl   = document.getElementById('mbt-label');
    var iClose= document.getElementById('mbt-close');
    var btn   = document.getElementById('chat-mary-btn');

    if (maryIsOpen) {
      win.classList.add('mary-open');
      iOpen.style.display  = 'none';
      lbl.style.display    = 'none';
      iClose.style.display = 'inline';
      dot.style.display    = 'none';
      btn.classList.add('mary-btn-compact');
      if (maryFirstOpen) {
        maryFirstOpen = false;
        setTimeout(function(){ maryRespond('welcome'); }, 320);
      }
      setTimeout(function(){ var i=document.getElementById('cw-input'); if(i) i.focus(); }, 360);
    } else {
      win.classList.remove('mary-open');
      iOpen.style.display  = '';
      lbl.style.display    = '';
      iClose.style.display = 'none';
      btn.classList.remove('mary-btn-compact');
    }
  };

  function maryRespond(action) {
    var data = MARY_DATA[action];
    if (!data) return;
    showTyping();
    setTimeout(function () {
      removeTyping();
      addBotMsg(data.msg);
      setChips(data.chips);
    }, 680);
  }

  function showTyping() {
    var msgs = document.getElementById('cw-msgs');
    var d = document.createElement('div');
    d.className = 'cw-msg bot cw-typing'; d.id = 'cw-typing-ind';
    d.innerHTML = '<span></span><span></span><span></span>';
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function removeTyping() {
    var t = document.getElementById('cw-typing-ind');
    if (t) t.remove();
  }

  function addBotMsg(html) {
    var msgs = document.getElementById('cw-msgs');
    var d = document.createElement('div');
    d.className = 'cw-msg bot'; d.innerHTML = html;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function addUsrMsg(text) {
    var msgs = document.getElementById('cw-msgs');
    var d = document.createElement('div');
    d.className = 'cw-msg usr'; d.textContent = text;
    msgs.appendChild(d);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function setChips(chips) {
    var c = document.getElementById('cw-chips');
    c.innerHTML = '';
    chips.forEach(function (ch) {
      var btn = document.createElement('button');
      btn.className = 'cw-chip';
      btn.textContent = ch.label;
      btn.onclick = function () {
        addUsrMsg(ch.label);
        setChips([]);
        maryRespond(ch.action);
      };
      c.appendChild(btn);
    });
  }

  window.marySend = function () {
    var input = document.getElementById('cw-input');
    var text  = (input.value || '').trim();
    if (!text) return;
    input.value = '';
    addUsrMsg(text);
    setChips([]);

    var lower  = text.toLowerCase();
    var action = null;
    var keys   = Object.keys(KEYWORDS);
    for (var i = 0; i < keys.length; i++) {
      var key   = keys[i];
      var words = KEYWORDS[key];
      for (var j = 0; j < words.length; j++) {
        if (lower.indexOf(words[j]) !== -1) { action = key; break; }
      }
      if (action) break;
    }

    if (action) {
      maryRespond(action);
    } else {
      showTyping();
      setTimeout(function () {
        removeTyping();
        addBotMsg('Lo siento, no entendí tu consulta. Por el momento puedo ayudarte con información sobre <strong>empleos y vacantes</strong>. ¿En qué puedo ayudarte?');
        setChips(MARY_DATA.welcome.chips);
      }, 680);
    }
  };
})();
