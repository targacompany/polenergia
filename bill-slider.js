(function() {
  'use strict';

  // Configuration
  const SLIDER_CONFIG = {
    min: 100,           // Minimum bill value (PLN)
    max: 2000,          // Maximum bill value (PLN)
    step: 10,           // Step increment
    defaultValue: 500   // Default starting value
  };

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Get elements
    const slider = document.querySelector('[data-slider="bill-slider"]');
    const billInput = document.getElementById('billInput');
    const valueDisplay = document.querySelector('[data-slider="bill-value"]');
    const minLabel = document.querySelector('[data-slider="min-label"]');
    const maxLabel = document.querySelector('[data-slider="max-label"]');

    // Early return if required elements don't exist
    if (!slider || !billInput) {
      console.warn('Bill range slider: required elements not found');
      return;
    }

    // Initialize slider attributes
    slider.setAttribute('type', 'range');
    slider.setAttribute('min', SLIDER_CONFIG.min);
    slider.setAttribute('max', SLIDER_CONFIG.max);
    slider.setAttribute('step', SLIDER_CONFIG.step);
    slider.setAttribute('value', billInput.value || SLIDER_CONFIG.defaultValue);

    // Set initial input value if empty
    if (!billInput.value) {
      billInput.value = SLIDER_CONFIG.defaultValue;
    }

    // Initialize labels
    if (minLabel) minLabel.textContent = SLIDER_CONFIG.min;
    if (maxLabel) maxLabel.textContent = SLIDER_CONFIG.max;

    // Update value display
    updateValueDisplay(slider.value);

    /**
     * Update the value display element
     */
    function updateValueDisplay(value) {
      if (valueDisplay) {
        valueDisplay.textContent = formatCurrency(value);
      }
    }

    /**
     * Format number as Polish currency
     */
    function formatCurrency(value) {
      const numValue = parseFloat(value);
      if (isNaN(numValue)) return '0 zł';
      return `${numValue.toFixed(0)} zł`;
    }

    /**
     * Update slider visual progress (CSS custom property)
     */
    function updateSliderProgress(value) {
      const percentage = ((value - SLIDER_CONFIG.min) / (SLIDER_CONFIG.max - SLIDER_CONFIG.min)) * 100;
      slider.style.setProperty('--slider-progress', `${percentage}%`);
    }

    /**
     * Handle slider input
     */
    function handleSliderInput(e) {
      const value = e.target.value;
      
      // Update billInput
      billInput.value = value;
      
      // Update display
      updateValueDisplay(value);
      updateSliderProgress(value);
      
      // Trigger input event on billInput to update calculator
      const inputEvent = new Event('input', { bubbles: true });
      billInput.dispatchEvent(inputEvent);
    }

    /**
     * Handle direct input in billInput field
     */
    function handleBillInputChange(e) {
      const value = parseFloat(e.target.value);
      
      if (!isNaN(value)) {
        // Clamp value to slider range
        const clampedValue = Math.max(SLIDER_CONFIG.min, Math.min(SLIDER_CONFIG.max, value));
        
        // Update slider
        slider.value = clampedValue;
        
        // Update display
        updateValueDisplay(clampedValue);
        updateSliderProgress(clampedValue);
      }
    }

    /**
     * Handle slider interaction start
     */
    function handleSliderStart() {
      slider.classList.add('is-dragging');
    }

    /**
     * Handle slider interaction end
     */
    function handleSliderEnd() {
      slider.classList.remove('is-dragging');
    }

    // Attach event listeners to slider
    slider.addEventListener('input', handleSliderInput);
    slider.addEventListener('mousedown', handleSliderStart);
    slider.addEventListener('mouseup', handleSliderEnd);
    slider.addEventListener('touchstart', handleSliderStart);
    slider.addEventListener('touchend', handleSliderEnd);

    // Attach event listener to billInput for bidirectional sync
    billInput.addEventListener('input', handleBillInputChange);

    // Initialize progress
    updateSliderProgress(slider.value);

    // Add custom CSS for modern slider styling
    injectSliderStyles();
  }

  /**
   * Inject custom CSS for modern slider styling
   */
  function injectSliderStyles() {
    const style = document.createElement('style');
    style.textContent = `
      [data-slider="bill-slider"] {
        -webkit-appearance: none;
        appearance: none;
        width: 100%;
        height: 8px;
        border-radius: 4px;
        background: #e0e0e0;
        outline: none;
        position: relative;
        cursor: pointer;
      }

      [data-slider="bill-slider"]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
      }

      [data-slider="bill-slider"]::-webkit-slider-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      }

      [data-slider="bill-slider"]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #007bff;
        cursor: pointer;
        border: 2px solid #fff;
        box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        transition: all 0.2s ease;
      }

      [data-slider="bill-slider"]::-moz-range-thumb:hover {
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0,0,0,0.3);
      }

      [data-slider="bill-slider"].is-dragging::-webkit-slider-thumb {
        transform: scale(1.2);
        box-shadow: 0 6px 12px rgba(0,0,0,0.4);
      }

      [data-slider="bill-slider"].is-dragging::-moz-range-thumb {
        transform: scale(1.2);
        box-shadow: 0 6px 12px rgba(0,0,0,0.4);
      }

      /* Progress fill using CSS custom property */
      [data-slider="bill-slider"] {
        background: linear-gradient(to right, #007bff var(--slider-progress, 0%), #e0e0e0 var(--slider-progress, 0%));
      }
    `;
    document.head.appendChild(style);
  }

  // Export configuration for external access (optional)
  window.BillSliderConfig = SLIDER_CONFIG;
})();
