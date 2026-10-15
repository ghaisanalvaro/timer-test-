alert("JavaScript berhasil dijalankan!");
document.addEventListener('DOMContentLoaded', () => {
  console.log('Focus Timer JavaScript berhasil dimuat!');

  // Durasi timer dalam detik
  const DURATIONS = {
    focus: 25 * 60,
    short: 5 * 60,
    long: 15 * 60
  };

  const LABELS = {
    focus: 'TIME TO FOCUS',
    short: 'TAKE A BREATHER',
    long: 'YOU EARNED THIS'
  };

  const $ = (id) => document.getElementById(id);

  // Ambil elemen HTML
  const timeDisplay = $('time');
  const timerLabel = $('timerLabel');
  const timerState = $('timerState');
  const timerRing = $('timerRing');
  const startBtn = $('startBtn');
  const startText = $('startText');
  const startIcon = $('startIcon');
  const resetBtn = $('resetBtn');
  const skipBtn = $('skipBtn');
  const sessionsDisplay = $('sessions');
  const totalMinutesDisplay = $('totalMinutes');

  // Periksa elemen penting agar error mudah ditemukan
  const requiredElements = {
    time: timeDisplay,
    timerLabel,
    timerState,
    timerRing,
    startBtn,
    startText,
    startIcon,
    resetBtn,
    skipBtn,
    sessions: sessionsDisplay,
    totalMinutes: totalMinutesDisplay
  };

  const missingElements = Object.entries(requiredElements)
    .filter(([, element]) => !element)
    .map(([name]) => name);

  if (missingElements.length > 0) {
    console.error(
      'Focus Timer: elemen HTML tidak ditemukan:',
      missingElements.join(', ')
    );
    return;
  }

  // State timer
  let mode = 'focus';
  let remaining = DURATIONS.focus;
  let endTime = null;
  let interval = null;
  let running = false;
  let completedSessions = 0;
  let totalFocusMinutes = 0;

  function render() {
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;

    timeDisplay.textContent =
      `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    timeDisplay.setAttribute(
      'aria-label',
      `${minutes} menit ${seconds} detik tersisa`
    );

    const progress =
      (1 - remaining / DURATIONS[mode]) * 360;

    timerRing.style.setProperty('--progress', `${progress}deg`);
    timerLabel.textContent = LABELS[mode];

    timerRing.classList.toggle('break', mode !== 'focus');

    startText.textContent = running ? 'Pause timer' : 'Start focusing';
    startIcon.textContent = running ? 'Ⅱ' : '▶';

    startBtn.setAttribute(
      'aria-label',
      running ? 'Pause timer' : 'Start timer'
    );

    timerState.textContent = running
      ? 'You are doing great. Keep going.'
      : remaining === 0
        ? 'Session completed!'
        : remaining === DURATIONS[mode]
          ? 'Ready when you are.'
          : 'Paused. Take your time.';

    sessionsDisplay.textContent = completedSessions;
    totalMinutesDisplay.textContent = totalFocusMinutes;

    document.title = running
      ? `${timeDisplay.textContent} — Focus Timer`
      : 'Focus Timer — Stay Focused';
  }

  function stopInterval() {
    if (interval !== null) {
      clearInterval(interval);
      interval = null;
    }
  }

  function pauseTimer() {
    if (running && endTime !== null) {
      remaining = Math.max(
        0,
        Math.ceil((endTime - Date.now()) / 1000)
      );
    }

    running = false;
    endTime = null;
    stopInterval();
    render();
  }

  function startTimer() {
    if (running || remaining <= 0) return;

    running = true;
    endTime = Date.now() + remaining * 1000;

    stopInterval();
    interval = setInterval(tick, 200);
    render();
  }

  function tick() {
    if (!running || endTime === null) return;

    remaining = Math.max(
      0,
      Math.ceil((endTime - Date.now()) / 1000)
    );

    if (remaining === 0) {
      const completedMode = mode;

      running = false;
      endTime = null;
      stopInterval();

      if (completedMode === 'focus') {
        completedSessions++;
        totalFocusMinutes += DURATIONS.focus / 60;
      }

      render();
      notifyCompletion(completedMode);
      return;
    }

    render();
  }

  function resetTimer() {
    running = false;
    endTime = null;
    stopInterval();

    remaining = DURATIONS[mode];
    render();
  }

  function setMode(nextMode) {
    if (!Object.hasOwn(DURATIONS, nextMode)) return;

    running = false;
    endTime = null;
    stopInterval();

    mode = nextMode;
    remaining = DURATIONS[mode];

    document.querySelectorAll('.mode').forEach((button) => {
      const active = button.dataset.mode === mode;

      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    render();
  }

  function skipSession() {
    setMode(mode === 'focus' ? 'short' : 'focus');
  }

  function notifyCompletion(completedMode) {
    const message = completedMode === 'focus'
      ? 'Sesi fokus selesai! Saatnya istirahat.'
      : 'Waktu istirahat selesai! Siap fokus lagi?';

    // Alert tetap berfungsi tanpa izin notifikasi browser
    window.alert(message);
  }

  // Tombol Start / Pause
  startBtn.addEventListener('click', () => {
    if (running) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  // Tombol Reset dan Skip
  resetBtn.addEventListener('click', resetTimer);
  skipBtn.addEventListener('click', skipSession);

  // Tombol pilihan mode
  document.querySelectorAll('.mode').forEach((button) => {
    button.addEventListener('click', () => {
      setMode(button.dataset.mode);
    });
  });

  // Klik status untuk meminta izin notifikasi (opsional)
  const statusElement = document.querySelector('.status');

  if (
    statusElement &&
    'Notification' in window
  ) {
    statusElement.addEventListener('click', async () => {
      if (Notification.permission === 'default') {
        try {
          await Notification.requestPermission();
        } catch (error) {
          console.warn('Izin notifikasi gagal:', error);
        }
      }
    });
  }

  render();
  console.log('Focus Timer siap digunakan!');
});
