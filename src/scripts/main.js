import Swiper from './vendor/swiper/swiper-bundle.min.mjs';
import '../styles/vendor/swiper-bundle.min.css';
import '../styles/main.scss';

const themeToggle = document.querySelector('.theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const navigationLinks = [...document.querySelectorAll('.primary-nav__link')];
const sections = navigationLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

const storageKey = 'neodahl-theme';
const colorScheme = window.matchMedia?.('(prefers-color-scheme: dark)');
let themeAnimationTimer;

function animateThemeToggle() {
  window.clearTimeout(themeAnimationTimer);
  themeToggle.classList.remove('is-changing');
  void themeToggle.offsetWidth;
  themeToggle.classList.add('is-changing');
  themeAnimationTimer = window.setTimeout(() => {
    themeToggle.classList.remove('is-changing');
  }, 420);
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
  applyTheme(nextTheme);
  animateThemeToggle();
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
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    },
    { threshold: 0.12 },
  );

  document.querySelectorAll(
    '.about-section__intro, .about-section__art, .section-heading, .career-entry, .career-project-link, .skill-card, .contact-section__bottom',
  )
    .forEach((element) => {
      element.classList.add('reveal-on-scroll');
      revealObserver.observe(element);
    });
}

const projectViewport = document.querySelector('.project-slider__viewport');

if (projectViewport) {
  const previousButton = document.querySelector('.project-slider__button--previous');
  const nextButton = document.querySelector('.project-slider__button--next');
  const slideStatus = document.querySelector('.project-slider__status');
  let activeProjectIndex = 0;
  let resizeTimeout;

  function updateProjectStatus(swiper) {
    activeProjectIndex = swiper.realIndex;
    const slideCount = swiper.slides.length;
    slideStatus.textContent = `${activeProjectIndex + 1} / ${slideCount}`;
    previousButton.disabled = swiper.isBeginning;
    nextButton.disabled = swiper.isEnd;
  }

  function updateProjectSliderLayout(swiper, activeIndex) {
    swiper.update();
    const lastSlideIndex = swiper.slidesGrid.length - 1;
    if (lastSlideIndex < 1) {
      swiper.params.slidesOffsetAfter = 0;
      swiper.update();
      swiper.slideTo(0, 0, false);
      updateProjectStatus(swiper);
      return;
    }
    const lastSlideThreshold =
      (swiper.slidesGrid[lastSlideIndex - 1] +
        swiper.slidesGrid[lastSlideIndex]) /
      2;
    // Give the final slide enough room to become active at every viewport width.
    swiper.params.slidesOffsetAfter = Math.max(
      0,
      lastSlideThreshold + swiper.width - swiper.virtualSize + 1,
    );
    swiper.update();
    swiper.slideTo(activeIndex, 0, false);
    updateProjectStatus(swiper);
  }

  const projectSlider = new Swiper(projectViewport, {
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
      firstSlideMessage: '첫 번째 프로젝트입니다',
      lastSlideMessage: '마지막 프로젝트입니다',
      slideLabelMessage: '{{index}} / {{slidesLength}}',
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
