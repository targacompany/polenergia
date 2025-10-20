<script>
const components = document.querySelectorAll('[data-carousell="component"]');

components.forEach(component => {
  const wrapper = component.querySelector('[data-carousell="elements-wrapper"]');
  let tween;

  component.addEventListener('mouseenter', () => {
    // uruchamia płynne przesuwanie w lewo
    tween = gsap.to(wrapper, {
      x: "-=200", // przesunięcie w lewo o 200px (możesz zmienić)
      ease: "none",
      duration: 3, // tempo przesuwania
      repeat: -1 // pętla bez końca
    });
  });

  component.addEventListener('mouseleave', () => {
    // zatrzymuje animację w aktualnym miejscu
    if (tween) {
      tween.pause();
      tween = null;
    }
  });
});

</script>