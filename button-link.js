document.addEventListener("DOMContentLoaded", () => {
  const triggers = document.querySelectorAll('[button-link="trigger"]');
  console.log("Found triggers:", triggers.length);
  
  triggers.forEach((trigger, index) => {
    console.log(`Trigger ${index}:`, trigger);
    
    const source = trigger.querySelector('[button-link="source"]');
    console.log(`Source for trigger ${index}:`, source);
    
    if (!source) {
      console.warn(`No source found for trigger ${index}`);
      return;
    }

    const href = source.getAttribute("href");
    console.log(`Href for trigger ${index}:`, href);
    
    if (!href) {
      console.warn(`No href found for trigger ${index}`);
      return;
    }

    trigger.addEventListener("click", () => {
      console.log("Trigger clicked! Navigating to:", href);
      window.location.href = href;
    });
    
    console.log(`✓ Trigger ${index} setup complete`);
  });
});

