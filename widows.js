(function() {
  // Lista krótkich słów, które nie mogą zostawać na końcu linii
  const shortWords = ["i", "a", "z", "w", "o", "u", "do", "na", "po", "od", "za"];

  // Funkcja poprawiająca tekst
  function fixOrphans(root = document) {
    const textElements = root.querySelectorAll('p, h1, h2, h3, h4, h5, h6');

    textElements.forEach(el => {
      let html = el.innerHTML;

      // --- 1. Zamień spacje po krótkich słowach na twarde spacje
      shortWords.forEach(word => {
        const regex = new RegExp(`\\b${word} `, 'gi');
        html = html.replace(regex, `${word}&nbsp;`);
      });

      // --- 2. Wykryj pojedyncze słowo na końcu linii
      // (np. gdy linia zawija się i zostaje jedno słowo)
      // — dodaj twardą spację z lewej strony, by "przykleić" je do poprzedniego
      html = html.replace(/ ([^ ]+)\s*$/gm, '&nbsp;$1');

      el.innerHTML = html;
    });
  }

  // Uruchom po załadowaniu strony
  document.addEventListener("DOMContentLoaded", () => {
    fixOrphans();

    // --- Obserwator zmian w DOM (np. Webflow interakcje, CMS)
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) {
            fixOrphans(node);
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });
  });
})();
