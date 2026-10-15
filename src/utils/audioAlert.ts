// Web Audio synthesizer for emergency alarm and phone ringtone
let audioCtx: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function startEmergencySiren(): void {
  try {
    const ctx = getAudioContext();
    stopEmergencySiren();

    sirenOscillator = ctx.createOscillator();
    sirenGain = ctx.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenGain.gain.setValueAtTime(0.3, ctx.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(ctx.destination);

    let high = false;
    sirenOscillator.frequency.setValueAtTime(800, ctx.currentTime);

    sirenInterval = setInterval(() => {
      if (!audioCtx || !sirenOscillator) return;
      const targetFreq = high ? 700 : 1200;
      sirenOscillator.frequency.exponentialRampToValueAtTime(targetFreq, ctx.currentTime + 0.25);
      high = !high;
    }, 300);

    sirenOscillator.start();

    // Haptic vibration if supported
    if ('vibrate' in navigator) {
      navigator.vibrate([400, 200, 400, 200, 800]);
    }
  } catch (e) {
    console.warn('Audio siren could not start:', e);
  }
}

export function stopEmergencySiren(): void {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch {
      // ignore
    }
    sirenOscillator = null;
  }
  if (sirenGain) {
    try {
      sirenGain.disconnect();
    } catch {
      // ignore
    }
    sirenGain = null;
  }
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

// Ringtone synthesizer for the Fake Call feature
let ringtoneInterval: any = null;

export function startFakeCallRingtone(): void {
  try {
    const ctx = getAudioContext();
    stopFakeCallRingtone();

    const playBeepPair = () => {
      if (!ctx) return;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.value = 440;
      osc2.frequency.value = 480;
      osc1.type = 'sine';
      osc2.type = 'sine';

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.2);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 1.2);
      osc2.stop(ctx.currentTime + 1.2);

      if ('vibrate' in navigator) {
        navigator.vibrate([500, 250, 500]);
      }
    };

    playBeepPair();
    ringtoneInterval = setInterval(playBeepPair, 3000);
  } catch (e) {
    console.warn('Ringtone could not play:', e);
  }
}

export function stopFakeCallRingtone(): void {
  if (ringtoneInterval) {
    clearInterval(ringtoneInterval);
    ringtoneInterval = null;
  }
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

// Speech synthesis for AI Assistant reading
export function speakText(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.1; // soft, bright friendly sister tone
  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
