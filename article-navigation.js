(function() {
  'use strict';

  function generateArticleNavigation() {
    console.log('=== Article Navigation: Starting generation ===');
    
    // Find the navigation list and article body elements
    const naviList = document.querySelector('[data-article="navi-list"]');
    const articleBody = document.querySelector('[data-article="article-body"]');

    console.log('Navigation list found:', naviList);
    console.log('Article body found:', articleBody);

    // Check if both elements exist
    if (!naviList || !articleBody) {
      console.warn('Article navigation: Required elements not found');
      console.warn('naviList:', naviList);
      console.warn('articleBody:', articleBody);
      return;
    }

    // Get all h2 and h3 headers from the article body
    const headers = articleBody.querySelectorAll('h2, h3');
    console.log(`Found ${headers.length} headers:`, headers);

    // Clear existing list items
    naviList.innerHTML = '';
    console.log('Cleared existing list items');

    // Generate list items for each header
    headers.forEach((header, index) => {
      // Skip headers with no text content
      const headerText = header.textContent.trim();
      if (!headerText) {
        console.log(`Skipping empty header ${index + 1}:`, header.tagName);
        return;
      }
      
      console.log(`Processing header ${index + 1}:`, header.tagName, headerText);
      const listItem = document.createElement('li');
      listItem.className = 'ordered-list-item';
      
      // Create anchor link
      const link = document.createElement('a');
      
      // Create or use existing ID for the header
      if (!header.id) {
        header.id = `section-${index + 1}`;
      }
      
      // Set link attributes
      link.href = `#${header.id}`;
      link.textContent = headerText;
      
      // Add data attribute to indicate header level
      listItem.setAttribute('data-level', header.tagName.toLowerCase());
      
      // Append link to list item
      listItem.appendChild(link);
      
      // Append list item to navigation list
      naviList.appendChild(listItem);
      console.log(`Added list item ${index + 1} to navigation`);
    });

    // Always add FAQ as the last item
    const faqListItem = document.createElement('li');
    faqListItem.className = 'ordered-list-item';
    
    const faqLink = document.createElement('a');
    faqLink.href = '#FAQ';
    faqLink.textContent = 'FAQ';
    
    faqListItem.setAttribute('data-level', 'h2');
    faqListItem.appendChild(faqLink);
    naviList.appendChild(faqListItem);
    console.log('Added FAQ list item to navigation');

    console.log(`=== Completed: ${headers.length + 1} navigation items generated (including FAQ) ===`);
    console.log('Final navigation list HTML:', naviList.innerHTML);

    // Optional: Add smooth scroll behavior to links
    addSmoothScroll();
  }

  function addSmoothScroll() {
    const naviList = document.querySelector('[data-article="navi-list"]');
    if (!naviList) return;

    const links = naviList.querySelectorAll('a[href^="#"]');
    
    // Get CSS variable and add 1rem: calc(var(--navbar-height) + 1rem)
    const rootStyles = getComputedStyle(document.documentElement);
    const fontSize = parseFloat(rootStyles.fontSize); // 1rem in px
    
    // Get the CSS var as a string, e.g. "6.5rem"
    const navbarHeightValue = rootStyles.getPropertyValue('--navbar-height').trim();
    
    let navbarHeightPx;
    if (navbarHeightValue.endsWith('rem')) {
      navbarHeightPx = parseFloat(navbarHeightValue) * fontSize;
    } else {
      navbarHeightPx = parseFloat(navbarHeightValue) || 0; // assumes px or unitless
    }
    
    const scrollOffset = navbarHeightPx + fontSize; // px
    
    links.forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetElement = document.querySelector(targetId);
        
        if (targetElement) {
          // Calculate position with offset
          const elementPosition = targetElement.getBoundingClientRect().top;
          const testOffset = 7.5 * fontSize; // TEST: 7.5rem
          const offsetPosition = elementPosition + window.pageYOffset - testOffset;
          
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      });
    });
  }

  function initArticleMobileToggle() {
    const toggleTrigger = document.querySelector('[article-navi="toggle-open"]');
    if (!toggleTrigger) {
      console.log('Article navigation toggle: trigger not found');
      return;
    }

    const closedText = document.querySelector('[article-navi="closed-text"]');
    const mobileToggleElement = document.querySelector('[movile-navi="toggle-element"]');
    const mobileQuery = window.matchMedia('(max-width: 991.98px)');

    let isExpanded = false;
    let previousClosedDisplay = '';
    let previousMobileDisplay = '';

    function applyState() {
      if (!mobileQuery.matches || !isExpanded) {
        if (closedText) {
          closedText.style.display = previousClosedDisplay;
        }
        if (mobileToggleElement) {
          mobileToggleElement.style.display = previousMobileDisplay;
        }
        return;
      }

      if (closedText) {
        previousClosedDisplay = previousClosedDisplay || closedText.style.display;
        closedText.style.display = 'none';
      }

      if (mobileToggleElement) {
        previousMobileDisplay = previousMobileDisplay || mobileToggleElement.style.display;
        mobileToggleElement.style.display = 'flex';
      }
    }

    function resetStoredDisplays() {
      previousClosedDisplay = '';
      previousMobileDisplay = '';
    }

    const handleToggle = () => {
      if (!mobileQuery.matches) {
        isExpanded = false;
        resetStoredDisplays();
        applyState();
        return;
      }

      isExpanded = !isExpanded;
      applyState();
    };

    toggleTrigger.addEventListener('click', handleToggle);

    const handleBreakpointChange = event => {
      if (!event.matches) {
        isExpanded = false;
        resetStoredDisplays();
      }
      applyState();
    };

    if (typeof mobileQuery.addEventListener === 'function') {
      mobileQuery.addEventListener('change', handleBreakpointChange);
    } else if (typeof mobileQuery.addListener === 'function') {
      mobileQuery.addListener(handleBreakpointChange);
    }

    applyState();
  }

  function initArticleFeatures() {
    generateArticleNavigation();
    initArticleMobileToggle();
  }

  // Initialize when DOM is ready
  console.log('Article Navigation Script Loaded');
  console.log('Document ready state:', document.readyState);
  
  if (document.readyState === 'loading') {
    console.log('Waiting for DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', initArticleFeatures);
  } else {
    console.log('DOM already loaded, running immediately');
    initArticleFeatures();
  }

  // Optional: Re-generate navigation if content changes
  // Expose function globally if needed
  window.refreshArticleNavigation = generateArticleNavigation;

})();
