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

injectFontAndGate();
mountAuthRoot();

(async function bootEmotionSense() {
  showSplash();
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;

    if (data.session?.user) {
      await enterSignedIn(data.session.user, 850);
    } else {
      setTimeout(showWelcome, 850);
    }
  } catch (error) {
    console.error(error);
    setTimeout(() => {
      showWelcome();
      showAuthMessage('Não foi possível conectar à sua conta agora.');
    }, 850);
  }
})();

function injectFontAndGate() {
  document.querySelectorAll('link[href*="fonts.googleapis.com"]').forEach(link => link.remove());
  const font = document.createElement('link');
  font.rel = 'stylesheet';
  font.href = 'https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap';
  document.head.appendChild(font);

  const style = document.createElement('style');
  style.textContent = `
    html,body,button,input{font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    h1,h2,h3,.display,.metric-card strong,.result-ring strong,.history-summary strong,.history-score{font-family:"DM Sans",-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif!important}
    body.es-gate .screen,body.es-gate #bottom-nav{display:none!important}
    #es-auth-root{position:absolute;inset:0;z-index:1000;background:#F7F7FB;color:#18182B;min-height:100vh;overflow:auto}
    .es-auth{min-height:100vh;display:flex;flex-direction:column;padding:26px 22px calc(25px + env(safe-area-inset-bottom));animation:esIn .35s cubic-bezier(.22,1,.36,1) both}
    @keyframes esIn{from{opacity:0;transform:translateY(9px)}to{opacity:1;transform:none}}
    .es-splash{align-items:center;justify-content:center;color:#fff;background:linear-gradient(155deg,#4F46E5 0%,#3730A3 54%,#211D5E 100%);overflow:hidden;position:relative}
    .es-splash:before{content:"";position:absolute;width:270px;height:270px;border-radius:50%;background:rgba(34,199,214,.18);right:-145px;top:-110px}
    .es-splash:after{content:"";position:absolute;width:210px;height:210px;border-radius:50%;background:rgba(255,255,255,.08);left:-130px;bottom:-110px}
    .es-sense{width:112px;height:112px;position:relative;display:grid;place-items:center;color:#88E7F0;z-index:2}
    .es-dot{width:36px;height:36px;border-radius:50%;background:#fff;box-shadow:0 0 35px rgba(255,255,255,.4);z-index:3}
    .es-ring{position:absolute;border:2px solid currentColor;border-radius:50%;animation:esPulse 2.1s ease-in-out infinite}
    .es-r1{width:72px;height:72px;opacity:.5}.es-r2{width:104px;height:104px;opacity:.24;animation-delay:.35s}
    @keyframes esPulse{0%,100%{transform:scale(.9);opacity:.22}50%{transform:scale(1.05);opacity:.68}}
    .es-brand{font-size:25px;font-weight:700;letter-spacing:-.035em;margin-top:17px;z-index:2}
    .es-caption{font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.58);margin-top:8px;z-index:2}
    .es-welcome{justify-content:flex-end}
    .es-art{min-height:43vh;margin:-26px -22px 26px;display:grid;place-items:center;position:relative;background:linear-gradient(155deg,#EEF2FF,#F7F7FB 74%);overflow:hidden}
    .es-art .es-sense{color:#4F46E5;width:132px;height:132px}
    .es-art .es-dot{background:linear-gradient(145deg,#4F46E5,#22C7D6);box-shadow:0 15px 38px rgba(79,70,229,.22)}
    .es-kicker{font-size:10px;font-weight:700;letter-spacing:.14em;color:#4F46E5;margin-bottom:10px}
    .es-title{font-size:31px;line-height:1.08;letter-spacing:-.035em;font-weight:700;margin:0 0 11px}
    .es-copy{font-size:13px;line-height:1.6;color:#6D6D80;margin:0}
    .es-actions{display:grid;gap:10px;margin-top:27px}
    .es-primary,.es-secondary{width:100%;border-radius:15px;padding:15px 17px;border:0;font-size:13px;font-weight:700}
    .es-primary{background:#4F46E5;color:#fff;box-shadow:0 12px 28px rgba(79,70,229,.17)}
    .es-secondary{background:#fff;color:#18182B;border:1px solid #E8E8F0}
    .es-primary:active,.es-secondary:active{transform:scale(.975)}
    .es-primary:disabled{opacity:.55;cursor:wait}
    .es-note{text-align:center;font-size:9px;line-height:1.5;color:#8A8A9B;margin:15px 18px 0}
    .es-form-screen{justify-content:center;position:relative}
    .es-back{position:absolute;top:22px;left:20px;width:38px;height:38px;border:1px solid #E8E8F0;border-radius:50%;background:#fff;color:#18182B;font-size:27px;display:grid;place-items:center}
    .es-mini{position:absolute;top:31px;left:72px;font-size:12px;font-weight:700}
    .es-mini i{display:inline-block;width:9px;height:9px;border-radius:50%;background:linear-gradient(145deg,#4F46E5,#22C7D6);margin-right:6px}
    .es-form-head{margin-top:42px}
    .es-form{display:grid;gap:13px;margin-top:28px}
    .es-field span{display:block;font-size:10px;font-weight:600;color:#6D6D80;margin:0 0 7px 2px}
    .es-field input{width:100%;border:1px solid #E8E8F0;border-radius:15px;background:#fff;padding:14px 15px;color:#18182B;font-size:13px;outline:none}
    .es-field input:focus{border-color:rgba(79,70,229,.55);box-shadow:0 0 0 4px rgba(79,70,229,.07)}
    .es-link{justify-self:end;border:0;background:none;color:#4F46E5;font-size:10px;font-weight:600}
    .es-switch{text-align:center;font-size:10px;color:#6D6D80;margin-top:18px}
    .es-switch button{border:0;background:none;color:#4F46E5;font-size:inherit;font-weight:700}
    .es-error{min-height:16px;color:#A34242;font-size:10px;text-align:center;margin-top:10px}
    .es-success{color:#31735B}
    .es-logout{display:block;width:100%;border:1px solid #E8E8F0;background:#fff;color:#18182B;font-weight:700;font-size:11px;border-radius:13px;padding:13px;margin-bottom:9px}
  `;
  document.head.appendChild(style);
  document.body.classList.add('es-gate');
}

function mountAuthRoot() {
  const root = document.createElement('div');
  root.id = 'es-auth-root';
  document.getElementById('app').appendChild(root);
}

function authRoot() { return document.getElementById('es-auth-root'); }
function setAuth(html) { authRoot().innerHTML = html; }

function senseMark() {
  return '<div class="es-sense"><span class="es-dot"></span><span class="es-ring es-r1"></span><span class="es-ring es-r2"></span></div>';
}

function showSplash() {
  setAuth(`<section class="es-auth es-splash">${senseMark()}<div class="es-brand">Emotion Sense</div><div class="es-caption">perceba seus sinais</div></section>`);
}

function showWelcome() {
  setAuth(`<section class="es-auth es-welcome"><div class="es-art">${senseMark()}</div><div class="es-kicker">EMOTION SENSE</div><h1 class="es-title">Entenda melhor como você está.</h1><p class="es-copy">Check-ins rápidos e análise facial para acompanhar mudanças ao longo do tempo.</p><div class="es-actions"><button class="es-primary" id="es-create">Criar conta</button><button class="es-secondary" id="es-login">Já tenho uma conta</button></div><p class="es-note">Sua conta agora é sincronizada pelo Supabase. O app não faz diagnóstico médico nem prevê crises.</p></section>`);
  document.getElementById('es-create').onclick = showSignup;
  document.getElementById('es-login').onclick = showLogin;
}

function showLogin() {
  setAuth(formTemplate('login'));
  bindBackAndSwitch(showSignup);
  document.getElementById('es-submit').onclick = login;
  document.getElementById('es-forgot').onclick = resetPassword;
  setTimeout(() => document.getElementById('es-email')?.focus(), 120);
}

function showSignup() {
  setAuth(formTemplate('signup'));
  bindBackAndSwitch(showLogin);
  document.getElementById('es-submit').onclick = signup;
  setTimeout(() => document.getElementById('es-name')?.focus(), 120);
}

function formTemplate(mode) {
  const signupMode = mode === 'signup';
  return `<section class="es-auth es-form-screen"><button class="es-back" id="es-back">‹</button><div class="es-mini"><i></i>Emotion Sense</div><div class="es-form-head"><div class="es-kicker">${signupMode ? 'COMECE AGORA' : 'BEM-VINDO DE VOLTA'}</div><h1 class="es-title">${signupMode ? 'Criar conta' : 'Entrar'}</h1><p class="es-copy">${signupMode ? 'Crie sua conta para manter seus registros sincronizados.' : 'Entre para acessar seus registros em qualquer dispositivo.'}</p></div><div class="es-form">${signupMode ? '<label class="es-field"><span>Nome</span><input id="es-name" autocomplete="name" placeholder="Seu nome"></label>' : ''}<label class="es-field"><span>E-mail</span><input id="es-email" type="email" autocomplete="email" placeholder="voce@email.com"></label><label class="es-field"><span>Senha</span><input id="es-password" type="password" autocomplete="${signupMode ? 'new-password' : 'current-password'}" placeholder="${signupMode ? 'Mínimo 6 caracteres' : 'Sua senha'}"></label>${signupMode ? '' : '<button class="es-link" id="es-forgot" type="button">Esqueci minha senha</button>'}<button class="es-primary" id="es-submit">${signupMode ? 'Criar conta' : 'Entrar'}</button><div class="es-error" id="es-error"></div></div><div class="es-switch">${signupMode ? 'Já tem conta?' : 'Ainda não tem conta?'} <button id="es-switch">${signupMode ? 'Entrar' : 'Criar conta'}</button></div></section>`;
}

function bindBackAndSwitch(next) {
  document.getElementById('es-back').onclick = showWelcome;
  document.getElementById('es-switch').onclick = next;
}

async function signup() {
  const name = document.getElementById('es-name').value.trim();
  const email = document.getElementById('es-email').value.trim();
  const password = document.getElementById('es-password').value;
  if (!name || !email || !password) return showAuthMessage('Preencha todos os campos.');
  if (!validEmail(email)) return showAuthMessage('Digite um e-mail válido.');
  if (password.length < 6) return showAuthMessage('A senha precisa ter pelo menos 6 caracteres.');

  setAuthBusy(true);
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } }
    });
    if (error) throw error;

    if (data.session?.user) {
      await ensureProfile(data.session.user, name);
      await enterSignedIn(data.session.user, 0);
      return;
    }

    showAuthMessage('Conta criada. Confirme o e-mail enviado para você e depois entre.', true);
  } catch (error) {
    console.error(error);
    showAuthMessage(readableAuthError(error));
  } finally {
    setAuthBusy(false);
  }
}

async function login() {
  const email = document.getElementById('es-email').value.trim();
  const password = document.getElementById('es-password').value;
  if (!email || !password) return showAuthMessage('Preencha e-mail e senha.');
  if (!validEmail(email)) return showAuthMessage('Digite um e-mail válido.');

  setAuthBusy(true);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    await enterSignedIn(data.user, 0);
  } catch (error) {
    console.error(error);
    showAuthMessage(readableAuthError(error));
  } finally {
    setAuthBusy(false);
  }
}

async function resetPassword() {
  const email = document.getElementById('es-email')?.value.trim();
  if (!email || !validEmail(email)) return showAuthMessage('Digite seu e-mail primeiro.');
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    showAuthMessage('Se a conta existir, o Supabase enviará as instruções de recuperação.', true);
  } catch (error) {
    console.error(error);
    showAuthMessage('Não foi possível solicitar a recuperação agora.');
  }
}

async function enterSignedIn(user, delayMs = 0) {
  showSplash();
  try {
    await ensureProfile(user);
    await hydrateLocalState(user);
    await import('./app-core.js?v=6');
    installAccountControls(user);
    installCloudSync(user);
    if (delayMs) await delay(delayMs);
    authRoot()?.remove();
    document.body.classList.remove('es-gate');
    window.switchTab?.('screen-inicio');
  } catch (error) {
    console.error(error);
    showWelcome();
    showAuthMessage('Sua conta entrou, mas não consegui carregar os dados agora.');
  }
}

async function ensureProfile(user, fallbackName = '') {
  const { data, error } = await supabase
    .from('profiles')
    .select('id,name,email,preferences')
    .eq('id', user.id)
    .maybeSingle();

  if (error) throw error;
  if (data) return data;

  const name = fallbackName || user.user_metadata?.name || '';
  const profile = {
    id: user.id,
    name,
    email: user.email || null,
    preferences: { checkinReminders: true, patternAlerts: true }
  };
  const { error: insertError } = await supabase.from('profiles').insert(profile);
  if (insertError) throw insertError;
  return profile;
}

async function hydrateLocalState(user) {
  const [profileResult, recordsResult] = await Promise.all([
    supabase.from('profiles').select('name,email,preferences').eq('id', user.id).maybeSingle(),
    supabase.from('wellbeing_records').select('id,type,mood,score,label,signals,created_at').order('created_at', { ascending: false }).limit(200)
  ]);

  if (profileResult.error) throw profileResult.error;
  if (recordsResult.error) throw recordsResult.error;

  const oldState = readState();
  const records = (recordsResult.data || []).map(row => ({
    id: row.id,
    type: row.type,
    mood: row.mood,
    score: row.score,
    label: row.label,
    signals: row.signals,
    createdAt: row.created_at
  }));
  const profile = profileResult.data || {};
  const state = {
    profile: {
      name: profile.name || user.user_metadata?.name || '',
      email: user.email || profile.email || '',
      photo: oldState.profile?.photo || ''
    },
    preferences: profile.preferences || oldState.preferences || { checkinReminders: true, patternAlerts: true },
    history: records,
    lastScan: records.find(item => item.type === 'scan') || null
  };
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
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
  window.esCloud = {
    userId: user.id,
    syncLatestRecord,
    syncProfile,
    clearHistory: clearCloudHistory
  };

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
  const user = authData.user;
  if (!user) return;

  const payload = {
    id: record.id,
    user_id: user.id,
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
  const user = data.user;
  if (!user) return;

  const { error } = await supabase.from('profiles').upsert({
    id: user.id,
    name: state.profile?.name || user.user_metadata?.name || '',
    email: user.email || null,
    preferences: state.preferences || { checkinReminders: true, patternAlerts: true },
    updated_at: new Date().toISOString()
  }, { onConflict: 'id' });
  if (error) throw error;
}

async function clearCloudHistory() {
  const { error } = await supabase.from('wellbeing_records').delete().not('id', 'is', null);
  if (error) throw error;
}

async function logout() {
  try {
    await supabase.auth.signOut();
  } finally {
    localStorage.removeItem(STATE_KEY);
    location.reload();
  }
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch { return {}; }
}

function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
function setAuthBusy(busy) {
  const button = document.getElementById('es-submit');
  if (button) button.disabled = busy;
}
function showAuthMessage(message, success = false) {
  const el = document.getElementById('es-error');
  if (el) {
    el.textContent = message;
    el.classList.toggle('es-success', success);
  } else {
    console.warn(message);
  }
}
function readableAuthError(error) {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('invalid login credentials')) return 'E-mail ou senha incorretos.';
  if (message.includes('email not confirmed')) return 'Confirme seu e-mail antes de entrar.';
  if (message.includes('user already registered')) return 'Já existe uma conta com esse e-mail.';
  if (message.includes('password')) return 'Confira a senha e tente novamente.';
  return 'Não foi possível concluir. Tente novamente.';
}
function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
