// Emotion Sense bootstrap sem splash visual.
// Mantém a lógica principal em app-main.js e garante que qualquer splash legado fique invisível.
const noSplashStyle = document.createElement('style');
noSplashStyle.textContent = `
  .es-splash{display:none!important}
  #es-auth-root:has(.es-splash){background:#F7F7FB!important}
`;
document.head.appendChild(noSplashStyle);

import('./app-main.js?v=7');
