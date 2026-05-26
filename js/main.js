// ── ROUTING ── //
function showPage(id) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const el = document.getElementById('page-' + id);
  if (el) {
    el.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Re-run reveals for inner pages
    setTimeout(initReveal, 100);
  }
  // Nav always solid on inner pages
  if (id === 'home') {
    updateNavSolid();
  } else {
    document.getElementById('navbar').classList.add('solid');
  }
}

function scrollToSection(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const navH = document.getElementById('navbar').offsetHeight;
  // Offset extra por sección — ajusta cada número si necesitas más/menos aire
  const offsets = {
    about:       -25,
    trayectoria: -25,
    plantas:     -25,
    novedades:   -25,
    contact:     -5   // contacto tiene menos padding, usa offset menor
  };
  const offset = offsets[id] ?? 20;
  const top = el.getBoundingClientRect().top + window.scrollY - navH - offset;
  window.scrollTo({ top, behavior: 'smooth' });
}

// ── NAV ──
const navbar = document.getElementById('navbar');
function updateNavSolid() {
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

/* ════════ FORMULARIO DE CONTACTO — VALIDACIÓN Y ENVÍO ════════════════════════════════ */

// ── Contadores de caracteres en tiempo real ──
(function() {
  const pairs = [
    { inputId: 'cf-asunto',  countId: 'char-asunto',  max: 100  },
    { inputId: 'cf-mensaje', countId: 'char-mensaje', max: 1200 }
  ];
  document.addEventListener('DOMContentLoaded', () => {
    pairs.forEach(({ inputId, countId, max }) => {
      const el = document.getElementById(inputId);
      const counter = document.getElementById(countId);
      if (!el || !counter) return;
      el.addEventListener('input', () => {
        const len = el.value.length;
        counter.textContent = `${len} / ${max}`;
        counter.style.color = len > max * 0.9
          ? (len >= max ? '#ff6b6b' : '#ffb74d')
          : 'rgba(255,255,255,.3)';
      });
    });
  });
})();

// ── Validaciones individuales ──
function validarNombre(val) {
  const limpio = val.trim();
  if (!limpio) return 'El nombre es obligatorio.';
  if (!/^[a-zA-ZáéíóúÁÉÍÓÚàèìòùÀÈÌÒÙäëïöüÄËÏÖÜñÑ\s'\-]+$/.test(limpio))
    return 'Solo se permiten letras y espacios.';
  if (limpio.length < 2) return 'El nombre debe tener al menos 2 caracteres.';
  return '';
}

function validarEmail(val) {
  const limpio = val.trim();
  if (!limpio) return 'El correo es obligatorio.';
  // RFC 5322 básico
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!re.test(limpio)) return 'Ingresa un correo electrónico válido.';
  return '';
}

function validarAsunto(val) {
  const limpio = val.trim();
  if (!limpio) return 'El asunto es obligatorio.';
  if (limpio.length < 4) return 'El asunto es demasiado corto.';
  if (limpio.length > 100) return 'El asunto no puede superar los 100 caracteres.';
  return '';
}

function validarMensaje(val) {
  const limpio = val.trim();
  if (!limpio) return 'El mensaje es obligatorio.';
  if (limpio.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
  if (limpio.length > 1200) return 'El mensaje no puede superar los 1.200 caracteres.';
  return '';
}

// ── Mostrar/limpiar error en campo ──
function setFieldState(inputEl, errorEl, msg) {
  if (msg) {
    inputEl.classList.add('invalid');
    inputEl.classList.remove('valid');
    errorEl.textContent = msg;
  } else {
    inputEl.classList.remove('invalid');
    inputEl.classList.add('valid');
    errorEl.textContent = '';
  }
  return !msg;
}

// ── Validación en tiempo real al salir del campo ──
document.addEventListener('DOMContentLoaded', () => {
  const fields = [
    { id: 'cf-nombre',  errId: 'err-nombre',  fn: validarNombre  },
    { id: 'cf-email',   errId: 'err-email',   fn: validarEmail   },
    { id: 'cf-asunto',  errId: 'err-asunto',  fn: validarAsunto  },
    { id: 'cf-mensaje', errId: 'err-mensaje', fn: validarMensaje }
  ];
  fields.forEach(({ id, errId, fn }) => {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!el || !err) return;

    // Bloquear números en campo nombre
    if (id === 'cf-nombre') {
      el.addEventListener('keypress', e => {
        const char = String.fromCharCode(e.which);
        if (/[0-9]/.test(char)) e.preventDefault();
      });
      el.addEventListener('input', () => {
        // Eliminar números si se pegan con paste
        el.value = el.value.replace(/[0-9]/g, '');
      });
    }

    el.addEventListener('blur', () => {
      setFieldState(el, err, fn(el.value));
    });
    el.addEventListener('input', () => {
      if (el.classList.contains('invalid')) {
        setFieldState(el, err, fn(el.value));
      }
    });
  });
});

// ── Envío del formulario ──
function submitContactForm() {
  const nombre  = document.getElementById('cf-nombre');
  const email   = document.getElementById('cf-email');
  const asunto  = document.getElementById('cf-asunto');
  const mensaje = document.getElementById('cf-mensaje');
  const btn     = document.getElementById('cf-btn');
  const status  = document.getElementById('form-status');

  const errNombre  = document.getElementById('err-nombre');
  const errEmail   = document.getElementById('err-email');
  const errAsunto  = document.getElementById('err-asunto');
  const errMensaje = document.getElementById('err-mensaje');

  // Validar todos los campos
  const v1 = setFieldState(nombre,  errNombre,  validarNombre(nombre.value));
  const v2 = setFieldState(email,   errEmail,   validarEmail(email.value));
  const v3 = setFieldState(asunto,  errAsunto,  validarAsunto(asunto.value));
  const v4 = setFieldState(mensaje, errMensaje, validarMensaje(mensaje.value));

  if (!v1 || !v2 || !v3 || !v4) {
    // Hacer scroll al primer error
    const firstInvalid = document.querySelector('#contactForm .invalid');
    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // Deshabilitar botón mientras envía
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  status.className = 'sending';
  status.textContent = '⏳ Enviando tu mensaje, por favor espera...';
  status.style.display = 'block';

  // Construir FormData
  const formData = new FormData();
  formData.append('nombre',  nombre.value.trim());
  formData.append('email',   email.value.trim());
  formData.append('asunto',  asunto.value.trim());
  formData.append('mensaje', mensaje.value.trim());

  // Enviar al script PHP
  fetch('send_mail.php', {
    method: 'POST',
    body: formData
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      status.className = 'success';
      status.innerHTML = '✅ ¡Mensaje enviado! Nos pondremos en contacto contigo a la brevedad.';
      // Limpiar form
      ['cf-nombre','cf-email','cf-asunto','cf-mensaje'].forEach(id => {
        const el = document.getElementById(id);
        el.value = '';
        el.classList.remove('valid','invalid');
      });
      document.getElementById('char-asunto').textContent  = '0 / 100';
      document.getElementById('char-mensaje').textContent = '0 / 1200';
      btn.textContent = 'Enviar Mensaje →';
      btn.disabled = false;
    } else {
      throw new Error(data.msg || 'Error desconocido');
    }
  })
  .catch(err => {
    status.className = 'error';
    status.innerHTML = '❌ Hubo un problema al enviar. Por favor intenta de nuevo o escríbenos directamente a <a href="mailto:info@alimentosmary.com" style="color:#ff6b6b">info@alimentosmary.com</a>';
    btn.textContent = 'Enviar Mensaje →';
    btn.disabled = false;
    console.error('Contact form error:', err);
  });
}

(function () {
  var MARY_DATA = {
    welcome: {
      msg: '¡Hola! Soy <strong>Mary</strong>, tu asistente virtual de <strong>Alimentos Mary</strong>.<br>¿En qué puedo ayudarte hoy?',
      chips: [
        { label: '💼 Empleos y Vacantes', action: 'empleos' },
        { label: '📋 Propuesta Comercial', action: 'comercial' },
        { label: '💻 Área de TI', action: 'tecnologia' }
      ]
    },
    empleos: {
      msg: 'Para consultas sobre <strong>empleos y vacantes</strong> en el Grupo Alimentos Mary, comunícate con nuestro departamento de <strong>Recursos Humanos</strong>:<br><br>📧 <a href="mailto:captacion@alimentosmary.com">captacion@alimentosmary.com</a><br>🕐 Lunes a Viernes: 8:00 AM – 5:00 PM<br><br>Por favor indica el cargo de interés y adjunta tu CV actualizado.',
      chips: [{ label: '⬅ Volver al inicio', action: 'welcome' }]
    },
    comercial: {
      msg: 'Para enviar <strong>propuestas comerciales</strong>, alianzas o nuevos negocios, contacta a nuestro equipo de <strong>Mercadeo</strong>:<br><br>📧 <a href="mailto:lsequera@alimentosmary.com">lsequera@alimentosmary.com</a><br><br>🕐 Lunes a Viernes: 8:00 AM – 5:00 PM',
      chips: [{ label: '⬅ Volver al inicio', action: 'welcome' }]
    },
    tecnologia: {
      msg: '💻 <strong>Área de TI</strong><br><br>📧 <a href="mailto:jrangel@alimentosmary.com">jrangel@alimentosmary.com</a><br>🕐 Lunes a Viernes: 8:00 AM – 5:00 PM<br><br>Para: soporte técnico, sistemas de información y requerimientos tecnológicos.',
      chips: [{ label: '⬅ Volver al inicio', action: 'welcome' }]
    }
  };

  var KEYWORDS = {
    empleos:   ['empleo','trabajo','vacante','postular','cv','curriculum','contratar','plaza','puesto','aplicar','rrhh','recursos humanos'],
    comercial: ['propuesta','comercial','negocio','alianza','distribuidor','proveedor','cliente','convenio','mercadeo','marketing'],
    tecnologia:['tecnologia','tecnología','soporte','sistemas','informatica','informática',' ti ','area ti','área ti','tech','it']
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
        addBotMsg('Lo siento, solo puedo ayudarte con información sobre <strong>empleos</strong>, <strong>propuestas comerciales</strong>, <strong>horarios</strong> y <strong>contacto de departamentos</strong>. ¿En qué área puedo ayudarte?');
        setChips(MARY_DATA.welcome.chips);
      }, 680);
    }
  };
})();
