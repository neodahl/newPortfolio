import Swiper from './vendor/swiper/swiper.mjs';
import A11y from './vendor/swiper/modules/a11y.mjs';
import Keyboard from './vendor/swiper/modules/keyboard.mjs';
import Navigation from './vendor/swiper/modules/navigation.mjs';
import './vendor/swiper/swiper.css';
import '../styles/main.scss';

const themeToggle = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const navigationLinks = [...document.querySelectorAll('.primary-nav__link')];
const sections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const storageKey = 'neodahl-theme';
const colorScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
let themeToggleAnimationTimer;

function animateThemeToggle() {
  window.clearTimeout(themeToggleAnimationTimer);
  themeToggle.classList.remove('is-animating');
  void themeToggle.offsetWidth;
  themeToggle.classList.add('is-animating');
  themeToggleAnimationTimer = window.setTimeout(() => {
    themeToggle.classList.remove('is-animating');
  }, 240);
}

function getSystemTheme() {
  if (colorScheme) return colorScheme.matches ? 'dark' : 'light';
  const hour = new Date().getHours();
  return hour >= 6 && hour < 18 ? 'light' : 'dark';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  const isDark = theme === 'dark';
  themeToggle.dataset.theme = theme;
  themeToggle.setAttribute(
    'aria-label',
    `${isDark ? '라이트' : '블랙'} 테마로 변경`,
  );
  themeToggle.setAttribute('aria-pressed', String(isDark));
  themeColor.setAttribute('content', isDark ? '#171815' : '#ece8df');
}

function getInitialTheme() {
  try {
    const savedTheme = localStorage.getItem(storageKey);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
  } catch (error) {
    console.warn('저장된 테마 설정을 읽을 수 없습니다.', error);
  }
  return getSystemTheme();
}

applyTheme(getInitialTheme());

themeToggle.addEventListener('click', () => {
  const nextTheme =
    document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  animateThemeToggle();
  applyTheme(nextTheme);
  try {
    localStorage.setItem(storageKey, nextTheme);
  } catch (error) {
    console.warn('테마 설정을 저장할 수 없습니다.', error);
  }
});

function updateSystemTheme(event) {
  try {
    if (!localStorage.getItem(storageKey)) {
      applyTheme(event.matches ? 'dark' : 'light');
    }
  } catch (error) {
    console.warn('테마 설정을 확인할 수 없습니다.', error);
    applyTheme(event.matches ? 'dark' : 'light');
  }
}

if (colorScheme?.addEventListener) {
  colorScheme.addEventListener('change', updateSystemTheme);
} else if (colorScheme?.addListener) {
  colorScheme.addListener(updateSystemTheme);
}

const siteHeader = document.querySelector('.site-header');
let navigationScrollPending = false;
let navigationScrollTimer;

function setActiveNavigation(index) {
  navigationLinks.forEach((link, linkIndex) => {
    if (linkIndex === index) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

function updateActiveNavigation() {
  const scrollPadding = Number.parseFloat(
    getComputedStyle(document.documentElement).scrollPaddingTop,
  );
  const activationOffset = Math.max(
    siteHeader.getBoundingClientRect().height + 24,
    scrollPadding,
  );
  const activationPoint = window.scrollY + activationOffset + 16;
  let activeSectionIndex = 0;

  sections.forEach((section, index) => {
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    if (sectionTop <= activationPoint) activeSectionIndex = index;
  });

  if (
    window.scrollY + window.innerHeight >=
    document.documentElement.scrollHeight - 1
  ) {
    activeSectionIndex = sections.length - 1;
  }

  setActiveNavigation(activeSectionIndex);
}

function finishNavigationScroll() {
  if (!navigationScrollPending) return;
  navigationScrollPending = false;
  window.clearTimeout(navigationScrollTimer);
  updateActiveNavigation();
}

navigationLinks.forEach((link, index) => {
  link.addEventListener('click', (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    navigationScrollPending = true;
    window.clearTimeout(navigationScrollTimer);
    setActiveNavigation(index);
    navigationScrollTimer = window.setTimeout(finishNavigationScroll, 500);
  });
});

window.addEventListener('scrollend', finishNavigationScroll);
window.addEventListener('wheel', finishNavigationScroll, { passive: true });
window.addEventListener('touchstart', finishNavigationScroll, { passive: true });

const headerCollapseThreshold = 96;
const headerRestoreThreshold = 8;
let scrollUpdateScheduled = false;
let headerIsCompact = false;

function updateHeaderOnScroll() {
  const scrollPosition = window.scrollY;
  const shouldCompactHeader = headerIsCompact
    ? scrollPosition > headerRestoreThreshold
    : scrollPosition >= headerCollapseThreshold;

  if (shouldCompactHeader !== headerIsCompact) {
    headerIsCompact = shouldCompactHeader;
    siteHeader.classList.toggle('is-scrolled', headerIsCompact);
  }
  if (!navigationScrollPending) updateActiveNavigation();
  window.clearTimeout(navigationScrollTimer);
  if (navigationScrollPending) {
    navigationScrollTimer = window.setTimeout(
      finishNavigationScroll,
      220,
    );
  }
  scrollUpdateScheduled = false;
}

window.addEventListener(
  'scroll',
  () => {
    if (scrollUpdateScheduled) return;
    scrollUpdateScheduled = true;
    window.requestAnimationFrame(updateHeaderOnScroll);
  },
  { passive: true },
);
updateHeaderOnScroll();

if ('IntersectionObserver' in window) {
  const aboutSection = document.querySelector('#about');
  const aboutIntro = document.querySelector('.about-section__intro');
  const aboutArt = document.querySelector('.about-section__art');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.target === aboutSection) {
          aboutIntro?.classList.toggle('is-visible', entry.isIntersecting);
          aboutArt?.classList.toggle('is-visible', entry.isIntersecting);
        } else {
          entry.target.classList.toggle('is-visible', entry.isIntersecting);
        }
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(
    '.section-heading, .approach-card, .career-entry, .skill-card, .contact-section__bottom',
  )
    .forEach((element) => {
      element.classList.add('reveal-on-scroll');
      revealObserver.observe(element);
    });

  if (aboutSection) {
    aboutIntro?.classList.add('about-section__intro--animated');
    aboutArt?.classList.add('reveal-on-scroll');
    // Apply the hidden state before the observer starts the reveal.
    if (aboutArt) void aboutArt.offsetWidth;
    revealObserver.observe(aboutSection);
  }
}

const projectViewport = document.querySelector('.project-slider__viewport');

if (projectViewport) {
  const previousButton = document.querySelector('.project-slider__button--previous');
  const nextButton = document.querySelector('.project-slider__button--next');
  let activeProjectIndex = 0;
  let resizeTimeout;

  function updateProjectStatus(swiper) {
    activeProjectIndex = swiper.realIndex;
    previousButton.disabled = swiper.isBeginning;
    nextButton.disabled = swiper.isEnd;
  }

  function updateProjectSliderLayout(swiper, activeIndex) {
    swiper.params.slidesOffsetAfter = 0;
    swiper.update();
    swiper.slideTo(activeIndex, 0, false);
    updateProjectStatus(swiper);
  }

  const projectSlider = new Swiper(projectViewport, {
    modules: [A11y, Keyboard, Navigation],
    slidesPerView: 'auto',
    slidesPerGroup: 1,
    slidesPerGroupAuto: false,
    spaceBetween: 18,
    speed: 450,
    grabCursor: true,
    threshold: 5,
    longSwipesRatio: 0.08,
    longSwipesMs: 150,
    watchOverflow: true,
    keyboard: {
      enabled: true,
      onlyInViewport: true,
    },
    navigation: {
      prevEl: previousButton,
      nextEl: nextButton,
    },
    a11y: {
      enabled: true,
      prevSlideMessage: '이전 프로젝트',
      nextSlideMessage: '다음 프로젝트',
      firstSlideMessage: '첫 프로젝트입니다',
      lastSlideMessage: '마지막 프로젝트입니다',
      slideLabelMessage: '프로젝트',
    },
    breakpoints: {
      768: {
        spaceBetween: 24,
      },
      1024: {
        spaceBetween: 32,
      },
    },
    on: {
      slideChange: updateProjectStatus,
      transitionEnd: updateProjectStatus,
    },
  });

  updateProjectSliderLayout(projectSlider, 0);
  window.addEventListener('resize', () => {
    const activeIndex = activeProjectIndex;
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(
      () => updateProjectSliderLayout(projectSlider, activeIndex),
      80,
    );
  });
}
