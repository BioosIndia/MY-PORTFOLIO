const menu = document.querySelector('.menu-toggle');
const nav = document.querySelector('#primary-nav');
const compactNavigation = window.matchMedia('(max-width: 1120px)');
const setNavigationOpen = open => {
  if (!menu || !nav) return;
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  nav.classList.toggle('open', open);
};
menu?.addEventListener('click', event => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  setNavigationOpen(open);
  if (open && event.detail === 0) nav?.querySelector('a')?.focus();
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setNavigationOpen(false)));
document.addEventListener('pointerdown', event => {
  if (nav?.classList.contains('open') && !event.target.closest('.site-header')) setNavigationOpen(false);
});
nav?.addEventListener('focusout', event => {
  if (event.relatedTarget && !nav.contains(event.relatedTarget) && event.relatedTarget !== menu) setNavigationOpen(false);
});
compactNavigation.addEventListener('change', () => {
  setNavigationOpen(false);
  if (compactNavigation.matches && nav?.contains(document.activeElement)) menu?.focus();
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || !nav?.classList.contains('open')) return;
  event.preventDefault();
  setNavigationOpen(false);
  menu?.focus();
});
document.querySelector('#year').textContent = new Date().getFullYear();

const sectionLinks = [...(nav?.querySelectorAll('a[href^="#"]') || [])];
const sectionTargets = sectionLinks.map(link => ({link, section: document.querySelector(link.getAttribute('href'))})).filter(item => item.section);
let sectionUpdatePending = false;
const updateActiveSection = () => {
  let active = sectionTargets[0];
  for (const item of sectionTargets) {
    if (item.section.getBoundingClientRect().top <= window.innerHeight * 0.42) active = item;
  }
  sectionTargets.forEach(({link}) => {
    const selected = link === active?.link;
    link.classList.toggle('is-active', selected);
    if (selected) link.setAttribute('aria-current', 'location');
    else link.removeAttribute('aria-current');
  });
  sectionUpdatePending = false;
};
window.addEventListener('scroll', () => {
  if (!sectionUpdatePending) { sectionUpdatePending = true; requestAnimationFrame(updateActiveSection); }
}, {passive: true});
updateActiveSection();
window.addEventListener('resize', updateActiveSection, {passive: true});
window.addEventListener('load', updateActiveSection, {once: true});
document.fonts?.ready.then(updateActiveSection);

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reducedMotion.matches && 'IntersectionObserver' in window) {
  const targets = document.querySelectorAll('.proof-band, .section-top, .feature-card, .capability, .tools-box, .education-box, .training-box, .walkthrough li, .case-proof-grid > div, .case-stat-grid > div, .case-story, .boundary-card, .architecture-orbit, .architecture-panel, .study-card, .research-card, .thesis-card, .academic-side article, .evidence-table-wrap, .control-note, .about-copy, .contact-copy, .document-shelf, .mini-heading, .mini-build-card');
  targets.forEach(node => node.setAttribute('data-reveal', ''));
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
      else if (entry.boundingClientRect.bottom < 0 || entry.boundingClientRect.top > window.innerHeight) entry.target.classList.remove('is-visible');
    });
  }, {threshold: 0.02, rootMargin: '0px 0px 60px 0px'});
  targets.forEach(node => reveal.observe(node));
  document.documentElement.classList.add('motion-ready');

  const orbit = document.querySelector('.evidence-sculpture');
  const architectureScene = document.querySelector('.architecture-orbit-scene');
  let pending = false;
  const moveOrbit = () => {
    if (document.hidden) { pending = false; return; }
    const drift = Math.max(-30, Math.min(30, window.scrollY * -0.035));
    if (!reducedMotion.matches) orbit?.style.setProperty('--orbit-drift', `${drift}px`);
    if (architectureScene) {
      const rect = architectureScene.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const sceneDrift = Math.max(-18, Math.min(18, (window.innerHeight / 2 - rect.top - rect.height / 2) * 0.045));
        architectureScene.style.setProperty('--scene-drift', `${sceneDrift}px`);
      }
    }
    pending = false;
  };
  window.addEventListener('scroll', () => {
    if (!pending) { pending = true; requestAnimationFrame(moveOrbit); }
  }, {passive: true});
}

// A clear, reversible navigation choice for project details, documents and outbound actions.
const navigationDialog = document.querySelector('#navigation-dialog');
const navigationTitle = document.querySelector('#navigation-title');
const navigationDescription = document.querySelector('#navigation-description');
const navigationDestination = document.querySelector('#navigation-destination');
const navigationContinue = document.querySelector('#navigation-continue');
const navigationCancel = document.querySelector('#navigation-cancel');
let pendingNavigation = null;
let restoreNavigationFocus = true;
const navigationClose = document.querySelector('#navigation-close');
const navigationAddress = document.querySelector('#navigation-address');

function requestNavigation(event) {
  const link = event.target.closest?.('a[href]');
  const activation = event.type === 'auxclick' ? event.button === 1 : event.button === 0;
  if (!link || !navigationDialog?.showModal || event.defaultPrevented || !activation) return;
  if (link.matches('.skip-link, .brand')) return;

  const href = link.getAttribute('href');
  if (link.dataset.confirmedDownload === 'true') return;
  const label = (link.getAttribute('data-document-title') || link.getAttribute('aria-label') || link.textContent).trim().replace(/\s+/g, ' ').replace(/[↗↓↑]+$/u, '').trim();
  const isDocument = /\.(?:pdf|docx)(?:$|[?#])/i.test(href) || link.href.includes('/assets/docs/');
  const isImage = /\.(?:png|webp|jpe?g|svg)(?:$|[?#])/i.test(href);
  const isDownload = link.hasAttribute('download');
  const isSection = href.startsWith('#');
  const isExternal = /^https?:/i.test(href);
  event.preventDefault();
  pendingNavigation = link;
  restoreNavigationFocus = true;
  navigationTitle.textContent = isDownload ? 'Download this resume?' : isSection ? 'View this section?' : isDocument ? 'Open this document?' : isImage ? 'Open this architecture image?' : 'Open this destination?';
  navigationDescription.textContent = isDownload ? 'This downloads Rahul’s latest supplied one-page resume as a PDF.' : isSection
    ? 'This moves to a detailed section of Rahul’s portfolio.'
    : isDocument
      ? 'This opens the supplied paper, academic document or latest resume in a new tab. Its stated maturity and limitations remain part of the document.'
      : isImage
        ? 'This opens the architecture image in a new tab so you can inspect the diagram at full size.'
      : isExternal
        ? 'This opens an external site in a new tab. Its availability and content are controlled by that site.'
        : 'Your device will handle this email or phone action.';
  if (isExternal && link.dataset.accessNote) {
    navigationDescription.textContent += ' ' + link.dataset.accessNote;
  }
  navigationDestination.textContent = isExternal ? `${label} · ${new URL(link.href).hostname}` : `${label || 'Selected item'}${isDocument ? (/\.pdf(?:$|[?#])/i.test(href) ? ' · PDF' : ' · Academic document') : ''}`;
  navigationContinue.textContent = isDownload ? 'DOWNLOAD PDF' : isSection ? 'VIEW SECTION' : isDocument || isImage || isExternal ? 'OPEN NEW TAB' : 'CONTINUE';
  navigationAddress.textContent = isSection ? 'Portfolio section · ' + href.slice(1) : link.href;
  if (!navigationDialog.open) navigationDialog.showModal();
  document.body.classList.add('dialog-open');
  navigationCancel.focus();
}
document.addEventListener('click', requestNavigation);
document.addEventListener('auxclick', requestNavigation);

navigationCancel?.addEventListener('click', () => navigationDialog.close());
navigationClose?.addEventListener('click', () => navigationDialog.close());
navigationDialog?.addEventListener('cancel', event => { event.preventDefault(); navigationDialog.close(); });
navigationDialog?.addEventListener('keydown', event => {
  if (event.key !== 'Tab') return;
  const controls = [...navigationDialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')];
  const first = controls[0];
  const last = controls.at(-1);
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault(); last?.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault(); first?.focus();
  }
});
navigationDialog?.addEventListener('click', event => {
  if (event.target !== navigationDialog) return;
  const rect = navigationDialog.getBoundingClientRect();
  if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) navigationDialog.close();
});
navigationContinue?.addEventListener('click', () => {
  const link = pendingNavigation;
  if (!link) return;
  const href = link.getAttribute('href');
  restoreNavigationFocus = !href.startsWith('#');
  navigationDialog.close();
  if (href.startsWith('#')) {
    const target = document.querySelector(href);
    if (target) {
      history.pushState(null, '', href);
      target.scrollIntoView({behavior: reducedMotion.matches ? 'auto' : 'smooth'});
      const section = target.closest('section') || target;
      if (!reducedMotion.matches) {
        section.classList.remove('section-nav-focus');
        requestAnimationFrame(() => section.classList.add('section-nav-focus'));
        setTimeout(() => section.classList.remove('section-nav-focus'), 900);
      }
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll:true});
    }
  } else if (link.hasAttribute('download')) {
    const download = link.cloneNode(false);
    download.dataset.confirmedDownload = 'true';
    download.removeAttribute('target');
    download.hidden = true;
    document.body.append(download);
    download.click();
    download.remove();
  } else if (link.target === '_blank') {
    window.open(link.href, '_blank', 'noopener,noreferrer');
  } else {
    window.location.href = link.href;
  }
});
navigationDialog?.addEventListener('close', () => {
  document.body.classList.remove('dialog-open');
  if (restoreNavigationFocus && pendingNavigation?.isConnected) {
    const hiddenMenuLink = compactNavigation.matches && pendingNavigation.closest('#primary-nav') && !nav?.classList.contains('open');
    (hiddenMenuLink ? menu : pendingNavigation)?.focus({preventScroll:true});
  }
  pendingNavigation = null;
});
reducedMotion.addEventListener('change', () => {
  document.documentElement.classList.toggle('motion-ready', !reducedMotion.matches);
  if (reducedMotion.matches) document.querySelectorAll('[data-reveal]').forEach(node => node.classList.add('is-visible'));
});

// Refine only the conceptual scene; the exact branch diagram remains static and readable.
const orbitScene = document.querySelector('.architecture-orbit-scene');
const orbitModel = document.querySelector('.architecture-orbit');
function syncOrbitMotion() {
  orbitModel?.classList.toggle('orbit-paused', reducedMotion.matches);
}
reducedMotion.addEventListener('change', syncOrbitMotion);
syncOrbitMotion();
orbitScene?.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType === 'touch') return;
  const rect = orbitScene.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  orbitScene.style.setProperty('--view-x', `${Math.max(-5, Math.min(5, (event.clientY - rect.top - rect.height/2) / rect.height * -10))}deg`);
  orbitScene.style.setProperty('--view-y', `${Math.max(-7, Math.min(7, (event.clientX - rect.left - rect.width/2) / rect.width * 14))}deg`);
});
orbitScene?.addEventListener('pointerleave', () => {
  orbitScene.style.setProperty('--view-x', '0deg');
  orbitScene.style.setProperty('--view-y', '0deg');
});

// Decorative hero motion never transforms the real portrait or the text.
const heroSculpture = document.querySelector('.evidence-sculpture');
const portraitScene = document.querySelector('.portrait-scene');
const resetHeroTilt = () => {
  heroSculpture?.style.setProperty('--hero-view-x', '0deg');
  heroSculpture?.style.setProperty('--hero-view-y', '0deg');
};
function syncHeroMotion() {
  heroSculpture?.classList.toggle('hero-motion-paused', reducedMotion.matches);
  if (reducedMotion.matches) resetHeroTilt();
}
reducedMotion.addEventListener('change', syncHeroMotion);
syncHeroMotion();
portraitScene?.addEventListener('pointermove', event => {
  if (reducedMotion.matches || event.pointerType === 'touch') return;
  const rect = portraitScene.getBoundingClientRect();
  if (!rect.width || !rect.height) return;
  heroSculpture?.style.setProperty('--hero-view-x', `${Math.max(-3, Math.min(3, (event.clientY - rect.top - rect.height / 2) / rect.height * -6))}deg`);
  heroSculpture?.style.setProperty('--hero-view-y', `${Math.max(-5, Math.min(5, (event.clientX - rect.left - rect.width / 2) / rect.width * 10))}deg`);
});
portraitScene?.addEventListener('pointerleave', resetHeroTilt);

// Keep the subtle motion on screen; pause its work when the view is elsewhere.
if ('IntersectionObserver' in window) {
  const sceneVisibility = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('is-offscreen-motion', !entry.isIntersecting));
  }, {rootMargin: '100px 0px', threshold: 0});
  document.querySelectorAll('.portrait-scene, .architecture-orbit, .feature-card').forEach(scene => sceneVisibility.observe(scene));
}
const syncPageMotion = () => document.documentElement.classList.toggle('page-motion-paused', document.hidden);
document.addEventListener('visibilitychange', syncPageMotion);
syncPageMotion();
