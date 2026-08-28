// Emotion Sense bootstrap estável.
// Identidade visual é carregada sem interferir na lógica dos botões.
prepareBrand();

(async function boot(){
  try{
    await import('./app-core.js?v=17');
  }catch(error){
    console.error('Emotion Sense core error',error);
    showFatal('Não consegui carregar as funções do app. Recarregue a página.');
    return;
  }

  try{
    await import('./app-main.js?v=17');
  }catch(error){
    console.error('Emotion Sense auth error',error);
    document.body.classList.remove('es-gate');
    document.getElementById('es-auth-root')?.remove();
    window.switchTab?.('screen-inicio');
    showNonBlockingNotice('Modo local ativo. A sincronização da conta não carregou agora.');
  }

  Promise.allSettled([
    import('./cohesion.js?v=17'),
    import('./onboarding.js?v=17')
  ]).then(results=>results.forEach(result=>{
    if(result.status==='rejected') console.error('Emotion Sense optional module error',result.reason);
  }));
})();

function prepareBrand(){
  const meta=document.querySelector('meta[name="theme-color"]');
  if(meta) meta.content='#6945E6';
  addHeadLink('stylesheet','./brand.css?v=17','es-brand-css');
  addHeadLink('icon','./favicon.ico?v=17','es-favicon');
  addHeadLink('apple-touch-icon','./apple-touch-icon.png?v=17','es-apple-icon');
}

function addHeadLink(rel,href,id){
  if(document.getElementById(id)) return;
  const link=document.createElement('link');
  link.id=id; link.rel=rel; link.href=href;
  document.head.appendChild(link);
}

function showFatal(message){
  const app=document.getElementById('app');
  if(!app) return;
  app.innerHTML=`<div style="min-height:100vh;display:grid;place-items:center;padding:24px;font-family:DM Sans,system-ui,sans-serif;background:#FAF9FC;color:#242238;text-align:center"><div><img src="logo-full.png?v=17" alt="Emotion Sense" style="width:190px;height:190px;object-fit:contain;margin-bottom:18px"><h1 style="font-size:22px;margin:0 0 8px">Algo não carregou</h1><p style="font-size:13px;line-height:1.5;color:#777489;max-width:280px;margin:0 auto 16px">${message}</p><button onclick="location.reload()" style="border:0;border-radius:14px;background:#6945E6;color:white;padding:13px 18px;font-weight:700">Tentar novamente</button></div></div>`;
}

function showNonBlockingNotice(message){
  let toast=document.getElementById('boot-notice');
  if(!toast){
    toast=document.createElement('div');
    toast.id='boot-notice';
    toast.style.cssText='position:fixed;left:50%;bottom:88px;transform:translateX(-50%);z-index:9999;max-width:calc(100% - 32px);background:#242238;color:#fff;padding:10px 14px;border-radius:12px;font:600 11px/1.35 DM Sans,system-ui,sans-serif;box-shadow:0 10px 30px rgba(20,20,40,.18);text-align:center';
    document.body.appendChild(toast);
  }
  toast.textContent=message;
  setTimeout(()=>toast.remove(),4200);
}
