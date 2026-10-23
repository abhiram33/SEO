const icon = (name) => `<i data-lucide="${name}"></i>`;
const replaceIcons = () => window.lucide?.createIcons({ attrs: { 'stroke-width': 2 } });
replaceIcons();

// Native Scroll & Viewport Interactions
const header = document.querySelector('#siteHeader');
const backToTopBtn = document.querySelector('[data-back-to-top]');
const parallaxImg = document.querySelector('[data-parallax-image]');
const parallaxContent = document.querySelector('[data-parallax-content]');
const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

let scrollTicking = false;

const onNativeScroll = () => {
  const y = window.scrollY || window.pageYOffset || 0;
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, Math.max(0, y / max));

  // 1. Reading progress indicator
  document.documentElement.style.setProperty('--scroll-progress', progress);

  // 2. Fixed Header scrolled glass state
  if (header) {
    header.classList.toggle('is-scrolled', y > 40);
  }

  // 3. Back to Top visibility
  if (backToTopBtn) {
    backToTopBtn.classList.toggle('is-visible', y > 400);
  }

  // 4. Hero Parallax in exact sync
  if (!reducedMotionQuery.matches && parallaxImg) {
    const p = Math.min(y / 800, 1);
    parallaxImg.style.transform = `translateY(${p * 5}%)`;
    if (parallaxContent) parallaxContent.style.transform = `translateY(${p * 16}px)`;
  }

  scrollTicking = false;
};

const handleScroll = () => {
  if (!scrollTicking) {
    scrollTicking = true;
    requestAnimationFrame(onNativeScroll);
  }
};

window.addEventListener('scroll', handleScroll, { passive: true });
window.addEventListener('resize', handleScroll, { passive: true });
handleScroll();

// Accessible Anchor Link Handling & Mobile Menu Close
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener('click', () => {
    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#' || targetId === '#!') return;
    const target = document.querySelector(targetId);
    if (!target) return;

    // Close mobile menu if open
    const mobMenu = document.querySelector('[data-mobile-menu]');
    const mToggle = document.querySelector('[data-menu-toggle]');
    if (mobMenu && !mobMenu.hidden) {
      mobMenu.hidden = true;
      if (mToggle) {
        mToggle.setAttribute('aria-expanded', 'false');
        mToggle.innerHTML = icon('menu');
        replaceIcons();
      }
    }
  });
});

const menuToggle = document.querySelector('[data-menu-toggle]');
const mobileMenu = document.querySelector('[data-mobile-menu]');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    const isOpen = !mobileMenu.hidden;
    mobileMenu.hidden = isOpen;
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.innerHTML = icon(isOpen ? 'menu' : 'x');
    replaceIcons();
  });
  mobileMenu.querySelectorAll('a, button').forEach((entry) => entry.addEventListener('click', () => {
    mobileMenu.hidden = true;
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.innerHTML = icon('menu');
    replaceIcons();
  }));
}

const modal = document.querySelector('[data-audit-modal]');
const closeAudit = () => {
  if (modal) modal.hidden = true;
  document.body.classList.remove('modal-open');
};
document.querySelectorAll('[data-open-audit]').forEach((button) => button.addEventListener('click', () => {
  if (modal) modal.hidden = false;
  document.body.classList.add('modal-open');
}));
document.querySelectorAll('[data-close-audit]').forEach((button) => button.addEventListener('click', closeAudit));
if (modal) modal.addEventListener('click', (event) => { if (event.target === modal) closeAudit(); });
document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeAudit(); });
document.querySelectorAll('[data-tab]').forEach((tab) => tab.addEventListener('click', () => {
  document.querySelectorAll('[data-tab]').forEach((item) => item.classList.toggle('active', item === tab));
  document.querySelectorAll('[data-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.panel !== tab.dataset.tab;
  });
}));

if (backToTopBtn) {
  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: reducedMotionQuery.matches ? 'auto' : 'smooth'
    });
  });
}

const whySequence = document.querySelector('[data-why-sequence]');
if (whySequence) {
  const whyStage = whySequence.querySelector('[data-why-stage]');
  const whyPairs = [...whySequence.querySelectorAll('[data-why-pair]')];
  const whyCurrent = whySequence.querySelector('[data-why-current]');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let whyEnhanced = false;
  let whyFrame = 0;

  const updateWhySequence = () => {
    whyFrame = 0;
    if (!whyEnhanced) return;
    const track = whySequence.getBoundingClientRect();
    const travel = Math.max(1, whySequence.offsetHeight - whyStage.offsetHeight);
    const progress = Math.min(1, Math.max(0, (window.innerHeight * 0.15 - track.top) / travel));
    const activeIndex = Math.min(whyPairs.length - 1, Math.floor(progress * whyPairs.length));
    whyPairs.forEach((pair, index) => {
      pair.classList.toggle('is-active', index === activeIndex);
      pair.classList.toggle('is-past', index === activeIndex - 1);
      if (index === activeIndex) pair.removeAttribute('aria-hidden');
      else pair.setAttribute('aria-hidden', 'true');
    });
    whyCurrent.textContent = String(activeIndex + 1).padStart(2, '0');
  };

  const scheduleWhyUpdate = () => {
    if (!whyFrame) whyFrame = requestAnimationFrame(updateWhySequence);
  };

  const resetWhySequence = () => {
    window.removeEventListener('scroll', scheduleWhyUpdate);
    window.removeEventListener('resize', scheduleWhyUpdate);
    if (whyFrame) cancelAnimationFrame(whyFrame);
    whyFrame = 0;
    whySequence.classList.remove('is-enhanced');
    whyPairs.forEach((pair) => {
      pair.classList.remove('is-active', 'is-past', 'is-visible');
      pair.removeAttribute('aria-hidden');
    });
    whyCurrent.textContent = '01';
  };

  const configureWhySequence = () => {
    const shouldEnhance = !reducedMotionQuery.matches;
    if (shouldEnhance === whyEnhanced) {
      if (shouldEnhance) scheduleWhyUpdate();
      return;
    }
    resetWhySequence();
    whyEnhanced = shouldEnhance;
    if (shouldEnhance) {
      whySequence.classList.add('is-enhanced');
      window.addEventListener('scroll', scheduleWhyUpdate, { passive: true });
      window.addEventListener('resize', scheduleWhyUpdate);
      scheduleWhyUpdate();
    }
  };

  reducedMotionQuery.addEventListener('change', configureWhySequence);
  configureWhySequence();
}

const heroWords = [...document.querySelectorAll('#hero-main .hero-staggered-heading span')];
const heroFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const heroReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const heroWordHandlers = new Map();

const resetHeroWordInteraction = () => {
  heroWordHandlers.forEach((handlers, word) => {
    word.removeEventListener('pointerenter', handlers.enter);
    word.removeEventListener('pointermove', handlers.move);
    word.removeEventListener('pointerleave', handlers.leave);
    word.classList.remove('is-hovered');
    word.style.removeProperty('--word-x');
    word.style.removeProperty('--word-y');
    word.style.removeProperty('--word-rotate-x');
    word.style.removeProperty('--word-rotate-y');
  });
  heroWordHandlers.clear();
};

const configureHeroWordInteraction = () => {
  resetHeroWordInteraction();
  if (!heroFinePointer.matches || heroReducedMotion.matches) return;

  heroWords.forEach((word) => {
    const enter = () => word.classList.add('is-hovered');
    const move = (event) => {
      const bounds = word.getBoundingClientRect();
      const x = Math.max(-1, Math.min(1, (event.clientX - (bounds.left + bounds.width / 2)) / (bounds.width / 2)));
      const y = Math.max(-1, Math.min(1, (event.clientY - (bounds.top + bounds.height / 2)) / (bounds.height / 2)));
      word.style.setProperty('--word-x', `${x * 3}px`);
      word.style.setProperty('--word-y', `${y * 2.5}px`);
      word.style.setProperty('--word-rotate-x', `${y * -1.1}deg`);
      word.style.setProperty('--word-rotate-y', `${x * 1.2}deg`);
    };
    const leave = () => {
      word.classList.remove('is-hovered');
      word.style.removeProperty('--word-x');
      word.style.removeProperty('--word-y');
      word.style.removeProperty('--word-rotate-x');
      word.style.removeProperty('--word-rotate-y');
    };

    heroWordHandlers.set(word, { enter, move, leave });
    word.addEventListener('pointerenter', enter);
    word.addEventListener('pointermove', move);
    word.addEventListener('pointerleave', leave);
  });
};

heroFinePointer.addEventListener('change', configureHeroWordInteraction);
heroReducedMotion.addEventListener('change', configureHeroWordInteraction);
configureHeroWordInteraction();

const servicesScroll = document.querySelector('[data-seo-services-scroll]');
if (servicesScroll) {
  const servicesStage = servicesScroll.querySelector('[data-seo-services-stage]');
  const servicesWindow = servicesScroll.querySelector('[data-seo-services-window]');
  const servicesTrack = servicesScroll.querySelector('[data-seo-services-track]');
  const servicesReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let servicesEnhanced = false;
  let servicesFrame = 0;
  let servicesMaxShift = 0;
  let servicesStickyTop = 0;
  let servicesTravel = 1;

  // Natural smoothstep easing (Hermite interpolation) for fluid organic gliding
  const easeProgress = (t) => {
    if (t <= 0) return 0;
    if (t >= 1) return 1;
    return t * t * (3 - 2 * t);
  };

  const measureServicesTrack = () => {
    const comp = window.getComputedStyle(servicesStage);
    const parsedTop = parseFloat(comp.top);
    servicesStickyTop = Number.isFinite(parsedTop) ? parsedTop : (window.innerHeight * 0.14);
    servicesTravel = Math.max(1, servicesScroll.offsetHeight - servicesStage.offsetHeight);
    const available = servicesWindow.clientWidth - servicesTrack.offsetWidth;
    servicesMaxShift = Math.max(0, available);
  };

  const updateServicesTrack = () => {
    servicesFrame = 0;
    if (!servicesEnhanced) return;
    const bounds = servicesScroll.getBoundingClientRect();
    const scrolled = servicesStickyTop - bounds.top;
    const rawProgress = Math.min(1, Math.max(0, scrolled / servicesTravel));
    const eased = easeProgress(rawProgress);
    const shift = (servicesMaxShift * eased).toFixed(2);
    servicesTrack.style.setProperty('--services-shift', `${shift}px`);
  };

  const scheduleServicesUpdate = () => {
    if (!servicesFrame) servicesFrame = requestAnimationFrame(updateServicesTrack);
  };

  const handleServicesResize = () => {
    measureServicesTrack();
    scheduleServicesUpdate();
  };

  const configureServicesScroll = () => {
    const shouldEnhance = !servicesReducedMotion.matches;
    if (shouldEnhance === servicesEnhanced) {
      if (shouldEnhance) handleServicesResize();
      return;
    }
    servicesEnhanced = shouldEnhance;
    servicesScroll.classList.toggle('is-enhanced', servicesEnhanced);
    if (servicesEnhanced) {
      measureServicesTrack();
      window.addEventListener('scroll', scheduleServicesUpdate, { passive: true });
      window.addEventListener('resize', handleServicesResize);
      scheduleServicesUpdate();
      return;
    }
    window.removeEventListener('scroll', scheduleServicesUpdate);
    window.removeEventListener('resize', handleServicesResize);
    if (servicesFrame) cancelAnimationFrame(servicesFrame);
    servicesFrame = 0;
    servicesTrack.style.removeProperty('--services-shift');
  };

  servicesReducedMotion.addEventListener('change', configureServicesScroll);
  configureServicesScroll();
}

const seoServiceSelect = document.getElementById('seo-service-select');
const whatsappEnquiryBtn = document.getElementById('whatsapp-enquiry-btn');
const seoSelectError = document.getElementById('seo-select-error');

if (seoServiceSelect && whatsappEnquiryBtn) {
  seoServiceSelect.addEventListener('change', () => {
    if (seoServiceSelect.value) {
      seoServiceSelect.classList.remove('has-error');
      if (seoSelectError) {
        seoSelectError.hidden = true;
      }
    }
  });

  whatsappEnquiryBtn.addEventListener('click', (event) => {
    event.preventDefault();

    const selectedService = seoServiceSelect.value ? seoServiceSelect.value.trim() : '';

    if (!selectedService) {
      seoServiceSelect.classList.remove('has-error');
      // trigger reflow to re-run shake animation if clicked multiple times
      void seoServiceSelect.offsetWidth;
      seoServiceSelect.classList.add('has-error');

      if (seoSelectError) {
        seoSelectError.hidden = false;
      }
      seoServiceSelect.focus();
      return;
    }

    const message = `Hello Abhiram,\n\nI would like to enquire about your SEO services.\n\nService required: ${selectedService}\n\nI found your portfolio and would like to discuss my requirements.\n\nThank you.`;
    const whatsappUrl = `https://wa.me/918848677810?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  });
}

// Service panels scroll reveal
(() => {
  const servicePanels = document.querySelectorAll('[data-reveal]');
  if (!servicePanels.length) return;

  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  servicePanels.forEach((panel) => observer.observe(panel));
})();

// Transition Reveal for SEO Process
(() => {
  const processSection = document.querySelector('.process-section-reveal');
  if (!processSection) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  observer.observe(processSection);
})();


// Experience Section - Subtle Moving Hover Interaction
(() => {
  const card = document.querySelector('.experience-card');
  if (!card) return;

  const finePointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
  const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  let isHovered = false;
  let rafId = 0;
  let targetX = 0;

  const updateCardPosition = () => {
    rafId = 0;
    if (!isHovered) return;
    card.style.setProperty('--exp-x', `${targetX}px`);
  };

  const onPointerEnter = () => {
    if (!finePointerQuery.matches || reducedMotionQuery.matches) return;
    isHovered = true;
  };

  const onPointerMove = (e) => {
    if (!isHovered) return;
    const rect = card.getBoundingClientRect();
    if (rect.width === 0) return;
    const normalizedX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width) * 2 - 1));
    targetX = Number((normalizedX * 2.5).toFixed(2));
    if (!rafId) {
      rafId = requestAnimationFrame(updateCardPosition);
    }
  };

  const onPointerLeave = () => {
    isHovered = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
    card.style.removeProperty('--exp-x');
  };

  card.addEventListener('pointerenter', onPointerEnter);
  card.addEventListener('pointermove', onPointerMove, { passive: true });
  card.addEventListener('pointerleave', onPointerLeave);
})();

// Footer Layout Diagnostics
(() => {
  const logFooterMetrics = () => {
    const footer = document.querySelector('footer');
    const body = document.body;
    const root = document.documentElement;

    console.table({
      viewportWidth: window.innerWidth,
      documentWidth: root.scrollWidth,
      bodyWidth: body.scrollWidth,
      footerLeft: footer ? Math.round(footer.getBoundingClientRect().left) : 0,
      footerRight: footer ? Math.round(footer.getBoundingClientRect().right) : 0,
      footerWidth: footer ? Math.round(footer.getBoundingClientRect().width) : 0
    });
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', logFooterMetrics);
  } else {
    logFooterMetrics();
  }
  window.addEventListener('resize', logFooterMetrics, { passive: true });
})();



