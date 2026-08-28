// Emotion Sense bootstrap sem splash visual.
// Carrega a experiência, a lógica principal e o polimento visual da Home.
const noSplashStyle = document.createElement('style');
noSplashStyle.textContent = `
  .es-splash{display:none!important}
  #es-auth-root:has(.es-splash){background:#F7F7FB!important}
`;
document.head.appendChild(noSplashStyle);

await import('./experience.js?v=9');
await import('./app-main.js?v=9');
await import('./polish.js?v=9');
