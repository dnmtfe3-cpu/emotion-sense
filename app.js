// Emotion Sense bootstrap sem splash.
// O núcleo abre primeiro; melhorias visuais são opcionais e nunca podem causar tela branca.
import('./app-main.js?v=10')
  .then(async () => {
    const extras = await Promise.allSettled([
      import('./experience.js?v=10'),
      import('./polish.js?v=10')
    ]);
    extras.forEach(result => {
      if (result.status === 'rejected') console.error('Emotion Sense extra module error', result.reason);
    });
  })
  .catch(error => {
    console.error('Emotion Sense critical bootstrap error', error);
    document.body.classList.remove('es-gate');
    document.getElementById('es-auth-root')?.remove();
    document.querySelectorAll('.screen').forEach(screen => screen.classList.remove('active'));
    document.getElementById('screen-inicio')?.classList.add('active');
    const nav = document.getElementById('bottom-nav');
    if (nav) nav.style.display = 'flex';
  });
