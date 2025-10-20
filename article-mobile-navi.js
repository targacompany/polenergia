gsap.registerPlugin(ScrollTrigger);

let mm = gsap.matchMedia();

mm.add("(max-width: 991px)", () => {
  const toggleEl = document.querySelector('[mobile-navi="toggle-element"]');
  const infoEl = document.querySelector('.mobile-navi-info');
  const openArea = document.querySelector('.open-area');

  if (!toggleEl || !infoEl || !openArea) return;

  // Początkowy stan
  gsap.set(toggleEl, { display: "none", opacity: 0 });
  gsap.set(infoEl, { display: "block", opacity: 1 });

  // Tworzymy animację przełącznika
  const tl = gsap.timeline({ paused: true, reversed: true });

  tl.to(infoEl, {
    opacity: 0,
    duration: 0.3,
    onComplete: () => gsap.set(infoEl, { display: "none" }),
  })
    .set(toggleEl, { display: "block" })
    .to(toggleEl, { opacity: 1, duration: 0.3 }, "<");

  // Kliknięcie w openArea przełącza animację
  openArea.addEventListener("click", () => {
    tl.reversed(!tl.reversed());
  });
});


