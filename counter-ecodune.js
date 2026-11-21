/* ECODUNE — Cross-page counter */
(function(){
  const SK = {
    counter:  'ecod_counter',
    visitors: 'ecod_visitors',
    holders:  'ecod_holders',
    startTime:'ecod_start',
    lastUpdate:'ecod_last',
    hash:     'ecod_hash'
  };
  const SALT = 'ecodune_fintech_rwa_salt_2026';

  function genHash(v){
    let h = 0;
    const s = String(v) + SALT;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) - h) + s.charCodeAt(i);
      h &= h;
    }
    return Math.abs(h).toString(16).padStart(8, '0');
  }

  function save(v, h, s){
    const n = Date.now();
    const d = { visitors: v, holders: h, startTime: s, lastUpdate: n, hash: genHash(v + '|' + h + '|' + s) };
    try {
      localStorage.setItem(SK.counter, JSON.stringify(d));
      localStorage.setItem(SK.visitors, String(v));
      localStorage.setItem(SK.holders, String(h));
      localStorage.setItem(SK.startTime, String(s));
      localStorage.setItem(SK.lastUpdate, String(n));
      localStorage.setItem(SK.hash, d.hash);
      sessionStorage.setItem(SK.counter, JSON.stringify(d));
    } catch(e){}
  }

  function load(){
    try {
      const data = localStorage.getItem(SK.counter);
      if (data) {
        const p = JSON.parse(data);
        if (p.hash === genHash(p.visitors + '|' + p.holders + '|' + p.startTime)) return p;
      }
      const sd = sessionStorage.getItem(SK.counter);
      if (sd) {
        const p = JSON.parse(sd);
        if (p.hash === genHash(p.visitors + '|' + p.holders + '|' + p.startTime)) return p;
      }
    } catch(e){}
    return null;
  }

  let st = load();
  const now = Date.now();
  if (!st) {
    // Стартовые значения: 0 визитов, 17 холдеров, старт — сейчас
    st = { visitors: 0, holders: 17, startTime: now, lastUpdate: now, hash: genHash(0 + '|' + 17 + '|' + now) };
    save(st.visitors, st.holders, st.startTime);
  }

  let visitors = st.visitors;
  let holders  = st.holders;
  const startTime = st.startTime;

  function updateCounter(){
    const n = Date.now();
    const elapsed = Math.floor((n - startTime) / 1000);

    // Скорость роста: визиты +10 в час, холдеры +1 в час
    visitors = st.visitors + Math.floor(elapsed / 360);
    holders  = 17 + Math.floor(elapsed / 3600);

    document.querySelectorAll('.counter-visitors').forEach(el => el.textContent = visitors.toLocaleString());
    document.querySelectorAll('.counter-holders').forEach(el => el.textContent = holders.toLocaleString());

    if (n - st.lastUpdate > 10000) {
      save(visitors, holders, startTime);
      st.lastUpdate = n;
    }
  }

  window.addEventListener('storage', function(e){
    if (e.key === SK.holders) {
      const nv = parseInt(e.newValue);
      if (nv > holders) { holders = nv; updateCounter(); }
    }
  });

  window.addEventListener('beforeunload', function(){ save(visitors, holders, startTime); });

  updateCounter();
  setInterval(updateCounter, 1000);
})();
