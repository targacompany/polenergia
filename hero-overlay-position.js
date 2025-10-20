const img = document.querySelector('.hero-bkg-overlay');

function updateObjectPosition() {
  const vw = window.innerWidth;

  const maxWidth = 1512;
  const minWidth = 992;

  const maxPos = 80; // %
  const minPos = 40; // %

  let percentX;

  if (vw >= maxWidth) {
    percentX = maxPos;
  } else if (vw <= minWidth) {
    percentX = minPos;
  } else {
    // interpolacja liniowa
    const ratio = (vw - minWidth) / (maxWidth - minWidth);
    percentX = minPos + (maxPos - minPos) * ratio;
  }

  img.style.objectPosition = `${percentX}% 50%`;
}

// ustaw od razu
updateObjectPosition();

// i reaguj na zmianę okna
window.addEventListener('resize', updateObjectPosition);
