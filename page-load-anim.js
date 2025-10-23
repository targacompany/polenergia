// Page Loading Animation
// This script runs immediately to set initial styles before page loads

(function() {
    'use strict';
    
    // Create and inject critical CSS immediately
    const criticalCSS = `
        /* Initial hidden state for loading animation */
        .header-hero-left > * {
            opacity: 0;
        }
        
        .navbar-container, 
        .bar-content,
        .header {
            opacity: 0;
        }
        
        /* Prevent flash of unstyled content */
        body {
            visibility: hidden;
        }
        
        body.loaded {
            visibility: visible;
        }
    `;
    
    // Inject CSS immediately
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
    
    // Function to animate elements in
    function animateElementsIn() {
        // Wait for GSAP to be available
        if (typeof gsap === 'undefined') {
            setTimeout(animateElementsIn, 50);
            return;
        }
        
        // Create timeline for coordinated animation
        const tl = gsap.timeline();
        
        // Show body when animation starts
        document.body.classList.add('loaded');
        
        // Step 1: Animate navbar-container, header, and bar-content to opacity 1 (0.15s)
        tl.to(['.navbar-container', '.header', '.bar-content'], {
            opacity: 1,
            duration: 0.25,
            ease: 'power4.in'
        });
        
        // Step 2: Animate header-hero-left children one by one with 0.15s delay each
        tl.to('.header-hero-left > *', {
            opacity: 1,
            duration: 0.2,
            ease: 'power4.in',
            stagger: 0.15 // 0.15s delay between each child
        });
        
        // Step 3: Animate bar-content to opacity 1 (0.2s) and navbar-banner color change simultaneously
        tl.to('.bar-content', {
            delay: 0.4,
            opacity: 1,
            duration: 0.2,
            ease: 'power4.in'
        })
        .to('.navbar-banner', {
            delay: 0.4,
            duration: 0.2,
            ease: 'power4.in'
        }, '-=0.4') // Start at the same time as bar-content animation
        .call(() => {
            // Fallback: ensure all elements are visible after animation completes
            const elements = document.querySelectorAll('.header-hero-left > *, .navbar-container, .bar-content, .header');
            elements.forEach(el => {
                if (el) el.style.opacity = '1';
            });
        });
    }
    
    // Start animation when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', animateElementsIn);
    } else {
        // DOM is already ready
        animateElementsIn();
    }
    
    // Fallback: if elements don't exist yet, keep checking
    function checkAndAnimate() {
        const headerHeroLeft = document.querySelector('.header-hero-left');
        const navbarContainer = document.querySelector('.navbar-container');
        const barContent = document.querySelector('.bar-content');
        const navbarBanner = document.querySelector('.navbar-banner');
        
        if (headerHeroLeft && navbarContainer && barContent && navbarBanner) {
            animateElementsIn();
        } else {
            setTimeout(checkAndAnimate, 100);
        }
    }
    
    // Start checking for elements
    checkAndAnimate();
    
    // Fallback timeout: if animation doesn't start within 3 seconds, make elements visible
    setTimeout(() => {
        const elements = document.querySelectorAll('.header-hero-left > *, .navbar-container, .bar-content, .header');
        elements.forEach(el => {
            if (el) el.style.opacity = '1';
        });
        document.body.classList.add('loaded');
    }, 5000);
    
})();
