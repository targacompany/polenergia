
document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('.top-nav-dropdown');
  const HOVER_BREAKPOINT = 992;
  const isHoverMode = () => window.innerWidth >= HOVER_BREAKPOINT;

  dropdowns.forEach(dropdown => {
    const content = dropdown.querySelector('.top-nav-dropdown-content');
    if (!content) return;

    let hideTimeout;
    const baseTransition = 'transform 0.3s ease 0s, opacity 0.3 ease 0s';
    const delayedTransition = 'transform 0.3s ease 0.2s, opacity 0.3s ease 0.2s';
    let hoverEnabled = isHoverMode();

    const prepareHiddenState = () => {
      clearTimeout(hideTimeout);
      content.style.display = 'none';
      content.style.opacity = '0';
      content.style.transform = 'translateY(50%)';
      content.style.transition = baseTransition;
    };

    const showContent = (useDelay = true) => {
      clearTimeout(hideTimeout);
      content.style.display = 'flex';
      content.style.transition = useDelay ? delayedTransition : baseTransition;
      requestAnimationFrame(() => {
        content.style.transform = 'translateY(0%)';
        content.style.opacity = '1';
      });
    };

    const hideContent = () => {
      clearTimeout(hideTimeout);
      content.style.transition = baseTransition;
      content.style.transform = 'translateY(50%)';
      content.style.opacity = '0';
      hideTimeout = setTimeout(() => {
        content.style.display = 'none';
      }, 400);
    };

    const isWithinContent = target => target && (content === target || content.contains(target));

    dropdown.addEventListener('mouseenter', () => {
      if (!hoverEnabled) return;
      showContent();
    });

    dropdown.addEventListener('mouseleave', event => {
      if (!hoverEnabled) return;
      if (isWithinContent(event.relatedTarget)) return;
      hideContent();
    });

    content.addEventListener('mouseenter', () => {
      if (!hoverEnabled) return;
      clearTimeout(hideTimeout);
      content.style.transition = delayedTransition;
      content.style.transform = 'translateY(0%)';
      content.style.opacity = '1';
    });

    content.addEventListener('mouseleave', () => {
      if (!hoverEnabled) return;
      hideContent();
    });

    dropdown.addEventListener('click', event => {
      if (hoverEnabled) return;
      if (event.target.closest('.top-nav-dropdown-content')) return;
      event.preventDefault();
      const isVisible = content.style.display === 'flex' && content.style.opacity === '1';
      if (isVisible) {
        hideContent();
      } else {
        showContent(false);
      }
    });

    const updateHoverState = () => {
      const nextHoverState = isHoverMode();
      if (nextHoverState === hoverEnabled) return;
      hoverEnabled = nextHoverState;
      prepareHiddenState();
    };

    window.addEventListener('resize', updateHoverState);

    prepareHiddenState();
  });
});
