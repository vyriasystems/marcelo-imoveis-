(function () {
  if (!document.body.classList.contains('page-imovel')) return;

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var header = document.querySelector('.site-header');
  var progressBar = document.getElementById('scroll-progress');
  var revealObserver = null;
  var parallaxItems = [];
  var rafScroll = null;

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function prepareChildren(el) {
    var kids = [];
    if (el.matches('[data-reveal="stagger"]')) {
      kids = Array.prototype.slice.call(el.children);
    } else if (el.hasAttribute('data-reveal-children') || el.querySelector('[data-reveal-children]')) {
      var host = el.hasAttribute('data-reveal-children') ? el : el.querySelector('[data-reveal-children]');
      kids = host ? Array.prototype.slice.call(host.children) : [];
    }

    kids.forEach(function (child, index) {
      child.classList.add('px-reveal-child');
      child.style.setProperty('--px-delay', (index * 70) + 'ms');
    });
  }

  function observeReveals(root) {
    var targets = qsa('.px-reveal', root || document).filter(function (el) {
      return !el.classList.contains('is-visible') && !el.dataset.pxObserved;
    });

    if (!targets.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(function (el) {
        prepareChildren(el);
        el.classList.add('is-visible');
      });
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          prepareChildren(el);
          requestAnimationFrame(function () {
            el.classList.add('is-visible');
          });
          revealObserver.unobserve(el);
        });
      }, {
        threshold: 0.12,
        rootMargin: '0px 0px -10% 0px'
      });
    }

    targets.forEach(function (el) {
      el.dataset.pxObserved = '1';
      revealObserver.observe(el);
    });
  }

  function wrapParallaxImage(img) {
    if (!img || img.closest('.px-parallax')) return null;
    var wrap = document.createElement('div');
    wrap.className = 'px-parallax';
    img.parentNode.insertBefore(wrap, img);
    wrap.appendChild(img);
    return wrap;
  }

  function collectParallax() {
    parallaxItems = [];
    if (reduceMotion) return;

    var main = document.getElementById('property-main-photo');
    if (main) {
      var wrap = main.closest('.px-parallax') || wrapParallaxImage(main);
      if (wrap) parallaxItems.push({ wrap: wrap, img: main, strength: 28 });
    }

    qsa('.property-gallery-grid .property-gallery-slot img').forEach(function (img, index) {
      var wrap = img.closest('.px-parallax') || wrapParallaxImage(img);
      if (wrap) {
        parallaxItems.push({
          wrap: wrap,
          img: img,
          strength: 14 + (index % 3) * 4
        });
      }
    });
  }

  function updateParallax() {
    var vh = window.innerHeight || 1;
    parallaxItems.forEach(function (item) {
      var rect = item.wrap.getBoundingClientRect();
      if (rect.bottom < -80 || rect.top > vh + 80) return;
      var center = rect.top + rect.height / 2;
      var distance = (center - vh / 2) / vh;
      var offset = distance * item.strength;
      item.img.style.transform = 'translate3d(0, ' + offset.toFixed(2) + 'px, 0) scale(1.08)';
    });
  }

  function updateChrome() {
    var scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var progress = docHeight > 0 ? Math.min(100, Math.max(0, (scrollTop / docHeight) * 100)) : 0;

    if (progressBar) progressBar.style.width = progress + '%';
    if (header) header.classList.toggle('is-scrolled', scrollTop > 24);
  }

  function onScroll() {
    if (rafScroll !== null) return;
    rafScroll = requestAnimationFrame(function () {
      rafScroll = null;
      updateChrome();
      updateParallax();
    });
  }

  function enhanceDynamicContent() {
    var galleryMain = document.getElementById('property-gallery-main');
    if (galleryMain) {
      galleryMain.classList.add('px-reveal');
      galleryMain.setAttribute('data-reveal', 'hero');
      qsa('.property-gallery-thumb', galleryMain).forEach(function (thumb, index) {
        thumb.classList.add('px-reveal-child');
        thumb.style.setProperty('--px-delay', (120 + index * 60) + 'ms');
      });
    }

    var specs = document.getElementById('property-specs');
    if (specs) {
      specs.classList.add('px-reveal');
      specs.setAttribute('data-reveal', 'stagger');
    }

    var features = document.getElementById('property-features');
    if (features) features.setAttribute('data-reveal-children', '');

    var agents = document.getElementById('property-agent-grid');
    if (agents) {
      agents.classList.add('px-reveal');
      agents.setAttribute('data-reveal', 'stagger');
    }

    var related = document.getElementById('related-properties');
    if (related) {
      related.classList.add('px-reveal');
      related.setAttribute('data-reveal', 'stagger');
    }

    qsa('.property-gallery-grid .property-gallery-slot').forEach(function (slot, index) {
      slot.classList.add('px-reveal');
      slot.setAttribute('data-reveal', 'clip');
      slot.style.setProperty('--px-delay', ((index % 6) * 80) + 'ms');
      delete slot.dataset.pxObserved;
    });

    var videoSection = document.getElementById('property-video-section');
    if (videoSection && !videoSection.hidden) {
      observeReveals(videoSection);
    }

    collectParallax();
    observeReveals(document);

    qsa('.px-reveal.is-visible').forEach(function (el) {
      prepareChildren(el);
    });

    updateChrome();
    updateParallax();

    if (galleryMain && galleryMain.getBoundingClientRect().top < window.innerHeight) {
      prepareChildren(galleryMain);
      galleryMain.classList.add('is-visible');
    }
  }

  // Estado inicial dos reveals estáticos
  observeReveals(document);
  updateChrome();

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  document.addEventListener('property:ready', enhanceDynamicContent);

  // Fallback se o conteúdo já estiver no DOM
  var specsEl = document.getElementById('property-specs');
  if (document.getElementById('property-main-photo') || (specsEl && specsEl.children.length)) {
    enhanceDynamicContent();
  }
})();
