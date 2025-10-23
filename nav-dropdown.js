document.addEventListener('DOMContentLoaded', () => {
  const dropdowns = document.querySelectorAll('.top-nav-dropdown');

  dropdowns.forEach(dropdown => {
    const content = dropdown.querySelector('.top-nav-dropdown-content');
    if (!content) return;

    let hideTimeout;
    const baseTransition = 'transform 0.3s ease, opacity 0.4s ease';

    const prepareHiddenState = () => {
      content.style.display = 'none';
      content.style.opacity = '0';
      content.style.transform = 'translateY(50%)';
    };

    const showContent = () => {
      clearTimeout(hideTimeout);
      content.style.display = 'flex';
      content.style.transition = `${baseTransition} 0.2s`;
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

    dropdown.addEventListener('mouseenter', showContent);

    dropdown.addEventListener('mouseleave', event => {
      if (isWithinContent(event.relatedTarget)) return;
      hideContent();
    });

    content.addEventListener('mouseenter', () => {
      clearTimeout(hideTimeout);
      content.style.transition = `${baseTransition} 0.2s`;
      content.style.transform = 'translateY(0%)';
      content.style.opacity = '1';
    });

    content.addEventListener('mouseleave', hideContent);

    prepareHiddenState();
  });
});


