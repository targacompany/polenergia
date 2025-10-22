document.addEventListener("DOMContentLoaded", () => {
  const counters = document.querySelectorAll('[text-animation="counter"]');
  
  if (counters.length === 0) {
    console.error('[counter] No elements found with attribute [text-animation="counter"]');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);

  counters.forEach((counter) => {
    const target = counter.textContent.trim();
    if (!target) {
      console.warn('[counter] Counter element has no text content, skipping');
      return;
    }

    // Get computed styles BEFORE clearing content
    const computedStyle = window.getComputedStyle(counter);
    const originalLineHeight = computedStyle.lineHeight;

    counter.textContent = ""; // clear original text

    // Preserve existing styles, only add necessary layout properties
    Object.assign(counter.style, {
      display: "flex",
      gap: "4px",
      overflow: "hidden",
      lineHeight: originalLineHeight !== "normal" ? originalLineHeight : "1em"
    });

    target.split("").forEach((char, i) => {
    const wheel = document.createElement("div");
    const strip = document.createElement("div");
    
    // Handle non-digit characters (spaces, commas, etc.)
    if (!/\d/.test(char)) {
      const staticChar = document.createElement("span");
      staticChar.textContent = char;
      Object.assign(staticChar.style, { 
        display: "inline-block",
        minWidth: char === " " ? "0.3ch" : "auto"
      });
      counter.appendChild(staticChar);
      return;
    }
    
    const digit = parseInt(char, 10);

    Object.assign(wheel.style, {
      position: "relative",
      height: "1em",
      overflow: "hidden",
      minWidth: "0.6ch",
      display: "inline-block"
    });

    Object.assign(strip.style, {
      display: "flex",
      flexDirection: "column"
    });

    // build 0–9 repeated a few times for spinning
    const loops = 3;
    for (let r = 0; r < loops; r++) {
      for (let n = 0; n < 10; n++) {
        const span = document.createElement("span");
        span.textContent = n;
        Object.assign(span.style, { display: "block", lineHeight: "1em" });
        strip.appendChild(span);
      }
    }
    // add final sequence up to the target digit
    for (let n = 0; n <= digit; n++) {
      const span = document.createElement("span");
      span.textContent = n;
      Object.assign(span.style, { display: "block", lineHeight: "1em" });
      strip.appendChild(span);
    }

    wheel.appendChild(strip);
    counter.appendChild(wheel);

    // after DOM insert, measure the height of one digit
    requestAnimationFrame(() => {
      const digitHeight = strip.firstElementChild.offsetHeight;
      
      if (!digitHeight || digitHeight === 0) {
        console.error('[counter] Could not measure digit height, counter may be invisible or have invalid styles');
        return;
      }
      
      const targetOffset = -(loops * 10 + digit) * digitHeight;

      gsap.to(strip, {
        y: targetOffset,
        ease: "power2.out",
        duration: 2,
        delay: (target.length - 1 - i) * 0.1, // right to left animation
        scrollTrigger: {
          trigger: counter,
          start: "top 80%",
          once: true,
          onEnter: () => console.log(`[counter] digit ${i} animating to ${digit}`)
        }
      });
    });
    });
  });
});
