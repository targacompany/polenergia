// Navbar show/hide on scroll
document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar-component');
  
  if (!navbar) return;

  let lastScrollY = window.scrollY;
  let ticking = false;

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
    if (currentScrollY < 100) {
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

    lastScrollY = currentScrollY;
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(handleScroll);
      ticking = true;
    }
  });
});
