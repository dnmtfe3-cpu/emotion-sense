const PENDING_ONBOARDING_KEY = 'emotion_sense_pending_onboarding_v1';
const STATE_KEY = 'emotion_sense_state_v1';
const BASELINE_TARGET = 5;

injectExperienceStyles();
ensureStaticEnhancements();

const experienceObserver = new MutationObserver(() => {
  augmentSignupForm();
  ensureStaticEnhancements();
});
experienceObserver.observe(document.body, { childList: true, subtree: true });

document.addEventListener('click', event => {
  const submit = event.target.closest?.('#es-submit');
  if (!submit || !document.getElementById('es-onboarding-fields')) return;
  event.preventDefault();
  event.stopPropagation();
  event.stopImmediatePropagation();
  enhancedSignup().catch(error => {
    console.error(error);
    showSignupMessage('Não foi possível criar a conta agora.');
  });
}, true);

waitForSupabase();
waitForCoreFunctions();

function injectExperienceStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .es-extra-block{margin-top:2px}
    .es-extra-label{font-size:10px;font-weight:600;color:#6D6D80;margin:0 0 8px 2px}
    .es-choice-grid{display:grid;grid-template-columns:1fr;gap:8px}
    .es-choice-row{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
    .es-choice{border:1px solid #E4E5EE;background:#fff;color:#434355;border-radius:14px;padding:11px 12px;text-align:left;font:600 11px/1.25 "DM Sans",sans-serif;transition:.18s ease}
    .es-choice-row .es-choice{text-align:center}
    .es-choice.selected{border-color:#4F46E5;background:#EEF2FF;color:#3730A3;box-shadow:0 0 0 3px rgba(79,70,229,.06)}
    .es-consent{display:flex;align-items:flex-start;gap:9px;padding:11px 12px;border:1px solid #E8E8F0;border-radius:14px;background:#fff;color:#626273;font-size:10px;line-height:1.45}
    .es-consent input{width:17px;height:17px;margin:0;accent-color:#4F46E5;flex:0 0 auto}
    .es-estimates-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px}
    .es-estimate{padding:13px;border-radius:15px;background:#F7F7FB;min-height:82px}
    .es-estimate span{display:block;font-size:9px;color:#777789;margin-bottom:7px}
    .es-estimate strong{display:block;font-size:15px;line-height:1.2;color:#202033;letter-spacing:-.02em}
    .es-estimate small{display:block;font-size:9px;line-height:1.35;color:#8A8A9A;margin-top:5px}
    .es-estimate-note{font-size:9px;line-height:1.5;color:#818191;margin:9px 4px 0}
    .es-baseline-progress{height:6px;border-radius:999px;background:#ECECF3;overflow:hidden;margin-top:9px}
    .es-baseline-progress i{display:block;height:100%;border-radius:inherit;background:#4F46E5;transition:width .35s ease}
    .es-plan-card{margin:14px 0 2px;padding:15px 16px;border-radius:18px;background:#fff;border:1px solid #ECECF2;box-shadow:0 8px 25px rgba(32,32,51,.035)}
    .es-plan-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}
    .es-plan-card .es-plan-kicker{font-size:9px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#4F46E5}
    .es-plan-card strong{display:block;margin-top:5px;font-size:14px;color:#202033}
    .es-plan-card p{margin:5px 0 0;font-size:10px;line-height:1.45;color:#777789}
    .es-plan-badge{font-size:9px;font-weight:700;color:#3730A3;background:#EEF2FF;border-radius:999px;padding:7px 9px;white-space:nowrap}
    .es-onboarding-overlay{position:fixed;inset:0;z-index:4000;background:#F7F7FB;overflow:auto;color:#18182B}
    .es-onboarding-inner{min-height:100%;max-width:520px;margin:0 auto;padding:32px 22px calc(28px + env(safe-area-inset-bottom));display:flex;flex-direction:column;justify-content:center}
    .es-onboarding-mark{width:42px;height:42px;border-radius:15px;background:#EEF2FF;display:grid;place-items:center;color:#4F46E5;font-weight:800;margin-bottom:22px}
    .es-onboarding-title{font-size:30px;line-height:1.08;letter-spacing:-.035em;margin:0 0 9px;font-weight:700}
    .es-onboarding-copy{font-size:12px;line-height:1.55;color:#727285;margin:0 0 24px}
    .es-onboarding-form{display:grid;gap:14px}
    .es-onboarding-form .es-field input{box-sizing:border-box}
    .es-onboarding-error{min-height:15px;text-align:center;font-size:10px;color:#A34242}
    @media (max-width:380px){.es-estimates-grid{grid-template-columns:1fr}.es-choice-row{grid-template-columns:1fr 1fr 1fr}}
  `;
  document.head.appendChild(style);
}

function augmentSignupForm() {
  const nameInput = document.getElementById('es-name');
  const submit = document.getElementById('es-submit');
  if (!nameInput || !submit || document.getElementById('es-onboarding-fields')) return;

  const nameLabel = nameInput.closest('.es-field')?.querySelector('span');
  if (nameLabel) nameLabel.textContent = 'Como prefere ser chamado?';
  nameInput.placeholder = 'Seu nome';

  const wrapper = document.createElement('div');
  wrapper.id = 'es-onboarding-fields';
  wrapper.style.display = 'contents';
  wrapper.innerHTML = onboardingFieldsMarkup({ goal: 'entender_padroes', daily: 2, compact: true });
  submit.before(wrapper);
  bindChoiceButtons(wrapper);
}

function onboardingFieldsMarkup({ goal = 'entender_padroes', daily = 2 } = {}) {
  return `
    <div class="es-extra-block">
      <div class="es-extra-label">O que você quer acompanhar?</div>
      <div class="es-choice-grid" data-choice-group="goal">
        <button type="button" class="es-choice ${goal === 'entender_padroes' ? 'selected' : ''}" data-value="entender_padroes">Entender mudanças no meu padrão</button>
        <button type="button" class="es-choice ${goal === 'acompanhar_tensao' ? 'selected' : ''}" data-value="acompanhar_tensao">Acompanhar sinais de tensão</button>
        <button type="button" class="es-choice ${goal === 'checkins_rotina' ? 'selected' : ''}" data-value="checkins_rotina">Criar rotina de check-ins</button>
      </div>
      <input type="hidden" id="es-goal" value="${escapeAttr(goal)}">
    </div>
    <div class="es-extra-block">
      <div class="es-extra-label">Quantos check-ins por dia?</div>
      <div class="es-choice-row" data-choice-group="daily">
        ${[1,2,3].map(value => `<button type="button" class="es-choice ${Number(daily) === value ? 'selected' : ''}" data-value="${value}">${value}x</button>`).join('')}
      </div>
      <input type="hidden" id="es-daily-checkins" value="${Number(daily) || 2}">
    </div>
    <label class="es-consent"><input type="checkbox" id="es-camera-consent"><span>Entendo que a câmera será usada somente quando eu iniciar uma análise e que o vídeo do scan não precisa ser salvo.</span></label>
    <label class="es-consent"><input type="checkbox" id="es-privacy-ack"><span>Entendo que as estimativas faciais são aproximadas, podem variar com luz, posição e movimento e não representam diagnóstico.</span></label>
  `;
}

function bindChoiceButtons(scope) {
  scope.querySelectorAll('[data-choice-group]').forEach(group => {
    group.querySelectorAll('.es-choice').forEach(button => {
      button.onclick = () => {
        group.querySelectorAll('.es-choice').forEach(item => item.classList.remove('selected'));
        button.classList.add('selected');
        const hidden = group.dataset.choiceGroup === 'goal'
          ? document.getElementById('es-goal')
          : document.getElementById('es-daily-checkins');
        if (hidden) hidden.value = button.dataset.value;
      };
    });
  });
}

async function enhancedSignup() {
  const supabase = window.emotionSupabase;
  if (!supabase) return showSignupMessage('Conectando ao cadastro… tente novamente.');

  const name = document.getElementById('es-name')?.value.trim() || '';
  const email = document.getElementById('es-email')?.value.trim() || '';
  const password = document.getElementById('es-password')?.value || '';
  const goal = document.getElementById('es-goal')?.value || 'entender_padroes';
  const dailyCheckins = Number(document.getElementById('es-daily-checkins')?.value || 2);
  const cameraConsent = !!document.getElementById('es-camera-consent')?.checked;
  const privacyAcknowledged = !!document.getElementById('es-privacy-ack')?.checked;

  if (!name || !email || !password) return showSignupMessage('Preencha nome, e-mail e senha.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showSignupMessage('Digite um e-mail válido.');
  if (password.length < 6) return showSignupMessage('A senha precisa ter pelo menos 6 caracteres.');
  if (!cameraConsent || !privacyAcknowledged) return showSignupMessage('Marque os dois avisos para continuar.');

  const button = document.getElementById('es-submit');
  if (button) { button.disabled = true; button.textContent = 'Criando conta…'; }

  const onboarding = {
    name,
    email,
    goal,
    daily_checkins: dailyCheckins,
    camera_consent: cameraConsent,
    privacy_acknowledged: privacyAcknowledged,
    onboarding_completed: true
  };

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;

    localStorage.setItem(PENDING_ONBOARDING_KEY, JSON.stringify(onboarding));

    if (data.session?.user) {
      const { error: profileError } = await supabase.from('profiles').upsert({
        id: data.session.user.id,
        ...onboarding,
        preferences: { checkinReminders: true, patternAlerts: true },
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });
      if (profileError) throw profileError;
      localStorage.removeItem(PENDING_ONBOARDING_KEY);
      location.reload();
      return;
    }

    showSignupMessage('A conta foi criada, mas não entrou automaticamente. Confira se “Confirm email” está desativado no Supabase.');
  } catch (error) {
    console.error(error);
    const message = String(error?.message || '').toLowerCase();
    if (message.includes('already registered')) showSignupMessage('Já existe uma conta com esse e-mail.');
    else if (message.includes('password')) showSignupMessage('Confira a senha e tente novamente.');
    else showSignupMessage('Não foi possível criar a conta. Tente novamente.');
  } finally {
    if (button && document.body.contains(button)) { button.disabled = false; button.textContent = 'Criar conta'; }
  }
}

function showSignupMessage(message) {
  const el = document.getElementById('es-error');
  if (el) el.textContent = message;
}

async function waitForSupabase() {
  for (let i = 0; i < 120; i += 1) {
    if (window.emotionSupabase) {
      setTimeout(checkSignedInOnboarding, 500);
      window.emotionSupabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) setTimeout(checkSignedInOnboarding, 350);
      });
      return;
    }
    await delay(100);
  }
}

async function checkSignedInOnboarding() {
  const supabase = window.emotionSupabase;
  if (!supabase) return;
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return;
  const user = data.user;

  const pending = readJson(PENDING_ONBOARDING_KEY);
  if (pending) {
    const { error: pendingError } = await supabase.from('profiles').upsert({
      id: user.id,
      ...pending,
      email: user.email || pending.email || null,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (!pendingError) localStorage.removeItem(PENDING_ONBOARDING_KEY);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id,name,email,goal,daily_checkins,camera_consent,privacy_acknowledged,onboarding_completed,preferences')
    .eq('id', user.id)
    .maybeSingle();
  if (profileError) return console.error(profileError);

  updatePlanCards(profile || {});
  if (!profile?.onboarding_completed) showExistingUserOnboarding(user, profile || {});
}

function showExistingUserOnboarding(user, profile) {
  if (document.getElementById('es-onboarding-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'es-onboarding-overlay';
  overlay.className = 'es-onboarding-overlay';
  overlay.innerHTML = `
    <div class="es-onboarding-inner">
      <div class="es-onboarding-mark">ES</div>
      <div class="es-kicker">SEU ACOMPANHAMENTO</div>
      <h1 class="es-onboarding-title">Antes de começar</h1>
      <p class="es-onboarding-copy">Isso personaliza os check-ins e ajuda o Emotion Sense a construir um padrão pessoal com suas próprias leituras.</p>
      <div class="es-onboarding-form">
        <label class="es-field"><span>Como prefere ser chamado?</span><input id="es-setup-name" autocomplete="name" value="${escapeAttr(profile.name || user.user_metadata?.name || '')}" placeholder="Seu nome"></label>
        <div id="es-setup-fields">${onboardingFieldsMarkup({ goal: profile.goal || 'entender_padroes', daily: profile.daily_checkins || 2 })}</div>
        <button class="es-primary" id="es-setup-save">Continuar</button>
        <div class="es-onboarding-error" id="es-setup-error"></div>
      </div>
    </div>`;
  document.body.appendChild(overlay);
  bindChoiceButtons(overlay);
  overlay.querySelector('#es-setup-save').onclick = () => saveExistingUserOnboarding(user, overlay);
}

async function saveExistingUserOnboarding(user, overlay) {
  const name = overlay.querySelector('#es-setup-name')?.value.trim() || '';
  const goal = overlay.querySelector('#es-goal')?.value || 'entender_padroes';
  const dailyCheckins = Number(overlay.querySelector('#es-daily-checkins')?.value || 2);
  const cameraConsent = !!overlay.querySelector('#es-camera-consent')?.checked;
  const privacyAcknowledged = !!overlay.querySelector('#es-privacy-ack')?.checked;
  const errorBox = overlay.querySelector('#es-setup-error');

  if (!name) { errorBox.textContent = 'Digite seu nome para continuar.'; return; }
  if (!cameraConsent || !privacyAcknowledged) { errorBox.textContent = 'Marque os dois avisos para continuar.'; return; }

  const button = overlay.querySelector('#es-setup-save');
  button.disabled = true;
  button.textContent = 'Salvando…';
  try {
    const { error } = await window.emotionSupabase.from('profiles').upsert({
      id: user.id,
      name,
      email: user.email || null,
      goal,
      daily_checkins: dailyCheckins,
      camera_consent: cameraConsent,
      privacy_acknowledged: privacyAcknowledged,
      onboarding_completed: true,
      updated_at: new Date().toISOString()
    }, { onConflict: 'id' });
    if (error) throw error;
    updateLocalProfileName(name);
    location.reload();
  } catch (error) {
    console.error(error);
    errorBox.textContent = 'Não foi possível salvar agora.';
    button.disabled = false;
    button.textContent = 'Continuar';
  }
}

function ensureStaticEnhancements() {
  ensureResultSection();
  ensureHomePlanCard();
  ensureProfilePlanCard();
}

function ensureResultSection() {
  const resultContent = document.querySelector('#screen-resultado .result-content');
  const hero = resultContent?.querySelector('.result-hero');
  if (!resultContent || !hero || document.getElementById('es-estimates-section')) return;
  const section = document.createElement('section');
  section.className = 'section-block';
  section.id = 'es-estimates-section';
  section.innerHTML = `
    <div class="section-title">Estimativas da feição</div>
    <div class="card es-estimates-grid">
      <div class="es-estimate"><span>Tensão facial estimada</span><strong id="es-est-tension">—</strong><small>Sobrancelhas, olhos e boca</small></div>
      <div class="es-estimate"><span>Sorriso aparente</span><strong id="es-est-smile">—</strong><small>Movimento dos cantos da boca</small></div>
      <div class="es-estimate"><span>Padrão da expressão</span><strong id="es-est-expression">—</strong><small>Descrição da feição, não da emoção</small></div>
      <div class="es-estimate"><span>Comparação pessoal</span><strong id="es-est-baseline">Construindo</strong><small id="es-est-baseline-copy">Faça suas primeiras leituras</small><div class="es-baseline-progress"><i id="es-baseline-bar" style="width:0%"></i></div></div>
    </div>
    <p class="es-estimate-note">Essas estimativas descrevem movimentos do rosto. Luz, ângulo, fala e movimento podem alterar o resultado; o seu check-in continua sendo a principal referência de como você se sente.</p>`;
  hero.insertAdjacentElement('afterend', section);
}

function ensureHomePlanCard() {
  const hero = document.querySelector('#screen-inicio .hero-scan-card');
  if (!hero || document.getElementById('es-home-plan')) return;
  const card = document.createElement('article');
  card.id = 'es-home-plan';
  card.className = 'es-plan-card';
  card.innerHTML = `<div class="es-plan-top"><div><span class="es-plan-kicker">Seu acompanhamento</span><strong id="es-home-goal">Construindo seu padrão</strong><p id="es-home-plan-copy">As primeiras leituras ajudam a criar uma referência pessoal.</p></div><span class="es-plan-badge" id="es-home-baseline">0/${BASELINE_TARGET}</span></div>`;
  hero.insertAdjacentElement('afterend', card);
}

function ensureProfilePlanCard() {
  const hero = document.querySelector('#screen-perfil .profile-hero');
  if (!hero || document.getElementById('es-profile-plan')) return;
  const card = document.createElement('div');
  card.id = 'es-profile-plan';
  card.className = 'section';
  card.innerHTML = `<div class="section-title">Seu acompanhamento</div><div class="es-plan-card"><div class="es-plan-top"><div><span class="es-plan-kicker">Foco atual</span><strong id="es-profile-goal">—</strong><p id="es-profile-frequency">—</p></div><span class="es-plan-badge" id="es-profile-baseline">0/${BASELINE_TARGET}</span></div></div>`;
  hero.insertAdjacentElement('afterend', card);
}

function waitForCoreFunctions() {
  const timer = setInterval(() => {
    let ready = false;
    if (typeof window.startTimedScan === 'function' && !window.startTimedScan.__esEstimateWrapped) {
      const original = window.startTimedScan;
      const wrapped = async function(...args) {
        const result = await original(...args);
        setTimeout(renderEstimatesFromResult, 40);
        return result;
      };
      wrapped.__esEstimateWrapped = true;
      window.startTimedScan = wrapped;
      ready = true;
    }

    if (typeof window.finishResult === 'function' && !window.finishResult.__esEstimateWrapped) {
      const original = window.finishResult;
      const wrapped = function(...args) {
        const result = original(...args);
        persistLastEstimates();
        updatePlanCardsFromLocal();
        return result;
      };
      wrapped.__esEstimateWrapped = true;
      window.finishResult = wrapped;
      ready = true;
    }

    if (typeof window.switchTab === 'function' && !window.switchTab.__esExperienceWrapped) {
      const original = window.switchTab;
      const wrapped = function(...args) {
        const result = original(...args);
        updatePlanCardsFromLocal();
        return result;
      };
      wrapped.__esExperienceWrapped = true;
      window.switchTab = wrapped;
      ready = true;
    }

    if (ready) updatePlanCardsFromLocal();
  }, 180);
  window.addEventListener('beforeunload', () => clearInterval(timer), { once: true });
}

function renderEstimatesFromResult() {
  ensureResultSection();
  const score = readNumber('result-score');
  const brow = readPercent('result-brow');
  const eye = readPercent('result-eye');
  const mouth = readPercent('result-mouth');
  const smile = readPercent('result-smile');
  if (![score, brow, eye, mouth, smile].every(Number.isFinite)) return;

  const tension = Math.round((brow * .45) + (eye * .25) + (mouth * .30));
  const expression = describeExpression({ tension, smile, activation: score });
  const baseline = buildBaseline(score);

  setText('es-est-tension', `${tension}%`);
  setText('es-est-smile', `${Math.round(smile)}%`);
  setText('es-est-expression', expression);
  setText('es-est-baseline', baseline.title);
  setText('es-est-baseline-copy', baseline.copy);
  const bar = document.getElementById('es-baseline-bar');
  if (bar) bar.style.width = `${baseline.progress}%`;

  window.esLastEstimates = {
    tension,
    smile: Math.round(smile),
    expression,
    baseline_status: baseline.status,
    baseline_average: baseline.average,
    baseline_delta: baseline.delta,
    created_at: new Date().toISOString()
  };
}

function describeExpression({ tension, smile, activation }) {
  if (smile >= 45 && tension < 35) return 'Sorriso aparente';
  if (tension >= 48) return 'Mais contraída';
  if (activation <= 20 && tension < 30) return 'Pouco ativada';
  return 'Atividade moderada';
}

function buildBaseline(currentScore) {
  const state = readState();
  const previous = (state.history || []).filter(item => item.type === 'scan' && Number.isFinite(Number(item.score))).slice(0, 10);
  if (previous.length < BASELINE_TARGET) {
    return {
      title: `${previous.length}/${BASELINE_TARGET} leituras`,
      copy: 'Ainda construindo seu padrão pessoal',
      progress: Math.round(previous.length / BASELINE_TARGET * 100),
      status: 'building', average: null, delta: null
    };
  }
  const average = previous.reduce((sum, item) => sum + Number(item.score), 0) / previous.length;
  const delta = Math.round(currentScore - average);
  const status = delta > 10 ? 'above' : delta < -10 ? 'below' : 'near';
  const title = status === 'above' ? 'Acima do padrão' : status === 'below' ? 'Abaixo do padrão' : 'Próximo do padrão';
  const direction = delta === 0 ? 'sem diferença' : `${Math.abs(delta)} pts ${delta > 0 ? 'acima' : 'abaixo'}`;
  return { title, copy: `${direction} da média recente`, progress: 100, status, average: Math.round(average), delta };
}

function persistLastEstimates() {
  const estimates = window.esLastEstimates;
  if (!estimates) return;
  const state = readState();
  const record = state.history?.[0];
  if (!record || record.type !== 'scan') return;
  record.signals = { ...(record.signals || {}), estimates };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function updatePlanCards(profile = null) {
  const state = readState();
  const scans = (state.history || []).filter(item => item.type === 'scan');
  const count = Math.min(scans.length, BASELINE_TARGET);
  const goal = profile?.goal || state.experience?.goal || null;
  const daily = Number(profile?.daily_checkins || state.experience?.daily_checkins || 2);
  const goalLabel = goalText(goal);

  setText('es-home-goal', goalLabel || 'Construindo seu padrão');
  setText('es-home-plan-copy', `${daily} ${daily === 1 ? 'check-in' : 'check-ins'} por dia · compare suas leituras com seu próprio padrão.`);
  setText('es-home-baseline', `${count}/${BASELINE_TARGET}`);
  setText('es-profile-goal', goalLabel || 'Entender mudanças no meu padrão');
  setText('es-profile-frequency', `${daily} ${daily === 1 ? 'check-in por dia' : 'check-ins por dia'} · padrão pessoal com ${Math.max(BASELINE_TARGET, scans.length)} leituras ao longo do uso.`);
  setText('es-profile-baseline', `${count}/${BASELINE_TARGET}`);

  if (profile) {
    state.experience = { goal: profile.goal || null, daily_checkins: daily };
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
  }
}

function updatePlanCardsFromLocal() { updatePlanCards(null); }
function goalText(goal) {
  return ({
    entender_padroes: 'Entender mudanças no meu padrão',
    acompanhar_tensao: 'Acompanhar sinais de tensão',
    checkins_rotina: 'Criar rotina de check-ins'
  })[goal] || '';
}

function updateLocalProfileName(name) {
  const state = readState();
  state.profile = { ...(state.profile || {}), name };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch { return {}; }
}
function readJson(key) {
  try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return null; }
}
function readNumber(id) {
  const raw = document.getElementById(id)?.textContent || '';
  const value = Number(String(raw).replace(/[^0-9.-]/g, ''));
  return Number.isFinite(value) ? value : NaN;
}
function readPercent(id) { return readNumber(id); }
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function escapeAttr(value = '') { return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char])); }
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
