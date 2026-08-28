const STATE_KEY = 'emotion_sense_state_v1';

const DAILY_PHRASES = [
  'Perceber seus sinais já é uma forma de se cuidar.',
  'Você não precisa entender tudo de uma vez.',
  'Seu ritmo também merece ser respeitado.',
  'Pequenos check-ins ajudam a enxergar padrões maiores.',
  'Hoje também conta, mesmo quando parece um dia comum.',
  'Prestar atenção em você pode ser simples.',
  'Um minuto de pausa pode mudar o jeito de seguir o dia.',
  'Nem todo dia precisa render igual para ter valor.'
];

injectPolishStyles();
mountPolish();

const polishObserver = new MutationObserver(() => mountPolish());
polishObserver.observe(document.body, { childList: true, subtree: true });

function injectPolishStyles() {
  if (document.getElementById('es-polish-style')) return;
  const style = document.createElement('style');
  style.id = 'es-polish-style';
  style.textContent = `
    :root{
      --es-soft-bg:#F8F8FC;
      --es-soft-card:#FFFFFF;
      --es-soft-line:#ECECF3;
      --es-soft-ink:#242438;
      --es-soft-muted:#77778A;
      --es-soft-primary:#5B57D9;
      --es-soft-primary-2:#7773E8;
      --es-soft-lav:#F0EFFF;
      --es-soft-green:#EAF7F1;
    }
    body{background:#F0F0F5!important}
    .app{background:var(--es-soft-bg)!important}
    .home-header{padding-top:30px!important;padding-bottom:12px!important}
    .home-header h1{font-size:29px!important;color:var(--es-soft-ink)!important;font-weight:650!important;letter-spacing:-.035em!important}
    .home-header p{font-size:12px!important;color:var(--es-soft-muted)!important}
    .eyebrow{font-size:9px!important;letter-spacing:.12em!important;color:var(--es-soft-primary)!important}
    .content.home-content{padding-top:2px!important}
    .hero-scan-card{
      background:#262545!important;
      border-radius:24px!important;
      box-shadow:0 14px 34px rgba(38,37,69,.13)!important;
      padding:20px!important;
      min-height:172px;
      border:1px solid rgba(255,255,255,.04)!important;
    }
    .hero-scan-card:after{display:none!important}
    .hero-copy h2{font-size:21px!important;line-height:1.12!important;letter-spacing:-.025em!important}
    .hero-copy p{font-size:11px!important;color:rgba(255,255,255,.68)!important}
    .hero-orb{opacity:.86;transform:scale(.92)}
    .hero-scan-card .btn-primary{background:#fff!important;color:#292847!important;border-radius:12px!important;box-shadow:none!important}
    .summary-grid{gap:9px!important}
    .metric-card,.card,.es-plan-card{
      border-color:var(--es-soft-line)!important;
      box-shadow:0 6px 22px rgba(42,42,70,.035)!important;
    }
    .metric-card{border-radius:17px!important;min-height:126px!important;padding:15px!important}
    .metric-icon{background:var(--es-soft-lav)!important;color:var(--es-soft-primary)!important}
    .metric-card strong{color:var(--es-soft-ink)!important;font-weight:650!important}
    .section-head{margin-top:24px!important}.section-head h2{color:var(--es-soft-ink)!important}
    .section-title,.section-kicker{font-size:9px!important;letter-spacing:.105em!important}
    .mood-grid button{background:#FAFAFD!important;border-color:var(--es-soft-line)!important;border-radius:13px!important;color:#666679!important}
    .mood-grid button.selected{background:var(--es-soft-lav)!important;color:var(--es-soft-primary)!important}
    .notice-card{background:#F4F8F7!important;border-color:#E2EEEA!important}
    .notice-icon{background:#D9EFE7!important;color:#34735C!important}
    .notice-card p{color:#587067!important}
    .es-daily-phrase{margin:12px 0 0;padding:17px 17px 16px;border-radius:19px;background:#fff;border:1px solid var(--es-soft-line);box-shadow:0 6px 22px rgba(42,42,70,.035)}
    .es-daily-phrase-top{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px}
    .es-daily-phrase-kicker{font-size:9px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:var(--es-soft-primary)}
    .es-daily-phrase-icon{width:27px;height:27px;border-radius:10px;background:var(--es-soft-lav);display:grid;place-items:center;color:var(--es-soft-primary);font-size:12px}
    .es-daily-phrase p{margin:0;color:var(--es-soft-ink);font-size:15px;line-height:1.45;font-weight:600;letter-spacing:-.015em}
    .es-daily-phrase small{display:block;margin-top:7px;color:#9090A0;font-size:9px}
    .es-today-panel{margin:10px 0 0;display:grid;grid-template-columns:1.2fr .8fr;gap:9px}
    .es-goal-card,.es-pause-card{border-radius:18px;border:1px solid var(--es-soft-line);background:#fff;padding:15px;box-shadow:0 6px 22px rgba(42,42,70,.03)}
    .es-goal-card span,.es-pause-card span{font-size:9px;color:#858596;font-weight:650}
    .es-goal-card strong,.es-pause-card strong{display:block;font-size:14px;color:var(--es-soft-ink);margin-top:5px;letter-spacing:-.02em}
    .es-goal-track{height:6px;background:#EEEEF4;border-radius:999px;margin-top:12px;overflow:hidden}.es-goal-track i{display:block;height:100%;background:var(--es-soft-primary);border-radius:inherit;transition:width .3s ease}
    .es-goal-card small{display:block;color:#9090A0;font-size:9px;margin-top:7px}
    .es-pause-card{border:0;background:var(--es-soft-lav);text-align:left;cursor:pointer;color:inherit}
    .es-pause-card:active{transform:scale(.98)}
    .es-pause-card .es-pause-arrow{display:inline-block;margin-top:10px;color:var(--es-soft-primary);font-size:10px;font-weight:700}
    .es-breathe-overlay{position:fixed;inset:0;z-index:6000;background:rgba(26,26,44,.32);backdrop-filter:blur(10px);display:grid;place-items:center;padding:20px}
    .es-breathe-sheet{width:min(100%,390px);background:#fff;border-radius:28px;padding:26px 22px 22px;box-shadow:0 24px 70px rgba(28,28,52,.22);text-align:center}
    .es-breathe-close{float:right;width:34px;height:34px;border:1px solid var(--es-soft-line);border-radius:50%;background:#fff;font-size:20px;color:#77778A}
    .es-breathe-orb{width:116px;height:116px;border-radius:50%;background:var(--es-soft-lav);margin:38px auto 20px;display:grid;place-items:center;animation:esBreathe 8s ease-in-out infinite;color:var(--es-soft-primary);font-size:12px;font-weight:700}
    @keyframes esBreathe{0%,100%{transform:scale(.82)}50%{transform:scale(1.08)}}
    .es-breathe-sheet h2{margin:0;font-size:24px;color:var(--es-soft-ink);letter-spacing:-.035em}.es-breathe-sheet p{font-size:11px;line-height:1.55;color:var(--es-soft-muted);margin:8px auto 18px;max-width:280px}
    .es-breathe-time{font-size:28px;font-weight:700;color:var(--es-soft-primary);font-variant-numeric:tabular-nums}
    .es-breathe-caption{font-size:9px;color:#9A9AAA;margin-top:6px}
    .es-breathe-stop{margin-top:18px;width:100%;border:0;border-radius:14px;padding:13px;background:#262545;color:#fff;font-weight:700}
    .camera-card{border-radius:24px!important;box-shadow:0 14px 38px rgba(18,18,35,.16)!important}
    .live-panel{border-color:var(--es-soft-line)!important;box-shadow:0 6px 22px rgba(42,42,70,.03)!important}
    .result-hero{background:#262545!important;border-radius:24px!important;box-shadow:0 14px 34px rgba(38,37,69,.13)!important}
    .history-summary{background:#262545!important;border-radius:18px!important}
    .profile-hero{background:#262545!important}
    .es-estimate{background:#FAFAFD!important}
    .es-plan-card{border-radius:18px!important}
    @media(max-width:360px){.es-today-panel{grid-template-columns:1fr}.es-daily-phrase p{font-size:14px}}
  `;
  document.head.appendChild(style);
}

function mountPolish() {
  mountDailyPhrase();
  mountTodayPanel();
  refreshTodayPanel();
}

function mountDailyPhrase() {
  const home = document.querySelector('#screen-inicio .home-content');
  const hero = home?.querySelector('.hero-scan-card');
  if (!home || !hero || document.getElementById('es-daily-phrase')) return;
  const card = document.createElement('article');
  card.id = 'es-daily-phrase';
  card.className = 'es-daily-phrase';
  const phrase = DAILY_PHRASES[dailyIndex(DAILY_PHRASES.length)];
  card.innerHTML = `
    <div class="es-daily-phrase-top">
      <span class="es-daily-phrase-kicker">Para hoje</span>
      <span class="es-daily-phrase-icon">✦</span>
    </div>
    <p>${escapeHtml(phrase)}</p>
    <small>Uma frase por dia, sem pressão.</small>`;
  hero.insertAdjacentElement('beforebegin', card);
}

function mountTodayPanel() {
  const phrase = document.getElementById('es-daily-phrase');
  if (!phrase || document.getElementById('es-today-panel')) return;
  const panel = document.createElement('div');
  panel.id = 'es-today-panel';
  panel.className = 'es-today-panel';
  panel.innerHTML = `
    <article class="es-goal-card">
      <span>Meta de hoje</span>
      <strong id="es-goal-title">0 de 2 check-ins</strong>
      <div class="es-goal-track"><i id="es-goal-progress" style="width:0%"></i></div>
      <small id="es-goal-copy">Sem cobrança — é só uma referência.</small>
    </article>
    <button type="button" class="es-pause-card" id="es-pause-card">
      <span>Pausa guiada</span>
      <strong>1 minuto</strong>
      <span class="es-pause-arrow">Começar →</span>
    </button>`;
  phrase.insertAdjacentElement('afterend', panel);
  panel.querySelector('#es-pause-card').onclick = openBreathingPause;
}

function refreshTodayPanel() {
  const title = document.getElementById('es-goal-title');
  const progress = document.getElementById('es-goal-progress');
  const copy = document.getElementById('es-goal-copy');
  if (!title || !progress || !copy) return;
  const state = readState();
  const target = clamp(Number(state.experience?.daily_checkins || 2), 1, 4);
  const today = new Date().toDateString();
  const done = (state.history || []).filter(item => item.type === 'checkin' && new Date(item.createdAt).toDateString() === today).length;
  const capped = Math.min(done, target);
  title.textContent = `${capped} de ${target} ${target === 1 ? 'check-in' : 'check-ins'}`;
  progress.style.width = `${Math.round(capped / target * 100)}%`;
  copy.textContent = done >= target ? 'Meta concluída. O resto do dia é seu.' : 'Sem cobrança — é só uma referência.';
}

function openBreathingPause() {
  if (document.getElementById('es-breathe-overlay')) return;
  const overlay = document.createElement('div');
  overlay.id = 'es-breathe-overlay';
  overlay.className = 'es-breathe-overlay';
  overlay.innerHTML = `
    <div class="es-breathe-sheet" role="dialog" aria-modal="true" aria-label="Pausa guiada de um minuto">
      <button class="es-breathe-close" id="es-breathe-close" aria-label="Fechar">×</button>
      <div class="es-breathe-orb" id="es-breathe-orb">respire</div>
      <h2>Só um minuto</h2>
      <p>Acompanhe o círculo no seu ritmo. Não precisa acertar um tempo exato nem forçar a respiração.</p>
      <div class="es-breathe-time" id="es-breathe-time">1:00</div>
      <div class="es-breathe-caption" id="es-breathe-caption">acompanhe no seu ritmo</div>
      <button class="es-breathe-stop" id="es-breathe-stop">Encerrar pausa</button>
    </div>`;
  document.body.appendChild(overlay);
  let seconds = 60;
  const time = overlay.querySelector('#es-breathe-time');
  const caption = overlay.querySelector('#es-breathe-caption');
  const orb = overlay.querySelector('#es-breathe-orb');
  const timer = setInterval(() => {
    seconds -= 1;
    time.textContent = `0:${String(seconds).padStart(2, '0')}`;
    const phase = Math.floor((60 - seconds) / 4) % 2;
    caption.textContent = phase === 0 ? 'inspire de forma confortável' : 'solte o ar sem pressa';
    orb.textContent = phase === 0 ? 'inspire' : 'solte';
    if (seconds <= 0) {
      clearInterval(timer);
      time.textContent = 'pronto';
      caption.textContent = 'continue o dia no seu ritmo';
      orb.textContent = '✓';
    }
  }, 1000);
  const close = () => { clearInterval(timer); overlay.remove(); };
  overlay.querySelector('#es-breathe-close').onclick = close;
  overlay.querySelector('#es-breathe-stop').onclick = close;
  overlay.addEventListener('click', event => { if (event.target === overlay) close(); });
}

function dailyIndex(length) {
  const now = new Date();
  const seed = Number(`${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`);
  return seed % length;
}

function readState() {
  try { return JSON.parse(localStorage.getItem(STATE_KEY) || '{}'); } catch { return {}; }
}
function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
function escapeHtml(value='') { return String(value).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c])); }

window.addEventListener('storage', refreshTodayPanel);
setInterval(refreshTodayPanel, 1800);
