/* ECODUNE — 10-year persistent visitors counter */
(function(){
  const START_ISO = '2026-11-21T00:00:00Z'; // ФИКСИРОВАННАЯ дата старта (зашита в код)
  const START_MS  = new Date(START_ISO).getTime();
  const END_MS    = START_MS + 10 * 365 * 24 * 60 * 60 * 1000; // +10 лет

  const KEYS = {
    base:    'ecod_base_v3',
    backup1: 'ecod_base_bak1_v3',
    backup2: 'ecod_base_bak2_v3',
    session: 'ecod_session_v3',
    hash:    'ecod_hash_v3'
  };
  const SALT = 'ecodune_10y_counter_salt_2026';

  function genHash(v){
    let h = 0;
    const s = String(v) + SALT;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h &= h;
    }
    return Math.abs(h).toString(16).padStart(8, '0');
  }

  // Читаем базу из всех копий, берём максимальное валидное значение
  function readBase(){
    const candidates = [];
    [KEYS.base, KEYS.backup1, KEYS.backup2].forEach(k => {
      try {
        const raw = localStorage.getItem(k);
        if (raw) {
          const obj = JSON.parse(raw);
          if (obj && obj.hash === genHash(obj.value) && typeof obj.value === 'number') {
            candidates.push(obj.value);
          }
        }
      } catch(e){}
    });
    return candidates.length ? Math.max(...candidates) : 0;
  }

  // Пишем базу во все копии
  function writeBase(v){
    const payload = JSON.stringify({ value: v, hash: genHash(v) });
    [KEYS.base, KEYS.backup1, KEYS.backup2].forEach(k => {
      try { localStorage.setItem(k, payload); } catch(e){}
    });
  }

  let base = readBase();

  // Один визит за сессию браузера
  if (!sessionStorage.getItem(KEYS.session)) {
    base = base + 1;
    writeBase(base);
    sessionStorage.setItem(KEYS.session, '1');
  }

  function update(){
    const now = Date.now();
    if (now >= END_MS) {
      document.querySelectorAll('.counter-visitors').forEach(el => {
        el.textContent = base.toLocaleString();
      });
      return;
    }
    const elapsedSec = Math.floor((now - START_MS) / 1000);
    // +10 визитов в час = +1 каждые 360 секунд
    const live = base + Math.floor(elapsedSec / 360);
    document.querySelectorAll('.counter-visitors').forEach(el => {
      el.textContent = live.toLocaleString();
    });
  }

  update();
  setInterval(update, 1000);
})();
