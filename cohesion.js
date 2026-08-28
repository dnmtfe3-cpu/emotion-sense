const PHRASES=[
  'Perceber seus sinais já é uma forma de se conhecer melhor.',
  'Você não precisa entender tudo de uma vez.',
  'Pequenos check-ins ajudam a enxergar padrões maiores.',
  'Seu ritmo pode mudar — observar isso já conta.',
  'Um momento de atenção pode deixar o dia mais claro.',
  'Nem todo dia precisa ter o mesmo ritmo.',
  'Registrar como você está pode ajudar a notar mudanças com o tempo.'
];

mountHomeExtras();
handleShortcut();

function mountHomeExtras(){
  const home=document.querySelector('#screen-inicio .home-content');
  const hero=home?.querySelector('.hero-scan-card');
  if(!home||!hero||document.getElementById('es-home-extras')) return;

  const wrap=document.createElement('div');
  wrap.id='es-home-extras';
  const day=Math.floor(Date.now()/86400000);
  const phrase=PHRASES[day%PHRASES.length];
  wrap.innerHTML=`<article class="es-daily-card"><span>Para hoje</span><p>${escapeHtml(phrase)}</p></article>`;
  hero.insertAdjacentElement('beforebegin',wrap);

  const quick=document.createElement('div');
  quick.className='es-quick';
  quick.setAttribute('aria-label','Atalhos');
  quick.innerHTML=`
    <button type="button" data-action="scan"><i>◌</i>Sense Scan</button>
    <button type="button" data-action="checkin"><i>✓</i>Check-in</button>
    <button type="button" data-action="history"><i>⌁</i>Histórico</button>`;
  hero.insertAdjacentElement('afterend',quick);
  quick.addEventListener('click',event=>{
    const button=event.target.closest('button[data-action]');
    if(!button) return;
    openAction(button.dataset.action);
  });
}

function openAction(action){
  if(typeof window.switchTab!=='function') return;
  if(action==='scan') window.switchTab('screen-analisar');
  if(action==='history') window.switchTab('screen-historico');
  if(action==='checkin'){
    window.switchTab('screen-inicio');
    setTimeout(()=>document.getElementById('quick-moods')?.scrollIntoView({behavior:'smooth',block:'center'}),120);
  }
}

function handleShortcut(){
  const action=new URLSearchParams(location.search).get('shortcut');
  if(!['scan','checkin','history'].includes(action)) return;
  const started=Date.now();
  const timer=setInterval(()=>{
    const ready=typeof window.switchTab==='function'&&!document.body.classList.contains('es-gate');
    if(ready){
      clearInterval(timer);
      openAction(action);
      history.replaceState({},'',location.pathname+location.hash);
    }else if(Date.now()-started>10000){
      clearInterval(timer);
    }
  },120);
}

function escapeHtml(value=''){
  return String(value).replace(/[&<>\"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[char]));
}
