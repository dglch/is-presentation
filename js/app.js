// State
    let currentStep = 1;
    const totalSteps = 11;
    let teamIntegrity = 100;
    let totalScoreXP = 0;
    let sfxActive = true;
    let audioContext = null;

    // Web Audio Synthesizer (Modern clean UI sound effects)
    function getAudioCtx() {
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      return audioContext;
    }

    function emitBeep(freq, type, duration, delay = 0, vol = 0.08) {
      if (!sfxActive) return;
      try {
        const ctx = getAudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ctx.currentTime + delay);
        gain.gain.setValueAtTime(vol, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + delay + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + duration);
      } catch (err) {}
    }

    function soundEffect(kind) {
      if (!sfxActive) return;
      getAudioCtx();
      if (kind === 'click') {
        emitBeep(600, 'sine', 0.04);
      } else if (kind === 'step') {
        emitBeep(450, 'sine', 0.04);
        emitBeep(900, 'sine', 0.06, 0.03);
      } else if (kind === 'correct') {
        emitBeep(523.25, 'triangle', 0.08);
        emitBeep(659.25, 'triangle', 0.08, 0.06);
        emitBeep(783.99, 'triangle', 0.12, 0.12);
      } else if (kind === 'damage') {
        emitBeep(180, 'sawtooth', 0.12);
        emitBeep(130, 'sawtooth', 0.18, 0.08);
      } else if (kind === 'victory') {
        emitBeep(523.25, 'triangle', 0.09);
        emitBeep(659.25, 'triangle', 0.09, 0.08);
        emitBeep(783.99, 'triangle', 0.09, 0.16);
        emitBeep(1046.50, 'sine', 0.35, 0.24);
      }
    }

    function toggleAudio() {
      sfxActive = !sfxActive;
      const btn = document.getElementById('sfxBtn');
      const icon = document.getElementById('sfxIcon');
      if (sfxActive) {
        btn.classList.add('active');
        icon.innerText = '🔊';
        soundEffect('click');
      } else {
        btn.classList.remove('active');
        icon.innerText = '🔇';
      }
    }

    function toggleFullscreen() {
      soundEffect('click');
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
    }

    function updateStepView() {
      document.querySelectorAll('.slide-card').forEach((card, i) => {
        card.classList.toggle('active', i + 1 === currentStep);
      });

      document.getElementById('prevBtn').disabled = (currentStep === 1);
      document.getElementById('nextBtn').disabled = (currentStep === totalSteps);

      const activeCard = document.getElementById(`slide-${currentStep}`);
      const timeSlot = activeCard.getAttribute('data-time') || '';

      document.getElementById('dockCounter').innerText = `ЕТАП ${String(currentStep).padStart(2, '0')} / ${totalSteps}`;
      document.getElementById('dockTimer').innerText = `⏱️ ${timeSlot}`;

      if (currentStep === totalSteps) {
        soundEffect('victory');
      }
    }

    function navigateSlide(direction) {
      const target = currentStep + direction;
      if (target >= 1 && target <= totalSteps) {
        currentStep = target;
        soundEffect('step');
        updateStepView();
      }
    }

    function processChoice(btn, isCorrect, delta, msg) {
      const parent = btn.closest('.tech-panel');
      const alertBox = parent.querySelector('.result-alert');
      
      const siblingBtns = parent.querySelectorAll('.btn-choice');
      siblingBtns.forEach(b => b.disabled = true);

      if (isCorrect) {
        soundEffect('correct');
        totalScoreXP += delta;
        teamIntegrity = Math.min(100, teamIntegrity + 10);
        alertBox.style.display = 'block';
        alertBox.className = 'result-alert success';
        alertBox.innerHTML = `<strong>${msg}</strong>`;
      } else {
        soundEffect('damage');
        teamIntegrity = Math.max(15, teamIntegrity + delta);
        alertBox.style.display = 'block';
        alertBox.className = 'result-alert danger';
        alertBox.innerHTML = `<strong>${msg}</strong>`;
      }

      document.getElementById('integrityBar').style.width = teamIntegrity + '%';
      document.getElementById('integrityText').innerText = `${teamIntegrity}% ` + (teamIntegrity > 50 ? 'OK' : 'RISK');
      document.getElementById('xpPill').innerText = `⭐ ${totalScoreXP} XP`;
    }

    // Keyboard Controller
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        navigateSlide(1);
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        navigateSlide(-1);
      } else if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        toggleAudio();
      }
    });

    // Init
    updateStepView();