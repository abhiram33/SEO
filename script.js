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

// Lightweight SVG satin ribbons with continuous flow and damped pointer response.
(() => {
  const section = document.querySelector('[data-satin-ribbon]');
  if (!section) return;

  const svg = section.querySelector('.satin-ribbon__art');
  const layers = [
    { name: 'shadow', offset: 0.12, amplitude: 0.1, thickness: 0.22, frequency: 1.28, speed: 0.43, phase: 1.9 },
    { name: 'cocoa', offset: -0.1, amplitude: 0.14, thickness: 0.19, frequency: 1.04, speed: 0.56, phase: 0.35 },
    { name: 'beige', offset: 0.045, amplitude: 0.12, thickness: 0.2, frequency: 1.42, speed: 0.37, phase: 3.15 },
    { name: 'ivory', offset: -0.015, amplitude: 0.105, thickness: 0.25, frequency: 1.16, speed: 0.49, phase: 4.55 }
  ].map((config) => {
    const group = section.querySelector(`[data-ribbon-layer="${config.name}"]`);
    return {
      ...config,
      fill: group.querySelector('[data-ribbon-fill]'),
      fold: group.querySelector('[data-ribbon-fold]'),
      edge: group.querySelector('[data-ribbon-edge]'),
      center: group.querySelector('[data-ribbon-center]'),
      upper: [],
      lower: [],
      centerPoints: [],
      foldPoints: [],
      edgePoints: []
    };
  });
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = {
    targetX: 0.5,
    targetY: 0.5,
    currentX: 0.5,
    currentY: 0.5,
    velocityX: 0,
    velocityY: 0,
    energy: 0,
    lastMove: 0,
    inside: false,
    influence: 0
  };
  let sampleCount = 42;
  let width = 0;
  let height = 0;
  let documentLeft = 0;
  let documentTop = 0;
  let phase = 0;
  let frameId = 0;
  let lastFrameTime = 0;
  let previousPointerX = pointer.currentX;
  let previousPointerY = pointer.currentY;
  let sectionVisible = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const createPoints = (count) => Array.from({ length: count + 1 }, () => ({ x: 0, y: 0 }));

  const prepareLayerPoints = () => {
    layers.forEach((layer) => {
      layer.upper = createPoints(sampleCount);
      layer.lower = createPoints(sampleCount);
      layer.centerPoints = createPoints(sampleCount);
      layer.foldPoints = createPoints(sampleCount);
      layer.edgePoints = createPoints(sampleCount);
    });
  };

  const smoothPath = (points, reverse = false) => {
    if (points.length < 2) return '';
    const first = reverse ? points.length - 1 : 0;
    let path = `M ${points[first].x.toFixed(2)} ${points[first].y.toFixed(2)}`;
    for (let index = 0; index < points.length - 1; index += 1) {
      const previous = points[reverse ? points.length - 1 - Math.max(0, index - 1) : Math.max(0, index - 1)];
      const current = points[reverse ? points.length - 1 - index : index];
      const next = points[reverse ? points.length - 2 - index : index + 1];
      const following = points[reverse ? points.length - 1 - Math.min(points.length - 1, index + 2) : Math.min(points.length - 1, index + 2)];
      const control1X = current.x + (next.x - previous.x) / 6;
      const control1Y = current.y + (next.y - previous.y) / 6;
      const control2X = next.x - (following.x - current.x) / 6;
      const control2Y = next.y - (following.y - current.y) / 6;
      path += ` C ${control1X.toFixed(2)} ${control1Y.toFixed(2)}, ${control2X.toFixed(2)} ${control2Y.toFixed(2)}, ${next.x.toFixed(2)} ${next.y.toFixed(2)}`;
    }
    return path;
  };

  const render = (time, interaction = true) => {
    if (!width || !height) return;
    const influence = interaction ? pointer.influence : 0;
    const focus = pointer.currentX;
    const verticalAim = pointer.currentY;
    const motionBoost = interaction ? pointer.energy : 0;

    layers.forEach((layer) => {
      const { upper, lower, centerPoints, foldPoints, edgePoints } = layer;
      const thickness = height * layer.thickness;
      const spread = 0.15 + motionBoost * 0.045;
      const velocityMagnitude = Math.hypot(pointer.velocityX, pointer.velocityY);
      const velocityInfluence = Math.min(1, velocityMagnitude / 1.25);
      for (let index = 0; index <= sampleCount; index += 1) {
        const u = index / sampleCount;
        const x = u * width;
        const distance = (u - focus) / spread;
        const envelope = Math.exp(-0.5 * distance * distance) * influence;
        const wave = Math.sin(u * Math.PI * 2 * layer.frequency - time * layer.speed + layer.phase)
          + 0.28 * Math.sin(u * Math.PI * 2 * layer.frequency * 1.83 - time * layer.speed * 1.34 + layer.phase * 1.67)
          + 0.12 * Math.sin(u * Math.PI * 2 * layer.frequency * 2.71 - time * layer.speed * 0.77 + layer.phase * 2.13);
        const boostedWave = wave * layer.amplitude * height;
        const cursorRipple = Math.sin((u - focus) * Math.PI * (5.4 + layer.frequency) - time * layer.speed * 1.6 + layer.phase)
          * height * (motionBoost * 0.045 + velocityInfluence * 0.016);
        const cursorLift = (verticalAim - 0.5) * height * 0.075 + pointer.velocityY * height * 0.024;
        const cursorDeformation = clamp(envelope * (cursorLift + cursorRipple), -height * 0.12, height * 0.12);
        const horizontalWarp = envelope * pointer.velocityX * width * 0.008;
        const centerX = clamp(x + horizontalWarp, 0, width);
        const centerY = height * (0.5 + layer.offset) + boostedWave + cursorDeformation;
        centerPoints[index].x = centerX;
        centerPoints[index].y = centerY;
        upper[index].x = centerX;
        upper[index].y = centerY - thickness / 2;
        lower[index].x = centerX;
        lower[index].y = centerY + thickness / 2;
        foldPoints[index].x = centerX;
        foldPoints[index].y = centerY - thickness * 0.22;
        edgePoints[index].x = centerX;
        edgePoints[index].y = centerY + thickness * 0.38;
      }

      layer.fill.setAttribute('d', `${smoothPath(upper)} ${smoothPath(lower, true).replace(/^M/, 'L')} Z`);
      layer.fold.setAttribute('d', smoothPath(foldPoints));
      layer.edge.setAttribute('d', smoothPath(edgePoints));
      if (layer.center) layer.center.setAttribute('d', smoothPath(centerPoints));
    });
  };

  const measure = () => {
    const bounds = section.getBoundingClientRect();
    width = Math.max(1, bounds.width);
    height = Math.max(1, bounds.height);
    documentLeft = bounds.left + window.scrollX;
    documentTop = bounds.top + window.scrollY;
    sampleCount = width <= 640 ? 24 : 42;
    prepareLayerPoints();
    svg.setAttribute('viewBox', `0 0 ${width.toFixed(1)} ${height.toFixed(1)}`);
    const defs = svg.querySelectorAll('linearGradient');
    defs.forEach((gradient) => gradient.setAttribute('y2', height.toFixed(1)));
    render(phase, !reducedMotion.matches);
  };

  const stop = () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrameTime = 0;
  };

  const animate = (now) => {
    frameId = 0;
    if (!sectionVisible || document.hidden || reducedMotion.matches) return;
    const delta = lastFrameTime ? clamp(now - lastFrameTime, 1, 50) : 16;
    const seconds = delta / 1000;
    lastFrameTime = now;
    phase += seconds;

    const pointerEase = 1 - Math.exp(-delta / 105);
    pointer.currentX += (pointer.targetX - pointer.currentX) * pointerEase;
    pointer.currentY += (pointer.targetY - pointer.currentY) * pointerEase;

    const rawVelocityX = clamp((pointer.currentX - previousPointerX) / seconds, -1.4, 1.4);
    const rawVelocityY = clamp((pointer.currentY - previousPointerY) / seconds, -1.4, 1.4);
    const velocityEase = 1 - Math.exp(-delta / 115);
    pointer.velocityX += (rawVelocityX - pointer.velocityX) * velocityEase;
    pointer.velocityY += (rawVelocityY - pointer.velocityY) * velocityEase;
    previousPointerX = pointer.currentX;
    previousPointerY = pointer.currentY;

    const isMoving = pointer.inside && now - pointer.lastMove < 145;
    const influenceTarget = isMoving ? 1 : 0;
    const influenceEase = 1 - Math.exp(-delta / (isMoving ? 180 : 620));
    pointer.influence += (influenceTarget - pointer.influence) * influenceEase;
    const speed = Math.hypot(pointer.velocityX, pointer.velocityY);
    const energyTarget = isMoving ? clamp(speed / 1.25, 0, 1) : 0;
    const energyEase = 1 - Math.exp(-delta / (isMoving ? 150 : 520));
    pointer.energy += (energyTarget - pointer.energy) * energyEase;
    render(phase);
    frameId = requestAnimationFrame(animate);
  };

  const start = () => {
    if (!frameId && sectionVisible && !document.hidden && !reducedMotion.matches) {
      frameId = requestAnimationFrame(animate);
    }
  };

  const onPointerMove = (event) => {
    pointer.targetX = clamp((event.pageX - documentLeft) / width, 0, 1);
    pointer.targetY = clamp((event.pageY - documentTop) / height, 0, 1);
    pointer.lastMove = performance.now();
    pointer.inside = true;
  };

  const onPointerLeave = () => {
    pointer.inside = false;
  };

  const onMotionPreferenceChange = () => {
    if (reducedMotion.matches) {
      stop();
      render(phase, false);
    } else {
      start();
    }
  };

  section.addEventListener('pointermove', onPointerMove, { passive: true });
  section.addEventListener('pointerleave', onPointerLeave, { passive: true });
  const onVisibilityChange = () => {
    if (document.hidden) stop();
    else start();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  reducedMotion.addEventListener('change', onMotionPreferenceChange);

  if ('ResizeObserver' in window) {
    new ResizeObserver(measure).observe(section);
  } else {
    window.addEventListener('resize', measure, { passive: true });
  }
  measure();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      sectionVisible = entries.some((entry) => entry.isIntersecting);
      if (sectionVisible) start();
      else stop();
    });
    observer.observe(section);
  } else {
    sectionVisible = true;
    start();
  }
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
