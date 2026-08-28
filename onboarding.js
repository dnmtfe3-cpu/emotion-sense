const supabase=window.emotionSupabase;
const STATE_KEY='emotion_sense_state_v1';

if(supabase){
  checkCurrentSession();
  supabase.auth.onAuthStateChange((event,session)=>{
    if((event==='SIGNED_IN'||event==='INITIAL_SESSION')&&session?.user){
      setTimeout(()=>maybeShowOnboarding(session.user),0);
    }
  });
}

async function checkCurrentSession(){
  try{
    const {data}=await supabase.auth.getSession();
    if(data.session?.user) maybeShowOnboarding(data.session.user);
  }catch(error){ console.error('Emotion Sense onboarding session error',error); }
}

async function maybeShowOnboarding(user){
  try{
    const {data,error}=await supabase.from('profiles')
      .select('onboarding_completed,goal,daily_checkins,camera_consent,privacy_acknowledged')
      .eq('id',user.id).maybeSingle();
    if(error||data?.onboarding_completed) return;
    await waitUntilAppIsOpen();
    if(document.getElementById('es-onboarding')) return;
    showOnboarding(user,data||{});
  }catch(error){ console.error('Emotion Sense onboarding error',error); }
}

function waitUntilAppIsOpen(){
  return new Promise(resolve=>{
    const started=Date.now();
    const timer=setInterval(()=>{
      if(!document.body.classList.contains('es-gate')||Date.now()-started>10000){
        clearInterval(timer); resolve();
      }
    },120);
  });
}

function showOnboarding(user,profile){
  injectStyles();
  const overlay=document.createElement('div');
  overlay.id='es-onboarding';
  overlay.innerHTML=`
    <section class="es-onboard-sheet" role="dialog" aria-modal="true" aria-labelledby="es-onboard-title">
      <div class="es-onboard-logo"><img src="icon-192.png" alt=""></div>
      <span class="es-onboard-kicker">SEU EMOTION SENSE</span>
      <h2 id="es-onboard-title">Só falta deixar com a sua cara.</h2>
      <p class="es-onboard-copy">Essas escolhas ajustam seu acompanhamento. Você pode continuar usando check-ins mesmo sem liberar a câmera.</p>

      <fieldset class="es-onboard-group">
        <legend>O que você quer acompanhar?</legend>
        <label><input type="radio" name="es-goal" value="entender_padroes" ${(!profile.goal||profile.goal==='entender_padroes')?'checked':''}><span><b>Entender meus padrões</b><small>Comparar seus próprios registros ao longo do tempo.</small></span></label>
        <label><input type="radio" name="es-goal" value="sinais_tensao" ${profile.goal==='sinais_tensao'?'checked':''}><span><b>Perceber sinais de tensão</b><small>Observar mudanças sem tratar a leitura como diagnóstico.</small></span></label>
        <label><input type="radio" name="es-goal" value="rotina_checkins" ${profile.goal==='rotina_checkins'?'checked':''}><span><b>Criar uma rotina de check-ins</b><small>Registrar como você está em poucos toques.</small></span></label>
      </fieldset>

      <label class="es-onboard-select"><span>Check-ins por dia</span><select id="es-daily-checkins">
        ${[1,2,3,4].map(n=>`<option value="${n}" ${Number(profile.daily_checkins||2)===n?'selected':''}>${n} ${n===1?'vez':'vezes'}</option>`).join('')}
      </select></label>

      <label class="es-onboard-check"><input id="es-camera-consent" type="checkbox" ${profile.camera_consent?'checked':''}><span><b>Quero usar o Sense Scan</b><small>A câmera só é ativada quando você pedir uma análise e o navegador ainda solicita a permissão.</small></span></label>
      <label class="es-onboard-check"><input id="es-privacy-ack" type="checkbox" ${profile.privacy_acknowledged?'checked':''}><span><b>Entendi como a leitura funciona</b><small>As estimativas faciais são aproximadas, não são diagnóstico e o vídeo do scan não é salvo.</small></span></label>

      <div class="es-onboard-error" id="es-onboard-error"></div>
      <button class="es-onboard-save" id="es-onboard-save">Começar</button>
    </section>`;
  document.body.appendChild(overlay);
  document.getElementById('es-onboard-save').onclick=()=>saveOnboarding(user);
}

async function saveOnboarding(user){
  const privacy=document.getElementById('es-privacy-ack');
  const errorEl=document.getElementById('es-onboard-error');
  if(!privacy?.checked){
    errorEl.textContent='Confirme que entendeu como as estimativas funcionam.';
    return;
  }
  const button=document.getElementById('es-onboard-save');
  button.disabled=true; errorEl.textContent='';
  const goal=document.querySelector('input[name="es-goal"]:checked')?.value||'entender_padroes';
  const daily=Math.min(4,Math.max(1,Number(document.getElementById('es-daily-checkins')?.value||2)));
  const camera=Boolean(document.getElementById('es-camera-consent')?.checked);
  try{
    const {error}=await supabase.from('profiles').update({
      onboarding_completed:true,
      goal,
      daily_checkins:daily,
      camera_consent:camera,
      privacy_acknowledged:true,
      updated_at:new Date().toISOString()
    }).eq('id',user.id);
    if(error) throw error;
    updateLocalState(goal,daily,camera);
    document.getElementById('es-onboarding')?.remove();
    mountProfileSummary(goal,daily,camera);
  }catch(error){
    console.error(error);
    errorEl.textContent='Não consegui salvar agora. Tente novamente.';
    button.disabled=false;
  }
}

function updateLocalState(goal,daily,camera){
  try{
    const state=JSON.parse(localStorage.getItem(STATE_KEY)||'{}');
    state.experience={...(state.experience||{}),goal,daily_checkins:daily,camera_consent:camera,onboarding_completed:true};
    localStorage.setItem(STATE_KEY,JSON.stringify(state));
  }catch{}
}

function mountProfileSummary(goal,daily,camera){
  const profileScreen=document.getElementById('screen-perfil');
  const hero=profileScreen?.querySelector('.profile-hero');
  if(!profileScreen||!hero||document.getElementById('es-profile-plan')) return;
  const labels={entender_padroes:'Entender meus padrões',sinais_tensao:'Perceber sinais de tensão',rotina_checkins:'Rotina de check-ins'};
  const card=document.createElement('div');
  card.id='es-profile-plan'; card.className='es-profile-plan';
  card.innerHTML=`<span>Seu acompanhamento</span><strong>${labels[goal]||labels.entender_padroes}</strong><small>${daily} ${daily===1?'check-in':'check-ins'} por dia · Sense Scan ${camera?'ativado':'opcional'}</small>`;
  hero.insertAdjacentElement('afterend',card);
}

function injectStyles(){
  if(document.getElementById('es-onboard-style')) return;
  const style=document.createElement('style'); style.id='es-onboard-style';
  style.textContent=`
    #es-onboarding{position:fixed;inset:0;z-index:5000;background:rgba(30,23,53,.34);backdrop-filter:blur(12px);display:flex;align-items:flex-end;justify-content:center;padding:12px}
    .es-onboard-sheet{width:min(100%,456px);max-height:92vh;overflow:auto;background:#FAF9FC;border-radius:28px;padding:22px 20px calc(22px + env(safe-area-inset-bottom));box-shadow:0 24px 70px rgba(35,22,79,.22);font-family:'DM Sans',system-ui,sans-serif}
    .es-onboard-logo{width:54px;height:54px;border-radius:17px;background:#fff;border:1px solid #ECE9F3;display:grid;place-items:center;margin-bottom:14px}.es-onboard-logo img{width:40px;height:40px;object-fit:contain}
    .es-onboard-kicker{font-size:9px;font-weight:800;letter-spacing:.12em;color:#6945E6}.es-onboard-sheet h2{font-family:'DM Sans',system-ui,sans-serif!important;font-size:24px;line-height:1.08;color:#242238;margin:6px 0 8px;letter-spacing:-.03em}.es-onboard-copy{font-size:11px;line-height:1.5;color:#777489;margin:0 0 18px}
    .es-onboard-group{border:0;padding:0;margin:0}.es-onboard-group legend,.es-onboard-select>span{font-size:10px;font-weight:700;color:#5F5B70;margin-bottom:8px}.es-onboard-group label{display:flex;gap:10px;background:#fff;border:1px solid #ECE9F3;border-radius:14px;padding:11px;margin:7px 0;align-items:flex-start}.es-onboard-group input{accent-color:#6945E6;margin-top:3px}.es-onboard-group b,.es-onboard-check b{display:block;font-size:11px;color:#242238}.es-onboard-group small,.es-onboard-check small{display:block;font-size:9px;line-height:1.4;color:#858195;margin-top:2px}
    .es-onboard-select{display:block;margin:15px 0}.es-onboard-select span{display:block}.es-onboard-select select{width:100%;border:1px solid #ECE9F3;border-radius:14px;background:#fff;color:#242238;padding:12px;font:600 11px 'DM Sans',sans-serif}
    .es-onboard-check{display:flex;gap:10px;align-items:flex-start;margin:9px 0;padding:11px;border-radius:14px;background:#F4F0FF}.es-onboard-check input{accent-color:#6945E6;margin-top:3px}
    .es-onboard-save{width:100%;border:0;border-radius:15px;background:#6945E6;color:#fff;padding:14px;font:700 12px 'DM Sans',sans-serif;margin-top:8px}.es-onboard-save:disabled{opacity:.55}.es-onboard-error{min-height:15px;color:#A34242;font-size:9px;text-align:center;margin-top:8px}
    .es-profile-plan{margin:12px 18px 0;padding:15px 16px;background:#fff;border:1px solid #ECE9F3;border-radius:17px;box-shadow:0 8px 24px rgba(76,45,183,.05)}.es-profile-plan span{display:block;font-size:9px;text-transform:uppercase;letter-spacing:.09em;color:#6945E6;font-weight:800}.es-profile-plan strong{display:block;font-size:13px;color:#242238;margin-top:5px}.es-profile-plan small{display:block;font-size:9px;color:#777489;margin-top:3px}
  `;
  document.head.appendChild(style);
}