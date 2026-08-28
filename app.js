const STORAGE_KEY = 'emotion_sense_state_v1';
const MEDIAPIPE_VERSION = '1.0.1';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

const defaultState = () => ({
  profile: { name: '', email: '', photo: '' },
  preferences: { checkinReminders: true, patternAlerts: true },
  history: [],
  lastScan: null
});

let state = loadState();
let stream = null;
let faceLandmarker = null;
let visionModule = null;
let animationFrame = null;
let lastVideoTime = -1;
let latestSignals = null;
let scanBuffer = [];
let scanRunning = false;
let pendingScan = null;
let toastTimer = null;

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultState(), ...JSON.parse(raw) } : defaultState();
  } catch {
    return defaultState();
  }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }

window.switchTab = switchTab;
window.goto = goto;
window.toggleCamera = toggleCamera;
window.startTimedScan = startTimedScan;
window.quickCheckin = quickCheckin;
window.saveScanMood = saveScanMood;
window.finishResult = finishResult;
window.handlePhotoPick = handlePhotoPick;
window.saveAccount = saveAccount;
window.updatePreference = updatePreference;
window.clearHistory = clearHistory;
window.resetApp = resetApp;

function switchTab(id) {
  if (id !== 'screen-analisar' && stream) stopCamera();
  showScreen(id, true);
  document.querySelectorAll('.nav-item').forEach(btn => {
    const active = btn.dataset.tab === id;
    btn.classList.toggle('active', active);
    if (active) {
      btn.classList.remove('bounce');
      void btn.offsetWidth;
      btn.classList.add('bounce');
    }
  });
  document.getElementById('bottom-nav').style.display = 'flex';
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (id === 'screen-historico') renderHistory();
  if (id === 'screen-perfil') renderProfile();
}

function goto(id) {
  if (id !== 'screen-analisar' && stream && id !== 'screen-resultado') stopCamera();
  showScreen(id, false);
  const isSub = !['screen-inicio','screen-analisar','screen-historico','screen-perfil'].includes(id);
  document.getElementById('bottom-nav').style.display = isSub ? 'none' : 'flex';
  window.scrollTo({ top: 0, behavior: 'instant' });
  if (id === 'screen-conta') renderAccount();
}

function showScreen(id, tab) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active','tab-in'));
  const target = document.getElementById(id);
  target.classList.add('active');
  if (tab) target.classList.add('tab-in');
}

function initials(name) {
  return (name || '?').trim().split(/\s+/).slice(0,2).map(p => p[0]?.toUpperCase()).join('') || '?';
}
function avatarSrc() {
  if (state.profile.photo) return state.profile.photo;
  const label = initials(state.profile.name);
  return `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#4F46E5"/><stop offset="1" stop-color="#312E81"/></linearGradient></defs><rect width="160" height="160" rx="80" fill="url(#g)"/><text x="50%" y="55%" text-anchor="middle" font-family="Arial" font-size="54" font-weight="700" fill="#fff">${label}</text></svg>`)}`;
}

function renderAll() {
  renderHome();
  renderProfile();
  renderHistory();
  renderPreferences();
}

function renderHome() {
  const name = state.profile.name?.trim();
  document.getElementById('home-first-name').textContent = name ? name.split(/\s+/)[0] : 'você';
  document.getElementById('home-avatar').src = avatarSrc();
  const todayKey = new Date().toDateString();
  const todayCount = state.history.filter(h => new Date(h.createdAt).toDateString() === todayKey).length;
  document.getElementById('home-checkins').textContent = `${todayCount} hoje`;
  if (state.lastScan) {
    document.getElementById('home-last-level').textContent = state.lastScan.label;
    document.getElementById('home-last-time').textContent = formatRelativeTime(state.lastScan.createdAt);
  } else {
    document.getElementById('home-last-level').textContent = 'Sem dados';
    document.getElementById('home-last-time').textContent = 'Faça seu primeiro scan';
  }
}

function renderProfile() {
  const src = avatarSrc();
  document.getElementById('hero-avatar').src = src;
  document.getElementById('account-avatar').src = src;
  document.getElementById('hero-name').textContent = state.profile.name || 'Seu nome';
  document.getElementById('profile-email').textContent = state.profile.email || 'Não informado';
  renderPreferences();
}

function renderAccount() {
  document.getElementById('input-name').value = state.profile.name || '';
  document.getElementById('input-email').value = state.profile.email || '';
  document.getElementById('account-avatar').src = avatarSrc();
}

function renderPreferences() {
  document.getElementById('pref-checkin').checked = !!state.preferences.checkinReminders;
  document.getElementById('pref-pattern').checked = !!state.preferences.patternAlerts;
}

function saveAccount() {
  const name = document.getElementById('input-name').value.trim();
  const email = document.getElementById('input-email').value.trim();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showToast('Digite um e-mail válido.'); return;
  }
  state.profile.name = name;
  state.profile.email = email;
  saveState(); renderAll(); showToast('Perfil atualizado.'); goto('screen-perfil');
}

function handlePhotoPick(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  if (!file.type.startsWith('image/')) { showToast('Escolha uma imagem.'); return; }
  const reader = new FileReader();
  reader.onload = () => { state.profile.photo = reader.result; saveState(); renderAll(); showToast('Foto atualizada.'); };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function updatePreference(key, value) { state.preferences[key] = !!value; saveState(); showToast('Preferência atualizada.'); }

async function ensureFaceLandmarker() {
  if (faceLandmarker) return faceLandmarker;
  setLoading(true, 'Carregando o analisador facial…');
  try {
    visionModule = await import(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/+esm`);
    const { FilesetResolver, FaceLandmarker } = visionModule;
    const vision = await FilesetResolver.forVisionTasks(`https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`);
    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO',
      numFaces: 1,
      outputFaceBlendshapes: true,
      minFaceDetectionConfidence: 0.5,
      minFacePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    return faceLandmarker;
  } catch (error) {
    console.error(error);
    showToast('Não foi possível carregar o modelo facial.');
    throw error;
  } finally { setLoading(false); }
}

async function toggleCamera() {
  if (stream) { stopCamera(); return; }
  if (!navigator.mediaDevices?.getUserMedia) { showToast('Este navegador não oferece acesso à câmera.'); return; }
  try {
    await ensureFaceLandmarker();
    stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 960 } }, audio: false });
    const video = document.getElementById('camera');
    video.srcObject = stream;
    await video.play();
    video.style.display = 'block';
    document.getElementById('camera-placeholder').style.display = 'none';
    document.getElementById('scan-frame').hidden = false;
    document.getElementById('camera-button').textContent = 'Desativar câmera';
    document.getElementById('scan-button').disabled = false;
    document.getElementById('camera-status').textContent = 'Procurando rosto…';
    analyzeLoop();
  } catch (error) {
    console.error(error);
    if (error?.name === 'NotAllowedError') showToast('Permissão da câmera negada.');
    else showToast('Não foi possível abrir a câmera.');
  }
}

function stopCamera() {
  if (animationFrame) cancelAnimationFrame(animationFrame);
  animationFrame = null;
  if (stream) stream.getTracks().forEach(t => t.stop());
  stream = null; scanRunning = false; scanBuffer = []; latestSignals = null; lastVideoTime = -1;
  const video = document.getElementById('camera');
  if (video) { video.pause(); video.srcObject = null; video.style.display = 'none'; }
  const placeholder = document.getElementById('camera-placeholder');
  if (placeholder) placeholder.style.display = 'flex';
  const frame = document.getElementById('scan-frame'); if (frame) frame.hidden = true;
  const btn = document.getElementById('camera-button'); if (btn) btn.textContent = 'Ativar câmera';
  const scan = document.getElementById('scan-button'); if (scan) { scan.disabled = true; scan.textContent = 'Iniciar análise de 10 s'; }
  const status = document.getElementById('camera-status'); if (status) status.textContent = 'Pronto para começar';
  updateLivePanel(null);
}

function analyzeLoop() {
  const video = document.getElementById('camera');
  if (!stream || !faceLandmarker) return;
  try {
    if (video.readyState >= 2 && video.currentTime !== lastVideoTime) {
      const result = faceLandmarker.detectForVideo(video, performance.now());
      lastVideoTime = video.currentTime;
      const categories = result?.faceBlendshapes?.[0]?.categories || [];
      if (categories.length) {
        latestSignals = computeSignals(categories);
        updateLivePanel(latestSignals);
        document.getElementById('camera-status').textContent = scanRunning ? 'Analisando… mantenha o rosto visível' : 'Rosto detectado';
        if (scanRunning) scanBuffer.push(latestSignals);
      } else {
        document.getElementById('camera-status').textContent = 'Posicione seu rosto no centro';
        updateLivePanel(null);
      }
    }
  } catch (error) { console.error('Face analysis frame error', error); }
  animationFrame = requestAnimationFrame(analyzeLoop);
}

function computeSignals(categories) {
  const map = Object.fromEntries(categories.map(c => [c.categoryName, c.score]));
  const avg = (...keys) => keys.reduce((sum, key) => sum + (map[key] || 0), 0) / keys.length;
  const brow = avg('browDownLeft','browDownRight');
  const eye = avg('eyeSquintLeft','eyeSquintRight');
  const mouth = avg('mouthPressLeft','mouthPressRight');
  const smile = avg('mouthSmileLeft','mouthSmileRight');
  const jaw = map.jawOpen || 0;
  const activation = clamp((brow * .34) + (eye * .24) + (mouth * .26) + (Math.min(jaw, .65) * .16), 0, 1);
  return { brow, eye, mouth, smile, jaw, activation };
}

function updateLivePanel(signals) {
  const values = signals || { brow:0, eye:0, mouth:0, smile:0 };
  [['brow',values.brow],['eye',values.eye],['mouth',values.mouth],['smile',values.smile]].forEach(([key,val]) => {
    const pct = signals ? Math.round(val*100) : 0;
    document.getElementById(`bar-${key}`).style.width = `${pct}%`;
    document.getElementById(`val-${key}`).textContent = signals ? `${pct}%` : '—';
  });
}

async function startTimedScan() {
  if (!stream || !faceLandmarker || scanRunning) return;
  scanRunning = true; scanBuffer = [];
  const button = document.getElementById('scan-button');
  button.disabled = true;
  let remaining = 10;
  button.textContent = `Analisando… ${remaining}s`;
  document.getElementById('camera-status').textContent = 'Analisando… mantenha o rosto visível';
  const timer = setInterval(() => {
    remaining -= 1;
    button.textContent = remaining > 0 ? `Analisando… ${remaining}s` : 'Finalizando…';
  }, 1000);
  await delay(10000);
  clearInterval(timer);
  scanRunning = false;
  button.disabled = false;
  button.textContent = 'Iniciar nova análise';
  if (scanBuffer.length < 8) { showToast('Não consegui acompanhar seu rosto por tempo suficiente.'); return; }
  const averaged = averageSignals(scanBuffer);
  pendingScan = { ...averaged, score: Math.round(averaged.activation * 100), label: labelActivation(averaged.activation), createdAt: new Date().toISOString(), mood: null };
  fillResult(pendingScan);
  stopCamera();
  goto('screen-resultado');
}

function averageSignals(items) {
  const keys = ['brow','eye','mouth','smile','jaw','activation'];
  return Object.fromEntries(keys.map(k => [k, items.reduce((sum,item) => sum + item[k],0) / items.length]));
}
function labelActivation(v) { if (v < .22) return 'Baixa ativação'; if (v < .45) return 'Ativação moderada'; return 'Ativação elevada'; }
function fillResult(scan) {
  document.getElementById('result-score').textContent = scan.score;
  document.getElementById('result-title').textContent = scan.label;
  document.getElementById('result-copy').textContent = scan.score < 22 ? 'Pouca ativação nos sinais faciais acompanhados durante este scan.' : scan.score < 45 ? 'Alguns movimentos faciais ficaram mais ativos durante este scan.' : 'Vários movimentos faciais ficaram ativos ao mesmo tempo. Faça seu check-in para dar contexto ao resultado.';
  ['brow','eye','mouth','smile'].forEach(k => document.getElementById(`result-${k}`).textContent = `${Math.round(scan[k]*100)}%`);
  document.querySelectorAll('.result-moods button').forEach(b => b.classList.remove('selected'));
}

function saveScanMood(mood, button) {
  if (!pendingScan) return;
  pendingScan.mood = mood;
  document.querySelectorAll('.result-moods button').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
  showToast(`Check-in: ${mood}`);
}

function finishResult() {
  if (!pendingScan) { switchTab('screen-inicio'); return; }
  const record = { id: crypto.randomUUID?.() || String(Date.now()), type: 'scan', createdAt: pendingScan.createdAt, score: pendingScan.score, label: pendingScan.label, mood: pendingScan.mood || 'Não informado', signals: { brow: pendingScan.brow, eye: pendingScan.eye, mouth: pendingScan.mouth, smile: pendingScan.smile } };
  state.history.unshift(record);
  state.history = state.history.slice(0,200);
  state.lastScan = record;
  saveState();
  pendingScan = null;
  renderAll();
  switchTab('screen-inicio');
  showToast('Análise salva no histórico.');
}

function quickCheckin(mood, button) {
  document.querySelectorAll('#quick-moods button').forEach(b => b.classList.remove('selected'));
  button.classList.add('selected');
  const record = { id: crypto.randomUUID?.() || String(Date.now()), type: 'checkin', createdAt: new Date().toISOString(), mood, label: 'Check-in', score: null };
  state.history.unshift(record); state.history = state.history.slice(0,200); saveState(); renderHome();
  setTimeout(() => button.classList.remove('selected'), 650);
  showToast(`Registrado: ${mood}`);
}

function renderHistory() {
  const list = document.getElementById('history-list');
  const empty = document.getElementById('history-empty');
  const sevenDays = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const count7 = state.history.filter(h => new Date(h.createdAt).getTime() >= sevenDays).length;
  document.getElementById('history-count').textContent = `${count7} ${count7 === 1 ? 'registro' : 'registros'}`;
  if (!state.history.length) { list.innerHTML=''; empty.style.display='block'; return; }
  empty.style.display='none';
  list.innerHTML = state.history.map(item => {
    const isScan = item.type === 'scan';
    const score = isScan ? `${item.score}%` : '•';
    const subtitle = isScan ? `${item.mood || 'Sem check-in'} · ${formatDate(item.createdAt)}` : `${item.mood} · ${formatDate(item.createdAt)}`;
    return `<article class="history-item"><div class="history-mark">${isScan ? '◌' : '●'}</div><div class="history-main"><strong>${escapeHtml(isScan ? item.label : 'Check-in rápido')}</strong><span>${escapeHtml(subtitle)}</span></div><div class="history-score">${score}</div></article>`;
  }).join('');
}

function clearHistory() {
  if (!state.history.length) { showToast('O histórico já está vazio.'); return; }
  if (!confirm('Apagar todo o histórico salvo neste dispositivo?')) return;
  state.history = []; state.lastScan = null; saveState(); renderAll(); showToast('Histórico apagado.');
}
function resetApp() {
  if (!confirm('Apagar perfil, preferências e histórico deste dispositivo?')) return;
  localStorage.removeItem(STORAGE_KEY); state = defaultState(); renderAll(); switchTab('screen-inicio'); showToast('Dados locais apagados.');
}

function showToast(message) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-text').textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}
function setLoading(show, text='Preparando análise…') { const el=document.getElementById('loading-overlay'); document.getElementById('loading-text').textContent=text; el.classList.toggle('show',show); }
function formatDate(iso) { return new Intl.DateTimeFormat('pt-BR',{day:'2-digit',month:'short',hour:'2-digit',minute:'2-digit'}).format(new Date(iso)); }
function formatRelativeTime(iso) { const mins=Math.max(0,Math.round((Date.now()-new Date(iso).getTime())/60000)); if(mins<1)return 'Agora'; if(mins<60)return `Há ${mins} min`; const h=Math.round(mins/60); if(h<24)return `Há ${h} h`; return formatDate(iso); }
function escapeHtml(v='') { return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
function clamp(v,min,max){return Math.min(max,Math.max(min,v))} function delay(ms){return new Promise(r=>setTimeout(r,ms))}

window.addEventListener('beforeunload', stopCamera);
if ('serviceWorker' in navigator) window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
renderAll();
