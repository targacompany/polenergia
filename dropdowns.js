document.addEventListener("DOMContentLoaded", () => {
  const dropdowns = document.querySelectorAll('[faq-element="dropdown"]');

  function closeContent(el, icon) {
    gsap.to(el, {
      height: 0,
      duration: 0.4,
      ease: "power2.inOut",
      onComplete: () => gsap.set(el, { display: "none" })
    });
    if (icon) gsap.to(icon, { rotate: 0, duration: 0.3, ease: "power2.inOut" });
  }

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('[faq-element="trigger"]');
    const content = dropdown.querySelector('[faq-element="content"]');
    const icon = trigger.querySelector('.faq-icon');

    // start closed
    gsap.set(content, { height: 0, display: "none", overflow: "hidden" });

    trigger.addEventListener("click", () => {
      const isOpen = gsap.getProperty(content, "display") !== "none";

      // close all dropdowns
      dropdowns.forEach(d => {
        const dContent = d.querySelector('[faq-element="content"]');
        const dIcon = d.querySelector('.faq-icon');
        if (gsap.getProperty(dContent, "display") !== "none") {
          closeContent(dContent, dIcon);
        }
      });

      // if clicked one was closed → open it
      if (!isOpen) {
        gsap.set(content, { display: "flex" });
        gsap.fromTo(content,
          { height: 0 },
          {
            height: content.scrollHeight,
            duration: 0.5,
            ease: "power2.inOut",
            onComplete: () => gsap.set(content, { height: "auto" })
          }
        );
        if (icon) gsap.to(icon, { rotate: 180, duration: 0.3, ease: "power2.inOut" });
      }
    });

    // extra rule: close on scroll if nav dropdown
    if (content.classList.contains("nav-dropdown-content")) {
      window.addEventListener("scroll", () => {
        if (gsap.getProperty(content, "display") !== "none") {
          closeContent(content, icon);
        }
      });
    }
  });
});
