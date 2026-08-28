import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.112.4/+esm';

const SUPABASE_URL = 'https://zljrbkbnnqwmovtmvgea.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_uuhDNzZLTeqBymA8Bmk4MQ_68NKwPXl';
const STATE_KEY = 'emotion_sense_state_v1';

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

window.emotionSupabase = supabase;

injectAuthStyles();
mountAuthRoot();
showWelcome();
bootEmotionSense();

async function bootEmotionSense() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (data.session?.user) await enterSignedIn(data.session.user);
  } catch (error) {
    console.error('Emotion Sense boot error', error);
    showWelcome();
    showAuthMessage('Não consegui sincronizar sua sessão agora, mas você pode tentar entrar normalmente.');
  }
}

function injectAuthStyles() {
  document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => link.remove());
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap';
  document.head.appendChild(font);

  const style = document.createElement('style');
  style.id = 'es-auth-styles';
  style.textContent = `
    html,body,button,input{font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    h1,h2,h3,.display,.metric-card strong,.result-ring strong,.history-summary strong,.history-score{font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    body.es-gate .screen,body.es-gate #bottom-nav{display:none!important}
    #es-auth-root{position:absolute;inset:0;z-index:1000;background:#F8F8FC;color:#18182B;min-height:100vh;overflow:auto}
    .es-auth{min-height:100vh;display:flex;flex-direction:column;padding:26px 22px calc(25px + env(safe-area-inset-bottom));animation:esIn .28s cubic-bezier(.22,1,.36,1) both}
    @keyframes esIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
    .es-welcome{justify-content:flex-end}
    .es-art{min-height:42vh;margin:-26px -22px 28px;display:grid;place-items:center;background:#F0EFFF;position:relative;overflow:hidden}
    .es-sense{width:118px;height:118px;position:relative;display:grid;place-items:center;color:#5B57D9}
    .es-dot{width:38px;height:38px;border-radius:50%;background:#5B57D9;box-shadow:0 10px 26px rgba(91,87,217,.18);z-index:2}
    .es-ring{position:absolute;border:1.5px solid currentColor;border-radius:50%}
    .es-r1{width:76px;height:76px;opacity:.42}.es-r2{width:110px;height:110px;opacity:.18}
    .es-kicker{font-size:9px;font-weight:700;letter-spacing:.14em;color:#5B57D9;margin-bottom:10px}
    .es-title{font-size:31px;line-height:1.08;letter-spacing:-.035em;font-weight:700;margin:0 0 11px;color:#242438}
    .es-copy{font-size:13px;line-height:1.6;color:#737386;margin:0}
    .es-actions{display:grid;gap:10px;margin-top:27px}
    .es-primary,.es-secondary{width:100%;border-radius:15px;padding:15px 17px;border:0;font-size:13px;font-weight:700;transition:.16s ease}
    .es-primary{background:#5B57D9;color:#fff;box-shadow:0 10px 24px rgba(91,87,217,.15)}
    .es-secondary{background:#fff;color:#242438;border:1px solid #E8E8F0}
    .es-primary:active,.es-secondary:active{transform:scale(.98)}
    .es-primary:disabled{opacity:.55;cursor:wait}
    .es-note{text-align:center;font-size:9px;line-height:1.5;color:#8A8A9B;margin:15px 18px 0}
    .es-form-screen{justify-content:center;position:relative}
    .es-back{position:absolute;top:22px;left:20px;width:38px;height:38px;border:1px solid #E8E8F0;border-radius:50%;background:#fff;color:#242438;font-size:27px;display:grid;place-items:center}
    .es-mini{position:absolute;top:31px;left:72px;font-size:12px;font-weight:700;color:#303044}
    .es-mini i{display:inline-block;width:9px;height:9px;border-radius:50%;background:#5B57D9;margin-right:6px}
    .es-form-head{margin-top:42px}.es-form{display:grid;gap:13px;margin-top:28px}
    .es-field span{display:block;font-size:10px;font-weight:600;color:#6D6D80;margin:0 0 7px 2px}
    .es-field input{width:100%;box-sizing:border-box;border:1px solid #E8E8F0;border-radius:15px;background:#fff;padding:14px 15px;color:#18182B;font-size:13px;outline:none}
    .es-field input:focus{border-color:rgba(91,87,217,.5);box-shadow:0 0 0 4px rgba(91,87,217,.06)}
    .es-link{justify-self:end;border:0;background:none;color:#5B57D9;font-size:10px;font-weight:600}
    .es-switch{text-align:center;font-size:10px;color:#6D6D80;margin-top:18px}.es-switch button{border:0;background:none;color:#5B57D9;font-size:inherit;font-weight:700}
    .es-error{min-height:16px;color:#A34242;font-size:10px;text-align:center;margin-top:10px}.es-success{color:#31735B}
    .es-logout{display:block;width:100%;border:1px solid #E8E8F0;background:#fff;color:#18182B;font-weight:700;font-size:11px;border-radius:13px;padding:13px;margin-bottom:9px}
  `;
  document.head.appendChild(style);
  document.body.classList.add('es-gate');
}

function mountAuthRoot() {
  if (document.getElementById('es-auth-root')) return;
  const root = document.createElement('div');
  root.id = 'es-auth-root';
  document.getElementById('app')?.appendChild(root);
}

function authRoot() { return document.getElementById('es-auth-root'); }
function setAuth(html) { const root = authRoot(); if (root) root.innerHTML = html; }
function senseMark() { return '<div class="es-sense"><span class="es-dot"></span><span class="es-ring es-r1"></span><span class="es-ring es-r2"></span></div>'; }

function showWelcome() {
  setAuth(`<section class="es-auth es-welcome"><div class="es-art">${senseMark()}</div><div class="es-kicker">EMOTION SENSE</div><h1 class="es-title">Entenda melhor como você está.</h1><p class="es-copy">Check-ins rápidos e análise facial para acompanhar mudanças ao longo do tempo.</p><div class="es-actions"><button class="es-primary" id="es-create">Criar conta</button><button class="es-secondary" id="es-login">Já tenho uma conta</button></div><p class="es-note">As estimativas faciais são aproximadas e não substituem seu próprio relato.</p><div class="es-error" id="es-error"></div></section>`);
  document.getElementById('es-create')?.addEventListener('click', showSignup);
  document.getElementById('es-login')?.addEventListener('click', showLogin);
}

function showLogin() {
  setAuth(formTemplate('login'));
  bindBackAndSwitch(showSignup);
  document.getElementById('es-submit').onclick = login;
  document.getElementById('es-forgot').onclick = resetPassword;
  setTimeout(() => document.getElementById('es-email')?.focus(), 80);
}

function showSignup() {
  setAuth(formTemplate('signup'));
  bindBackAndSwitch(showLogin);
  document.getElementById('es-submit').onclick = signup;
  setTimeout(() => document.getElementById('es-name')?.focus(), 80);
}

function formTemplate(mode) {
  const signupMode = mode === 'signup';
  return `<section class="es-auth es-form-screen"><button class="es-back" id="es-back">‹</button><div class="es-mini"><i></i>Emotion Sense</div><div class="es-form-head"><div class="es-kicker">${signupMode ? 'COMECE AGORA' : 'BEM-VINDO DE VOLTA'}</div><h1 class="es-title">${signupMode ? 'Criar conta' : 'Entrar'}</h1><p class="es-copy">${signupMode ? 'Crie seu perfil e personalize seu acompanhamento.' : 'Entre para acessar seus registros sincronizados.'}</p></div><div class="es-form">${signupMode ? '<label class="es-field"><span>Nome</span><input id="es-name" autocomplete="name" placeholder="Seu nome"></label>' : ''}<label class="es-field"><span>E-mail</span><input id="es-email" type="email" autocomplete="email" placeholder="voce@email.com"></label><label class="es-field"><span>Senha</span><input id="es-password" type="password" autocomplete="${signupMode ? 'new-password' : 'current-password'}" placeholder="${signupMode ? 'Mínimo 6 caracteres' : 'Sua senha'}"></label>${signupMode ? '' : '<button class="es-link" id="es-forgot" type="button">Esqueci minha senha</button>'}<button class="es-primary" id="es-submit">${signupMode ? 'Criar conta' : 'Entrar'}</button><div class="es-error" id="es-error"></div></div><div class="es-switch">${signupMode ? 'Já tem conta?' : 'Ainda não tem conta?'} <button id="es-switch">${signupMode ? 'Entrar' : 'Criar conta'}</button></div></section>`;
}

function bindBackAndSwitch(next) {
  document.getElementById('es-back').onclick = showWelcome;
  document.getElementById('es-switch').onclick = next;
}

async function signup() {
  const name = document.getElementById('es-name')?.value.trim() || '';
  const email = document.getElementById('es-email')?.value.trim() || '';
  const password = document.getElementById('es-password')?.value || '';
  if (!name || !email || !password) return showAuthMessage('Preencha todos os campos.');
  if (!validEmail(email)) return showAuthMessage('Digite um e-mail válido.');
  if (password.length < 6) return showAuthMessage('A senha precisa ter pelo menos 6 caracteres.');

  setAuthBusy(true);
  try {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
    if (error) throw error;
    if (data.session?.user) {
      await ensureProfile(data.session.user, name);
      await enterSignedIn(data.session.user);
      return;
    }
    showAuthMessage('A conta foi criada, mas o Supabase não abriu uma sessão automática. Verifique se “Confirm email” está desativado.', true);
  } catch (error) {
    console.error(error);
    showAuthMessage(readableAuthError(error));
  } finally { setAuthBusy(false); }
}

async function login() {
  const email = document.getElementById('es-email')?.value.trim() || '';
  const password = document.getElementById('es-password')?.value || '';
  if (!email || !password) return showAuthMessage('Preencha e-mail e senha.');
  if (!validEmail(email)) return showAuthMessage('Digite um e-mail válido.');
  setAuthBusy(true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await enterSignedIn(data.user);
  } catch (error) {
    console.error(error);
    showAuthMessage(readableAuthError(error));
  } finally { setAuthBusy(false); }
}

async function resetPassword() {
  const email = document.getElementById('es-email')?.value.trim();
  if (!email || !validEmail(email)) return showAuthMessage('Digite seu e-mail primeiro.');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    showAuthMessage('Se a conta existir, você receberá as instruções de recuperação.', true);
  } catch (error) {
    console.error(error);
    showAuthMessage('Não foi possível solicitar a recuperação agora.');
  }
}

async function enterSignedIn(user) {
  try {
    await ensureProfile(user);
    await hydrateLocalState(user);
    if (typeof window.switchTab !== 'function') await import('./app-core.js?v=10');
    installAccountControls(user);
    installCloudSync(user);
    authRoot()?.remove();
    document.body.classList.remove('es-gate');
    window.switchTab?.('screen-inicio');
  } catch (error) {
    console.error('Emotion Sense enter app error', error);
    showWelcome();
    showAuthMessage('Sua conta entrou, mas não consegui carregar os dados. Tente novamente.');
  }
}

async function ensureProfile(user, fallbackName = '') {
  const { data, error } = await supabase.from('profiles').select('id,name,email,preferences').eq('id', user.id).maybeSingle();
  if (error) throw error;
  if (data) return data;
  const profile = {
    id: user.id,
    name: fallbackName || user.user_metadata?.name || '',
    email: user.email || null,
    preferences: { checkinReminders: true, patternAlerts: true }
  };
  const { error: insertError } = await supabase.from('profiles').insert(profile);
  if (insertError) throw insertError;
  return profile;
}

async function hydrateLocalState(user) {
  const [profileResult, recordsResult] = await Promise.all([
    supabase.from('profiles').select('name,email,preferences,goal,daily_checkins').eq('id', user.id).maybeSingle(),
    supabase.from('wellbeing_records').select('id,type,mood,score,label,signals,created_at').order('created_at', { ascending: false }).limit(200)
  ]);
  if (profileResult.error) throw profileResult.error;
  if (recordsResult.error) throw recordsResult.error;

  const oldState = readState();
  const records = (recordsResult.data || []).map(row => ({
    id: row.id, type: row.type, mood: row.mood, score: row.score, label: row.label, signals: row.signals, createdAt: row.created_at
  }));
  const profile = profileResult.data || {};
  localStorage.setItem(STATE_KEY, JSON.stringify({
    profile: {
      name: profile.name || user.user_metadata?.name || '',
      email: user.email || profile.email || '',
      photo: oldState.profile?.photo || ''
    },
    preferences: profile.preferences || oldState.preferences || { checkinReminders: true, patternAlerts: true },
    experience: {
      ...(oldState.experience || {}),
      goal: profile.goal || oldState.experience?.goal || null,
      daily_checkins: Number(profile.daily_checkins || oldState.experience?.daily_checkins || 2)
    },
    history: records,
    lastScan: records.find(item => item.type === 'scan') || null
  }));
}

function installAccountControls(user) {
  const bottom = document.querySelector('#screen-perfil .bottom-section');
  if (bottom && !document.getElementById('es-logout')) {
    const button = document.createElement('button');
    button.id = 'es-logout';
    button.className = 'es-logout';
    button.textContent = 'Sair da conta';
    button.onclick = logout;
    bottom.prepend(button);
  }
  const emailInput = document.getElementById('input-email');
  if (emailInput) {
    emailInput.value = user.email || '';
    emailInput.readOnly = true;
    emailInput.title = 'O e-mail da conta é gerenciado pelo Supabase Auth.';
  }
}

function installCloudSync(user) {
  window.esCloud = { userId: user.id, syncLatestRecord, syncProfile, clearHistory: clearCloudHistory };
  wrapGlobal('quickCheckin', original => function(...args) {
    const result = original(...args);
    queueMicrotask(() => syncLatestRecord().catch(console.error));
    return result;
  });
  wrapGlobal('finishResult', original => function(...args) {
    const result = original(...args);
    queueMicrotask(() => syncLatestRecord().catch(console.error));
    return result;
  });
  wrapGlobal('saveAccount', original => function(...args) {
    const result = original(...args);
    queueMicrotask(() => syncProfile().catch(console.error));
    return result;
  });
  wrapGlobal('updatePreference', original => function(...args) {
    const result = original(...args);
    queueMicrotask(() => syncProfile().catch(console.error));
    return result;
  });
  wrapGlobal('clearHistory', original => function(...args) {
    const before = readState().history?.length || 0;
    const result = original(...args);
    const after = readState().history?.length || 0;
    if (before > 0 && after === 0) queueMicrotask(() => clearCloudHistory().catch(console.error));
    return result;
  });
}

function wrapGlobal(name, wrapperFactory) {
  const original = window[name];
  if (typeof original === 'function' && !original.__emotionCloudWrapped) {
    const wrapped = wrapperFactory(original);
    wrapped.__emotionCloudWrapped = true;
    window[name] = wrapped;
  }
}

async function syncLatestRecord() {
  const state = readState();
  const record = state.history?.[0];
  if (!record) return;
  const { data: authData } = await supabase.auth.getUser();
  if (!authData.user) return;
  const payload = {
    id: record.id,
    user_id: authData.user.id,
    type: record.type,
    mood: record.mood || null,
    score: Number.isFinite(record.score) ? record.score : null,
    label: record.label || null,
    signals: record.signals || null,
    created_at: record.createdAt || new Date().toISOString()
  };
  const { error } = await supabase.from('wellbeing_records').upsert(payload, { onConflict: 'id' });
  if (error) throw error;
}

async function syncProfile() {
  const state = readState();
  const { data, error: userError } = await supabase.auth.getUser();
  if (userError) throw userError;
  if (!data.user) return;
  const currentExperience = state.experience || {};
  const { error } = await supabase.from('profiles').upsert({
    id: data.user.id,
    name: state.profile?.name || data.user.user_metadata?.name || '',
    email: data.user.email || null,
    preferences: state.preferences || { checkinReminders: true, patternAlerts: true },
    goal: currentExperience.goal || null,
    daily_checkins: Number(currentExperience.daily_checkins || 2),
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
  if (error) throw error;
}

async function clearCloudHistory() {
  const { error } = await supabase.from('wellbeing_records').delete().not('id', 'is', null);
  if (error) throw error;
}

async function logout() {
  try { await supabase.auth.signOut(); }
  finally {
    localStorage.removeItem(STATE_KEY);
    location.reload();
  }
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); }
  catch { return {}; }
}
function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function setAuthBusy(busy) { const button = document.getElementById('es-submit'); if (button) button.disabled = busy; }
function showAuthMessage(message, success = false) {
  const el = document.getElementById('es-error');
  if (!el) return console.warn(message);
  el.textContent = message;
  el.classList.toggle('es-success', success);
}
function readableAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('email not confirmed')) return 'A confirmação de e-mail ainda está ativa no Supabase.';
  if (message.includes('user already registered')) return 'Já existe uma conta com esse e-mail.';
  if (message.includes('password')) return 'Confira a senha e tente novamente.';
  return 'Não foi possível concluir. Tente novamente.';
}
