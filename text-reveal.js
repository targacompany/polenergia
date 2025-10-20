document.addEventListener("DOMContentLoaded", () => {
  const parents = document.querySelectorAll('[data-text="animation-parent"]');
  console.log("Found parents:", parents.length);

  parents.forEach((parent, i) => {
    const trigger = parent.querySelector('[data-text="text-reveal"]');
    const targetDesktop = parent.querySelector('[data-text="show-more"]');
    const targetMobile = parent.querySelector('[data-text="mobile-rolled-up"]');
    const hideBtn = parent.querySelector('[data-text="text-hide"]');

    console.log(`Parent ${i}:`, { trigger, targetDesktop, targetMobile, hideBtn });

    function rollDown(el) {
      if (!el) return;
      gsap.set(el, { display: "block", height: "auto" }); 
      let fullHeight = el.offsetHeight; 
      gsap.fromTo(el, { height: 0, overflow: "hidden" }, { height: fullHeight, duration: 0.5, ease: "power2.out" });
    }

    function rollUp(el) {
      if (!el) return;
      let fullHeight = el.offsetHeight; 
      gsap.to(el, { height: 0, duration: 0.5, ease: "power2.in", onComplete: () => {
        gsap.set(el, { display: "none" });
      }});
    }

    if (trigger) {
      trigger.addEventListener("click", () => {
        console.log("Clicked trigger in parent", i);

        if (window.innerWidth >= 992) {
          rollDown(targetDesktop);
        } else {
          rollDown(targetDesktop);
          rollDown(targetMobile);
        }

        trigger.style.display = "none";
      });
    }

    if (hideBtn) {
      hideBtn.addEventListener("click", () => {
        console.log("Clicked hide in parent", i);

        rollUp(targetDesktop);
        rollUp(targetMobile);

        if (trigger) {
          trigger.style.display = ""; // restore trigger
        }
      });
    }
  });
});
