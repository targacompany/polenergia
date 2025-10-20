// Mobile menu: only compute and set top position
document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar-component');
  const navbarBanner = document.querySelector('.navbar-banner');
  const navigationContent = document.querySelector('.navigation-content');

  if (!navbar || !navigationContent) return;

  // Calculate the correct top position based on navbar and banner visibility
  const calculateTop = () => {
    const navbarHeight = navbar.offsetHeight;
    let totalHeight = navbarHeight;

    if (navbarBanner) {
      const bannerHeight = navbarBanner.offsetHeight;
      const atTop = window.scrollY === 0;
      if (atTop) {
        totalHeight = navbarHeight + bannerHeight;
      }
    }

    return totalHeight;
  };

  // Update navigation content top position (mobile only)
  const updateTopPosition = () => {
    if (window.innerWidth < 991) {
      const top = calculateTop();
      navigationContent.style.top = `${top}px`;
    } else {
      navigationContent.style.top = '';
    }
  };

  // Initial position
  updateTopPosition();

  // Update on scroll and resize
  window.addEventListener('scroll', updateTopPosition);
  window.addEventListener('resize', updateTopPosition);
});

