/* ============================================================
   WTE Flow — Main JavaScript
   Vanilla JS · No frameworks · No libraries
   ============================================================ */

(function () {
  'use strict';

  // ---- Respect reduced motion ----
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---- Sticky header scroll state ----
  const topbar = document.getElementById('topbar');
  let lastScroll = 0;
  function onScroll() {
    const y = window.scrollY;
    if (y > 50) {
      topbar.classList.add('scrolled');
    } else {
      topbar.classList.remove('scrolled');
    }
    lastScroll = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // ---- Smooth scroll for anchors ----
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 60;
      const top = target.getBoundingClientRect().top + window.scrollY - offset - 12;
      window.scrollTo({ top: top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

      // Close mobile nav if open
      closeMobileNav();
    });
  });

  // ---- Mobile hamburger ----
  const hamburger = document.getElementById('hamburger');
  const mobileNav = document.getElementById('mobile-nav');

  function closeMobileNav() {
    hamburger.classList.remove('active');
    mobileNav.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    const isOpen = mobileNav.classList.contains('open');
    if (isOpen) {
      closeMobileNav();
    } else {
      hamburger.classList.add('active');
      mobileNav.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  });

  // ---- Hero panel tabs ----
  const heroPanelTabs = document.querySelectorAll('.hero-panel__tab');
  const heroPanelContents = document.querySelectorAll('.hero-panel__content');

  heroPanelTabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = this.getAttribute('data-panel');
      heroPanelTabs.forEach(function (t) { t.classList.remove('active'); });
      heroPanelContents.forEach(function (c) { c.classList.remove('active'); });
      this.classList.add('active');
      document.getElementById('panel-' + target).classList.add('active');
    });
  });

  // ---- Contact form toggle ----
  const contactToggleBtns = document.querySelectorAll('.contact__toggle-btn');
  const contactForms = document.querySelectorAll('.contact-form');
  const formConfirmation = document.getElementById('form-confirmation');

  contactToggleBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const target = this.getAttribute('data-form');
      contactToggleBtns.forEach(function (b) { b.classList.remove('active'); });
      contactForms.forEach(function (f) { f.classList.remove('active'); });
      this.classList.add('active');
      document.getElementById('form-' + target).classList.add('active');
      // Hide confirmation if switching
      formConfirmation.classList.remove('show');
    });
  });

  // ---- Form submission ----
  contactForms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Basic validation
      var valid = true;
      var requiredFields = form.querySelectorAll('[required]');
      requiredFields.forEach(function (field) {
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#ef4444';
          field.addEventListener('input', function handler() {
            field.style.borderColor = '';
            field.removeEventListener('input', handler);
          });
        }
      });

      // Email validation
      var emailField = form.querySelector('input[type="email"]');
      if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
        valid = false;
        emailField.style.borderColor = '#ef4444';
      }

      if (!valid) return;

      // Collect form data
      var formData = new FormData(form);
      var formType = form.id === 'form-operator' ? 'Operator' : 'Supplier';
      formData.append('form_type', formType);

      // For now, just show confirmation
      // In production, replace with fetch() to your endpoint
      contactForms.forEach(function (f) { f.classList.remove('active'); });
      document.querySelector('.contact__toggle').style.display = 'none';
      formConfirmation.classList.add('show');

      // Log to console for dev
      console.log('Form submitted (' + formType + '):', Object.fromEntries(formData));
    });
  });

  // ---- FAQ accordion ----
  var faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function (item) {
    var question = item.querySelector('.faq-item__question');
    var answer = item.querySelector('.faq-item__answer');

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(function (other) {
        if (other !== item) {
          other.classList.remove('open');
          other.querySelector('.faq-item__question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-item__answer').style.maxHeight = null;
        }
      });

      if (isOpen) {
        item.classList.remove('open');
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = null;
      } else {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });

  // ---- Scroll reveal (blur-fade) ----
  if (!prefersReducedMotion) {
    var reveals = document.querySelectorAll('.reveal');
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    reveals.forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // If reduced motion, make everything visible immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  // ---- Animated Beam Hub Diagram ----
  var beamSvg = document.getElementById('beam-svg');
  var beamContainer = document.getElementById('beam-container');
  if (beamSvg && beamContainer) {
    function getCenter(el) {
      var rect = el.getBoundingClientRect();
      var cRect = beamContainer.getBoundingClientRect();
      return {
        x: rect.left - cRect.left + rect.width / 2,
        y: rect.top - cRect.top + rect.height / 2
      };
    }

    function drawBeams() {
      beamSvg.innerHTML = '';
      var center = document.getElementById('bn-center');
      if (!center) return;
      var cPos = getCenter(center);

      var leftNodes = ['bn-op1', 'bn-op2', 'bn-op3', 'bn-op4'];
      var rightNodes = ['bn-sup1', 'bn-sup2'];
      var allPaths = [];

      // Draw curved paths from left nodes to center
      leftNodes.forEach(function (id) {
        var node = document.getElementById(id);
        if (!node) return;
        var nPos = getCenter(node);
        var dx = cPos.x - nPos.x;
        var cp1x = nPos.x + dx * 0.4;
        var cp2x = nPos.x + dx * 0.6;
        var d = 'M' + nPos.x + ',' + nPos.y + ' C' + cp1x + ',' + nPos.y + ' ' + cp2x + ',' + cPos.y + ' ' + cPos.x + ',' + cPos.y;

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', 'beam-path');
        beamSvg.appendChild(path);
        allPaths.push({ path: path, reverse: false });
      });

      // Draw curved paths from center to right nodes
      rightNodes.forEach(function (id) {
        var node = document.getElementById(id);
        if (!node) return;
        var nPos = getCenter(node);
        var dx = nPos.x - cPos.x;
        var cp1x = cPos.x + dx * 0.4;
        var cp2x = cPos.x + dx * 0.6;
        var d = 'M' + cPos.x + ',' + cPos.y + ' C' + cp1x + ',' + cPos.y + ' ' + cp2x + ',' + nPos.y + ' ' + nPos.x + ',' + nPos.y;

        var path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', d);
        path.setAttribute('class', 'beam-path');
        beamSvg.appendChild(path);
        allPaths.push({ path: path, reverse: true });
      });

      // Animate dots along paths
      if (!prefersReducedMotion) {
        allPaths.forEach(function (item, idx) {
          var dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('class', 'beam-dot');
          dot.setAttribute('r', '3');
          beamSvg.appendChild(dot);

          var pathLen = item.path.getTotalLength();
          var duration = 2500 + idx * 300;
          var startTime = null;
          var delay = idx * 400;

          function animateDot(timestamp) {
            if (!startTime) startTime = timestamp;
            var elapsed = ((timestamp - startTime) - delay) % duration;
            if (elapsed < 0) elapsed += duration;
            var progress = elapsed / duration;
            var pt = item.path.getPointAtLength(progress * pathLen);
            dot.setAttribute('cx', pt.x);
            dot.setAttribute('cy', pt.y);
            dot.setAttribute('opacity', (progress > 0.05 && progress < 0.95) ? 1 : 0);
            requestAnimationFrame(animateDot);
          }
          requestAnimationFrame(animateDot);
        });
      }
    }

    // Draw on load and resize
    drawBeams();
    window.addEventListener('resize', function () {
      clearTimeout(window._beamResizeTimer);
      window._beamResizeTimer = setTimeout(drawBeams, 200);
    });
  }

  // ---- Card mouse-tracking spotlight effect ----
  if (!prefersReducedMotion) {
    var spotlightCards = document.querySelectorAll('.usecase-card, .capability-card');
    spotlightCards.forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        card.style.background = 'radial-gradient(400px circle at ' + x + 'px ' + y + 'px, rgba(91, 138, 245, 0.06), var(--bg-2) 70%)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.background = '';
      });
    });
  }

  // ---- Hero panel subtle tilt on mouse move ----
  if (!prefersReducedMotion) {
    var heroPanel = document.querySelector('.hero-panel');
    if (heroPanel) {
      heroPanel.addEventListener('mousemove', function (e) {
        var rect = heroPanel.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        heroPanel.style.transform = 'perspective(800px) rotateY(' + (x * 3) + 'deg) rotateX(' + (-y * 3) + 'deg)';
      });
      heroPanel.addEventListener('mouseleave', function () {
        heroPanel.style.transform = '';
        heroPanel.style.transition = 'transform 0.5s ease';
        setTimeout(function () { heroPanel.style.transition = ''; }, 500);
      });
    }
  }

  // ---- Active navigation section tracking ----
  var navLinks = document.querySelectorAll('.topbar__link');
  var sections = [];
  navLinks.forEach(function (link) {
    var href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      var section = document.querySelector(href);
      if (section) {
        sections.push({ el: section, link: link });
      }
    }
  });

  if (sections.length > 0) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var matchedSection = sections.find(function (s) { return s.el === entry.target; });
        if (matchedSection) {
          if (entry.isIntersecting) {
            navLinks.forEach(function (l) { l.classList.remove('active'); });
            matchedSection.link.classList.add('active');
          }
        }
      });
    }, {
      threshold: 0.3,
      rootMargin: '-60px 0px -40% 0px'
    });

    sections.forEach(function (s) {
      sectionObserver.observe(s.el);
    });
  }

})();
