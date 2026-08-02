/* =============================================
   ALBERTO DAVIS — PORTFOLIO — main.js
   ============================================= */

'use strict';

/* ─── CUSTOM CURSOR ─── */
(function initCursor() {
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let mx = 0, my = 0;  // mouse position
  let fx = 0, fy = 0;  // follower position

  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    cursor.style.transform = `translate(${mx - 4}px, ${my - 4}px)`;
  });

  // Smooth follower with rAF
  function animateFollower() {
    fx += (mx - fx - 16) * 0.12;
    fy += (my - fy - 16) * 0.12;
    follower.style.transform = `translate(${fx}px, ${fy}px)`;
    requestAnimationFrame(animateFollower);
  }
  animateFollower();

  // Hover effect on interactive elements
  const hoverEls = document.querySelectorAll('a, button, .cert-card, .contact-card, .project-item');
  hoverEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.classList.add('hover');
      follower.classList.add('hover');
    });
    el.addEventListener('mouseleave', () => {
      cursor.classList.remove('hover');
      follower.classList.remove('hover');
    });
  });
})();


/* ─── NAVBAR ─── */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('nav-burger');
  const menu   = document.getElementById('mobile-menu');
  const mLinks = document.querySelectorAll('.mobile-link');

  // Scroll state
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    highlightNavLinks();
  });

  // Burger toggle
  burger.addEventListener('click', () => {
    burger.classList.toggle('open');
    menu.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('open') ? 'hidden' : '';
  });

  // Close on mobile link click
  mLinks.forEach(link => {
    link.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active nav link highlighting
  function highlightNavLinks() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollY  = window.scrollY + 120;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }
})();


/* ─── SCROLL REVEAL ─── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal-up');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || 0, 10);
        setTimeout(() => el.classList.add('visible'), delay);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();


/* ─── CERTIFICATES SHOW/HIDE ─── */
function initCertToggle() {
  const toggleBtn = document.getElementById('toggle-certs');
  const hiddenCerts = document.querySelectorAll('.cert-hidden');
  if (!toggleBtn || !hiddenCerts.length) return;

  let expanded = false;

  toggleBtn.setAttribute('aria-expanded', 'false');

  toggleBtn.addEventListener('click', () => {
    expanded = !expanded;
    toggleBtn.textContent = expanded ? 'Ver menos ↑' : 'Ver todos los certificados ↓';
    toggleBtn.setAttribute('aria-expanded', String(expanded));

    hiddenCerts.forEach(card => {
      if (expanded) {
        card.classList.add('cert-visible');
        requestAnimationFrame(() => card.classList.add('visible'));
        return;
      }

      card.classList.remove('visible');
      window.setTimeout(() => {
        if (!expanded) {
          card.classList.remove('cert-visible');
        }
      }, 750);
    });
  });
}

initCertToggle();


/* ─── PROJECT CONTACT FORM ─── */
(function initProjectContactForm() {
  const form = document.getElementById('project-contact-form');
  const toggle = document.getElementById('contact-form-toggle');
  const panel = document.getElementById('contact-form-panel');
  const contactSection = document.getElementById('contact');
  const contactLinks = contactSection?.querySelector('.contact-links');
  if (!form || !toggle || !panel || !contactSection || !contactLinks) return;

  const submitBtn = form.querySelector('.project-form-submit');
  const status = document.getElementById('contact-form-status');
  const recipient = 'albertoantonio.davisc@gmail.com';
  const endpoint = `https://formsubmit.co/ajax/${recipient}`;
  const requiredMessages = {
    'contact-name': 'Ingresa tu nombre.',
    'contact-email': 'Ingresa un correo electrónico válido.',
    'contact-project-type': 'Selecciona el tipo de proyecto.',
    'contact-description': 'Cuéntame brevemente sobre el proyecto.'
  };

  function resetFormState() {
    form.reset();
    form.querySelectorAll('input, select, textarea').forEach(field => setError(field));
    status.className = 'form-status';
    status.textContent = '';
  }

  function closeForm() {
    panel.hidden = true;
    toggle.hidden = false;
    toggle.setAttribute('aria-expanded', 'false');
    contactLinks.classList.remove('is-form-open');
    resetFormState();
  }

  toggle.addEventListener('click', () => {
    panel.hidden = false;
    toggle.hidden = true;
    toggle.setAttribute('aria-expanded', 'true');
    contactLinks.classList.add('is-form-open');
    panel.querySelector('input')?.focus();
  });

  const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting && !panel.hidden) closeForm();
    });
  }, { threshold: 0.05 });

  sectionObserver.observe(contactSection);

  function setError(field, message = '') {
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    const wrapper = field.closest('.form-field');
    if (error) error.textContent = message;
    if (wrapper) wrapper.classList.toggle('has-error', Boolean(message));
    field.setAttribute('aria-invalid', String(Boolean(message)));
  }

  function validateField(field) {
    const value = field.value.trim();
    let message = '';

    if (field.required && !value) {
      message = requiredMessages[field.id];
    } else if (field.type === 'email' && value && !field.validity.valid) {
      message = 'Ingresa un correo electrónico válido.';
    }

    setError(field, message);
    return !message;
  }

  form.querySelectorAll('input, select, textarea').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    status.className = 'form-status';

    const requiredFields = form.querySelectorAll('[required]');
    const isValid = [...requiredFields].map(validateField).every(Boolean);
    if (!isValid) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';

    const formData = Object.fromEntries(new FormData(form).entries());
    const payload = {
      ...formData,
      _subject: 'Nueva solicitud desde el portafolio de Alberto Davis'
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Request failed');

      form.reset();
      form.querySelectorAll('[aria-invalid="true"]').forEach(field => setError(field));
      status.textContent = 'Solicitud enviada correctamente. Me pondré en contacto contigo pronto.';
      status.className = 'form-status is-visible is-success';
    } catch (error) {
      status.textContent = 'No se pudo enviar la solicitud. Inténtalo nuevamente o contáctame por WhatsApp.';
      status.className = 'form-status is-visible is-error';
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Enviar solicitud <span aria-hidden="true">→</span>';
    }
  });
})();


/* ─── SKILL BARS ─── */
(function initSkillBars() {
  const container = document.querySelector('.about-skills');
  if (!container) return;

  const bars = container.querySelectorAll('.skill-fill');
  bars.forEach(bar => { bar.style.width = '0%'; });

  function animateBars() {
    bars.forEach((bar, i) => {
      const width = bar.dataset.width || 0;
      setTimeout(() => {
        bar.style.width = `${width}%`;
      }, i * 80);
    });
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      if (mutation.target.classList.contains('visible')) {
        setTimeout(animateBars, 200);
        observer.disconnect();
      }
    });
  });

  observer.observe(container, {
    attributes: true,
    attributeFilter: ['class']
  });
})();


/* ─── HERO TEXT STAGGER ON LOAD ─── */
(function initHeroLoad() {
  const heroItems = document.querySelectorAll('.hero-content .reveal-up');

  window.addEventListener('load', () => {
    heroItems.forEach((el, i) => {
      const delay = parseInt(el.dataset.delay || (i * 100), 10);
      setTimeout(() => el.classList.add('visible'), delay + 200);
    });
  });
})();


/* ─── SMOOTH ANCHOR SCROLL ─── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target   = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const navH   = document.getElementById('nav').offsetHeight;
      const offset = target.getBoundingClientRect().top + window.scrollY - navH;

      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
})();


/* ─── CERT CARDS — tilt effect on hover ─── */
(function initCertTilt() {
  const cards = document.querySelectorAll('.cert-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect   = card.getBoundingClientRect();
      const cx     = rect.left + rect.width  / 2;
      const cy     = rect.top  + rect.height / 2;
      const dx     = (e.clientX - cx) / (rect.width  / 2);
      const dy     = (e.clientY - cy) / (rect.height / 2);
      const tiltX  = dy * -6;
      const tiltY  = dx *  6;
      card.style.transform = `translateY(-6px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
})();


/* ─── COUNTER ANIMATION (contact section) ─── */
(function initCounters() {
  // no numeric counters in current layout — placeholder for future use
})();


/* ─── TICKER DUPLICATION (ensure seamless loop) ─── */
(function initTicker() {
  const track = document.querySelector('.ticker-track');
  if (!track) return;
  // Already duplicated in HTML via two identical sets.
  // Ensure CSS animation duration is consistent.
})();


/* ─── NOISE BG CANVAS (optional ambient effect) ─── */
(function initNoiseCanvas() {
  // The noise is handled via SVG filter in CSS for performance.
})();


/* ─── PAGE TRANSITION FADE-IN ─── */
(function initPageFade() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';

  window.addEventListener('load', () => {
    setTimeout(() => {
      document.body.style.opacity = '1';
    }, 50);
  });
})();


/* ─── FOOTER YEAR ─── */
(function initFooterYear() {
  const copyEl = document.querySelector('.footer-copy');
  if (copyEl) {
    const year = new Date().getFullYear();
    copyEl.textContent = `© ${year} ZenReverse. Todos los derechos reservados.`;
  }
})();
