// Emotion Sense bootstrap sem splash visual.
// Carrega primeiro a camada de experiência e depois a lógica principal.
const noSplashStyle = document.createElement('style');
noSplashStyle.textContent = `
  .es-splash{display:none!important}
  #es-auth-root:has(.es-splash){background:#F7F7FB!important}
`;
document.head.appendChild(noSplashStyle);

await import('./experience.js?v=8');
await import('./app-main.js?v=8');
