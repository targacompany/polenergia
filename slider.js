document.addEventListener('DOMContentLoaded', function() {
  const sliderComponents = document.querySelectorAll('.slider-component');

  sliderComponents.forEach(sliderComponent => {
    const scrollNav = sliderComponent.parentElement?.querySelector('[data-scroll="nav"]');
    if (!scrollNav) return;

    const leftBtn = scrollNav.querySelector('[data-scroll="left"]');
    const rightBtn = scrollNav.querySelector('[data-scroll="right"]');
    if (!leftBtn || !rightBtn) return;

    // Resolve slide container: prefer explicit container, fall back to nested children
    const explicitTrack = sliderComponent.querySelector('[data-slider="container"], .slider-container');
    const firstNest = sliderComponent.firstElementChild;
    const secondNest = firstNest?.firstElementChild;
    const slideContainer = explicitTrack || secondNest || firstNest || sliderComponent;

    if (!slideContainer) return;

    const slides = Array.from(slideContainer.children).filter(node => node.nodeType === Node.ELEMENT_NODE);
    if (!slides.length) return;

    function getCurrentSlideIndex() {
      const containerRect = sliderComponent.getBoundingClientRect();
      const idx = slides.findIndex(slide => {
        const slideRect = slide.getBoundingClientRect();
        return slideRect.left >= containerRect.left - 10;
      });
      return idx >= 0 ? idx : 0;
    }

    function scrollToSlide(slideIndex) {
      if (slideIndex < 0 || slideIndex >= slides.length) return;

      const targetSlide = slides[slideIndex];
      const originalSnapType = getComputedStyle(sliderComponent).scrollSnapType;

      // Disable scroll snap temporarily
      sliderComponent.style.scrollSnapType = 'none';

      // Scroll to the target slide
      targetSlide.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });

      // Re-enable scroll snap after scroll completes
      setTimeout(() => {
        sliderComponent.style.scrollSnapType = originalSnapType;
      }, 500);
    }

    leftBtn.addEventListener('click', () => {
      const currentIndex = getCurrentSlideIndex();
      scrollToSlide(currentIndex - 1);
    });

    rightBtn.addEventListener('click', () => {
      const currentIndex = getCurrentSlideIndex();
      scrollToSlide(currentIndex + 1);
    });

    // Update button states
    function updateButtonStates() {
      const isAtStart = sliderComponent.scrollLeft <= 1;
      const isAtEnd = sliderComponent.scrollLeft >=
        sliderComponent.scrollWidth - sliderComponent.clientWidth - 1;

      leftBtn.disabled = isAtStart;
      leftBtn.style.opacity = isAtStart ? '0.5' : '1';

      rightBtn.disabled = isAtEnd;
      rightBtn.style.opacity = isAtEnd ? '0.5' : '1';
    }

    sliderComponent.addEventListener('scroll', updateButtonStates, { passive: true });
    window.addEventListener('resize', updateButtonStates);
    updateButtonStates();
  });
});

