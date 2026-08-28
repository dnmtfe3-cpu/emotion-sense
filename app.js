const SESSION_KEY = 'emotion_sense_session_v1';
const STATE_KEY = 'emotion_sense_state_v1';

injectFontAndGate();
mountAuthRoot();

(async function bootEmotionSense() {
  showSplash();
  const session = readSession();

  if (session?.signedIn) {
    try {
      await import('./app-core.js');
      installAccountControls();
      setTimeout(enterExistingApp, 1050);
    } catch (error) {
      console.error(error);
      showAuthMessage('Não foi possível iniciar o app. Atualize a página.');
    }
    return;
  }

  setTimeout(showWelcome, 1050);
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
    .es-ring{position:absolute;border:2px solid currentColor;border-radius:50%;animation:esPulse 2.1s ease-in-out infinite}.es-r1{width:72px;height:72px;opacity:.5}.es-r2{width:104px;height:104px;opacity:.24;animation-delay:.35s}
    @keyframes esPulse{0%,100%{transform:scale(.9);opacity:.22}50%{transform:scale(1.05);opacity:.68}}
    .es-brand{font-size:25px;font-weight:700;letter-spacing:-.035em;margin-top:17px;z-index:2}.es-caption{font-size:10px;font-weight:600;letter-spacing:.16em;text-transform:uppercase;color:rgba(255,255,255,.58);margin-top:8px;z-index:2}
    .es-welcome{justify-content:flex-end}.es-art{min-height:43vh;margin:-26px -22px 26px;display:grid;place-items:center;position:relative;background:linear-gradient(155deg,#EEF2FF,#F7F7FB 74%);overflow:hidden}
    .es-art .es-sense{color:#4F46E5;width:132px;height:132px}.es-art .es-dot{background:linear-gradient(145deg,#4F46E5,#22C7D6);box-shadow:0 15px 38px rgba(79,70,229,.22)}
    .es-kicker{font-size:10px;font-weight:700;letter-spacing:.14em;color:#4F46E5;margin-bottom:10px}.es-title{font-size:31px;line-height:1.08;letter-spacing:-.035em;font-weight:700;margin:0 0 11px}.es-copy{font-size:13px;line-height:1.6;color:#6D6D80;margin:0}
    .es-actions{display:grid;gap:10px;margin-top:27px}.es-primary,.es-secondary{width:100%;border-radius:15px;padding:15px 17px;border:0;font-size:13px;font-weight:700}.es-primary{background:#4F46E5;color:#fff;box-shadow:0 12px 28px rgba(79,70,229,.17)}.es-secondary{background:#fff;color:#18182B;border:1px solid #E8E8F0}.es-primary:active,.es-secondary:active{transform:scale(.975)}
    .es-note{text-align:center;font-size:9px;line-height:1.5;color:#8A8A9B;margin:15px 18px 0}.es-form-screen{justify-content:center;position:relative}.es-back{position:absolute;top:22px;left:20px;width:38px;height:38px;border:1px solid #E8E8F0;border-radius:50%;background:#fff;color:#18182B;font-size:27px;display:grid;place-items:center}.es-mini{position:absolute;top:31px;left:72px;font-size:12px;font-weight:700}.es-mini i{display:inline-block;width:9px;height:9px;border-radius:50%;background:linear-gradient(145deg,#4F46E5,#22C7D6);margin-right:6px}
    .es-form-head{margin-top:42px}.es-form{display:grid;gap:13px;margin-top:28px}.es-field span{display:block;font-size:10px;font-weight:600;color:#6D6D80;margin:0 0 7px 2px}.es-field input{width:100%;border:1px solid #E8E8F0;border-radius:15px;background:#fff;padding:14px 15px;color:#18182B;font-size:13px;outline:none}.es-field input:focus{border-color:rgba(79,70,229,.55);box-shadow:0 0 0 4px rgba(79,70,229,.07)}
    .es-link{justify-self:end;border:0;background:none;color:#4F46E5;font-size:10px;font-weight:600}.es-switch{text-align:center;font-size:10px;color:#6D6D80;margin-top:18px}.es-switch button{border:0;background:none;color:#4F46E5;font-size:inherit;font-weight:700}.es-error{min-height:16px;color:#A34242;font-size:10px;text-align:center;margin-top:10px}
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
  setAuth(`<section class="es-auth es-welcome"><div class="es-art">${senseMark()}</div><div class="es-kicker">EMOTION SENSE</div><h1 class="es-title">Entenda melhor como você está.</h1><p class="es-copy">Check-ins rápidos e análise facial para acompanhar mudanças ao longo do tempo.</p><div class="es-actions"><button class="es-primary" id="es-create">Criar conta</button><button class="es-secondary" id="es-login">Já tenho uma conta</button></div><p class="es-note">O app não faz diagnóstico médico nem prevê crises.</p></section>`);
  document.getElementById('es-create').onclick = showSignup;
  document.getElementById('es-login').onclick = showLogin;
}

function showLogin() {
  setAuth(formTemplate('login'));
  bindBackAndSwitch(showSignup);
  document.getElementById('es-submit').onclick = login;
  document.getElementById('es-forgot').onclick = () => showAuthMessage('A recuperação de senha será ativada com o backend.');
  setTimeout(() => document.getElementById('es-email')?.focus(), 120);
}

function showSignup() {
  setAuth(formTemplate('signup'));
  bindBackAndSwitch(showLogin);
  document.getElementById('es-submit').onclick = signup;
  setTimeout(() => document.getElementById('es-name')?.focus(), 120);
}

function formTemplate(mode) {
  const signup = mode === 'signup';
  return `<section class="es-auth es-form-screen"><button class="es-back" id="es-back">‹</button><div class="es-mini"><i></i>Emotion Sense</div><div class="es-form-head"><div class="es-kicker">${signup ? 'COMECE AGORA' : 'BEM-VINDO DE VOLTA'}</div><h1 class="es-title">${signup ? 'Criar conta' : 'Entrar'}</h1><p class="es-copy">${signup ? 'Seus primeiros dados ficam somente neste dispositivo.' : 'Acesse seus registros e continue de onde parou.'}</p></div><div class="es-form">${signup ? '<label class="es-field"><span>Nome</span><input id="es-name" autocomplete="name" placeholder="Seu nome"></label>' : ''}<label class="es-field"><span>E-mail</span><input id="es-email" type="email" autocomplete="email" placeholder="voce@email.com"></label><label class="es-field"><span>Senha</span><input id="es-password" type="password" autocomplete="${signup ? 'new-password' : 'current-password'}" placeholder="${signup ? 'Mínimo 6 caracteres' : 'Sua senha'}"></label>${signup ? '' : '<button class="es-link" id="es-forgot" type="button">Esqueci minha senha</button>'}<button class="es-primary" id="es-submit">${signup ? 'Criar conta' : 'Entrar'}</button><div class="es-error" id="es-error"></div></div><div class="es-switch">${signup ? 'Já tem conta?' : 'Ainda não tem conta?'} <button id="es-switch">${signup ? 'Entrar' : 'Criar conta'}</button></div></section>`;
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

  const passwordHash = await hashPassword(password);
  const session = { signedIn: true, name, email, passwordHash };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  const current = readState();
  current.profile = { ...(current.profile || {}), name, email };
  localStorage.setItem(STATE_KEY, JSON.stringify(current));
  location.reload();
}

async function login() {
  const email = document.getElementById('es-email').value.trim();
  const password = document.getElementById('es-password').value;
  if (!email || !password) return showAuthMessage('Preencha e-mail e senha.');
  if (!validEmail(email)) return showAuthMessage('Digite um e-mail válido.');
  const account = readSession();
  if (!account?.passwordHash) return showAuthMessage('Crie uma conta neste dispositivo primeiro.');
  if (account.email.toLowerCase() !== email.toLowerCase()) return showAuthMessage('E-mail não encontrado neste dispositivo.');
  if (await hashPassword(password) !== account.passwordHash) return showAuthMessage('Senha incorreta.');
  account.signedIn = true;
  localStorage.setItem(SESSION_KEY, JSON.stringify(account));
  location.reload();
}

function installAccountControls() {
  const bottom = document.querySelector('#screen-perfil .bottom-section');
  if (!bottom || document.getElementById('es-logout')) return;
  const button = document.createElement('button');
  button.id = 'es-logout';
  button.className = 'es-logout';
  button.textContent = 'Sair da conta';
  button.onclick = logout;
  bottom.prepend(button);
}

function logout() {
  const session = readSession() || {};
  session.signedIn = false;
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  location.reload();
}

function enterExistingApp() {
  authRoot()?.remove();
  document.body.classList.remove('es-gate');
  window.switchTab?.('screen-inicio');
}

function readSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); } catch { return null; }
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch { return {}; }
}

function validEmail(value) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value); }
async function hashPassword(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}
function showAuthMessage(message) {
  const el = document.getElementById('es-error');
  if (el) el.textContent = message;
  else console.warn(message);
}
