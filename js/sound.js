/*
==========================================
MathTeach 音效系統
作者：浪子傳說
==========================================
*/

let audioContext = null;

function getAudioContext() {
  const AudioContextClass =
    window.AudioContext ||
    window.webkitAudioContext;

  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
  }

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  return audioContext;
}

function playTone({
  frequency,
  duration,
  volume = 0.08,
  type = "sine",
  delay = 0
}) {
  const context = getAudioContext();

  if (!context) {
    return;
  }

  const startTime = context.currentTime + delay;

  const oscillator =
    context.createOscillator();

  const gain =
    context.createGain();

  oscillator.type = type;

  oscillator.frequency.setValueAtTime(
    frequency,
    startTime
  );

  gain.gain.setValueAtTime(
    0.0001,
    startTime
  );

  gain.gain.exponentialRampToValueAtTime(
    volume,
    startTime + 0.02
  );

  gain.gain.exponentialRampToValueAtTime(
    0.0001,
    startTime + duration
  );

  oscillator.connect(gain);
  gain.connect(context.destination);

  oscillator.start(startTime);
  oscillator.stop(
    startTime + duration + 0.05
  );
}

export function prepareAudio() {
  getAudioContext();
}

export function playCorrectSound() {

  playTone({
    frequency: 523.25,
    duration: 0.22,
    volume: 0.07
  });

  playTone({
    frequency: 659.25,
    duration: 0.25,
    volume: 0.06,
    delay: 0.10
  });

  playTone({
    frequency: 783.99,
    duration: 0.28,
    volume: 0.055,
    delay: 0.20
  });

}

export function playWrongSound() {

  playTone({
    frequency: 392,
    duration: 0.22,
    volume: 0.055,
    type: "triangle"
  });

  playTone({
    frequency: 329.63,
    duration: 0.28,
    volume: 0.05,
    type: "triangle",
    delay: 0.14
  });

}

export function playCountdownSound(
  timeLeft
) {

  const frequency =
    timeLeft <= 3 ? 880 : 660;

  const duration =
    timeLeft <= 3 ? 0.16 : 0.10;

  const volume =
    timeLeft <= 3 ? 0.09 : 0.06;

  playTone({
    frequency,
    duration,
    volume,
    type: "square"
  });

}
