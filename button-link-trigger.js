document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('[button-link="trigger"]').forEach(trigger => {
    const source = trigger.querySelector('[button-link="source"]');
    if (!source) return;

    const href = source.getAttribute("href");
    if (!href) return;

    trigger.addEventListener("click", () => {
      window.location.href = href; // navigate in the same tab
    });
  });
});
