/**
 * IMPERIUM PROVIDENCE TECHNOLOGIES
 * Interactive Logic, Particle Canvas & Micro-Interactions (Refined Edition)
 */

document.addEventListener('DOMContentLoaded', () => {
  initParticleCanvas();
  initNavigation();
  initCounters();
  initTechFilter();
  initTechSearch();
  initCallbackForm();
  initCopyActions();
  initBackToTop();
  init3DTilt();
});

/* ==========================================================================
   INTERACTIVE CYBER PARTICLE CANVAS
   ========================================================================== */
function initParticleCanvas() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];
  let mouse = { x: null, y: null, radius: 140 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.x;
    mouse.y = e.y;
  });

  window.addEventListener('mouseout', () => {
    mouse.x = null;
    mouse.y = null;
  });

  const particleCount = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 16000), 75);

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = (Math.random() - 0.5) * 0.7;
      this.radius = Math.random() * 2 + 1;
      this.isGold = Math.random() > 0.82;
      this.color = this.isGold ? 'rgba(245, 158, 11, ' : 'rgba(0, 210, 255, ';
      this.baseAlpha = Math.random() * 0.5 + 0.2;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;

      if (mouse.x !== null && mouse.y !== null) {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x -= (dx / dist) * force * 3;
          this.y -= (dy / dist) * force * 3;
        }
      }
    }

    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = this.color + this.baseAlpha + ')';
      ctx.shadowBlur = 10;
      ctx.shadowColor = this.isGold ? '#f59e0b' : '#00d2ff';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  let animationId;
  function animate() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();

      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          const alpha = (1 - dist / 130) * 0.22;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = particles[i].isGold || particles[j].isGold 
            ? `rgba(245, 158, 11, ${alpha * 0.8})` 
            : `rgba(0, 210, 255, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    animationId = requestAnimationFrame(animate);
  }

  animate();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationId);
    } else {
      animate();
    }
  });
}

/* ==========================================================================
   NAVIGATION & SCROLL SPY
   ========================================================================== */
function initNavigation() {
  const header = document.querySelector('.site-header');
  const toggle = document.querySelector('.mobile-nav-toggle');
  const menu = document.querySelector('.nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('open');
      const isOpen = menu.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
      toggle.innerHTML = isOpen ? '✕' : '☰';
    });

    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.innerHTML = '☰';
      });
    });
  }

  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  });
}

/* ==========================================================================
   ANIMATED STAT COUNTERS
   ========================================================================== */
function initCounters() {
  const statCards = document.querySelectorAll('.stat-card');
  if (!statCards.length) return;

  let hasAnimated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimated) {
        hasAnimated = true;
        animateAllCounters();
      }
    });
  }, { threshold: 0.3 });

  const statsSection = document.querySelector('.stats-section');
  if (statsSection) observer.observe(statsSection);

  function animateAllCounters() {
    const counterElements = document.querySelectorAll('.counter-val');
    counterElements.forEach(el => {
      const target = parseFloat(el.getAttribute('data-target'));
      const decimals = parseInt(el.getAttribute('data-decimals') || '0', 10);
      const prefix = el.getAttribute('data-prefix') || '';
      const suffix = el.getAttribute('data-suffix') || '';
      const duration = 2000;
      const startTime = performance.now();

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const ease = 1 - (1 - progress) * (1 - progress);
        const currentVal = target * ease;

        el.textContent = `${prefix}${currentVal.toFixed(decimals)}${suffix}`;

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = `${prefix}${target.toFixed(decimals)}${suffix}`;
        }
      }

      requestAnimationFrame(update);
    });
  }
}

/* ==========================================================================
   TECHNOLOGY STACK FILTER & SEARCH
   ========================================================================== */
function initTechFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const techCards = document.querySelectorAll('.tech-card');

  if (!filterBtns.length || !techCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      techCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 20);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(15px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      });
    });
  });
}

function initTechSearch() {
  const searchInput = document.getElementById('tech-search-input');
  const techCards = document.querySelectorAll('.tech-card');

  if (!searchInput || !techCards.length) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    techCards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (!query || text.includes(query)) {
        card.style.display = 'flex';
        card.style.opacity = '1';
      } else {
        card.style.display = 'none';
        card.style.opacity = '0';
      }
    });
  });
}

/* ==========================================================================
   UI-LEVEL CALLBACK & CONSULTATION FORM (NO BACKEND STORAGE)
   ========================================================================== */
function initCallbackForm() {
  const form = document.getElementById('callback-form');
  const successBox = document.getElementById('callback-success');
  const submitBtn = document.getElementById('submit-callback-btn');
  const resetBtn = document.getElementById('submit-another-btn');
  const ticketRefSpan = document.getElementById('ticket-ref');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('cb-name').value.trim();
    const email = document.getElementById('cb-email').value.trim();
    const phoneCode = document.getElementById('cb-phone-code').value;
    const phoneNumber = document.getElementById('cb-phone').value.trim();
    const service = document.getElementById('cb-service').value;
    const timeframe = document.getElementById('cb-timeframe').value;
    const query = document.getElementById('cb-query').value.trim();

    if (!name || !email || !phoneNumber) {
      showToast('Please provide your Name, Email, and Phone Number.');
      return;
    }

    const fullPhone = `${phoneCode} ${phoneNumber}`;

    // Button loading state
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <svg class="spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.25"></circle>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="#000"></path>
      </svg>
      <span>Logging Consultation Dispatch...</span>
    `;

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;

      const randomTicket = 'IPT-' + Math.floor(100000 + Math.random() * 900000);
      if (ticketRefSpan) ticketRefSpan.textContent = randomTicket;

      const clientNameSpan = document.getElementById('confirm-name');
      if (clientNameSpan) clientNameSpan.textContent = name;

      const clientContactSpan = document.getElementById('confirm-contact');
      if (clientContactSpan) clientContactSpan.textContent = `${email} | ${fullPhone}`;

      const clientServiceSpan = document.getElementById('confirm-service');
      if (clientServiceSpan) clientServiceSpan.textContent = service;

      form.style.display = 'none';
      if (successBox) successBox.classList.add('active');

      successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Callback request logged successfully!');
    }, 1200);
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      form.reset();
      if (successBox) successBox.classList.remove('active');
      form.style.display = 'block';
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  }
}

/* ==========================================================================
   CLIPBOARD ACTIONS & TOAST
   ========================================================================== */
function initCopyActions() {
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const email = 'imperium.providencetech@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast('Email copied to clipboard: ' + email);
      }).catch(() => {
        showToast('imperium.providencetech@gmail.com');
      });
    });
  }

  const copyTicketBtn = document.getElementById('copy-ticket-btn');
  if (copyTicketBtn) {
    copyTicketBtn.addEventListener('click', () => {
      const ticket = document.getElementById('ticket-ref').textContent;
      navigator.clipboard.writeText(ticket).then(() => {
        showToast('Reference ticket copied: ' + ticket);
      });
    });
  }
}

function showToast(message) {
  let toast = document.getElementById('toast-msg');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast-msg';
    toast.className = 'toast-notification';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

/* ==========================================================================
   BACK TO TOP BUTTON
   ========================================================================== */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      btn.classList.add('show');
    } else {
      btn.classList.remove('show');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ==========================================================================
   3D CARD TILT EFFECT (DESKTOP)
   ========================================================================== */
function init3DTilt() {
  if (window.innerWidth < 1024) return;

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -6;
      const rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });
}
