// Emotion Sense bootstrap estável, sem splash.
// Auth carrega primeiro. O polimento visual vem depois e não interfere no cadastro/login.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js?v=11').then(reg => reg.update()).catch(console.error);
}

import('./app-main.js?v=11')
  .then(() => import('./polish.js?v=11').catch(error => console.error('Emotion Sense polish error', error)))
  .catch(error => {
    console.error('Emotion Sense critical bootstrap error', error);
    document.body.classList.remove('es-gate');
    document.getElementById('es-auth-root')?.remove();
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('screen-inicio')?.classList.add('active');
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = 'flex';
  });
