document.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 900,
    easing: 'ease-out-cubic',
    once: true,
    offset: 80
  });

  gsap.registerPlugin(ScrollTrigger);

  const header = document.querySelector('.main-header');
  const setHeaderState = () => {
    header.classList.toggle('nav-scrolled', window.scrollY > 40);
  };

  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const heroSwiper = new Swiper('.heroSwiper', {
    autoplay: false,
    loop: false,
    speed: 900,
    effect: 'fade',
    fadeEffect: { crossFade: true },
    allowTouchMove: true
  });

  const heroVideo = document.getElementById('heroIntroVideo');
  const heroProgressLines = Array.from(document.querySelectorAll('.hero-progress-line'));
  const heroPrevButton = document.querySelector('.hero-arrow-prev');
  const heroNextButton = document.querySelector('.hero-arrow-next');
  let heroAdvanceTimer = null;
  const heroImageDelay = 5000;

  const playIntroVideo = () => {
    if (!heroVideo) {
      return;
    }

    heroVideo.currentTime = 0;
    const playback = heroVideo.play();
    if (playback && typeof playback.catch === 'function') {
      playback.catch(() => {});
    }
  };

  const stopHeroAdvance = () => {
    if (heroAdvanceTimer) {
      window.clearTimeout(heroAdvanceTimer);
      heroAdvanceTimer = null;
    }
  };

  const scheduleHeroAdvance = (targetIndex, delay = heroImageDelay) => {
    stopHeroAdvance();
    heroAdvanceTimer = window.setTimeout(() => {
      if (!heroSwiper) {
        return;
      }

      heroSwiper.slideTo(targetIndex);
    }, delay);
  };

  const getIntroDuration = () => {
    if (!heroVideo || !Number.isFinite(heroVideo.duration) || heroVideo.duration <= 0) {
      return heroImageDelay;
    }

    return Math.max(heroVideo.duration * 1000, 1000);
  };

  const restartHeroProgress = (activeIndex, duration = heroImageDelay) => {
    heroProgressLines.forEach((line, index) => {
      line.classList.remove('is-active', 'is-complete');
      line.style.setProperty('--hero-progress-duration', `${duration}ms`);

      if (index < activeIndex) {
        line.classList.add('is-complete');
      }
    });

    const activeLine = heroProgressLines[activeIndex];
    if (!activeLine) {
      return;
    }

    activeLine.style.setProperty('--hero-progress-duration', `${duration}ms`);
    void activeLine.offsetWidth;
    activeLine.classList.add('is-active');
  };

  const updateHeroProgress = () => {
    if (!heroSwiper) {
      return;
    }

    const activeIndex = heroSwiper.realIndex;

    if (activeIndex === 0) {
      stopHeroAdvance();
      restartHeroProgress(activeIndex, getIntroDuration());
      playIntroVideo();
      return;
    }

    restartHeroProgress(activeIndex, heroImageDelay);
    scheduleHeroAdvance((activeIndex + 1) % heroSwiper.slides.length, heroImageDelay);
  };

  const goToHeroSlide = (targetIndex) => {
    if (!heroSwiper) {
      return;
    }

    stopHeroAdvance();
    heroSwiper.slideTo((targetIndex + heroSwiper.slides.length) % heroSwiper.slides.length);
  };

  if (heroVideo && heroSwiper) {
    const handleIntroEnd = () => {
      if (heroSwiper.realIndex === 0) {
        heroSwiper.slideTo(1);
      }
    };

    heroVideo.addEventListener('ended', handleIntroEnd);

    const animateActiveHero = () => {
      const activeSlide = heroSwiper.slides[heroSwiper.activeIndex];
      if (!activeSlide) {
        return;
      }

      const heroCopy = activeSlide.querySelector('.hero-content');
      const heroMedia = activeSlide.querySelector('.hero-media');

      gsap.killTweensOf([heroCopy, heroMedia]);

      if (heroMedia) {
        gsap.fromTo(heroMedia, { opacity: 0.92 }, {  opacity: 1, duration: 0.9, ease: 'power2.out' });
      }

      if (heroCopy) {
        gsap.fromTo(
          heroCopy,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.08 }
        );
      }
    };

    heroSwiper.on('slideChangeTransitionStart', () => {
      if (heroSwiper.realIndex !== 0) {
        heroVideo.pause();
        heroVideo.currentTime = 0;
      }
    });

    heroSwiper.on('realIndexChange', () => {
      animateActiveHero();
      updateHeroProgress();
    });

    heroSwiper.on('slideChangeTransitionEnd', () => {
      animateActiveHero();
    });

    heroVideo.addEventListener('loadedmetadata', () => {
      if (heroSwiper.realIndex === 0) {
        restartHeroProgress(0, getIntroDuration());
      }
    });

    heroProgressLines.forEach((line) => {
      line.addEventListener('click', () => {
        goToHeroSlide(Number(line.dataset.slide));
      });
    });

    if (heroPrevButton) {
      heroPrevButton.addEventListener('click', () => {
        goToHeroSlide(heroSwiper.realIndex - 1);
      });
    }

    if (heroNextButton) {
      heroNextButton.addEventListener('click', () => {
        goToHeroSlide(heroSwiper.realIndex + 1);
      });
    }

    animateActiveHero();
    updateHeroProgress();
  }

  const projectsSwiperElement = document.querySelector('.projectsSwiper');
  const projectsSwiper = projectsSwiperElement
    ? new Swiper(projectsSwiperElement, {
        loop: false,
        spaceBetween: 24,
        pagination: {
          el: '.projects-pagination',
          clickable: true
        },
        breakpoints: {
          0: { slidesPerView: 1 },
          992: { slidesPerView: 1 }
        }
      })
    : null;

  new Swiper('.newsSwiper', {
    loop: true,
    spaceBetween: 24,
    autoplay: {
      delay: 4200,
      disableOnInteraction: false
    },
    pagination: {
      el: '.news-pagination',
      clickable: true
    },
    breakpoints: {
      0: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1200: { slidesPerView: 3 }
    }
  });

  const animateCounter = (element, target) => {
    const state = { value: 0 };
    gsap.to(state, {
      value: target,
      duration: 1.8,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%'
      },
      onUpdate: () => {
        const currentValue = Math.floor(state.value).toLocaleString();
        element.textContent = `${currentValue}+`;
      }
    });
  };

  document.querySelectorAll('[data-count]').forEach((element) => {
    animateCounter(element, Number(element.dataset.count));
  });

  document.querySelectorAll('.filter-btn').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((btn) => btn.classList.remove('active'));
      button.classList.add('active');
      const filter = button.dataset.filter;

      document.querySelectorAll('.project-slide').forEach((slide) => {
        const matches = filter === 'all' || slide.dataset.category === filter;
        slide.style.display = matches ? 'block' : 'none';
      });

      if (projectsSwiper) {
        projectsSwiper.update();
      }
    });
  });

  document.querySelectorAll('.business-tab').forEach((button) => {
    button.addEventListener('click', () => {
      document.querySelectorAll('.business-tab').forEach((tab) => tab.classList.remove('active'));
      document.querySelectorAll('.business-tab').forEach((tab) => tab.setAttribute('aria-selected', 'false'));
      button.classList.add('active');
      button.setAttribute('aria-selected', 'true');

      const targetView = button.dataset.view;
      document.querySelectorAll('.business-panel').forEach((panel) => {
        const isVisible = panel.dataset.panel === targetView;
        panel.hidden = !isVisible;
        panel.classList.toggle('active', isVisible);
      });
    });
  });

  const businessFeature = document.querySelector('.business-feature');
  const businessFeatureImage = document.getElementById('businessFeatureImage');
  const businessFeatureTitle = document.getElementById('businessFeatureTitle');
  const businessFeatureText = document.getElementById('businessFeatureText');

  document.querySelectorAll('.business-card[data-feature-image]').forEach((card) => {
    const updateBusinessFeature = () => {
      if (!businessFeature || !businessFeatureImage) {
        return;
      }

      const nextImage = card.dataset.featureImage;
      if (!nextImage || businessFeatureImage.src === nextImage) {
        return;
      }

      businessFeature.classList.add('is-changing');

      window.setTimeout(() => {
        businessFeatureImage.src = nextImage;
        businessFeatureImage.alt = card.dataset.featureTitle || 'Chandi Group business verticals';

        if (businessFeatureTitle && card.dataset.featureTitle) {
          businessFeatureTitle.textContent = card.dataset.featureTitle;
        }

        if (businessFeatureText && card.dataset.featureText) {
          businessFeatureText.textContent = card.dataset.featureText;
        }

        businessFeature.classList.remove('is-changing');
      }, 160);
    };

    card.addEventListener('mouseenter', updateBusinessFeature);
    card.addEventListener('focus', updateBusinessFeature);
  });

  const csrCarousel = document.querySelector('.csr-carousel');
  if (csrCarousel) {
    const csrCarouselImage = document.getElementById('csrCarouselImage');
    const csrCarouselKicker = document.getElementById('csrCarouselKicker');
    const csrCarouselTitle = document.getElementById('csrCarouselTitle');
    const csrCarouselText = document.getElementById('csrCarouselText');
    const csrCarouselLink = document.getElementById('csrCarouselLink');
    const csrTabs = Array.from(document.querySelectorAll('.csr-carousel-tab'));
    let csrSwapTimer = null;

    const csrSlides = [
      {
        kicker: 'For a Sustainable Tomorrow',
        title: '100 Million Trees Pledged',
        text: 'Our commitment is to create meaningful impact through education, health, community outreach, and leadership partnerships.',
        image: 'https://images.unsplash.com/photo-1526634332515-d56c8b8942e3?auto=format&fit=crop&w=1800&q=80',
        alt: 'Community engagement and sustainable growth',
        linkText: 'View Environmental Impact',
        linkHref: '#contact'
      },
      {
        kicker: 'Community First',
        title: 'Nurturing Communities',
        text: 'We invest in programs that support families, strengthen neighborhoods, and encourage responsible long-term growth.',
        image: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=1800&q=80',
        alt: 'Community outreach and engagement',
        linkText: 'Explore Community Work',
        linkHref: '#contact'
      },
      {
        kicker: 'Social Investment',
        title: 'Education & Health',
        text: 'Focused support for education and healthcare helps create measurable outcomes and stronger future opportunities.',
        image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1800&q=80',
        alt: 'Education and health initiatives',
        linkText: 'See Social Impact',
        linkHref: '#contact'
      },
      {
        kicker: 'Leadership Association',
        title: 'Palm Springs Film Festival',
        text: 'Our leadership association reflects a broader commitment to culture, visibility, and responsible public engagement.',
        image: 'https://images.unsplash.com/photo-1516280030429-b1a7f6d3b8f6?auto=format&fit=crop&w=1800&q=80',
        alt: 'Film festival and leadership event',
        linkText: 'View Leadership Story',
        linkHref: '#contact'
      },
      {
        kicker: 'Governance & Giving',
        title: 'Philanthropy with Outcomes',
        text: 'We connect governance, accountability, and giving to ensure that community commitments are visible and measurable.',
        image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1800&q=80',
        alt: 'Governance and philanthropic collaboration',
        linkText: 'Read More',
        linkHref: '#contact'
      }
    ];

    const applyCsrSlide = (index) => {
      const slide = csrSlides[index];
      if (!slide || !csrCarouselImage) {
        return;
      }

      csrTabs.forEach((tab, tabIndex) => {
        const isActive = tabIndex === index;
        tab.classList.toggle('active', isActive);
        tab.setAttribute('aria-selected', String(isActive));
      });

      if (csrSwapTimer) {
        window.clearTimeout(csrSwapTimer);
      }

      csrCarousel.classList.add('is-transitioning');
      csrSwapTimer = window.setTimeout(() => {
        csrCarouselImage.src = slide.image;
        csrCarouselImage.alt = slide.alt;
        csrCarouselKicker.textContent = slide.kicker;
        csrCarouselTitle.textContent = slide.title;
        csrCarouselText.textContent = slide.text;
        csrCarouselLink.textContent = slide.linkText;
        csrCarouselLink.setAttribute('href', slide.linkHref);
        csrCarousel.classList.remove('is-transitioning');
      }, 220);
    };

    csrTabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        applyCsrSlide(Number(tab.dataset.csrIndex));
      });
    });
  }
});

const showcase = document.querySelector('.business-showcase');
const title = document.getElementById('businessTitle');
const desc = document.getElementById('businessDesc');

document.querySelectorAll('.business-item').forEach(item=>{

    item.addEventListener('mouseenter',function(){

        document.querySelectorAll('.business-item')
        .forEach(i=>i.classList.remove('active'));

        this.classList.add('active');

        title.innerHTML = this.dataset.title;
        desc.innerHTML = this.dataset.desc;

    });

});
