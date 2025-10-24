// Navbar show/hide on scroll
document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar-component');
  const navbarBanner = document.querySelector('.navbar-banner');
  
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;
  let bannerVisible = false;
  let bannerHideTimeout;

  const MOBILE_BREAKPOINT = 992;

  const getScrollThreshold = () => {
    if (window.visualViewport) {
      return window.visualViewport.height;
    }
    return window.innerHeight;
  };

  const setBannerHidden = (immediate = false) => {
    if (!navbarBanner) return;
    clearTimeout(bannerHideTimeout);
    navbarBanner.style.transform = 'translateY(100%)';
    if (immediate) {
      navbarBanner.style.display = 'none';
      bannerVisible = false;
      return;
    }
    bannerHideTimeout = setTimeout(() => {
      navbarBanner.style.display = 'none';
      bannerVisible = false;
    }, 300);
  };

  const setBannerVisible = () => {
    if (!navbarBanner || bannerVisible) return;
    clearTimeout(bannerHideTimeout);
    navbarBanner.style.display = 'block';
    requestAnimationFrame(() => {
      navbarBanner.style.transform = 'translateY(0)';
    });
    bannerVisible = true;
  };

  const showNavbar = () => {
    gsap.to(navbar, {
      y: 0,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const hideNavbar = () => {
    gsap.to(navbar, {
      y: -navbar.offsetHeight,
      duration: 0.3,
      ease: 'power2.out'
    });
  };

  const handleScroll = () => {
    const currentScrollY = window.scrollY;

    // Don't hide navbar if we're at the top of the page
    if (currentScrollY < 50){
      showNavbar();
    } else {
      // Scrolling down - hide navbar
      if (currentScrollY > lastScrollY) {
        hideNavbar();
      } 
      // Scrolling up - show navbar
      else if (currentScrollY < lastScrollY) {
        showNavbar();
      }
    }

    if (navbarBanner) {
      if (window.innerWidth < MOBILE_BREAKPOINT) {
        if (currentScrollY >= getScrollThreshold()) {
          setBannerVisible();
        } else {
          setBannerHidden();
        }
      } else if (bannerVisible) {
        setBannerHidden(true);
      }
    }

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  });

  if (navbarBanner) {
    navbarBanner.style.transform = 'translateY(-100%)';
    navbarBanner.style.display = 'none';

    window.addEventListener('resize', () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) {
        setBannerHidden(true);
      } else if (window.scrollY >= getScrollThreshold()) {
        setBannerVisible();
      } else {
        setBannerHidden(true);
      }
    });
  }
});
