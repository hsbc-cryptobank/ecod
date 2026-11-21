// ============================================
// ECODUNE — main.js
// Таймер пресейла и прогресс-бар (заглушки)
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initCountdown();
  initProgress();
});

// --- Таймер обратного отсчёта ---
function initCountdown() {
  const el = document.getElementById('countdownTimer');
  if (!el) return;

  // ЗАМЕНИТЕ на реальную дату окончания пресейла
  const endDate = new Date('2026-12-31T23:59:59Z').getTime();

  function update() {
    const now = Date.now();
    const diff = endDate - now;

    if (diff <= 0) {
      el.textContent = 'Пресейл завершён';
      return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    el.textContent = `${days}д ${hours}ч ${minutes}м ${seconds}с`;
  }

  update();
  setInterval(update, 1000);
}

// --- Прогресс-бар ---
function initProgress() {
  const fill = document.getElementById('progressFill');
  const text = document.getElementById('progressText');
  if (!fill || !text) return;

  // ЗАМЕНИТЕ на реальные данные с PinkSale API или ручное обновление
  const raised = 0;       // сколько собрано (SOL или USD)
  const hardCap = 100;    // Hard Cap

  const percent = Math.min((raised / hardCap) * 100, 100);
  fill.style.width = percent + '%';
  text.textContent = `${raised} / ${hardCap} (${percent.toFixed(1)}%)`;
}

// --- Опционально: подключение Phantom ---
// Раскомментируйте, если нужна кнопка "Connect Wallet" на сайте
/*
async function connectWallet() {
  if (!window.phantom?.solana) {
    alert('Phantom не установлен. Скачайте с phantom.com');
    return;
  }
  try {
    const resp = await window.phantom.solana.connect();
    console.log('Connected:', resp.publicKey.toString());
  } catch (err) {
    console.error('Connection failed:', err);
  }
}
*/
