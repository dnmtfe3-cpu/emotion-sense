const PHRASES=[
  'Perceber seus sinais já é uma forma de se conhecer melhor.',
  'Você não precisa entender tudo de uma vez.',
  'Pequenos check-ins ajudam a enxergar padrões maiores.',
  'Seu ritmo pode mudar — observar isso já conta.',
  'Um momento de atenção pode deixar o dia mais claro.',
  'Nem todo dia precisa ter o mesmo ritmo.',
  'Registrar como você está pode ajudar a notar mudanças com o tempo.'
];

const SHORTCUTS=[
  {
    action:'scan',
    label:'Sense Scan',
    icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7"/><path d="M12 7v2M9 11h.01M15 11h.01M9 15c1.7 1.4 4.3 1.4 6 0"/></svg>'
  },
  {
    action:'checkin',
    label:'Check-in',
    icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="m8.5 12 2.2 2.2 4.8-5"/></svg>'
  },
  {
    action:'history',
    label:'Histórico',
    icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V9M10 19V5M16 19v-7M22 19V3"/></svg>'
  },
  {
    action:'profile',
    label:'Perfil',
    icon:'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 4-6 8-6s8 2 8 6"/></svg>'
  }
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
  quick.innerHTML=SHORTCUTS.map(item=>`
    <button type="button" data-action="${item.action}" aria-label="${item.label}">
      <span class="es-quick-icon">${item.icon}</span>
      <span class="es-quick-label">${item.label}</span>
    </button>`).join('');
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
  if(action==='profile') window.switchTab('screen-perfil');
  if(action==='checkin'){
    window.switchTab('screen-inicio');
    setTimeout(()=>document.getElementById('quick-moods')?.scrollIntoView({behavior:'smooth',block:'center'}),120);
  }
}

function handleShortcut(){
  const action=new URLSearchParams(location.search).get('shortcut');
  if(!SHORTCUTS.some(item=>item.action===action)) return;
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
