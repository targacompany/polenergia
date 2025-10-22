document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('[calc-data="type-toggler"]').forEach(wrapper => {
    const buttons = wrapper.querySelectorAll('[data-calc="calc-button"]');
    const advancedOptions = gsap.utils.toArray('[data-calc="advanced-option"]');
    const advancedSecond = gsap.utils.toArray('[data-calc="advanced-second"]');
    const hideOnAdvanced = gsap.utils.toArray('[calc-button="hide-on-advanced"]');

    // 🚀 Force start state hidden (no flicker)
    gsap.set([...advancedOptions, ...advancedSecond], {
      display: "none",
      maxHeight: 0,
      opacity: 0,
      overflow: "hidden"
    });

    // Show with GSAP
    const showElements = (elements) => {
      elements.forEach(el => {
        gsap.killTweensOf(el);
        el.style.display = "flex"; // set display first
        gsap.fromTo(el,
          { maxHeight: 0, opacity: 0, overflow: "hidden" },
          {
            maxHeight: el.scrollHeight,
            opacity: 1,
            duration: 0.4,
            ease: "power2.out",
            onComplete: () => { el.style.maxHeight = "none"; el.style.overflow = ""; }
          }
        );
      });
    };

    // Hide with GSAP
    const hideElements = (elements) => {
      elements.forEach(el => {
        gsap.killTweensOf(el);
        gsap.to(el, {
          maxHeight: 0,
          opacity: 0,
          overflow: "hidden",
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => { el.style.display = "none"; }
        });
      });
    };

    // Handle toggler clicks
    buttons.forEach(button => {
      button.addEventListener("click", () => {
        buttons.forEach(b => b.classList.remove("is-active"));
        button.classList.add("is-active");

        const calcOption = button.getAttribute("calc-option");
        const isAdvanced = calcOption === "is-advanced";

        if (isAdvanced) {
          showElements(advancedOptions);
          hideElements(advancedSecond);
          hideOnAdvanced.forEach(el => el.style.display = "none");
        } else {
          hideElements(advancedOptions);
          hideElements(advancedSecond);
          hideOnAdvanced.forEach(el => el.style.display = "");
        }

        document.dispatchEvent(new CustomEvent('polenergia:calculator:advanced', {
          detail: { active: isAdvanced }
        }));
      });
    });

    // Handle "next-data" inside advanced options
    advancedOptions.forEach(option => {
      const nextButton = option.querySelector('[data-calc="next-data"]');
      if (nextButton) {
        nextButton.addEventListener("click", () => {
          hideElements(advancedOptions);
          showElements(advancedSecond);
        });
      }
    });

    advancedSecond.forEach(step => {
      const prevButton = step.querySelector('[data-button="previous-step"]');
      if (prevButton) {
        prevButton.addEventListener("click", () => {
          hideElements(advancedSecond);
          showElements(advancedOptions);
        });
      }
    });
  });
});
