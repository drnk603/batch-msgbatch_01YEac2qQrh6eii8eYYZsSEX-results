(function() {
  'use strict';

  if (typeof window.__app === 'undefined') {
    window.__app = {};
  }

  var app = window.__app;

  function debounce(func, wait) {
    var timeout;
    return function() {
      var context = this;
      var args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(function() {
        func.apply(context, args);
      }, wait);
    };
  }

  function throttle(func, limit) {
    var inThrottle;
    return function() {
      var context = this;
      var args = arguments;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(function() {
          inThrottle = false;
        }, limit);
      }
    };
  }

  function escapeHtml(text) {
    var map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
  }

  function initIntersectionObserver() {
    if (app.observerInited) return;
    app.observerInited = true;

    var observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px',
      threshold: 0.1
    };

    var animateOnScroll = function(entries, observer) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    };

    var observer = new IntersectionObserver(animateOnScroll, observerOptions);

    var elements = document.querySelectorAll('.c-card, .c-service-card, .c-case, .c-value-card, .c-team-card, .c-testimonial-card, .c-info-card, .c-cta-card, .c-section-header');
    elements.forEach(function(el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
      observer.observe(el);
    });
  }

  function initImageAnimations() {
    if (app.imageAnimationsInited) return;
    app.imageAnimationsInited = true;

    var images = document.querySelectorAll('img:not(.c-logo__img)');
    var observerOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.01
    };

    var imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var img = entry.target;
          img.style.opacity = '1';
          img.style.transform = 'scale(1)';
          imageObserver.unobserve(img);
        }
      });
    }, observerOptions);

    images.forEach(function(img) {
      if (!img.hasAttribute('loading')) {
        img.setAttribute('loading', 'lazy');
      }
      img.style.opacity = '0';
      img.style.transform = 'scale(0.95)';
      img.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
      imageObserver.observe(img);
    });
  }

  function initBurgerMenu() {
    if (app.burgerInited) return;
    app.burgerInited = true;

    var nav = document.querySelector('.c-nav#main-nav');
    var toggle = document.querySelector('.c-nav__toggle');
    var navList = document.querySelector('.c-nav__list');
    var body = document.body;

    if (!nav || !toggle || !navList) return;

    navList.style.maxHeight = '0';
    navList.style.height = 'calc(100vh - var(--header-h))';

    function openMenu() {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      body.classList.add('u-no-scroll');
      navList.style.maxHeight = 'calc(100vh - var(--header-h))';
    }

    function closeMenu() {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      body.classList.remove('u-no-scroll');
      navList.style.maxHeight = '0';
    }

    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      if (nav.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeMenu();
      }
    });

    document.addEventListener('click', function(e) {
      if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) {
        closeMenu();
      }
    });

    var navLinks = document.querySelectorAll('.c-nav__link');
    for (var i = 0; i < navLinks.length; i++) {
      navLinks[i].addEventListener('click', function() {
        if (nav.classList.contains('is-open')) {
          closeMenu();
        }
      });
    }

    window.addEventListener('resize', debounce(function() {
      if (window.innerWidth >= 1024 && nav.classList.contains('is-open')) {
        closeMenu();
      }
    }, 150));
  }

  function initSmoothScroll() {
    if (app.smoothScrollInited) return;
    app.smoothScrollInited = true;

    var links = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < links.length; i++) {
      var link = links[i];
      var href = link.getAttribute('href');

      if (href === '#' || href === '#!') continue;

      link.addEventListener('click', function(e) {
        var targetHref = this.getAttribute('href');
        var targetId = targetHref.substring(1);
        var targetElement = document.getElementById(targetId);

        if (targetElement) {
          e.preventDefault();

          var header = document.querySelector('.l-header');
          var headerHeight = header ? header.offsetHeight : 80;
          var targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

          window.scrollTo({
            top: targetPosition,
            behavior: 'smooth'
          });

          if (history.pushState) {
            history.pushState(null, null, targetHref);
          }
        }
      });
    }
  }

  function initScrollSpy() {
    if (app.scrollSpyInited) return;
    app.scrollSpyInited = true;

    var sections = document.querySelectorAll('[id]');
    var navLinks = document.querySelectorAll('.c-nav__link[href^="#"]');

    if (sections.length === 0 || navLinks.length === 0) return;

    var observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0
    };

    var currentActive = null;

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          var id = entry.target.getAttribute('id');
          navLinks.forEach(function(link) {
            var href = link.getAttribute('href');
            if (href === '#' + id) {
              if (currentActive) {
                currentActive.classList.remove('active');
                currentActive.removeAttribute('aria-current');
              }
              link.classList.add('active');
              link.setAttribute('aria-current', 'page');
              currentActive = link;
            }
          });
        }
      });
    }, observerOptions);

    sections.forEach(function(section) {
      observer.observe(section);
    });
  }

  function initActiveMenu() {
    if (app.activeMenuInited) return;
    app.activeMenuInited = true;

    var currentPath = window.location.pathname;
    var navLinks = document.querySelectorAll('.c-nav__link');

    for (var i = 0; i < navLinks.length; i++) {
      var link = navLinks[i];
      var linkPath = link.getAttribute('href');

      if (!linkPath || linkPath.startsWith('#')) continue;

      var normalizedLinkPath = linkPath.replace(/^.?//, '');
      var normalizedCurrentPath = currentPath.replace(/^//, '');

      if (normalizedCurrentPath === '' || normalizedCurrentPath === 'index.html') {
        if (normalizedLinkPath === '' || normalizedLinkPath === 'index.html' || normalizedLinkPath === '/') {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        }
      } else {
        if (normalizedLinkPath === normalizedCurrentPath) {
          link.setAttribute('aria-current', 'page');
          link.classList.add('active');
        }
      }
    }
  }

  function initRippleEffect() {
    if (app.rippleInited) return;
    app.rippleInited = true;

    var elements = document.querySelectorAll('.c-btn, .c-button, .btn, .c-nav__link, .c-card__link');

    elements.forEach(function(el) {
      el.style.position = 'relative';
      el.style.overflow = 'hidden';

      el.addEventListener('click', function(e) {
        var ripple = document.createElement('span');
        var rect = this.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var x = e.clientX - rect.left - size / 2;
        var y = e.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple-animation 0.6s ease-out';
        ripple.style.pointerEvents = 'none';

        this.appendChild(ripple);

        setTimeout(function() {
          ripple.remove();
        }, 600);
      });
    });

    var style = document.createElement('style');
    style.textContent = '@keyframes ripple-animation { to { transform: scale(4); opacity: 0; } }';
    document.head.appendChild(style);
  }

  function initButtonHoverEffects() {
    if (app.buttonHoverInited) return;
    app.buttonHoverInited = true;

    var buttons = document.querySelectorAll('.c-btn, .c-button, .btn');

    buttons.forEach(function(btn) {
      btn.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px)';
        this.style.boxShadow = '0 10px 24px 0 rgba(0, 0, 0, 0.15)';
      });

      btn.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  }

  function initCardHoverEffects() {
    if (app.cardHoverInited) return;
    app.cardHoverInited = true;

    var cards = document.querySelectorAll('.c-card, .c-service-card, .c-value-card, .c-team-card, .c-info-card');

    cards.forEach(function(card) {
      card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-8px) scale(1.02)';
        this.style.boxShadow = '0 20px 40px 0 rgba(0, 0, 0, 0.15)';
      });

      card.addEventListener('mouseleave', function() {
        this.style.transform = '';
        this.style.boxShadow = '';
      });
    });
  }

  function initCountUp() {
    if (app.countUpInited) return;
    app.countUpInited = true;

    var counters = document.querySelectorAll('[data-count]');
    if (counters.length === 0) return;

    var observerOptions = {
      root: null,
      threshold: 0.5
    };

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
          entry.target.classList.add('counted');
          var target = parseInt(entry.target.getAttribute('data-count'));
          var duration = 2000;
          var start = 0;
          var increment = target / (duration / 16);
          var current = start;

          var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
              entry.target.textContent = target;
              clearInterval(timer);
            } else {
              entry.target.textContent = Math.floor(current);
            }
          }, 16);

          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    counters.forEach(function(counter) {
      observer.observe(counter);
    });
  }

  function initFormValidation() {
    if (app.formsInited) return;
    app.formsInited = true;

    var form = document.getElementById('contact-form');
    if (!form) return;

    var patterns = {
      name: /^[a-zA-ZÀ-ÿs-']{2,50}$/,
      email: /^[^s@]+@[^s@]+.[^s@]+$/,
      phone: /^[ds+-()]{10,20}$/,
      message: /^.{10,}$/
    };

    function showError(field, message) {
      var errorDiv = field.parentNode.querySelector('.c-form__error');
      if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.className = 'c-form__error';
        field.parentNode.appendChild(errorDiv);
      }
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      field.classList.add('has-error');
      field.setAttribute('aria-invalid', 'true');
    }

    function clearError(field) {
      var errorDiv = field.parentNode.querySelector('.c-form__error');
      if (errorDiv) {
        errorDiv.style.display = 'none';
      }
      field.classList.remove('has-error');
      field.removeAttribute('aria-invalid');
    }

    function validateField(field) {
      var value = field.value.trim();
      var id = field.id;
      var isValid = true;

      clearError(field);

      if (field.hasAttribute('required') && !value) {
        showError(field, 'Dieses Feld ist erforderlich.');
        return false;
      }

      if (id === 'name' && value) {
        if (!patterns.name.test(value)) {
          showError(field, 'Bitte geben Sie einen gültigen Namen ein (2-50 Zeichen, nur Buchstaben).');
          isValid = false;
        }
      }

      if (id === 'email' && value) {
        if (!patterns.email.test(value)) {
          showError(field, 'Bitte geben Sie eine gültige E-Mail-Adresse ein.');
          isValid = false;
        }
      }

      if (id === 'phone' && value) {
        if (!patterns.phone.test(value)) {
          showError(field, 'Bitte geben Sie eine gültige Telefonnummer ein (10-20 Zeichen).');
          isValid = false;
        }
      }

      if (id === 'message' && value) {
        if (!patterns.message.test(value)) {
          showError(field, 'Die Nachricht muss mindestens 10 Zeichen lang sein.');
          isValid = false;
        }
      }

      if (field.type === 'checkbox' && field.hasAttribute('required')) {
        if (!field.checked) {
          showError(field, 'Sie müssen die Datenschutzerklärung akzeptieren.');
          isValid = false;
        }
      }

      return isValid;
    }

    var inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(function(input) {
      input.addEventListener('blur', function() {
        validateField(this);
      });

      input.addEventListener('input', function() {
        if (this.classList.contains('has-error')) {
          validateField(this);
        }
      });
    });

    form.addEventListener('submit', function(e) {
      e.preventDefault();

      var isFormValid = true;
      inputs.forEach(function(input) {
        if (!validateField(input)) {
          isFormValid = false;
        }
      });

      if (!isFormValid) {
        var firstError = form.querySelector('.has-error');
        if (firstError) {
          firstError.focus();
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      var submitBtn = form.querySelector('button[type="submit"]');
      var originalText = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<span style="display:inline-block;width:16px;height:16px;border:2px solid #fff;border-radius:50%;border-top-color:transparent;animation:spin 0.6s linear infinite;margin-right:8px;"></span>Wird gesendet...';

      var style = document.createElement('style');
      style.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
      document.head.appendChild(style);

      setTimeout(function() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
        
        window.location.href = 'thank_you.html';
      }, 1500);
    });
  }

  function initScrollToTop() {
    if (app.scrollTopInited) return;
    app.scrollTopInited = true;

    var button = document.createElement('button');
    button.innerHTML = '↑';
    button.className = 'scroll-to-top';
    button.setAttribute('aria-label', 'Nach oben scrollen');
    button.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#E67E22,#D35400);color:#fff;border:none;font-size:24px;cursor:pointer;opacity:0;visibility:hidden;transition:all 0.3s ease;z-index:999;box-shadow:0 4px 12px rgba(0,0,0,0.15);';

    document.body.appendChild(button);

    window.addEventListener('scroll', throttle(function() {
      if (window.pageYOffset > 300) {
        button.style.opacity = '1';
        button.style.visibility = 'visible';
      } else {
        button.style.opacity = '0';
        button.style.visibility = 'hidden';
      }
    }, 100));

    button.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    button.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-4px) scale(1.1)';
      this.style.boxShadow = '0 8px 20px rgba(0,0,0,0.2)';
    });

    button.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.boxShadow = '';
    });
  }

  function initAccordion() {
    if (app.accordionInited) return;
    app.accordionInited = true;

    var accordionButtons = document.querySelectorAll('.accordion-button');
    
    accordionButtons.forEach(function(button) {
      button.addEventListener('click', function() {
        var targetId = this.getAttribute('data-bs-target');
        var target = document.querySelector(targetId);
        
        if (!target) return;

        var isExpanded = this.getAttribute('aria-expanded') === 'true';

        if (isExpanded) {
          this.classList.add('collapsed');
          this.setAttribute('aria-expanded', 'false');
          target.classList.remove('show');
          target.style.maxHeight = '0';
        } else {
          this.classList.remove('collapsed');
          this.setAttribute('aria-expanded', 'true');
          target.classList.add('show');
          target.style.maxHeight = target.scrollHeight + 'px';
        }
      });
    });
  }

  function initPrivacyLinks() {
    if (app.privacyLinksInited) return;
    app.privacyLinksInited = true;

    var privacyLinks = document.querySelectorAll('a[href*="privacy"]');
    
    privacyLinks.forEach(function(link) {
      link.addEventListener('click', function(e) {
        var href = this.getAttribute('href');
        if (href && href.includes('privacy')) {
          this.style.transform = 'scale(0.98)';
          setTimeout(function() {
            link.style.transform = '';
          }, 150);
        }
      });
    });
  }

  function initHeaderScroll() {
    if (app.headerScrollInited) return;
    app.headerScrollInited = true;

    var header = document.querySelector('.l-header');
    if (!header) return;

    var lastScroll = 0;

    window.addEventListener('scroll', throttle(function() {
      var currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        header.style.boxShadow = '0 4px 12px 0 rgba(0, 0, 0, 0.1)';
      } else {
        header.style.boxShadow = '';
      }

      lastScroll = currentScroll;
    }, 100));
  }

  function initLinkAnimations() {
    if (app.linkAnimationsInited) return;
    app.linkAnimationsInited = true;

    var links = document.querySelectorAll('a:not(.c-btn):not(.c-button):not(.btn)');

    links.forEach(function(link) {
      link.addEventListener('mouseenter', function() {
        this.style.transition = 'all 0.2s ease-in-out';
        this.style.transform = 'translateX(2px)';
      });

      link.addEventListener('mouseleave', function() {
        this.style.transform = '';
      });
    });
  }

  function initParallax() {
    if (app.parallaxInited) return;
    app.parallaxInited = true;

    var parallaxElements = document.querySelectorAll('.c-hero__bg, .c-vision__media img, .c-goals__media img');
    
    if (parallaxElements.length === 0) return;

    window.addEventListener('scroll', throttle(function() {
      var scrolled = window.pageYOffset;

      parallaxElements.forEach(function(el) {
        var speed = 0.5;
        var yPos = -(scrolled * speed);
        el.style.transform = 'translateY(' + yPos + 'px)';
      });
    }, 16));
  }

  app.init = function() {
    initIntersectionObserver();
    initImageAnimations();
    initBurgerMenu();
    initSmoothScroll();
    initScrollSpy();
    initActiveMenu();
    initRippleEffect();
    initButtonHoverEffects();
    initCardHoverEffects();
    initCountUp();
    initFormValidation();
    initScrollToTop();
    initAccordion();
    initPrivacyLinks();
    initHeaderScroll();
    initLinkAnimations();
    initParallax();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', app.init);
  } else {
    app.init();
  }
})();
