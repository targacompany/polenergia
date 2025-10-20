// Top position calculations for navigation content
document.addEventListener('DOMContentLoaded', function() {
  const navbar = document.querySelector('.navbar-component');
  const navbarBanner = document.querySelector('.navbar-banner');
  const navigationContent = document.querySelector('.navigation-content');
  const mobileNavi = document.querySelector('.mobile-navi');
  const mobileHamburger = document.querySelector('.mobile-hamburger');
  
  if (!navbar || !navigationContent) return;

  let isMenuOpen = false;

  // Calculate the correct top position and height based on navbar and banner visibility
  const calculatePositionAndHeight = () => {
    const navbarHeight = navbar.offsetHeight;
    let totalHeight = navbarHeight;
    let availableHeight = navbarHeight;

    // Check if banner is visible (when at top of page)
    if (navbarBanner) {
      const bannerHeight = navbarBanner.offsetHeight;
      const scrollY = window.scrollY;
      
      // If we're at the top of the page, both navbar and banner are visible
      if (scrollY === 0) {
        totalHeight = navbarHeight + bannerHeight;
        availableHeight = navbarHeight + bannerHeight;
      }
      // If scrolled, only navbar is visible (sticky at top)
    }

    return {
      top: totalHeight,
      height: `calc(100svh - ${availableHeight}px)`
    };
  };

  // Update navigation content position
  const updateNavigationPosition = () => {
    if (window.innerWidth < 991) {
      const positionData = calculatePositionAndHeight();
      navigationContent.style.top = `${positionData.top}px`;
      navigationContent.style.height = positionData.height;
    } else {
      // Remove positioning on desktop
      navigationContent.style.top = '';
      navigationContent.style.height = '';
    }
  };

  // Initial position
  updateNavigationPosition();

  // Update position on scroll (for banner visibility changes)
  window.addEventListener('scroll', updateNavigationPosition);

  // Update position on resize
  window.addEventListener('resize', updateNavigationPosition);

  // Handle mobile navigation click
  if (mobileNavi) {
    mobileNavi.addEventListener('click', () => {
      isMenuOpen = !isMenuOpen;
      
      // Toggle hamburger icons
      if (mobileHamburger) {
        const hamburgerOpen = mobileHamburger.querySelector('.open');
        const hamburgerClose = mobileHamburger.querySelector('.close');
        
        if (hamburgerOpen && hamburgerClose) {
          if (isMenuOpen) {
            // Hide .open, show .close
            gsap.to(hamburgerOpen, {
              display: 'none',
              duration: 0,
              ease: 'power2.in'
            });
            
            gsap.to(hamburgerClose, {
              display: 'flex',
              duration: 0,
              ease: 'power2.in'
            });
          } else {
            // Hide .close, show .open
            gsap.to(hamburgerClose, {
              display: 'none',
              duration: 0,
              ease: 'power2.in'
            });
            
            gsap.to(hamburgerOpen, {
              display: 'flex',
              duration: 0,
              ease: 'power2.in'
            });
          }
        }
      }
      
      // Animate navigation content transform
      if (isMenuOpen) {
        // Slide in from left
        gsap.fromTo(navigationContent, {
          transform: 'translate3d(-100%, 0px, 0px)'
        }, {
          transform: 'translate3d(0%, 0px, 0px)',
          duration: 0.3,
          ease: 'power2.in'
        });
      } else {
        // Slide out to left
        gsap.to(navigationContent, {
          transform: 'translate3d(-100%, 0px, 0px)',
          duration: 0.3,
          ease: 'power2.in'
        });
      }
    });
  }
});

